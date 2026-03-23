import { initializeApp } from "firebase/app";
import {
  getFirestore,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { LocalStorageAdapter } from "@/utils";
import { GameStorageService, type StoredGame } from "@/services/gameStorage.js";
import { TemplateStorageService } from "@/services/templateStorage.js";
import { FirestoreStorageAdapter } from "@/utils/storage-adapters/firestore-storage.js";
import { SyncedStorageAdapter } from "@/utils/storage-adapters/synced-storage.js";
import { ThrottledStorageAdapter } from "@/utils/storage-adapters/throttled-storage.js";
import { normalizeDates } from "@/utils/normalizeDates.js";
import type { GameTemplate } from "@/utils";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);

// Module-level references for cleanup on sign-out
let activeThrottledAdapter: ThrottledStorageAdapter<StoredGame> | null = null;
let activeTemplateThrottledAdapter: ThrottledStorageAdapter<GameTemplate> | null = null;

export async function tryResumeSession(): Promise<string | null> {
  try {
    await auth.authStateReady();
    return auth.currentUser?.uid ?? null;
  } catch (error) {
    console.error("Firebase session restore failed:", error);
    return null;
  }
}

export async function signIn(): Promise<string | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user.uid;
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null;
    }
    console.error("Google sign-in failed:", error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await deactivateSync();
  await firebaseSignOut(auth);
  await Promise.all([
    GameStorageService.getInstance().clearAllGames(),
    TemplateStorageService.getInstance().clearAllTemplates(),
  ]);
  window.dispatchEvent(new CustomEvent("scorekeeper:sync-complete"));
}

export async function activateSync(userId: string): Promise<void> {
  // Games
  const localGames = new LocalStorageAdapter<StoredGame>("scorekeeper");
  const firestoreGames = new FirestoreStorageAdapter<StoredGame>("games", userId);
  const throttledGames = new ThrottledStorageAdapter(firestoreGames, 30_000);
  activeThrottledAdapter = throttledGames;
  GameStorageService.initialize(new SyncedStorageAdapter(localGames, throttledGames));

  // Templates
  const localTemplates = new LocalStorageAdapter<GameTemplate>("scorekeeper-templates");
  const firestoreTemplates = new FirestoreStorageAdapter<GameTemplate>("templates", userId);
  const throttledTemplates = new ThrottledStorageAdapter(firestoreTemplates, 30_000);
  activeTemplateThrottledAdapter = throttledTemplates;
  TemplateStorageService.initialize(new SyncedStorageAdapter(localTemplates, throttledTemplates));

  try {
    await Promise.all([
      runInitialSync(localGames, firestoreGames),
      runInitialTemplateSync(localTemplates, firestoreTemplates),
    ]);
  } catch (err) {
    console.error("Initial sync failed, continuing with local data:", err);
  }

  window.dispatchEvent(new CustomEvent("scorekeeper:sync-complete"));
}

export async function deactivateSync(): Promise<void> {
  if (activeThrottledAdapter) {
    await activeThrottledAdapter.flush();
    activeThrottledAdapter.destroy();
    activeThrottledAdapter = null;
  }
  if (activeTemplateThrottledAdapter) {
    await activeTemplateThrottledAdapter.flush();
    activeTemplateThrottledAdapter.destroy();
    activeTemplateThrottledAdapter = null;
  }
  GameStorageService.initialize(new LocalStorageAdapter<StoredGame>("scorekeeper"));
  TemplateStorageService.initialize(new LocalStorageAdapter<GameTemplate>("scorekeeper-templates"));
}

async function runInitialSync(
  local: LocalStorageAdapter<StoredGame>,
  remote: FirestoreStorageAdapter<StoredGame>
): Promise<void> {
  const [rawLocal, rawRemote] = await Promise.all([
    local.getAll ? local.getAll() : getAllFromKeys(local),
    remote.getAll(),
  ]);

  const localGames = rawLocal.map(normalizeDates);
  const remoteGames = rawRemote.map(normalizeDates);

  const localMap = new Map(localGames.map((g: StoredGame) => [g.id, g]));
  const remoteMap = new Map(remoteGames.map((g: StoredGame) => [g.id, g]));

  const writes: Promise<unknown>[] = [];

  for (const [id, remoteGame] of remoteMap) {
    const localGame = localMap.get(id);
    if (!localGame) {
      writes.push(local.set(id, remoteGame));
    } else if (remoteGame.updatedAt > localGame.updatedAt) {
      writes.push(local.set(id, remoteGame));
    }
  }

  for (const [id, localGame] of localMap) {
    if (!remoteMap.has(id)) {
      writes.push(remote.set(id, localGame));
    }
  }

  await Promise.all(writes);
}

async function getAllFromKeys(adapter: LocalStorageAdapter<StoredGame>): Promise<StoredGame[]> {
  const keys = await adapter.keys();
  return (await Promise.all(keys.map((k: string) => adapter.get(k))))
    .filter((g): g is StoredGame => g !== null);
}

async function runInitialTemplateSync(
  local: LocalStorageAdapter<GameTemplate>,
  remote: FirestoreStorageAdapter<GameTemplate>
): Promise<void> {
  const [rawLocal, rawRemote] = await Promise.all([
    local.getAll ? local.getAll() : getAllTemplatesFromKeys(local),
    remote.getAll(),
  ]);

  const localMap = new Map(rawLocal.map((t: GameTemplate) => [t.id, t]));
  const remoteMap = new Map(rawRemote.map((t: GameTemplate) => [t.id, t]));

  const writes: Promise<unknown>[] = [];

  for (const [id, remoteTemplate] of remoteMap) {
    const localTemplate = localMap.get(id);
    if (!localTemplate) {
      writes.push(local.set(id, remoteTemplate));
    } else {
      const remoteDate = new Date(remoteTemplate.createdAt);
      const localDate = new Date(localTemplate.createdAt);
      if (remoteDate > localDate) {
        writes.push(local.set(id, remoteTemplate));
      }
    }
  }

  for (const [id, localTemplate] of localMap) {
    if (!remoteMap.has(id)) {
      writes.push(remote.set(id, localTemplate));
    }
  }

  await Promise.all(writes);
}

async function getAllTemplatesFromKeys(adapter: LocalStorageAdapter<GameTemplate>): Promise<GameTemplate[]> {
  const keys = await adapter.keys();
  return (await Promise.all(keys.map((k: string) => adapter.get(k))))
    .filter((t): t is GameTemplate => t !== null);
}
