import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks
const mockInitializeApp = vi.fn();
const mockGetApps = vi.fn();
const mockGetApp = vi.fn();
const mockGetAuth = vi.fn();

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  GoogleAuthProvider: vi.fn(),
  OAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

describe('authService - ensureAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns null when config is missing', async () => {
    // Clear required env vars
    delete process.env.FIREBASE_API_KEY;
    delete process.env.FIREBASE_AUTH_DOMAIN;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_APP_ID;

    // Dynamically import to pick up new env vars
    const { ensureAuth } = await import('./authService');

    const result = ensureAuth();

    expect(result).toBeNull();
    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockGetAuth).not.toHaveBeenCalled();
  });

  it('initializes app and auth when config is present', async () => {
    // Set required env vars
    process.env.FIREBASE_API_KEY = 'test-key';
    process.env.FIREBASE_AUTH_DOMAIN = 'test-domain';
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_APP_ID = 'test-app-id';

    const mockApp = { name: '[DEFAULT]' };
    const mockAuth = { app: mockApp };

    mockGetApps.mockReturnValue([]); // No existing apps
    mockInitializeApp.mockReturnValue(mockApp);
    mockGetAuth.mockReturnValue(mockAuth);

    const { ensureAuth } = await import('./authService');

    const result = ensureAuth();

    expect(result).toBe(mockAuth);
    expect(mockInitializeApp).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'test-key',
      authDomain: 'test-domain',
      projectId: 'test-project',
      appId: 'test-app-id'
    }));
    expect(mockGetAuth).toHaveBeenCalledWith(mockApp);
  });

  it('returns cached auth instance on subsequent calls', async () => {
    // Set required env vars
    process.env.FIREBASE_API_KEY = 'test-key';
    process.env.FIREBASE_AUTH_DOMAIN = 'test-domain';
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_APP_ID = 'test-app-id';

    const mockApp = { name: '[DEFAULT]' };
    const mockAuth = { app: mockApp };

    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue(mockApp);
    mockGetAuth.mockReturnValue(mockAuth);

    const { ensureAuth } = await import('./authService');

    // First call
    ensureAuth();
    // Second call
    const result = ensureAuth();

    expect(result).toBe(mockAuth);
    // Should still only have been called once
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockGetAuth).toHaveBeenCalledTimes(1);
  });

  it('uses existing app if available', async () => {
     // Set required env vars
    process.env.FIREBASE_API_KEY = 'test-key';
    process.env.FIREBASE_AUTH_DOMAIN = 'test-domain';
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_APP_ID = 'test-app-id';

    const mockApp = { name: '[DEFAULT]' };
    const mockAuth = { app: mockApp };

    mockGetApps.mockReturnValue([mockApp]); // App exists
    mockGetApp.mockReturnValue(mockApp);
    mockGetAuth.mockReturnValue(mockAuth);

    const { ensureAuth } = await import('./authService');

    const result = ensureAuth();

    expect(result).toBe(mockAuth);
    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockGetApp).toHaveBeenCalled();
    expect(mockGetAuth).toHaveBeenCalledWith(mockApp);
  });
});
