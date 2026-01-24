import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

import { PerkAPIClient } from '../api/perkClient';

describe('PerkAPIClient', () => {
  it('should search by similarity', async () => {
    const client = new PerkAPIClient('http://localhost:3000');
    const results = await client.searchBySimilarity('javascript');
    expect(results).toHaveLength(2);
    expect(results[0].node.name).toBe('JavaScript Basics');
  });

  it('should submit material request', async () => {
    const client = new PerkAPIClient('http://localhost:3000');
    const result = await client.submitMaterialRequest({
      userIntent: 'Add React tutorial',
      suggestedMaterials: [],
      sessionId: 'test_session',
      timestamp: new Date(),
    });
    expect(result.success).toBe(true);
  });
});
