import type { StorageAdapter } from "./types.js";

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
