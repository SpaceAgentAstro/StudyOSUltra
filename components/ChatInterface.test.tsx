import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import { FileDocument } from '../types';
import React from 'react';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  streamChatResponse: vi.fn(),
  setRuntimeProvider: vi.fn(),
  setRuntimeApiKey: vi.fn(),
  setRuntimeApiKeyForProvider: vi.fn(),
  setRuntimeOllamaConfig: vi.fn(),
  getProviderRuntimeStatus: vi.fn(() => ({
    resolved: 'google',
    configured: { google: true }
  }))
}));

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onresult = null;
  onstart = null;
  onend = null;
  onerror = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
});

describe('ChatInterface', () => {
  const mockFiles: FileDocument[] = [];

  it('renders agent selection buttons correctly', () => {
    render(<ChatInterface files={mockFiles} />);

    expect(screen.getAllByText('The Council (Auto)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Teacher').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Examiner').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coach').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analyst').length).toBeGreaterThan(0);
  });
});
