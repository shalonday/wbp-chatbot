import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RAGChatbot } from './RAGChatbot';
import { PerkAPIClient } from '../api/perkClient';
import { DEFAULT_PERK_API_URL } from '../constants/api';

describe('RAGChatbot', () => {
  it('renders with welcome message', async () => {
    const mockClient = new PerkAPIClient(DEFAULT_PERK_API_URL);
    render(<RAGChatbot apiClient={mockClient} />);

    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm the WBP Chatbot/i)).toBeInTheDocument();
    });
  });

  it('renders message input', () => {
    const mockClient = new PerkAPIClient(DEFAULT_PERK_API_URL);
    render(<RAGChatbot apiClient={mockClient} />);

    expect(
      screen.getByPlaceholderText(/Ask about learning materials/i)
    ).toBeInTheDocument();
  });

  it('shows settings dialog when settings button clicked', async () => {
    const mockClient = new PerkAPIClient(DEFAULT_PERK_API_URL);
    const user = userEvent.setup();
    render(<RAGChatbot apiClient={mockClient} />);

    const settingsButton = screen.getByLabelText('settings');
    await user.click(settingsButton);

    expect(screen.getByText('Custom Instructions')).toBeInTheDocument();
  });

  it('sends message and receives response', async () => {
    const mockClient = new PerkAPIClient(DEFAULT_PERK_API_URL);
    const user = userEvent.setup();
    render(<RAGChatbot apiClient={mockClient} />);

    const input = screen.getByPlaceholderText(/Ask about learning materials/i);
    await user.type(input, 'javascript');

    const sendButton = screen.getByLabelText('send message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/javascript/i)).toBeInTheDocument();
    });
  });
});
