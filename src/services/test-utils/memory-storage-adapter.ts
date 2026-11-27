import type { StorageAdapter } from "@/utils";

/**
 * A small in-memory `StorageAdapter<T>` test double, backed by a `Map`.
 * Used to unit-test storage services without touching real `localStorage`.
 */
export class MemoryStorageAdapter<T> implements StorageAdapter<T> {
  private store = new Map<string, T>();

  async get(key: string): Promise<T | null> {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  async set(key: string, value: T): Promise<boolean> {
    this.store.set(key, value);
    return true;
  }

  async remove(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async clear(): Promise<boolean> {
    this.store.clear();
    return true;
  }

  async keys(): Promise<string[]> {
    return [...this.store.keys()];
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async getAll(): Promise<T[]> {
    return [...this.store.values()];
  }
}
