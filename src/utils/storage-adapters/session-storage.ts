import { StorageAdapter } from "../storage-adapters";

/**
 * A storage adapter that provides a typed interface for interacting with
 * the browser's `sessionStorage` API, with optional key prefixing for namespacing.
 * For games so sensitive, they need to expire immediately!
 *
 * This adapter implements the `StorageAdapter<T>` interface, allowing you to
 * store, retrieve, and manage values of type `T` in session storage.
 *
 * @typeParam T - The type of values to be stored and retrieved.
 *
 * @example
 * ```typescript
 * const adapter = new SessionStorageAdapter<User>('user');
 * adapter.set('profile', { name: 'Alice' });
 * const profile = adapter.get('profile');
 * ```
 */
export class SessionStorageAdapter<T> implements StorageAdapter<T> {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  get(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from sessionStorage for key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: T): boolean {
    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to sessionStorage for key "${key}":`, error);
      return false;
    }
  }

  remove(key: string): boolean {
    try {
      sessionStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage for key "${key}":`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (this.prefix) {
        const keys = this.keys();
        keys.forEach((key) => sessionStorage.removeItem(this.getKey(key)));
      } else {
        sessionStorage.clear();
      }
      return true;
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
      return false;
    }
  }

  keys(): string[] {
    try {
      const allKeys = Object.keys(sessionStorage);
      if (this.prefix) {
        const prefixPattern = `${this.prefix}:`;
        return allKeys
          .filter((key) => key.startsWith(prefixPattern))
          .map((key) => key.substring(prefixPattern.length));
      }
      return allKeys;
    } catch (error) {
      console.error("Error getting sessionStorage keys:", error);
      return [];
    }
  }

  has(key: string): boolean {
    try {
      return sessionStorage.getItem(this.getKey(key)) !== null;
    } catch (error) {
      console.error(`Error checking sessionStorage for key "${key}":`, error);
      return false;
    }
  }
}
