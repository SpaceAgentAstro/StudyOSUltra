import { config } from "./config";
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { AuthIdentity, AuthProviderOption } from '../types';

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  appId: config.firebase.appId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
};

const hasRequiredFirebaseConfig = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

const ensureAuth = (): Auth | null => {
  if (!hasRequiredFirebaseConfig()) return null;
  if (cachedAuth) return cachedAuth;

  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cachedAuth = getAuth(cachedApp);
  return cachedAuth;
};

const mapUser = (user: User | null): AuthIdentity | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    providerId: user.providerData?.[0]?.providerId || null,
  };
};

const providerFromOption = (provider: AuthProviderOption) => {
  if (provider === 'google') {
    const authProvider = new GoogleAuthProvider();
    authProvider.setCustomParameters({ prompt: 'select_account' });
    return authProvider;
  }

  const oauthProvider = new OAuthProvider(provider === 'microsoft' ? 'microsoft.com' : 'apple.com');
  return oauthProvider;
};

const toAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code || '';
  if (code === 'auth/popup-closed-by-user') return 'Sign-in popup was closed before completing login.';
  if (code === 'auth/popup-blocked') return 'Popup was blocked by your browser. Allow popups and try again.';
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with a different sign-in provider for this email.';
  }
  return (error as { message?: string })?.message || 'Authentication failed. Please try again.';
};

export const isFirebaseAuthConfigured = () => hasRequiredFirebaseConfig();

export const subscribeToAuth = (onChange: (user: AuthIdentity | null) => void): (() => void) => {
  const auth = ensureAuth();
  if (!auth) {
    onChange(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => onChange(mapUser(user)));
};

export const signInWithProvider = async (provider: AuthProviderOption): Promise<AuthIdentity> => {
  const auth = ensureAuth();
  if (!auth) {
    throw new Error('Firebase auth is not configured. Add Firebase env vars first.');
  }

  try {
    const result = await signInWithPopup(auth, providerFromOption(provider));
    const mapped = mapUser(result.user);
    if (!mapped) throw new Error('Unable to read user identity after sign-in.');
    return mapped;
  } catch (error) {
    throw new Error(toAuthErrorMessage(error));
  }
};

export const signOutCurrentUser = async () => {
  const auth = ensureAuth();
  if (!auth) return;
  await signOut(auth);
};
