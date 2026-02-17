import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';
import { AppView } from '../types';

// Mock the Icons to avoid rendering issues and keep test focused
vi.mock('./Icons', () => ({
  Brain: () => <span data-testid="icon-brain" />,
  MessageSquare: () => <span data-testid="icon-message-square" />,
  BookOpen: () => <span data-testid="icon-book-open" />,
  UploadCloud: () => <span data-testid="icon-upload-cloud" />,
  Trophy: () => <span data-testid="icon-trophy" />,
  Zap: () => <span data-testid="icon-zap" />,
  FileText: () => <span data-testid="icon-file-text" />,
  Network: () => <span data-testid="icon-network" />,
  Activity: () => <span data-testid="icon-activity" />,
  Layers: () => <span data-testid="icon-layers" />,
  Image: () => <span data-testid="icon-image" />,
  Compass: () => <span data-testid="icon-compass" />,
}));

describe('Sidebar', () => {
  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: vi.fn(),
    authUser: null,
    guestMode: false,
    onSignOut: vi.fn(),
    onSwitchToSignIn: vi.fn(),
  };

  it('renders navigation buttons with accessible labels', () => {
    render(<Sidebar {...defaultProps} />);

    // Find the dashboard button by its text content (which is present in DOM even if hidden by CSS class)
    const dashboardText = screen.getByText('Dashboard');
    const dashboardButton = dashboardText.closest('button');

    expect(dashboardButton).toBeInTheDocument();

    // These assertions should FAIL initially because aria-label and title are missing
    expect(dashboardButton).toHaveAttribute('aria-label', 'Dashboard');
    expect(dashboardButton).toHaveAttribute('title', 'Dashboard');

    // Check another one
    const chatText = screen.getByText('Council Chat');
    const chatButton = chatText.closest('button');
    expect(chatButton).toHaveAttribute('aria-label', 'Council Chat');
  });
});
