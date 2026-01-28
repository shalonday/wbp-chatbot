import { RAGChatbot } from '../components/RAGChatbot';
import { createPerkAPIClient } from '../api/perkClient';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Box,
} from '@mui/material';
import type { MaterialRequest } from '../types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Example: Standalone Chatbot Demo
 */
function StandaloneDemo() {
  const apiClient = createPerkAPIClient();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RAGChatbot
        apiClient={apiClient}
        systemPrompt="You are a helpful learning assistant for the Web Brain Project."
        customInstructions="Always recommend beginner-friendly resources first."
      />
    </ThemeProvider>
  );
}

/**
 * Example: Embedded Chatbot with Custom Handler
 */
function EmbeddedDemo() {
  const apiClient = createPerkAPIClient();

  const handleMaterialRequest = async (request: MaterialRequest) => {
    console.log('Custom material request handler:', request);
    // Custom logic here - could send to different endpoint, etc.
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <h1>Search Page</h1>
          <p>Find learning materials and visualize skill paths</p>
        </Box>

        <Box sx={{ height: '70vh', border: '1px solid #ddd', borderRadius: 2 }}>
          <RAGChatbot
            apiClient={apiClient}
            onMaterialRequestSubmit={handleMaterialRequest}
            startNodeId="E" // Entry node for skill tree
            sx={{ height: '100%', borderRadius: 2 }}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

/**
 * Example: Integration with Router (React Router v6)
 */
function RouterIntegrationExample() {
  const apiClient = createPerkAPIClient();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RAGChatbot
        apiClient={apiClient}
        startNodeId="E"
        customInstructions={`
When providing learning material recommendations:
- Always include the prerequisite chain
- Mention estimated time commitment
- Highlight any costs (free vs paid)
        `}
      />
    </ThemeProvider>
  );
}

export { StandaloneDemo, EmbeddedDemo, RouterIntegrationExample };
export default StandaloneDemo;
