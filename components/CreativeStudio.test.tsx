// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';
import CreativeStudio from './CreativeStudio';
import { AppView } from '../types';

expect.extend(matchers);

vi.mock('../services/geminiService', () => ({
  generateImage: vi.fn(),
  generateVideoPlan: vi.fn(),
  generateVideoClip: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CreativeStudio', () => {
  it('renders all 17 studio cards on the home launcher', () => {
    render(<CreativeStudio />);

    const labels = [
      'Audio',
      'Video',
      'Mind Map',
      'Reports',
      'Flashcards',
      'Quiz',
      'Infographics',
      'Slide Deck',
      'Data Table',
      'Summary Notes',
      'Cheat Sheet',
      'Lesson Plan',
      'Revision Timeline',
      'Mark Scheme',
      'Rubric Builder',
      'Weakness Report',
      'Retest Plan',
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('opens the voice editor when Audio card is clicked', () => {
    render(<CreativeStudio />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Audio' }));

    expect(screen.getByText('Voice Script')).toBeInTheDocument();
  });

  it('deep-links Mind Map card through onNavigate', () => {
    const onNavigate = vi.fn();
    render(<CreativeStudio onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Mind Map' }));

    expect(onNavigate).toHaveBeenCalledWith(AppView.KNOWLEDGE_UNIVERSE);
  });

  it('opens a coming soon panel for Summary Notes', () => {
    render(<CreativeStudio />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Summary Notes' }));

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Summary Notes' })).toBeInTheDocument();
  });

  it('returns to Studio home from a tool with Back to Studio', () => {
    render(<CreativeStudio />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Audio' }));
    expect(screen.getByText('Voice Script')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Studio' }));
    expect(screen.getByRole('button', { name: 'Open Audio' })).toBeInTheDocument();
  });
});
