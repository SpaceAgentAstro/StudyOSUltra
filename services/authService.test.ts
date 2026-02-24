import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';

// Mock dependencies
const initializeAppMock = vi.fn();
const getAppsMock = vi.fn();
const getAppMock = vi.fn();
const getAuthMock = vi.fn();

// Mock config
let mockFirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
  storageBucket: undefined,
  messagingSenderId: undefined,
};

vi.mock('./config', () => ({
  config: {
    get firebase() { return mockFirebaseConfig; }
  }
}));

vi.mock('firebase/app', () => ({
  initializeApp: (...args: any[]) => initializeAppMock(...args),
  getApps: (...args: any[]) => getAppsMock(...args),
  getApp: (...args: any[]) => getAppMock(...args),
}));

vi.mock('firebase/auth', () => ({
  getAuth: (...args: any[]) => getAuthMock(...args),
  GoogleAuthProvider: vi.fn(),
  OAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Reset config
    mockFirebaseConfig = {
      apiKey: '',
      authDomain: '',
      projectId: '',
      appId: '',
      storageBucket: undefined,
      messagingSenderId: undefined,
    };
  });

  describe('ensureAuth', () => {
    it('returns null if config is missing', async () => {
      // Config is empty by default
      const { ensureAuth } = await import('./authService');

      const result = ensureAuth();
      expect(result).toBeNull();
      expect(initializeAppMock).not.toHaveBeenCalled();
    });

    it('initializes new app and auth when config is present and no app exists', async () => {
      // Set config
      mockFirebaseConfig = {
        apiKey: 'test-key',
        authDomain: 'test-domain',
        projectId: 'test-project',
        appId: 'test-app-id',
        storageBucket: undefined,
        messagingSenderId: undefined,
      };

      // Mock behavior
      getAppsMock.mockReturnValue([]);
      const mockApp = { name: '[DEFAULT]' } as FirebaseApp;
      initializeAppMock.mockReturnValue(mockApp);
      const mockAuth = { app: mockApp } as unknown as Auth;
      getAuthMock.mockReturnValue(mockAuth);

      // Re-import module
      const { ensureAuth } = await import('./authService');

      const result = ensureAuth();

      expect(result).toBe(mockAuth);
      expect(initializeAppMock).toHaveBeenCalledWith({
        apiKey: 'test-key',
        authDomain: 'test-domain',
        projectId: 'test-project',
        appId: 'test-app-id',
        storageBucket: undefined,
        messagingSenderId: undefined,
      });
      expect(getAuthMock).toHaveBeenCalledWith(mockApp);
    });

    it('reuses existing app if available', async () => {
      // Set config
      mockFirebaseConfig = {
        apiKey: 'test-key',
        authDomain: 'test-domain',
        projectId: 'test-project',
        appId: 'test-app-id',
        storageBucket: undefined,
        messagingSenderId: undefined,
      };

      // Mock behavior
      const mockApp = { name: '[DEFAULT]' } as FirebaseApp;
      getAppsMock.mockReturnValue([mockApp]);
      getAppMock.mockReturnValue(mockApp);
      const mockAuth = { app: mockApp } as unknown as Auth;
      getAuthMock.mockReturnValue(mockAuth);

      // Re-import module
      const { ensureAuth } = await import('./authService');

      const result = ensureAuth();

      expect(result).toBe(mockAuth);
      expect(initializeAppMock).not.toHaveBeenCalled();
      expect(getAppMock).toHaveBeenCalled();
      expect(getAuthMock).toHaveBeenCalledWith(mockApp);
    });

    it('returns cached auth instance on subsequent calls (singleton)', async () => {
      // Set config
      mockFirebaseConfig = {
        apiKey: 'test-key',
        authDomain: 'test-domain',
        projectId: 'test-project',
        appId: 'test-app-id',
        storageBucket: undefined,
        messagingSenderId: undefined,
      };

      // Mock behavior
      getAppsMock.mockReturnValue([]);
      const mockApp = { name: '[DEFAULT]' } as FirebaseApp;
      initializeAppMock.mockReturnValue(mockApp);
      const mockAuth = { app: mockApp } as unknown as Auth;
      getAuthMock.mockReturnValue(mockAuth);

      // Re-import module
      const { ensureAuth } = await import('./authService');

      // First call
      const result1 = ensureAuth();
      expect(result1).toBe(mockAuth);
      expect(initializeAppMock).toHaveBeenCalledTimes(1);
      expect(getAuthMock).toHaveBeenCalledTimes(1);

      // Second call
      const result2 = ensureAuth();
      expect(result2).toBe(mockAuth);

      // Should not call init or getAuth again
      expect(initializeAppMock).toHaveBeenCalledTimes(1);
      expect(getAuthMock).toHaveBeenCalledTimes(1);
    });
  });
});
