import { describe, it, expect } from 'vitest';
import { toAuthErrorMessage } from './authService';

describe('toAuthErrorMessage', () => {
  it('returns friendly message for popup-closed-by-user', () => {
    const error = { code: 'auth/popup-closed-by-user' };
    expect(toAuthErrorMessage(error)).toBe('Sign-in popup was closed before completing login.');
  });

  it('returns friendly message for popup-blocked', () => {
    const error = { code: 'auth/popup-blocked' };
    expect(toAuthErrorMessage(error)).toBe('Popup was blocked by your browser. Allow popups and try again.');
  });

  it('returns friendly message for account-exists-with-different-credential', () => {
    const error = { code: 'auth/account-exists-with-different-credential' };
    expect(toAuthErrorMessage(error)).toBe('An account already exists with a different sign-in provider for this email.');
  });

  it('returns error message if present and code is not handled', () => {
    const error = { message: 'Some other error occurred' };
    expect(toAuthErrorMessage(error)).toBe('Some other error occurred');
  });

  it('returns generic message if no code and no message', () => {
    const error = {};
    expect(toAuthErrorMessage(error)).toBe('Authentication failed. Please try again.');
  });

  it('returns generic message if error is null or undefined', () => {
    expect(toAuthErrorMessage(null)).toBe('Authentication failed. Please try again.');
    expect(toAuthErrorMessage(undefined)).toBe('Authentication failed. Please try again.');
  });

  it('returns generic message if code is present but empty', () => {
    const error = { code: '' };
    expect(toAuthErrorMessage(error)).toBe('Authentication failed. Please try again.');
  });

  it('returns message even if code is present but not one of the specific ones', () => {
      const error = { code: 'auth/other-error', message: 'Something went wrong' };
      expect(toAuthErrorMessage(error)).toBe('Something went wrong');
  });
});
