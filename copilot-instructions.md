# Copilot Instructions

## Project Goal

Build a plug-and-play React RAG chatbot component for the Web Brain Project (WBP) Search page. It should query a Neo4j Aura graph, surface results with clickable links (/paths/:startId/:endId), accept custom instructions (string or file), allow styling overrides, and support an email workflow to notify the admin about new material requests.

## Tech Stack

- Vite + React + TypeScript
- Material UI (no custom theme prop overrides; use MUI defaults)
- Neo4j JavaScript driver for Aura (embeddings stored in Neo4j)
- RAG layer: retrieval via Neo4j similarity search using stored embeddings
- Testing: Vitest + React Testing Library + Mock Service Worker
- Linting/formatting: ESLint (TypeScript + React), Prettier
- Backend integration: https://perk-api-production.up.railway.app (add new endpoints as needed)

## Architecture & Data Models

### Neo4j Schema

**Nodes:**

- `Skill` (properties: `id`, `name`)
- `URL` (properties: `id`, `name`)

**Relationships:**

- `(Skill)-[:IS_PREREQUISITE_TO]->(URL)`
- `(URL)-[:TEACHES]->(Skill)`

**Embeddings:** Stored directly in Neo4j as node properties. We will add generation/refresh logic later.

### Data Flow

- Chatbot queries the perk-api backend (https://perk-api-production.up.railway.app) for:
  - Similarity search over Neo4j embeddings
  - Discord webhook submission for material requests
- Neo4j Aura credentials are kept server-side (not exposed to client)
- Results include clickable links in format `/paths/:startId/:endId`

## Constraints & Practices

- Keep secrets/config in .env.local (never commit). Example keys: NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, EMAIL_WEBHOOK_URL.
- Prefer hooks and functional components; keep side effects isolated.
- Add brief comments only for non-obvious logic.
- Accessibility: sensible aria labels, keyboard navigation, focus management.
- Error handling: user-friendly messages; log details to console only in dev.
- Styling: Use MUI defaults and theme context; no custom prop-based theming overrides at this stage.
- Links in chat replies must be clickable and route-friendly (e.g., `/paths/:startId/:endId`).
- Discord workflow: Material requests are formatted as Discord embeds and posted to a webhook. Collect:
  - Brief summary of user intent
  - User identification (with consent)
  - Timestamp
  - Anonymous session ID
  - Related existing nodes from the graph
  - Format as Discord embed for readability
- Custom instructions: Should **append** to the base system prompt (unless explicitly overridden).

## Open Questions

1. **Embedding generation:** What model should we use (e.g., `sentence-transformers`, OpenAI embeddings)? Where should the pipeline run (e.g., worker script, backend endpoint)?
2. **Perk API endpoints:** We'll design and add these as we implement the chatbot (similarity search, Discord webhook submission, etc.).
3. **Existing materials search:** When user requests "add new material," should the chatbot first perform a similarity search to avoid duplicates, then show results and ask for confirmation?
4. **Session tracking:** Anonymous session ID—how should this be generated and stored (localStorage, cookie)?

## Implementation Roadmap

1. Scaffold Vite + React + TS + MUI, lint/test setup.
2. Create mock data provider and test harness.
3. Implement the RAG chatbot component with hooks for search, result display, and Discord submission.
4. Integrate perk-api endpoints (stub them first; backend dev comes later).
5. Add tests (RTL + MSW) and documentation.
