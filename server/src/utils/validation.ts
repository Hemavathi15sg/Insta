/**
 * Validates and sanitizes a tag string
 * @param tag - The tag to validate
 * @returns Validated and trimmed tag (max 20 chars) or null if invalid
 */
export function validateTag(tag: any): string | null {
  // If tag is undefined, null, or empty string, return null
  if (tag === undefined || tag === null || tag === '') {
    return null;
  }

  // Convert to string and trim whitespace
  const trimmedTag = String(tag).trim();

  // If empty after trimming, return null
  if (trimmedTag === '') {
    return null;
  }

  // Truncate to 20 characters maximum
  return trimmedTag.substring(0, 20);
}
