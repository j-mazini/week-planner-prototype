/**
 * Parses a service partner ID from string or number format
 * @param id - The service partner ID to parse (can be string or number)
 * @returns The parsed ID as a number, or null if invalid
 */
export function parseServicePartnerId(id: unknown): number | null {
  if (!id) return null;

  if (typeof id === 'number') {
    return isNaN(id) ? null : id;
  }

  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}
