// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import GameCenter from './GameCenter';

expect.extend(matchers);
import * as geminiService from '../services/geminiService';
import { FileDocument } from '../types';
import React from 'react';

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  generateGameQuestions: vi.fn(),
  gradeOpenEndedAnswer: vi.fn(),
}));

describe('GameCenter', () => {
  const mockFiles: FileDocument[] = [
    {
      id: '1',
      name: 'test.pdf',
      type: 'pdf',
      content: 'test content',
      uploadDate: Date.now(),
      status: 'ready',
    },
  ];

  it('handles empty questions gracefully', async () => {
    // Mock generateGameQuestions to return an empty array
    vi.mocked(geminiService.generateGameQuestions).mockResolvedValue([]);

    render(<GameCenter files={mockFiles} />);

    // Click on a topic to start game (first topic)
    const startButton = screen.getAllByText('Smart MCQ')[0];
    fireEvent.click(startButton);

    // Wait for async operation and verify the fallback UI is shown
    await waitFor(() => {
      expect(screen.getByText(/No Questions Available/i)).toBeInTheDocument();
    });

    // Verify return to dashboard button works
    const returnButton = screen.getByText(/Return to Dashboard/i);
    fireEvent.click(returnButton);

    // Should be back to dashboard
    expect(screen.getByText(/Game Center/i)).toBeInTheDocument();
  });
});
