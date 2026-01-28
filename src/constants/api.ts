/**
 * API Configuration Constants
 */

// Default Perk API base URL (used if VITE_PERK_API_BASE_URL is not set)
export const DEFAULT_PERK_API_URL = 'http://localhost:3000';

// Get the Perk API base URL from environment or use default
export function getPerkApiUrl(): string {
  return import.meta.env.VITE_PERK_API_BASE_URL || DEFAULT_PERK_API_URL;
}
