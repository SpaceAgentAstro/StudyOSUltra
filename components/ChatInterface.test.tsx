
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import ChatInterface from './ChatInterface';
import { FileDocument } from '../types';

afterEach(() => {
  cleanup();
});

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  streamChatResponse: vi.fn(),
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
});
