/**
 * Local HH:MM helpers for manual time entry. Kept dependency-free so the file
 * stays trivially testable / importable anywhere.
 */

/**
 * Sanitizes manual typing into an `HH:MM` shape as the user types.
 * Accepts digits only (separators are inserted): `0700` -> `07:00`,
 * `7` -> `7`, `07` -> `07`, `073` -> `07:3`.
 */
export function normalizeTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** True when `HH:MM` (24h, zero-padded) is a valid clock time. */
export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/**
 * Converts a valid `HH:MM` string into a timestamp on the current day
 * (so the existing timestamp-based payload/draft logic keeps working).
 * Returns null when the text is not a complete valid time yet.
 */
export function timeStringToTimestamp(value: string): number | null {
  if (!isValidTime(value)) return null;
  const [hour, minute] = value.split(':').map((part) => parseInt(part, 10));
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

/** Formats a timestamp back to a zero-padded `HH:MM` string. */
export function timestampToHHMM(time: number | null): string {
  if (!time) return '';
  const date = new Date(time);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
