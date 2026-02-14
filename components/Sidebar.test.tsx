/** @vitest-environment jsdom */
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';
import Sidebar from './Sidebar';
import { AppView } from '../types';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('Sidebar', () => {
  const mockSetView = vi.fn();
  const mockOnSignOut = vi.fn();
  const mockOnSwitchToSignIn = vi.fn();

  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: mockSetView,
    authUser: null,
    guestMode: false,
    onSignOut: mockOnSignOut,
    onSwitchToSignIn: mockOnSwitchToSignIn,
  };

  it('renders navigation buttons with accessible names (aria-label)', () => {
    render(<Sidebar {...defaultProps} />);

    // Check for a few key navigation items
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Council Chat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sources' })).toBeInTheDocument();
  });

  it('renders navigation buttons with title attributes for tooltips', () => {
    render(<Sidebar {...defaultProps} />);

    const dashboardBtn = screen.getByRole('button', { name: 'Dashboard' });
    expect(dashboardBtn).toHaveAttribute('title', 'Dashboard');

    const chatBtn = screen.getByRole('button', { name: 'Council Chat' });
    expect(chatBtn).toHaveAttribute('title', 'Council Chat');
  });

  it('highlights the active view', () => {
    render(<Sidebar {...defaultProps} currentView={AppView.CHAT} />);

    const chatBtn = screen.getByRole('button', { name: 'Council Chat' });
    expect(chatBtn).toHaveClass('bg-primary-600');
  });
});
