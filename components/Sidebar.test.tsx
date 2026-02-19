import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { AppView } from '../types';
import { vi, describe, it, expect } from 'vitest';

// Mock Icons to avoid rendering issues
vi.mock('./Icons', () => ({
  Brain: () => <span data-testid="icon-brain" />,
  MessageSquare: () => <span data-testid="icon-message" />,
  BookOpen: () => <span data-testid="icon-book" />,
  UploadCloud: () => <span data-testid="icon-upload" />,
  Trophy: () => <span data-testid="icon-trophy" />,
  Zap: () => <span data-testid="icon-zap" />,
  FileText: () => <span data-testid="icon-file" />,
  Network: () => <span data-testid="icon-network" />,
  Activity: () => <span data-testid="icon-activity" />,
  Layers: () => <span data-testid="icon-layers" />,
  Image: () => <span data-testid="icon-image" />,
  Compass: () => <span data-testid="icon-compass" />,
}));

describe('Sidebar Component', () => {
  const mockSetView = vi.fn();
  const mockOnSignOut = vi.fn();
  const mockOnSwitchToSignIn = vi.fn();

  const defaultProps = {
    currentView: AppView.DASHBOARD,
    setView: mockSetView,
    authUser: { uid: '123', email: 'test@example.com', displayName: 'Test User', photoURL: null, providerId: 'google' },
    guestMode: false,
    authBusy: false,
    onSignOut: mockOnSignOut,
    onSwitchToSignIn: mockOnSwitchToSignIn,
  };

  it('renders navigation buttons with correct labels and accessibility attributes', () => {
    render(<Sidebar {...defaultProps} />);

    // Check for specific navigation items
    const dashboardBtn = screen.getByRole('button', { name: /Dashboard/i });
    expect(dashboardBtn).toBeInTheDocument();

    // Check for aria-label (should exist for accessibility, especially when text is hidden on mobile)
    expect(dashboardBtn).toHaveAttribute('aria-label', 'Dashboard');
    expect(dashboardBtn).toHaveAttribute('title', 'Dashboard');

    const chatBtn = screen.getByRole('button', { name: /Council Chat/i });
    expect(chatBtn).toHaveAttribute('aria-label', 'Council Chat');
    expect(chatBtn).toHaveAttribute('title', 'Council Chat');
  });

  it('calls setView when a button is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const chatBtn = screen.getByRole('button', { name: /Council Chat/i });
    fireEvent.click(chatBtn);

    expect(mockSetView).toHaveBeenCalledWith(AppView.CHAT);
  });
});
