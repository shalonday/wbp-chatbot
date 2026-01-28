import { RAGChatbot } from './components/RAGChatbot';
import { createPerkAPIClient } from './api/perkClient';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

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

function App() {
  const apiClient = createPerkAPIClient();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RAGChatbot
        apiClient={apiClient}
        systemPrompt="You are a helpful assistant for the Web Brain Project Search Page. Assist users in searching for URLs or skills, and assist them in adding new material if the material they are looking for does not exist yet."
        customInstructions=""
      />
    </ThemeProvider>
  );
}

export default App;
