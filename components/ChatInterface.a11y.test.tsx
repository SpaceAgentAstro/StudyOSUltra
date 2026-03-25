
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import { FileDocument } from '../types';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
});

describe('ChatInterface Accessibility', () => {
  const mockFiles: FileDocument[] = [];

  it('toggle buttons have aria-pressed attribute', () => {
    render(<ChatInterface files={mockFiles} />);

    // Check Thinking Mode button
    const thinkingButton = screen.getByLabelText('Toggle Thinking Mode');
    expect(thinkingButton).toHaveAttribute('aria-pressed', 'false');

    // Toggle it
    fireEvent.click(thinkingButton);
    expect(thinkingButton).toHaveAttribute('aria-pressed', 'true');

    // Check Google Search button
    const searchButton = screen.getByLabelText('Toggle Google Search');
    expect(searchButton).toHaveAttribute('aria-pressed', 'false');

    // Toggle it
    fireEvent.click(searchButton);
    expect(searchButton).toHaveAttribute('aria-pressed', 'true');

    // Check Flash Lite button
    const flashButton = screen.getByLabelText('Toggle Flash Lite');
    expect(flashButton).toHaveAttribute('aria-pressed', 'false');

    // Toggle it
    fireEvent.click(flashButton);
    expect(flashButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('agent selection buttons have aria-pressed attribute', () => {
    render(<ChatInterface files={mockFiles} />);

    // Find the Council agent button (default selected)
    const councilButton = screen.getByRole('button', { name: /The Council/i });
    expect(councilButton).toHaveAttribute('aria-pressed', 'true');

    // Find another agent button, e.g., "Teacher" (Label is "Teacher")
    const teacherButton = screen.getByRole('button', { name: /Teacher/i });
    expect(teacherButton).toHaveAttribute('aria-pressed', 'false');

    // Click Teacher
    fireEvent.click(teacherButton);
    expect(teacherButton).toHaveAttribute('aria-pressed', 'true');
    expect(councilButton).toHaveAttribute('aria-pressed', 'false');
  });
});
