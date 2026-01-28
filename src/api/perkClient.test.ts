import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';
import { DEFAULT_PERK_API_URL } from '../constants/api';
import { PerkAPIClient } from '../api/perkClient';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PerkAPIClient', () => {
  it('should search by similarity', async () => {
    const client = new PerkAPIClient(DEFAULT_PERK_API_URL);
    const results = await client.searchBySimilarity('javascript');
    expect(results).toHaveLength(2);
    expect(results[0].node.name).toBe('JavaScript Basics');
  });

  it('should submit material request', async () => {
    const client = new PerkAPIClient(DEFAULT_PERK_API_URL);
    const result = await client.submitMaterialRequest({
      userIntent: 'Add React tutorial',
      suggestedMaterials: [],
      sessionId: 'test_session',
      timestamp: new Date(),
    });
    expect(result.success).toBe(true);
  });
});
