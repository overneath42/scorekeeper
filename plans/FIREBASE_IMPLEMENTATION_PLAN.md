# Firebase Remote Storage Implementation Plan

## Goal

Add Firebase Firestore as a remote storage backend so game data syncs between devices. Local storage remains the primary/offline store; Firestore acts as the sync layer.

## Firestore Data Model

One Firestore collection, `games`, with each document keyed by the existing game `id` (UUID):

```
games/{gameId}
  ├── name: string
  ├── timecode: string
  ├── status: "active" | "completed" | "paused"
  ├── players: GamePlayer[]              # array of {index, name} objects
  ├── scoringHistory: number[][]         # tuples stored as plain arrays
  ├── targetScore: number | null
  ├── timeLimit: number | null
  ├── timeRemaining: number | null
  ├── lastActiveAt: Timestamp | null
  ├── timerBehavior: string | null
  ├── turnTrackingEnabled: boolean
  ├── currentPlayerIndex: number         # 0, not undefined
  ├── currentTurnNumber: number          # 1, not undefined
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── userId: string                     # per-user scoping
```

Type conversion notes:
- **Dates** are stored as Firestore `Timestamp` objects. Convert with `Timestamp.fromDate()` on write and `timestamp.toDate()` on read. Never use `new Date(timestamp)`.
- **`undefined` fields** are rejected by Firestore. The serializer must strip them. On read-back they are absent (not `undefined`), which is safe because consuming code uses nullish coalescing (`?? 0`, `?? 1`).
- **`ScoreEntry` tuples** (`[number, number]`) become plain `number[]` arrays. Needs an explicit cast on read: `data.scoringHistory as unknown as ScoreEntry[]`.

## Authentication

Use **Google Sign-In** for cross-device identity. Anonymous Auth is unsuitable: it gives each browser a different UID, so data never syncs between devices.

**Sign-in must be user-triggered.** Browsers block popups not opened in response to a click. The background init path only resumes an existing session; a "Sign In" button triggers the actual OAuth flow.

All auth helpers live in `src/services/firebase.ts`:

```typescript
// Configure persistence once at module load, not per-call.
setPersistence(auth, browserLocalPersistence);

// Resume an existing session on page load. Never opens a popup.
export async function tryResumeSession(): Promise<string | null> {
  try {
    await auth.authStateReady();
    return auth.currentUser?.uid ?? null;
  } catch (error) {
    console.error("Firebase session restore failed:", error);
    return null;
  }
}

// Called from a "Sign In" button click handler.
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

// Called from a "Sign Out" button click handler.
export async function signOut(): Promise<void> {
  await deactivateSync();
  await auth.signOut();
  window.dispatchEvent(new CustomEvent("scorekeeper:sync-complete"));
}
```

---

## Implementation Steps

### Phase 1: Foundation

#### 1.1 Install Firebase SDK

```bash
npm install firebase
```

Only import the modular/tree-shakeable modules: `firebase/app`, `firebase/firestore`, `firebase/auth`.

#### 1.2 Firebase configuration module

Create `src/services/firebase.ts`:
- Initialize the Firebase app from `import.meta.env.VITE_FIREBASE_*` environment variables
- Export the `Firestore` and `Auth` instances
- Call `setPersistence(auth, browserLocalPersistence)` once at module scope
- Export `tryResumeSession`, `signIn`, `signOut`, `activateSync`, and `deactivateSync`
- Add `.env.example` documenting required variables; ensure `.env` is in `.gitignore`

Required env vars:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Build-time note:** `VITE_*` vars are baked into the bundle by Vite. The `if (import.meta.env.VITE_FIREBASE_API_KEY)` check is a build-time branch, not a runtime one. Separate builds (or env files) are needed for local-only vs Firebase-enabled deployments.

#### 1.3 Make the `StorageAdapter` interface fully async

Change all return types to `Promise<T>`. Union types (`Promise<T> | T`) are not type-safe -- TypeScript won't catch a forgotten `await`.

```typescript
// src/utils/storage-adapters/types.ts
export interface StorageAdapter<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
  getAll?(): Promise<T[]>;
}
```

Update both `LocalStorageAdapter` and `SessionStorageAdapter` to wrap every return in `Promise.resolve(...)`. Add `getAll()` to `LocalStorageAdapter`.

### Phase 2: Async Migration

#### 2.1 Update `GameStorageService` to async

Every method that touches `this.storage` becomes `async`:

`saveGame`, `getStoredGame`, `getAllStoredGames`, `getGameSummaries`, `deleteGame`, `createGame`, `addScore`, `updateGameStatus`, `updateGame`, `updateTimeRemaining`, `updateLastActiveAt`, `clearAllGames`, `fromGameContext`

`fromGameContext` calls `getStoredGame` internally, so it must also become async even though it doesn't call the adapter directly.

Methods that don't touch storage stay synchronous: `calculatePlayerScores`, `getPlayerScoringHistory`, `toGameContext`.

**Date normalization.** `LocalStorageAdapter` stores values via `JSON.stringify`, so dates come back as ISO strings. The existing `getStoredGame()` converts them (`new Date(game.createdAt)`), but the `getAll()` path bypasses `getStoredGame()`. Extract a shared `normalizeDates` utility so both paths can use it:

```typescript
// src/utils/normalizeDates.ts
export function normalizeDates(game: StoredGame): StoredGame {
  return {
    ...game,
    createdAt: new Date(game.createdAt),
    updatedAt: new Date(game.updatedAt),
    lastActiveAt: game.lastActiveAt ? new Date(game.lastActiveAt) : null,
  };
}
```

This is safe for both string dates (from localStorage JSON) and `Date` objects (from Firestore): `new Date(dateObj)` clones; `new Date(isoString)` parses.

Use it in `getAllStoredGames`:

```typescript
async getAllStoredGames(): Promise<StoredGame[]> {
  let games: StoredGame[];
  if (this.storage.getAll) {
    const raw = await this.storage.getAll();
    games = raw.map(normalizeDates);
  } else {
    const ids = await this.storage.keys();
    games = (await Promise.all(ids.map(id => this.getStoredGame(id))))
      .filter((g): g is StoredGame => g !== null);
  }
  return games.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
```

Without normalization, `b.updatedAt.getTime()` throws a `TypeError` on string values from `LocalStorageAdapter.getAll()`.

#### 2.2 Update provider components

**`game-list-provider.ts`**:
- `connectedCallback`: use an async IIFE or helper to load games after mount
- `addGame`, `removeGame`, `updateGame`, `clearGames`: make async, await storage calls, then `requestUpdate()`
- Listen for `scorekeeper:sync-complete` on `window` and reload the game list

**`game-provider.ts`**:
- `loadGameById`, `addScore`, `updateGame`, `createNewGame`: make async
- Timer methods (`tickTimer`, `stopTimer`): fire-and-forget the storage promise with `void` rather than blocking the tick

**Sync events and active games:** `game-provider` does NOT listen for `scorekeeper:sync-complete`. If a game is actively being played while sync overwrites that game in localStorage, re-loading would discard the user's in-progress changes. Instead, sync only applies cleanly to idle games. This is an acceptable trade-off for a scorekeeping app -- active gameplay takes precedence over a background merge.

#### 2.3 Verify local-only functionality

Run the dev server and verify the app works exactly as before. All storage still hits `LocalStorageAdapter`; the only change is `async/await` wiring.

### Phase 3: Firebase Adapter

#### 3.1 Create `FirestoreStorageAdapter`

Create `src/utils/storage-adapters/firestore-storage.ts`:

```typescript
export class FirestoreStorageAdapter<T extends object> implements StorageAdapter<T> {
  private collectionRef: CollectionReference;
  private userId: string;

  constructor(collectionName: string, userId: string) {
    this.collectionRef = collection(db, collectionName);
    this.userId = userId;
  }

  async get(key: string): Promise<T | null> {
    const docSnap = await getDoc(doc(this.collectionRef, key));
    if (!docSnap.exists()) return null;
    return this.deserialize(docSnap.data());
  }

  async set(key: string, value: T): Promise<boolean> {
    await setDoc(doc(this.collectionRef, key), {
      ...this.serialize(value),
      userId: this.userId,
    });
    return true;
  }

  async remove(key: string): Promise<boolean> {
    await deleteDoc(doc(this.collectionRef, key));
    return true;
  }

  async keys(): Promise<string[]> {
    const q = query(this.collectionRef, where("userId", "==", this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.id);
  }

  async has(key: string): Promise<boolean> {
    const docSnap = await getDoc(doc(this.collectionRef, key));
    return docSnap.exists();
  }

  async clear(): Promise<boolean> {
    const q = query(this.collectionRef, where("userId", "==", this.userId));
    const snapshot = await getDocs(q);
    for (let i = 0; i < snapshot.docs.length; i += 500) {
      const batch = writeBatch(db);
      snapshot.docs.slice(i, i + 500).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    return true;
  }

  async getAll(): Promise<T[]> {
    const q = query(this.collectionRef, where("userId", "==", this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.deserialize(d.data()));
  }

  // Serialization: shallow traversal. Nested Date fields inside arrays or
  // sub-objects are NOT converted. The current StoredGame schema has no
  // nested Dates; this is a known limitation if the schema grows.

  private serialize(value: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      if (v instanceof Date) {
        out[k] = Timestamp.fromDate(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  private deserialize(data: DocumentData): T {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Timestamp) {
        out[k] = v.toDate();
      } else {
        out[k] = v;
      }
    }
    if (out.scoringHistory) {
      out.scoringHistory = (out.scoringHistory as number[][]) as unknown as ScoreEntry[];
    }
    return out as T;
  }
}
```

#### 3.2 Create `SyncedStorageAdapter`

Create `src/utils/storage-adapters/synced-storage.ts`. This composite adapter writes to local (fast, authoritative) and remote (best-effort background sync):

```typescript
export class SyncedStorageAdapter<T> implements StorageAdapter<T> {
  constructor(
    private local: StorageAdapter<T>,
    private remote: StorageAdapter<T>
  ) {}

  async get(key: string): Promise<T | null> {
    const localResult = await this.local.get(key);
    if (localResult !== null) return localResult;

    // Cache miss: fetch from remote and populate local
    const remoteResult = await this.remote.get(key);
    if (remoteResult !== null) {
      await this.local.set(key, remoteResult);
    }
    return remoteResult;
  }

  async set(key: string, value: T): Promise<boolean> {
    const localOk = await this.local.set(key, value);
    this.remote.set(key, value).catch(err =>
      console.error(`[SyncedStorage] Remote write failed for key "${key}":`, err)
    );
    return localOk;
  }

  async remove(key: string): Promise<boolean> {
    const localOk = await this.local.remove(key);
    this.remote.remove(key).catch(err =>
      console.error(`[SyncedStorage] Remote delete failed for key "${key}":`, err)
    );
    return localOk;
  }

  async keys(): Promise<string[]> {
    const [localKeys, remoteKeys] = await Promise.all([
      this.local.keys(),
      this.remote.keys().catch(() => [] as string[]),
    ]);
    return [...new Set([...localKeys, ...remoteKeys])];
  }

  async clear(): Promise<boolean> {
    const localOk = await this.local.clear();
    this.remote.clear().catch(err =>
      console.error("[SyncedStorage] Remote clear failed:", err)
    );
    return localOk;
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  async getAll(): Promise<T[]> {
    const localItems = this.local.getAll
      ? await this.local.getAll()
      : await this.getAllFromKeys(this.local);

    // If local is empty (e.g. browser data cleared), fall back to remote.
    // Uses (item as any).id to extract the key -- this couples the generic
    // adapter to StoredGame's shape, which is acceptable for a single-type app.
    if (localItems.length === 0 && this.remote.getAll) {
      const remoteItems = await this.remote.getAll().catch(() => [] as T[]);
      await Promise.all(remoteItems.map(item => {
        const id = (item as Record<string, unknown>).id as string;
        return id ? this.local.set(id, item) : Promise.resolve();
      }));
      return remoteItems;
    }
    return localItems;
  }

  private async getAllFromKeys(adapter: StorageAdapter<T>): Promise<T[]> {
    const keys = await adapter.keys();
    return (await Promise.all(keys.map(k => adapter.get(k))))
      .filter((v): v is T => v !== null);
  }
}
```

#### 3.3 Create `ThrottledStorageAdapter`

Timer writes (`updateTimeRemaining`, `updateLastActiveAt`) fire every 5 seconds. Without throttling, each creates a Firestore write -- burning through the free quota (50,000/day) quickly. Wrap the remote adapter in a debouncer that batches writes per key.

Pending writes are flushed on `visibilitychange` to `"hidden"` (reliable for async work). `beforeunload` is intentionally not used: browsers kill async work immediately after the synchronous handler returns. A hard kill (Cmd+Q) can lose up to `delayMs` of pending writes.

```typescript
export class ThrottledStorageAdapter<T> implements StorageAdapter<T> {
  private pending = new Map<string, { value: T; timer: ReturnType<typeof setTimeout> }>();
  private onVisibilityChange: (() => void) | null = null;

  constructor(
    private inner: StorageAdapter<T>,
    private delayMs: number = 30_000
  ) {
    if (typeof window !== "undefined") {
      this.onVisibilityChange = () => {
        if (document.visibilityState === "hidden") void this.flush();
      };
      window.addEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  destroy(): void {
    // Cancel all pending writes and remove event listeners.
    // Must be called before discarding the adapter (e.g. on sign-out).
    for (const [, { timer }] of this.pending) clearTimeout(timer);
    this.pending.clear();
    if (this.onVisibilityChange && typeof window !== "undefined") {
      window.removeEventListener("visibilitychange", this.onVisibilityChange);
      this.onVisibilityChange = null;
    }
  }

  async set(key: string, value: T): Promise<boolean> {
    const existing = this.pending.get(key);
    if (existing) clearTimeout(existing.timer);

    const timer = setTimeout(async () => {
      this.pending.delete(key);
      await this.inner.set(key, value).catch(err =>
        console.error(`[ThrottledStorage] Deferred write failed for key "${key}":`, err)
      );
    }, this.delayMs);

    this.pending.set(key, { value, timer });
    return true;
  }

  async flush(): Promise<void> {
    const entries = [...this.pending.entries()];
    this.pending.clear();
    entries.forEach(([, { timer }]) => clearTimeout(timer));
    await Promise.all(
      entries.map(([key, { value }]) =>
        this.inner.set(key, value).catch(err =>
          console.error(`[ThrottledStorage] Flush write failed for key "${key}":`, err)
        )
      )
    );
  }

  // remove/clear cancel pending writes first to prevent ghost-write
  // (debounced set fires after delete and re-creates the document)

  async remove(key: string): Promise<boolean> {
    const existing = this.pending.get(key);
    if (existing) {
      clearTimeout(existing.timer);
      this.pending.delete(key);
    }
    return this.inner.remove(key);
  }

  async clear(): Promise<boolean> {
    for (const [, { timer }] of this.pending) clearTimeout(timer);
    this.pending.clear();
    return this.inner.clear();
  }

  get = (key: string) => this.inner.get(key);
  keys = () => this.inner.keys();
  has = (key: string) => this.inner.has(key);
  getAll = () => this.inner.getAll?.() ?? Promise.resolve([]);
}
```

### Phase 4: Sync & Auth Wiring

#### 4.1 Make adapter selection configurable in `GameStorageService`

```typescript
export class GameStorageService {
  private storage: StorageAdapter<StoredGame>;
  private static instance: GameStorageService;

  private constructor(storage?: StorageAdapter<StoredGame>) {
    this.storage = storage ?? new LocalStorageAdapter<StoredGame>("scorekeeper");
  }

  static initialize(storage: StorageAdapter<StoredGame>): void {
    if (GameStorageService.instance) {
      console.warn("GameStorageService.initialize() called after getInstance()");
    }
    GameStorageService.instance = new GameStorageService(storage);
  }

  static getInstance(): GameStorageService {
    if (!GameStorageService.instance) {
      GameStorageService.instance = new GameStorageService();
    }
    return GameStorageService.instance;
  }
}
```

Provider components call `getInstance()` on each operation (not caching the instance), so replacing the singleton via `initialize()` takes effect for subsequent calls. `initialize()` must be called before any component mounts; this is naturally true since `main.ts` runs before components connect.

#### 4.2 Bootstrap in `main.ts`

Register components first so the UI renders immediately from local data. Firebase initializes in the background.

```typescript
registerComponents();
startRouter();

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  tryResumeSession().then(async (userId) => {
    if (!userId) return; // No session -- show "Sign In to sync" button
    await activateSync(userId);
  }).catch(err => {
    console.error("Firebase initialization failed, using local-only storage:", err);
  });
}
```

#### 4.3 Activate sync

`activateSync` and `deactivateSync` are exported from `src/services/firebase.ts` so UI components can call them after sign-in/sign-out.

```typescript
// Module-level reference for cleanup on sign-out
let activeThrottledAdapter: ThrottledStorageAdapter<StoredGame> | null = null;

export async function activateSync(userId: string): Promise<void> {
  const local = new LocalStorageAdapter<StoredGame>("scorekeeper");
  const firestoreAdapter = new FirestoreStorageAdapter<StoredGame>("games", userId);
  const throttledRemote = new ThrottledStorageAdapter(firestoreAdapter, 30_000);

  activeThrottledAdapter = throttledRemote;
  GameStorageService.initialize(new SyncedStorageAdapter(local, throttledRemote));

  try {
    await runInitialSync(local, firestoreAdapter);
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
  // Revert to local-only storage
  GameStorageService.initialize(new LocalStorageAdapter<StoredGame>("scorekeeper"));
}
```

A sign-in button calls:
```typescript
import { signIn, activateSync } from "@/services/firebase";

async handleSignIn() {
  const userId = await signIn();
  if (userId) await activateSync(userId);
}
```

A sign-out button calls:
```typescript
import { signOut } from "@/services/firebase";

async handleSignOut() {
  await signOut();
}
```

`signOut()` (defined in the Authentication section above) calls `deactivateSync()`, then `auth.signOut()`, then dispatches `scorekeeper:sync-complete` so providers refresh the UI.

#### 4.4 Initial sync

Merge local and remote state on startup. Uses the raw Firestore adapter (not throttled) since this is a one-time bulk operation.

Date normalization is critical: `local.getAll()` returns ISO strings for dates, `remote.getAll()` returns `Date` objects. Comparing `Date > string` produces `NaN` and is always `false`, silently breaking the merge. Both sides are normalized before comparison.

```typescript
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

  const localMap = new Map(localGames.map(g => [g.id, g]));
  const remoteMap = new Map(remoteGames.map(g => [g.id, g]));

  const writes: Promise<unknown>[] = [];

  for (const [id, remoteGame] of remoteMap) {
    const localGame = localMap.get(id);
    if (!localGame) {
      writes.push(local.set(id, remoteGame));
    } else if (remoteGame.updatedAt > localGame.updatedAt) {
      // Document-level last-write-wins. If Device A updated the score and
      // Device B updated the name, one change is silently discarded.
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

async function getAllFromKeys(adapter: StorageAdapter<StoredGame>): Promise<StoredGame[]> {
  const keys = await adapter.keys();
  return (await Promise.all(keys.map(k => adapter.get(k))))
    .filter((g): g is StoredGame => g !== null);
}
```

**Limitation:** Conflict resolution uses `updatedAt` timestamps from client clocks. Clock drift between devices can cause the wrong version to win.

### Phase 5: Real-time Sync (Optional Enhancement)

Add a `RemoteStorageAdapter` interface extending `StorageAdapter` with a `subscribe` method:

```typescript
export interface RemoteStorageAdapter<T> extends StorageAdapter<T> {
  subscribe(onChange: (key: string, value: T | null) => void): () => void;
}
```

Implement in `FirestoreStorageAdapter`:

```typescript
subscribe(onChange: (key: string, value: T | null) => void): () => void {
  const q = query(this.collectionRef, where("userId", "==", this.userId));
  // Skip the first emission -- it delivers ALL existing docs as "added",
  // duplicating work already done by runInitialSync.
  let initialized = false;
  return onSnapshot(q, (snapshot) => {
    if (!initialized) { initialized = true; return; }
    snapshot.docChanges().forEach((change) => {
      if (change.type === "removed") {
        onChange(change.doc.id, null);
      } else {
        onChange(change.doc.id, this.deserialize(change.doc.data()));
      }
    });
  });
}
```

Wire into `SyncedStorageAdapter` via a `startSync(onUpdate)` method that writes remote changes to local and dispatches `scorekeeper:sync-complete`.

### Phase 6: Firebase Project Setup

Manual/one-time setup:

1. Create a Firebase project at console.firebase.google.com
2. Enable Firestore (start in test mode, then tighten rules)
3. Enable Google Sign-In under Authentication > Sign-in methods
4. Copy the Firebase config object into `.env`
5. Initialize the Firebase CLI and configure emulators:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore emulators
   ```
   Configure emulator ports in `firebase.json`:
   ```json
   {
     "emulators": {
       "auth": { "port": 9099 },
       "firestore": { "port": 8080 }
     }
   }
   ```
   Connect to emulators in dev mode (`src/services/firebase.ts`):
   ```typescript
   if (import.meta.env.DEV) {
     connectFirestoreEmulator(db, "localhost", 8080);
     connectAuthEmulator(auth, "http://localhost:9099");
   }
   ```
   Note: `signInWithPopup` does not work against the auth emulator. Use `signInWithEmailAndPassword` with a seeded test user for local dev.

6. Set Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /games/{gameId} {
         allow read, update, delete: if request.auth != null
                                      && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null
                       && request.resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

---

## File Changes Summary

| File | Change |
|---|---|
| `package.json` | Add `firebase` dependency |
| `.env.example` | New -- required env vars |
| `.gitignore` | Ensure `.env` is listed |
| `firebase.json` | New -- created by `firebase init` |
| `src/services/firebase.ts` | New -- Firebase init, auth helpers, `activateSync`/`deactivateSync`, emulator config |
| `src/utils/normalizeDates.ts` | New -- shared date normalization for `StoredGame` |
| `src/utils/storage-adapters/types.ts` | All methods return `Promise<T>`; add optional `getAll?()` |
| `src/utils/storage-adapters/local-storage.ts` | Wrap returns in `Promise.resolve()`; add `getAll()` |
| `src/utils/storage-adapters/session-storage.ts` | Wrap returns in `Promise.resolve()` |
| `src/utils/storage-adapters/firestore-storage.ts` | New -- Firestore adapter with serialize/deserialize |
| `src/utils/storage-adapters/synced-storage.ts` | New -- composite local+remote adapter |
| `src/utils/storage-adapters/throttled-storage.ts` | New -- debounced writes with `flush()` and `destroy()` |
| `src/utils/storage-adapters/index.ts` | Export new adapters |
| `src/services/gameStorage.ts` | All methods async; configurable adapter; `fromGameContext` async; uses `normalizeDates` |
| `src/components/providers/game-provider.ts` | Async storage calls |
| `src/components/providers/game-list-provider.ts` | Async storage calls; listen for `scorekeeper:sync-complete` |
| `src/main.ts` | Register components first; resume session in background |

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Async migration breaks existing functionality | Phase 2 is standalone -- verify local-only works before adding Firebase |
| `fromGameContext` calls `getStoredGame` (now async) | Listed in Phase 2.1 as requiring async migration |
| `signInWithPopup` blocked by browser on auto-call | Only called from user-triggered click handler; background path uses `tryResumeSession` |
| `auth.currentUser` null before session restores | `auth.authStateReady()` awaited before reading `auth.currentUser` |
| Firebase init blocks UI render | Components register before Firebase; auth runs in background |
| UI stale after background sync | `scorekeeper:sync-complete` event triggers provider reload |
| Active game overwritten by sync | `game-provider` does not listen for sync events; active gameplay takes precedence |
| `runInitialSync` failure suppresses UI refresh | Try/catch around sync; event always dispatched after `initialize()` |
| Sign-out leaves orphaned adapters | `deactivateSync()` flushes pending writes, calls `destroy()`, reverts to local-only |
| `ThrottledStorageAdapter` leaks event listeners | `destroy()` removes `visibilitychange` listener; called on sign-out |
| Timer writes burn Firestore quota | `ThrottledStorageAdapter` debounces to 30s on the remote path only |
| Pending writes lost on tab close | `visibilitychange` to `"hidden"` triggers flush; hard kill loses up to 30s (accepted) |
| `remove()`/`clear()` ghost-writes | Both cancel pending debounced writes before delegating |
| `LocalStorageAdapter.getAll()` returns string dates | `normalizeDates()` applied in `getAllStoredGames()` and `runInitialSync()` |
| `Date > string` comparison in sync always false | Both sides normalized through `normalizeDates()` before comparison |
| `ScoreEntry` tuples stored as plain arrays | Explicit cast in `deserialize()` |
| `undefined` fields rejected by Firestore | `serialize()` strips them |
| `Timestamp` to `Date` conversion | `timestamp.toDate()` on read; `Timestamp.fromDate()` on write |
| `serialize()` is shallow | Current schema has no nested Dates; documented limitation |
| `clear()` exceeds 500-op batch limit | Chunked into batches of 500 |
| `onSnapshot` first emission is a thundering herd | Skipped with `initialized` flag |
| Conflict resolution is document-level LWW | Accepted; field-level merge is out of scope |
| Security rules allow spoofed `userId` on create | `allow create` checks `request.resource.data.userId == request.auth.uid` |
| Dev writes hit production Firestore | Emulators configured for dev mode |
| `signInWithPopup` incompatible with auth emulator | Use `signInWithEmailAndPassword` with seeded test user |
| Build-time env var check confused for runtime | Documented in Phase 1.2 |
