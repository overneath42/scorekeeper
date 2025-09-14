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

  get(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: T): boolean {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
      return false;
    }
  }
 
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (this.prefix) {
        const keys = this.keys();
        keys.forEach((key) => localStorage.removeItem(this.getKey(key)));
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  keys(): string[] {
    try {
      const allKeys = Object.keys(localStorage);
      if (this.prefix) {
        const prefixPattern = `${this.prefix}:`;
        return allKeys
          .filter((key) => key.startsWith(prefixPattern))
          .map((key) => key.substring(prefixPattern.length));
      }
      return allKeys;
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return [];
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(this.getKey(key)) !== null;
    } catch (error) {
      console.error(`Error checking localStorage for key "${key}":`, error);
      return false;
    }
  }
}
