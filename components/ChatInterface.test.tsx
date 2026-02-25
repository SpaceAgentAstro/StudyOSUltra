
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { afterEach } from 'vitest';
import ChatInterface from './ChatInterface';
import { FileDocument } from '../types';
import { streamChatResponse } from '../services/geminiService';

afterEach(() => {
  cleanup();
});

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  streamChatResponse: vi.fn(),
  setRuntimeProvider: vi.fn(),
  setRuntimeApiKey: vi.fn(),
  setRuntimeOllamaConfig: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatInterface', () => {
  const mockFiles: FileDocument[] = [
    { id: '1', name: 'Biology_Notes.pdf', content: 'Biology content', type: 'pdf', uploadDate: Date.now(), status: 'ready' }
  ];

  it('renders initial welcome message', () => {
    render(<ChatInterface files={mockFiles} />);
    expect(screen.getByText(/Welcome to your Study Universe/i)).toBeDefined();
  });

  it('updates input value on change', () => {
    render(<ChatInterface files={mockFiles} />);
    const input = screen.getByPlaceholderText(/Ask/i);
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect((input as HTMLInputElement).value).toBe('Hello World');
  });

  it('triggers explain action when explain button is clicked', async () => {
    const messageWithCode = {
      id: '1',
      role: 'model' as const,
      agent: 'COUNCIL' as const,
      text: 'Here is some code:\n```javascript\nconsole.log("test");\n```',
      timestamp: Date.now(),
    };

    const streamChatResponseMock = vi.mocked(streamChatResponse);
    streamChatResponseMock.mockClear();

    render(<ChatInterface files={mockFiles} initialMessages={[messageWithCode]} />);

    // Find the Explain button
    const explainButton = screen.getByTitle('Ask Teacher to explain');
    expect(explainButton).toBeDefined();

    fireEvent.click(explainButton);

    // Verify streamChatResponse was called with the explanation prompt
    await waitFor(() => {
        expect(streamChatResponseMock).toHaveBeenCalled();
    });

    const callArgs = streamChatResponseMock.mock.calls[0][0];
    expect(callArgs.newMessage).toContain('Please explain this code as a teacher');
    expect(callArgs.newMessage).toContain('console.log("test");');
  });
});
