import { describe, it, expect } from 'vitest';
import {
  generateSessionId,
  buildPathLink,
  parsePathLink,
  isValidNodeId,
} from '../utils/common';

describe('common utilities', () => {
  it('should generate unique session IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).toMatch(/^session_/);
    expect(id2).toMatch(/^session_/);
    expect(id1).not.toBe(id2);
  });

  it('should validate node IDs', () => {
    expect(isValidNodeId('skill_1')).toBe(true);
    expect(isValidNodeId('')).toBe(false);
  });

  it('should build path links', () => {
    const link = buildPathLink(
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    );
    expect(link).toBe(
      '/paths/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    );
  });

  it('should parse path links', () => {
    const link =
      '/paths/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const parsed = parsePathLink(link);
    expect(parsed?.startId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(parsed?.endId).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  });

  it('should handle encoded IDs in path links', () => {
    const link = buildPathLink('skill with spaces', 'url-123');
    const parsed = parsePathLink(link);
    expect(parsed?.startId).toBe('skill with spaces');
    expect(parsed?.endId).toBe('url-123');
  });
});
