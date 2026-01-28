import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Stack,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SettingsIcon from '@mui/icons-material/Settings';
import type { PerkAPIClient } from '../api/perkClient';
import type { ChatMessage, MaterialRequest, SearchResult } from '../types';
import { generateSessionId } from '../utils/common';
import { buildPathLink, buildResultLinks } from '../utils/pathLinks';

export interface RAGChatbotProps {
  apiClient: PerkAPIClient;
  systemPrompt?: string;
  customInstructions?: string;
  onMaterialRequestSubmit?: (request: MaterialRequest) => Promise<void>;
  startNodeId?: string; // Default start node for path links (e.g., "E" for entry)
  sx?: object;
}

/**
 * Main RAG Chatbot Component
 *
 * Provides semantic search over Neo4j graph, clickable result links,
 * and Discord integration for material requests.
 */
export function RAGChatbot({
  apiClient,
  systemPrompt = 'You are a helpful assistant for the Web Brain Project Search Page. Assist users in searching for URLs or skills, and assist them in adding new material if the material they are looking for does not exist yet.',
  customInstructions = '',
  onMaterialRequestSubmit,
  startNodeId = 'E', // Default to "E" (entry node)
  sx = {},
}: RAGChatbotProps) {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(customInstructions);
  const [sessionId] = useState(() => generateSessionId());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userConsent, setUserConsent] = useState(false);
  const [userIdentification, setUserIdentification] = useState('');

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          "Hi! I'm the WBP Chatbot. I can help you search for learning materials or recommend new resources to add to the Web Brain Project. What would you like to explore?",
        timestamp: new Date(),
        metadata: { sessionId },
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  /**
   * Compose full system prompt with custom instructions
   */
  const getFullSystemPrompt = (): string => {
    const base = systemPrompt;
    if (customPrompt) {
      return `${base}\n\nAdditional Instructions:\n${customPrompt}`;
    }
    return base;
  };

  /**
   * Handle user message submission
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      metadata: {
        sessionId,
      },
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    try {
      // Search for relevant results
      const results = await apiClient.searchBySimilarity(inputValue, 10);
      setSearchResults(results);
      setShowResults(true);

      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: formatAssistantResponse(results),
        timestamp: new Date(),
        metadata: {
          sessionId,
          relatedNodeIds: results.map((r) => r.node.id),
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error processing message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format assistant response with result links
   */
  const formatAssistantResponse = (results: SearchResult[]): string => {
    if (results.length === 0) {
      return 'No relevant materials found. Would you like to request adding new materials?';
    }

    const resultLinks = buildResultLinks(results, startNodeId);
    const resultsList = resultLinks
      .map((r) => `• [${r.name}](${r.link})`)
      .join('\n');

    return `I found ${results.length} relevant material(s):\n\n${resultsList}\n\nWould you like more information about any of these, or would you like to request new materials?`;
  };

  /**
   * Handle file upload for custom instructions
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setCustomPrompt(text);
    } catch (err) {
      setError('Failed to read file');
      console.error('File read error:', err);
    }
  };

  /**
   * Handle material request submission
   */
  const handleSubmitMaterialRequest = async () => {
    try {
      // Get the last user message
      const userMessages = messages.filter((m) => m.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1];

      const request: MaterialRequest = {
        userIntent: lastUserMessage?.content || '',
        suggestedMaterials: searchResults,
        userIdentification: userConsent ? userIdentification : undefined,
        sessionId,
        timestamp: new Date(),
      };

      if (onMaterialRequestSubmit) {
        await onMaterialRequestSubmit(request);
      } else {
        await apiClient.submitMaterialRequest(request);
      }

      setShowResults(false);
      const thankYouMessage: ChatMessage = {
        id: `msg-${Date.now()}-thanks`,
        role: 'assistant',
        content:
          'Thank you for your request! The admin team will review it shortly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, thankYouMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit request';
      setError(errorMessage);
      console.error('Error submitting material request:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        ...sx,
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>Web Brain Project Chatbot</h2>
        <IconButton
          onClick={() => setShowSettings(true)}
          aria-label="settings"
          title="Custom Instructions"
        >
          <SettingsIcon />
        </IconButton>
      </Paper>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', marginTop: 4, color: '#999' }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent:
                message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Paper
              sx={{
                maxWidth: '70%',
                padding: 2,
                backgroundColor:
                  message.role === 'user' ? '#1976d2' : '#e0e0e0',
                color: message.role === 'user' ? '#fff' : '#000',
                borderRadius: 2,
                wordBreak: 'break-word',
              }}
            >
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content.split('\n').map((line, idx) => {
                  // Handle markdown-style links: [text](/path)
                  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
                  const parts = [];
                  let lastIndex = 0;

                  let match;
                  while ((match = linkRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(line.substring(lastIndex, match.index));
                    }
                    parts.push(
                      <MuiLink
                        key={`link-${idx}-${match.index}`}
                        href={match[2]}
                        sx={{
                          color: message.role === 'user' ? '#fff' : '#1976d2',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {match[1]}
                      </MuiLink>
                    );
                    lastIndex = linkRegex.lastIndex;
                  }

                  if (lastIndex < line.length) {
                    parts.push(line.substring(lastIndex));
                  }

                  return <div key={idx}>{parts.length > 0 ? parts : line}</div>;
                })}
              </Box>
            </Paper>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Search Results Panel */}
      {showResults && searchResults.length > 0 && (
        <Paper
          sx={{
            margin: 2,
            padding: 2,
            backgroundColor: '#f9f9f9',
            borderLeft: '4px solid #1976d2',
          }}
        >
          <h4 style={{ marginTop: 0 }}>
            Search Results ({searchResults.length})
          </h4>
          <List dense>
            {searchResults.map((result) => (
              <ListItem key={result.node.id} disableGutters sx={{ mb: 1 }}>
                <ListItemText
                  primary={
                    <MuiLink
                      href={buildPathLink(startNodeId, result.node.id)}
                      sx={{ fontWeight: 500 }}
                    >
                      {result.node.name}
                    </MuiLink>
                  }
                  secondary={
                    <>
                      <Chip
                        label={`Similarity: ${(result.similarity * 100).toFixed(1)}%`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmitMaterialRequest}
            >
              Request Addition
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowResults(false)}
            >
              Dismiss
            </Button>
          </Stack>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              label="Your name (optional)"
              value={userIdentification}
              onChange={(e) => {
                setUserIdentification(e.target.value);
                setUserConsent(!!e.target.value);
              }}
              placeholder="e.g., John Doe"
              sx={{ flex: 1 }}
              helperText="Included in Discord notification if provided"
            />
          </Box>
        </Paper>
      )}

      {/* Input Area */}
      <Paper
        elevation={2}
        sx={{
          padding: 2,
          borderRadius: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask about learning materials..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            aria-label="Message input"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".txt"
            aria-label="Upload instructions file"
          />
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Upload custom instructions"
            aria-label="upload file"
          >
            <AttachFileIcon />
          </IconButton>
          <IconButton
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            color="primary"
            aria-label="send message"
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Custom Instructions</DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Additional system prompt instructions"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter custom instructions that will be appended to the base system prompt..."
            helperText="These instructions will append to the default system prompt"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button onClick={() => setShowSettings(false)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
