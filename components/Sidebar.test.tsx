import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';
import { AppView } from '../types';

// Mock the icons to avoid rendering complexities
vi.mock('./Icons', () => ({
  Brain: () => <svg data-testid="icon-brain" />,
  MessageSquare: () => <svg data-testid="icon-message-square" />,
  BookOpen: () => <svg data-testid="icon-book-open" />,
  UploadCloud: () => <svg data-testid="icon-upload-cloud" />,
  Trophy: () => <svg data-testid="icon-trophy" />,
  Zap: () => <svg data-testid="icon-zap" />,
  FileText: () => <svg data-testid="icon-file-text" />,
  Network: () => <svg data-testid="icon-network" />,
  Activity: () => <svg data-testid="icon-activity" />,
  Layers: () => <svg data-testid="icon-layers" />,
  Image: () => <svg data-testid="icon-image" />,
  Compass: () => <svg data-testid="icon-compass" />,
}));

describe('Sidebar Component', () => {
  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: vi.fn(),
    authUser: null,
    guestMode: true,
    onSignOut: vi.fn(),
    onSwitchToSignIn: vi.fn(),
  };

  it('renders navigation buttons with accessible labels', () => {
    render(<Sidebar {...defaultProps} />);

    // Check if buttons have aria-labels corresponding to their visible text
    // The text is hidden on mobile, so aria-label is crucial.
    // We expect failure here initially if aria-label is missing and we test for it.

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
    expect(dashboardButton).toHaveAttribute('aria-label', 'Dashboard');

    const chatButton = screen.getByRole('button', { name: /council chat/i });
    expect(chatButton).toBeInTheDocument();
    expect(chatButton).toHaveAttribute('aria-label', 'Council Chat');
  });

  it('renders buttons with title attributes for tooltips', () => {
    render(<Sidebar {...defaultProps} />);

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardButton).toHaveAttribute('title', 'Dashboard');
  });
});
