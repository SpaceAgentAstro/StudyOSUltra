/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import { AppView } from '../types';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

describe('Sidebar Navigation', () => {
  const mockSetView = vi.fn();
  const mockOnSignOut = vi.fn();
  const mockOnSwitchToSignIn = vi.fn();

  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: mockSetView,
    authUser: null,
    guestMode: true,
    authBusy: false,
    onSignOut: mockOnSignOut,
    onSwitchToSignIn: mockOnSwitchToSignIn,
  };

  it('renders navigation buttons with accessible names', () => {
    render(<Sidebar {...defaultProps} />);

    const expectedLabels = [
      'Dashboard',
      'Codex Skills',
      'Universe',
      'Council Chat',
      'Meta Engine',
      'Skills Lab',
      'Creative Studio',
      'Game Center',
      'Exam Simulator',
      'Social Hub',
      'Sources',
      'Syllabus',
    ];

    expectedLabels.forEach((label) => {
      // In JSDOM without CSS processing, the text is visible, so getByRole might find it by text.
      // However, we specifically want to ensure aria-label is present for mobile accessibility where text is hidden.
      // We find the button (it might be found by text content in this environment)
      const button = screen.getByRole('button', { name: label });
      expect(button).toBeInTheDocument();

      // Critical check: assert aria-label and title are present
      // This ensures that even when the text span is hidden (on mobile), the button has an accessible name.
      expect(button).toHaveAttribute('aria-label', label);
      expect(button).toHaveAttribute('title', label);
    });
  });
});
