/**
 * Interface for a generic storage adapter.
 *
 * Implementations of this interface provide methods for storing, retrieving,
 * and managing key-value pairs. See {@link src/utils/storage-adapters/local-storage.ts}
 * for a concrete implementation using the browser's localStorage API.
 *
 * @typeParam T - The type of value to be stored.
 */
export interface StorageAdapter<T> {
  /**
   * Retrieves the value associated with the specified key.
   * @param key - The key whose value should be retrieved.
   * @returns The value associated with the key, or `null` if the key does not exist.
   */
  get(key: string): T | null;
  /**
   * Stores a value under the specified key.
   * @param key - The key under which to store the value.
   * @param value - The value to store.
   * @returns `true` if the value was successfully stored, otherwise `false`.
   */

  set(key: string, value: T): boolean;
  /**
   * Removes the value associated with the specified key.
   * @param key - The key whose value should be removed.
   * @returns `true` if the key existed and was removed, otherwise `false`.
   */
  remove(key: string): boolean;
  /**
   * Removes all key-value pairs from the storage.
   * @returns `true` if the storage was successfully cleared, otherwise `false`.
   */
  clear(): boolean;
  /**
   * Returns an array of all keys currently stored.
   * @returns An array of strings representing the keys in storage.
   */

  keys(): string[];
  /**
   * Checks whether a value exists for the specified key.
   * @param key - The key to check for existence.
   * @returns `true` if the key exists, otherwise `false`.
   */
  has(key: string): boolean;
}
