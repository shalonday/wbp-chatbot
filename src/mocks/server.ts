import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getPerkApiUrl } from '../constants/api';

const API_BASE = getPerkApiUrl();

export const server = setupServer(
  http.post(`${API_BASE}/chatbot/search`, () => {
    return HttpResponse.json([
      {
        node: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'JavaScript Basics',
        },
        similarity: 0.95,
      },
      {
        node: {
          id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          name: 'MDN JavaScript Tutorial',
        },
        similarity: 0.87,
      },
    ]);
  }),

  http.post(`${API_BASE}/chatbot/material-request`, () => {
    return HttpResponse.json({ success: true });
  })
);
