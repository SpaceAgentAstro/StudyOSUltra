
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Sidebar from './Sidebar';
import { AppView } from '../types';
import React from 'react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

describe('Sidebar', () => {
  it('renders navigation buttons with accessible names (aria-label)', () => {
    const mockProps = {
      currentView: AppView.DASHBOARD,
      setView: vi.fn(),
      authUser: null,
      guestMode: false,
      authBusy: false,
      onSignOut: vi.fn(),
      onSwitchToSignIn: vi.fn(),
    };

    render(<Sidebar {...mockProps} />);

    // Get all buttons. The first few should be the navigation items.
    // Dashboard is the first item.
    const dashboardButton = screen.getAllByRole('button')[0];

    // We expect the button to have an aria-label because the text might be hidden on small screens
    expect(dashboardButton).toHaveAttribute('aria-label', 'Dashboard');

    // Also check for title attribute for mouse users
    expect(dashboardButton).toHaveAttribute('title', 'Dashboard');
  });

  it('renders sign in button with accessible name when logged out', () => {
      const mockProps = {
        currentView: AppView.DASHBOARD,
        setView: vi.fn(),
        authUser: null,
        guestMode: false,
        authBusy: false,
        onSignOut: vi.fn(),
        onSwitchToSignIn: vi.fn(),
      };

      render(<Sidebar {...mockProps} />);

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      expect(signInButton).toBeInTheDocument();
  });
});
