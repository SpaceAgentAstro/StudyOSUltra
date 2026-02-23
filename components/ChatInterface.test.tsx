
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

  it('communicates selection state to assistive technology', () => {
    render(<ChatInterface files={mockFiles} />);

    // Check Agent Buttons
    const councilButton = screen.getByRole('button', { name: /The Council/i });
    const teacherButton = screen.getByRole('button', { name: /Teacher/i });

    // Default: Council is selected
    expect(councilButton).toHaveAttribute('aria-pressed', 'true');
    expect(teacherButton).toHaveAttribute('aria-pressed', 'false');

    // Switch to Teacher
    fireEvent.click(teacherButton);
    expect(councilButton).toHaveAttribute('aria-pressed', 'false');
    expect(teacherButton).toHaveAttribute('aria-pressed', 'true');

    // Check Feature Toggles
    const thinkingToggle = screen.getByLabelText('Toggle Thinking Mode');
    const searchToggle = screen.getByLabelText('Toggle Google Search');

    // Default: Off
    expect(thinkingToggle).toHaveAttribute('aria-pressed', 'false');
    expect(searchToggle).toHaveAttribute('aria-pressed', 'false');

    // Toggle Thinking Mode On
    fireEvent.click(thinkingToggle);
    expect(thinkingToggle).toHaveAttribute('aria-pressed', 'true');

    // Toggle Search On
    fireEvent.click(searchToggle);
    expect(searchToggle).toHaveAttribute('aria-pressed', 'true');
  });
});
