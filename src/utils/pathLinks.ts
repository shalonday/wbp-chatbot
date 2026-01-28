import type { SearchResult } from '../types';

/**
 * Build a path link for the D3 graph visualization
 * Uses "E" (entry node) as the default start if only one node is provided
 */
export function buildPathLink(startId: string, endId?: string): string {
  if (endId) {
    return `/paths/${encodeURIComponent(startId)}/${encodeURIComponent(endId)}`;
  }
  // Default to "E" (entry node) as start if only one ID provided
  return `/paths/E/${encodeURIComponent(startId)}`;
}

/**
 * Build path links for search results
 * Defaults to using "E" (entry node) as the start node
 */
export function buildResultLinks(
  results: SearchResult[],
  startNodeId: string = 'E'
): Array<{ nodeId: string; name: string; link: string }> {
  return results.map((result) => ({
    nodeId: result.node.id,
    name: result.node.name,
    link: buildPathLink(startNodeId, result.node.id),
  }));
}
