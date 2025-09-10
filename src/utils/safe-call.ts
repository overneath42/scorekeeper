/**
 * Safely calls a function if it exists, passing any arguments, or returns a default value if provided.
 * @param fn The function to call, or undefined.
 * @param args Arguments to pass to the function.
 * @param defaultValue Optional value to return if fn is not a function.
 */
export function safeCall<T extends unknown[], R = void>(
  fn: ((...args: T) => R) | undefined,
  args: T,
  defaultValue?: R
): R | undefined {
  if (typeof fn === "function") {
    return fn(...args);
  }
  return defaultValue;
}
