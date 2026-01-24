import type { ChatMessage } from '../types';

/**
 * Mock data provider for testing and offline development
 */
const MOCK_SEARCH_RESULTS = [
  {
    node: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'JavaScript Basics',
      embedding: [],
    },
    similarity: 0.95,
  },
  {
    node: {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      name: 'MDN JavaScript Tutorial',
      embedding: [],
    },
    similarity: 0.87,
  },
  {
    node: {
      id: '7cb7b811-9dad-11d1-80b4-00c04fd430c8',
      name: 'React Fundamentals',
      embedding: [],
    },
    similarity: 0.82,
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    role: 'assistant',
    content:
      "Hi! I'm the WBP Chatbot. I can help you search for learning materials or recommend new resources to add to the Web Brain Project. What would you like to explore?",
    timestamp: new Date(),
  },
];

export const mockDataProvider = {
  getSearchResults: () => Promise.resolve(MOCK_SEARCH_RESULTS),
  getInitialMessages: () => MOCK_MESSAGES,
  submitMaterialRequest: () => Promise.resolve({ success: true }),
};
