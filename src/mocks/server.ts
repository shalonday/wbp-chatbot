import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const API_BASE =
  import.meta.env.VITE_PERK_API_BASE_URL || 'http://localhost:3000';

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
