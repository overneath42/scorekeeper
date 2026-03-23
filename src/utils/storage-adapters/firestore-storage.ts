import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  CollectionReference,
  DocumentData,
  Firestore,
  Timestamp,
} from "firebase/firestore";
import type { StorageAdapter } from "./types.js";
import type { ScoreEntry } from "@/types/index.js";

export class FirestoreStorageAdapter<T extends object> implements StorageAdapter<T> {
  private collectionRef: CollectionReference;
  private db: Firestore;
  private userId: string;

  constructor(db: Firestore, collectionName: string, userId: string) {
    this.db = db;
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
      const batch = writeBatch(this.db);
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

  private serialize(value: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      if (v instanceof Date) {
        out[k] = Timestamp.fromDate(v);
      } else if (k === "scoringHistory" && Array.isArray(v)) {
        // Firestore doesn't support nested arrays — convert [playerIndex, score] tuples to objects
        out[k] = (v as number[][]).map(([p, s]) => ({ p, s }));
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
      } else if (k === "scoringHistory" && Array.isArray(v)) {
        // Convert back from objects to [playerIndex, score] tuples
        out[k] = (v as { p: number; s: number }[]).map(({ p, s }) => [p, s]) as unknown as ScoreEntry[];
      } else {
        out[k] = v;
      }
    }
    return out as T;
  }
}
