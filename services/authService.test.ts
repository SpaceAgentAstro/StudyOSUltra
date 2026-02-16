/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseApp from 'firebase/app';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(),
    GoogleAuthProvider: class {
      setCustomParameters = vi.fn();
    },
    OAuthProvider: class {},
    signInWithPopup: vi.fn(),
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  };
});

describe('authService', () => {
  const mockUser = {
    uid: '123',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'http://example.com/photo.jpg',
    providerData: [{ providerId: 'google.com' }],
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Set default env vars for successful auth
    vi.stubEnv('FIREBASE_API_KEY', 'test-key');
    vi.stubEnv('FIREBASE_AUTH_DOMAIN', 'test-domain');
    vi.stubEnv('FIREBASE_PROJECT_ID', 'test-project');
    vi.stubEnv('FIREBASE_APP_ID', 'test-app-id');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('signInWithProvider', () => {
    it('throws error if Firebase is not configured', async () => {
      // Unset env vars to simulate missing config
      vi.stubEnv('FIREBASE_API_KEY', '');

      // Re-import module to pick up env changes
      const { signInWithProvider } = await import('./authService');

      await expect(signInWithProvider('google')).rejects.toThrow(
        'Firebase auth is not configured. Add Firebase env vars first.'
      );
    });

    it('signs in successfully with Google provider', async () => {
      const { signInWithProvider } = await import('./authService');

      // Mock successful sign-in
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser as any,
        providerId: 'google.com',
        operationType: 'signIn',
      });
      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);

      const result = await signInWithProvider('google');

      // Check if GoogleAuthProvider was instantiated
      // Since we mocked it as a class, we can check if the mock was called if we wrapped it in vi.fn()
      // But here we returned a class directly.
      // To spy on the constructor, we can spy on the prototype or just assume it works if signInWithPopup is called with an instance.

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      const authProviderArg = vi.mocked(firebaseAuth.signInWithPopup).mock.calls[0][1];
      expect(authProviderArg).toBeInstanceOf(firebaseAuth.GoogleAuthProvider);

      expect(result).toEqual({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'http://example.com/photo.jpg',
        providerId: 'google.com',
      });
    });

    it('signs in successfully with Microsoft provider', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: { ...mockUser, providerData: [{ providerId: 'microsoft.com' }] } as any,
        providerId: 'microsoft.com',
        operationType: 'signIn',
      });
      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);

      const result = await signInWithProvider('microsoft');

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      const authProviderArg = vi.mocked(firebaseAuth.signInWithPopup).mock.calls[0][1];
      expect(authProviderArg).toBeInstanceOf(firebaseAuth.OAuthProvider);

      expect(result?.providerId).toBe('microsoft.com');
    });

    it('signs in successfully with Apple provider', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: { ...mockUser, providerData: [{ providerId: 'apple.com' }] } as any,
        providerId: 'apple.com',
        operationType: 'signIn',
      });
      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);

      const result = await signInWithProvider('apple');

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      const authProviderArg = vi.mocked(firebaseAuth.signInWithPopup).mock.calls[0][1];
      expect(authProviderArg).toBeInstanceOf(firebaseAuth.OAuthProvider);

      expect(result?.providerId).toBe('apple.com');
    });

    it('handles popup closed by user error', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({
        code: 'auth/popup-closed-by-user',
      });

      await expect(signInWithProvider('google')).rejects.toThrow(
        'Sign-in popup was closed before completing login.'
      );
    });

    it('handles popup blocked error', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({
        code: 'auth/popup-blocked',
      });

      await expect(signInWithProvider('google')).rejects.toThrow(
        'Popup was blocked by your browser. Allow popups and try again.'
      );
    });

    it('handles account exists with different credential error', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({
        code: 'auth/account-exists-with-different-credential',
      });

      await expect(signInWithProvider('google')).rejects.toThrow(
        'An account already exists with a different sign-in provider for this email.'
      );
    });

    it('handles generic error with message', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({
        message: 'Something went wrong',
      });

      await expect(signInWithProvider('google')).rejects.toThrow(
        'Something went wrong'
      );
    });

    it('handles generic error without message', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({});

      await expect(signInWithProvider('google')).rejects.toThrow(
        'Authentication failed. Please try again.'
      );
    });

    it('throws error if user mapping fails', async () => {
      const { signInWithProvider } = await import('./authService');

      vi.mocked(firebaseAuth.getAuth).mockReturnValue({} as any);
      // Simulate signInWithPopup returning a result with null user
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: null as any,
        providerId: 'google.com',
        operationType: 'signIn',
      });

      await expect(signInWithProvider('google')).rejects.toThrow(
        'Unable to read user identity after sign-in.'
      );
    });
  });
});
