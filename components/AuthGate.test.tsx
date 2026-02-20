import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthGate from './AuthGate';

describe('AuthGate', () => {
  const mockOnSignIn = vi.fn();
  const mockOnContinueAsGuest = vi.fn();

  const defaultProps = {
    firebaseConfigured: true,
    loading: false,
    error: null,
    onSignIn: mockOnSignIn,
    onContinueAsGuest: mockOnContinueAsGuest,
  };

  it('renders correctly', () => {
    render(<AuthGate {...defaultProps} />);
    expect(screen.getByText('Study OS')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Microsoft')).toBeInTheDocument();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
    expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
  });

  it('calls onSignIn when a provider button is clicked', () => {
    render(<AuthGate {...defaultProps} />);
    fireEvent.click(screen.getByText('Continue with Google'));
    expect(mockOnSignIn).toHaveBeenCalledWith('google');
  });

  it('calls onContinueAsGuest when guest button is clicked', () => {
    render(<AuthGate {...defaultProps} />);
    fireEvent.click(screen.getByText('Continue as Guest'));
    expect(mockOnContinueAsGuest).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(<AuthGate {...defaultProps} loading={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('disables provider buttons when firebase is not configured', () => {
    render(<AuthGate {...defaultProps} firebaseConfigured={false} />);
    // Provider buttons should be disabled
    expect(screen.getByText('Continue with Google').closest('button')).toBeDisabled();
    // Guest button should still be enabled
    expect(screen.getByText('Continue as Guest').closest('button')).not.toBeDisabled();
    // Should show warning
    expect(screen.getByText(/Firebase auth is not configured/i)).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    const errorMsg = 'Something went wrong';
    render(<AuthGate {...defaultProps} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });
});
