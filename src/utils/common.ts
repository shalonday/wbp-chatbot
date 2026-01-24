/**
 * Utility to generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Utility to format a date
 */
export function formatDate(date: Date): string {
  return date.toISOString()
}

/**
 * Check if a string is a valid UUID or ID format
 */
export function isValidNodeId(id: string): boolean {
  // Simple check: non-empty string
  return id.length > 0 && typeof id === 'string'
}

/**
 * Build a path link for the D3 graph visualization
 */
export function buildPathLink(startId: string, endId: string): string {
  return `/paths/${encodeURIComponent(startId)}/${encodeURIComponent(endId)}`
}

/**
 * Parse a path link back to IDs
 */
export function parsePathLink(link: string): { startId: string; endId: string } | null {
  const match = link.match(/\/paths\/([^/]+)\/([^/]+)/)
  if (match) {
    return {
      startId: decodeURIComponent(match[1]),
      endId: decodeURIComponent(match[2]),
    }
  }
  return null
}
