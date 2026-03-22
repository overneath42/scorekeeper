import { StorageAdapter } from "../storage-adapters";

/**
 * A storage adapter that provides a typed interface for interacting with
 * the browser's `localStorage` API, with optional key prefixing for namespacing.
 * This will persist game data as long as the user uses the same device and browser,
 * and doesn't clear their local storage.
 *
 * This adapter implements the `StorageAdapter<T>` interface, allowing you to
 * store, retrieve, and manage values of type `T` in local storage.
 *
 * @typeParam T - The type of values to be stored and retrieved.
 *
 * @example
 * ```typescript
 * const adapter = new LocalStorageAdapter<User>('user');
 * adapter.set('profile', { name: 'Alice' });
 * const profile = adapter.get('profile');
 * ```
 */
export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return Promise.resolve(item ? JSON.parse(item) : null);
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return Promise.resolve(null);
    }
  }

  async set(key: string, value: T): Promise<boolean> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
      return Promise.resolve(true);
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
      return Promise.resolve(false);
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.getKey(key));
      return Promise.resolve(true);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
      return Promise.resolve(false);
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (this.prefix) {
        const keys = await this.keys();
        keys.forEach((key) => localStorage.removeItem(this.getKey(key)));
      } else {
        localStorage.clear();
      }
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return Promise.resolve(false);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const allKeys = Object.keys(localStorage);
      if (this.prefix) {
        const prefixPattern = `${this.prefix}:`;
        return Promise.resolve(
          allKeys
            .filter((key) => key.startsWith(prefixPattern))
            .map((key) => key.substring(prefixPattern.length))
        );
      }
      return Promise.resolve(allKeys);
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return Promise.resolve([]);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return Promise.resolve(localStorage.getItem(this.getKey(key)) !== null);
    } catch (error) {
      console.error(`Error checking localStorage for key "${key}":`, error);
      return Promise.resolve(false);
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const keys = await this.keys();
      const items = keys.map((key) => {
        const item = localStorage.getItem(this.getKey(key));
        return item ? (JSON.parse(item) as T) : null;
      });
      return Promise.resolve(items.filter((item): item is T => item !== null));
    } catch (error) {
      console.error("Error getting all items from localStorage:", error);
      return Promise.resolve([]);
    }
  }
}
