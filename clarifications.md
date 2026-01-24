Schema:
Nodes:

- Skill
  - id: String
  - name: String
- URL
  - id: String
  - name: String

Relationships:

- (Skill)-[:IS_PREREQUISITE_TO]->(URL)
- (URL)-[:TEACHES]->(Skill)

Similarity Computation: Use embeddings stored directly in Neo4j. You will need to help me with adding these embeddings.

Data path: I have a backend at https://perk-api-production.up.railway.app. Help me add new endpoints for the chatbot later.

Email: Instead of email I've decided to use a Discord webhook, so it can be discussed there. Other template fields I think I want are:

- Brief summary of user intent
- Some User identification, if they consent
- Timestamp
- Anonymous session ID
- Related existing nodes in the graph
- Formatted as Discord embed for readability

Custom instructions: should append the system prompt, unless stated.

Styling: Just use MUI for now.
