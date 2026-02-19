
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import FileUploader from './components/FileUploader';
import Onboarding from './components/Onboarding';
import AuthGate from './components/AuthGate';
import { AppView, FileDocument, UserProfile, Message, AuthIdentity, AuthProviderOption } from './types';
import { isFirebaseAuthConfigured, signInWithProvider, signOutCurrentUser, subscribeToAuth } from './services/authService';

const STORAGE_KEYS = {
  profile: 'study_os_profile',
  files: 'study_os_files',
  chat: 'study_os_chat_history'
};

const getScopedStorageKey = (key: keyof typeof STORAGE_KEYS, scope: string) => `${STORAGE_KEYS[key]}::${scope}`;
const getSessionScope = (authUser: AuthIdentity | null, guestMode: boolean): string | null => {
  if (authUser) return `user:${authUser.uid}`;
  if (guestMode) return 'guest';
  return null;
};

const GameCenter = lazy(() => import('./components/GameCenter'));
const ExamSimulator = lazy(() => import('./components/ExamSimulator'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const KnowledgeUniverse = lazy(() => import('./components/KnowledgeUniverse'));
const MetaLearningEngine = lazy(() => import('./components/MetaLearningEngine'));
const CognitiveLab = lazy(() => import('./components/CognitiveLab'));
const CreativeStudio = lazy(() => import('./components/CreativeStudio'));
const CodexSkills = lazy(() => import('./components/CodexSkills'));
const SyllabusTracker = lazy(() => import('./components/SyllabusTracker'));
const Dashboard = lazy(() => import('./components/Dashboard'));

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthIdentity | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]); // Lifted state for Meta Analysis
  const [sessionStateLoaded, setSessionStateLoaded] = useState(false);

  const firebaseAuthConfigured = isFirebaseAuthConfigured();
  const hasSession = Boolean(authUser) || guestMode;
  const sessionScope = getSessionScope(authUser, guestMode);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        setGuestMode(false);
        setAuthError(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!sessionScope) {
      setSessionStateLoaded(false);
      setUserProfile(null);
      setFiles([]);
      setChatHistory([]);
      return;
    }

    setSessionStateLoaded(false);
    setUserProfile(null);
    setFiles([]);
    setChatHistory([]);

    try {
      const profileKey = getScopedStorageKey('profile', sessionScope);
      const filesKey = getScopedStorageKey('files', sessionScope);
      const chatKey = getScopedStorageKey('chat', sessionScope);

      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else if (sessionScope === 'guest') {
        const legacyProfile = localStorage.getItem(STORAGE_KEYS.profile);
        if (legacyProfile) setUserProfile(JSON.parse(legacyProfile));
      }

      const savedFiles = localStorage.getItem(filesKey);
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      } else if (sessionScope === 'guest') {
        const legacyFiles = localStorage.getItem(STORAGE_KEYS.files);
        if (legacyFiles) setFiles(JSON.parse(legacyFiles));
      }

      const savedChat = localStorage.getItem(chatKey);
      if (savedChat) {
        setChatHistory(JSON.parse(savedChat));
      } else if (sessionScope === 'guest') {
        const legacyChat = localStorage.getItem(STORAGE_KEYS.chat);
        if (legacyChat) setChatHistory(JSON.parse(legacyChat));
      }
    } catch (e) {
      console.warn('Failed to load session state', e);
    } finally {
      setSessionStateLoaded(true);
    }
  }, [sessionScope]);

  useEffect(() => {
    if (!sessionScope || !sessionStateLoaded) return;
    const profileKey = getScopedStorageKey('profile', sessionScope);
    if (userProfile) {
      localStorage.setItem(profileKey, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(profileKey);
    }
  }, [userProfile, sessionScope, sessionStateLoaded]);

  useEffect(() => {
    if (!sessionScope || !sessionStateLoaded) return;
    const filesKey = getScopedStorageKey('files', sessionScope);
    localStorage.setItem(filesKey, JSON.stringify(files));
  }, [files, sessionScope, sessionStateLoaded]);

  useEffect(() => {
    if (!sessionScope || !sessionStateLoaded) return;
    const chatKey = getScopedStorageKey('chat', sessionScope);
    if (chatHistory.length === 0) {
      localStorage.removeItem(chatKey);
      return;
    }
    // Trim to avoid unbounded storage growth
    const recent = chatHistory.slice(-60);
    localStorage.setItem(chatKey, JSON.stringify(recent));
  }, [chatHistory, sessionScope, sessionStateLoaded]);

  const handleOnboardingComplete = (profile: UserProfile, initialFiles: FileDocument[]) => {
    // Init Phase 8 props if missing
    if (!profile.knowledgeGraph) profile.knowledgeGraph = [];
    if (!profile.metaInsights) profile.metaInsights = [];
    if (!profile.lifeMode) profile.lifeMode = 'STUDENT';

    // Init Digital Twin if not present
    if (!profile.digitalTwin) {
      profile.digitalTwin = {
        knowledgeMap: {},
        examSkills: { precision: 50, timeManagement: 50, reasoning: 50 },
        weaknesses: [],
        recentMood: 'focused'
      };
    }
    setUserProfile(profile);
    setFiles(initialFiles);
    setChatHistory([]);
  };

  const handleSignIn = async (provider: AuthProviderOption) => {
    setAuthError(null);
    if (!firebaseAuthConfigured) {
      setAuthError('Firebase auth is not configured. Add FIREBASE_* environment variables first.');
      return;
    }

    setAuthBusy(true);
    try {
      await signInWithProvider(provider);
    } catch (error) {
      setAuthError((error as Error)?.message || 'Unable to sign in. Please try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signOutCurrentUser();
      setCurrentView(AppView.CHAT);
    } catch (error) {
      setAuthError((error as Error)?.message || 'Unable to sign out right now.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
    setAuthError(null);
  };

  const handleSwitchToSignIn = () => {
    setGuestMode(false);
    setAuthError(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.CODEX_SKILLS:
        return <CodexSkills />;
      case AppView.KNOWLEDGE_UNIVERSE:
        return <KnowledgeUniverse files={files} />;
      case AppView.META_LEARNING:
        return <MetaLearningEngine history={chatHistory} />;
      case AppView.COGNITIVE_LAB:
        return <CognitiveLab />;
      case AppView.CREATIVE_STUDIO:
        return <CreativeStudio onNavigate={setCurrentView} />;
      case AppView.EXAM_SIMULATOR:
        return <ExamSimulator files={files} />;
      case AppView.SOCIAL_HUB:
        return <SocialHub />;
      case AppView.GAME_CENTER:
        return <GameCenter files={files} />;
      case AppView.FILES:
        return <FileUploader files={files} setFiles={setFiles} />;
      case AppView.SYLLABUS:
        return <SyllabusTracker />;
      case AppView.DASHBOARD:
        return <Dashboard userProfile={userProfile} files={files} setCurrentView={setCurrentView} />;
      case AppView.CHAT:
      default:
        return (
          <div className="h-screen p-4 md:p-6 bg-slate-100/50">
            <ChatInterface
              files={files}
              initialMessages={chatHistory}
              onMessagesChange={setChatHistory}
            />
          </div>
        );
    }
  };

  if (!authReady || (hasSession && !sessionStateLoaded)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-5 h-5 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin" />
          <span>Preparing Study OS...</span>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <AuthGate
        firebaseConfigured={firebaseAuthConfigured}
        loading={authBusy}
        error={authError}
        onSignIn={handleSignIn}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {!userProfile && <Onboarding onComplete={handleOnboardingComplete} />}
      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        authUser={authUser}
        guestMode={guestMode}
        authBusy={authBusy}
        onSignOut={handleSignOut}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      <main className="flex-1 h-full overflow-y-auto relative">
        {authError && (
          <div className="sticky top-0 z-20 px-4 md:px-6 pt-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">
              {authError}
            </div>
          </div>
        )}
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center text-slate-500">
              Loading view...
            </div>
          }
        >
          {renderContent()}
        </Suspense>
      </main>
    </div>
  );
};

export default App;
