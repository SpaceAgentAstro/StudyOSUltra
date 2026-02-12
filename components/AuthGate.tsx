import React from 'react';
import { AuthProviderOption } from '../types';

interface AuthGateProps {
  firebaseConfigured: boolean;
  loading: boolean;
  error: string | null;
  onSignIn: (provider: AuthProviderOption) => void | Promise<void>;
  onContinueAsGuest: () => void;
}

const PROVIDERS: Array<{
  id: AuthProviderOption;
  label: string;
  subtext: string;
  badge: string;
  accent: string;
}> = [
  { id: 'google', label: 'Continue with Google', subtext: 'Use your Google account', badge: 'G', accent: 'bg-rose-500' },
  { id: 'microsoft', label: 'Continue with Microsoft', subtext: 'Use your Microsoft 365 account', badge: 'M', accent: 'bg-blue-500' },
  { id: 'apple', label: 'Continue with Apple', subtext: 'Use your Apple ID', badge: 'A', accent: 'bg-slate-700' },
];

const AuthGate: React.FC<AuthGateProps> = ({
  firebaseConfigured,
  loading,
  error,
  onSignIn,
  onContinueAsGuest,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-3xl font-bold tracking-tight">Study OS</h1>
          <p className="text-slate-400 mt-2">
            Sign in to load your personal workspace, or continue in guest mode.
          </p>
        </div>

        <div className="p-8 space-y-4">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              disabled={!firebaseConfigured || loading}
              onClick={() => onSignIn(provider.id)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-4 text-left flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${provider.accent} flex items-center justify-center text-white font-bold`}>
                {provider.badge}
              </div>
              <div>
                <div className="font-semibold text-slate-100">{provider.label}</div>
                <div className="text-xs text-slate-400">{provider.subtext}</div>
              </div>
            </button>
          ))}

          {!firebaseConfigured && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Firebase auth is not configured yet. Add `FIREBASE_*` keys to enable Google, Microsoft, and Apple sign-in.
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={onContinueAsGuest}
            className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
