/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * UUID validation
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * SQL injection prevention - basic validation
 */
export function isSafeSQLString(sql: string): boolean {
  const dangerousPatterns = [
    /;\s*drop\s+/i,
    /;\s*delete\s+/i,
    /;\s*truncate\s+/i,
    /;\s*alter\s+/i,
    /;\s*create\s+/i,
    /;\s*grant\s+/i,
    /;\s*revoke\s+/i,
  ];
  return !dangerousPatterns.some((pattern) => pattern.test(sql));
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Validate required fields in an object
 */
export function validateRequired<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (isNullOrUndefined(obj[field]) || isEmpty(String(obj[field]))) {
      missing.push(String(field));
    }
  }
  return { valid: missing.length === 0, missing };
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Domain validation
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}
