export interface StorageAdapter<T> {
  get(key: string): T | null;
  set(key: string, value: T): boolean;
  remove(key: string): boolean;
  clear(): boolean;
  keys(): string[];
  has(key: string): boolean;
}

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
