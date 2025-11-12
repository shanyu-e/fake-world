/**
 * 将驼峰命名转换为下划线命名
 * @example camelToSnake('sendTimestamp') => 'send_timestamp'
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 将下划线命名转换为驼峰命名
 * @example snakeToCamel('send_timestamp') => 'sendTimestamp'
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 递归转换对象的键名：驼峰 -> 下划线
 */
export function keysToSnakeCase<T = unknown>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnakeCase(item)) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      if (value) {
        result[snakeKey] = keysToSnakeCase(value);
      }
    }
    return result as T;
  }

  return obj as T;
}

/**
 * 递归转换对象的键名：下划线 -> 驼峰
 */
export function keysToCamelCase<T = unknown>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamelCase(item)) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = keysToCamelCase(value);
    }
    return result as T;
  }

  return obj as T;
}
