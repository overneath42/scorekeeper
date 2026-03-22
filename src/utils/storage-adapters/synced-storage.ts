import type { StorageAdapter } from "./types.js";

export class SyncedStorageAdapter<T> implements StorageAdapter<T> {
  constructor(
    private local: StorageAdapter<T>,
    private remote: StorageAdapter<T>
  ) {}

  async get(key: string): Promise<T | null> {
    const localResult = await this.local.get(key);
    if (localResult !== null) return localResult;

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

    if (localItems.length === 0 && this.remote.getAll) {
      const remoteItems = await this.remote.getAll().catch(() => [] as T[]);
      await Promise.all(remoteItems.map(item => {
        const id = (item as Record<string, unknown>).id as string;
        return id ? this.local.set(id, item) : Promise.resolve(false);
      }));
      return remoteItems;
    }
    return localItems;
  }

  private async getAllFromKeys(adapter: StorageAdapter<T>): Promise<T[]> {
    const keys = await adapter.keys();
    const results = await Promise.all(keys.map(k => adapter.get(k)));
    return results.filter((v): v is NonNullable<typeof v> => v !== null) as T[];
  }
}
