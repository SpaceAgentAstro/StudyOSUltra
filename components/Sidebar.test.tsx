// @vitest-environment jsdom
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
  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: vi.fn(),
    authUser: null,
    guestMode: true,
    onSignOut: vi.fn(),
    onSwitchToSignIn: vi.fn(),
  };

  it('renders navigation buttons with accessible names', () => {
    render(<Sidebar {...defaultProps} />);

    const dashboardBtn = screen.getByRole('button', { name: /Dashboard/i });
    expect(dashboardBtn).toBeInTheDocument();

    // Check for aria-label on the button itself
    // This is what we want to add. Currently it might fail if aria-label is missing,
    // but pass because the text content is present (though hidden in CSS, visible in JSDOM usually).
    // So we explicitly check for the attribute to ensure our fix is applied.
    expect(dashboardBtn).toHaveAttribute('aria-label', 'Dashboard');
  });

  it('renders navigation buttons with title attribute for tooltips', () => {
    render(<Sidebar {...defaultProps} />);

    const dashboardBtn = screen.getByRole('button', { name: /Dashboard/i });
    expect(dashboardBtn).toHaveAttribute('title', 'Dashboard');
  });
});
