# WBP Chatbot Component

A plug-and-play RAG chatbot React component for the Web Brain Project, powered by Neo4j and Material UI.

## Features

- **Semantic search** over Neo4j graph (skills and learning materials)
- **Clickable links** to visualization (`/paths/:startId/:endId`)
- **Discord integration** for material requests with rich embeds
- **Custom instructions** that append to system prompt
- **Fully tested** with Vitest, React Testing Library, and MSW
- **Styled with Material UI** using sensible defaults

## Installation

Install the package into your React app:

```bash
npm install wbp-chatbot
```

### Testing

```bash
npm test           # Run tests
npm run test:ui    # Visual test dashboard
npm run test:coverage  # Coverage report
```

### Linting & Formatting

```bash
npm run lint       # Check and fix lint issues
npm run format     # Format code with Prettier
```

## Project Structure

```
src/
├── api/               # Perk API client
├── components/        # React components (chatbot, message, etc.)
├── hooks/            # Custom hooks (useChatbot)
├── mocks/            # Mock data and MSW server
├── types/            # TypeScript types
├── utils/            # Utilities (session ID, path links, etc.)
├── test/             # Test configuration
└── index.ts          # Library entrypoint exports
```

## Usage

### Basic Example

```tsx
import { RAGChatbot, createPerkAPIClient } from 'wbp-chatbot';

function SearchPage() {
  const apiClient = createPerkAPIClient();

  return (
    <RAGChatbot
      apiClient={apiClient}
      systemPrompt="You are a helpful learning assistant"
      customInstructions="Focus on beginner-friendly resources"
    />
  );
}
```

### With Custom Event Handlers

```tsx
<RAGChatbot
  apiClient={apiClient}
  onMaterialRequestSubmit={async (request) => {
    console.log('Material request:', request);
    // Custom handling
  }}
/>
```

## Architecture

### Data Flow

1. User inputs a query
2. Component calls `apiClient.searchBySimilarity(query)`
3. Perk API backend searches Neo4j embeddings
4. Results are displayed with clickable path links
5. For material requests, results are formatted as Discord embeds and submitted

### Neo4j Schema

```
Nodes:
- Skill (id, name, embedding)
- URL (id, name, embedding)

Relationships:
- (Skill)-[:IS_PREREQUISITE_TO]->(URL)
- (URL)-[:TEACHES]->(Skill)
```

## API Endpoints (Perk API)

The component expects these endpoints to be available:

- `POST /chatbot/search` - Similarity search over embeddings
  - Request: `{ query: string, limit?: number }`
  - Response: `SearchResult[]`

- `POST /chatbot/material-request` - Submit a material request
  - Request: `{ embed: DiscordEmbedPayload, request: MaterialRequest }`
  - Response: `{ success: boolean }`

## Custom Instructions

Pass custom instructions as a string. They will be appended to the default system prompt:

```tsx
<RAGChatbot
  apiClient={apiClient}
  customInstructions={`
    - Always recommend beginner-friendly resources first
    - Include time estimates for each material
  `}
/>
```

## Development & Testing

The project includes:

- **MSW (Mock Service Worker)** for API mocking
- **React Testing Library** for component testing
- **Vitest** as the test runner
- Mock data provider for offline development

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { RAGChatbot } from './RAGChatbot';
import { createPerkAPIClient } from '../api/perkClient';

it('should render chatbot', () => {
  const apiClient = createPerkAPIClient();
  render(<RAGChatbot apiClient={apiClient} />);
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});
```

## Todo / Future Work

- [ ] Implement full RAGChatbot component with UI
- [ ] Add material request confirmation flow
- [ ] User identification/consent UI
- [ ] Embedding generation pipeline documentation
- [ ] More comprehensive tests
- [ ] Dark mode support
- [ ] Message persistence (localStorage)

## License

MIT
