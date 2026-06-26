import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import FileUploader from './components/FileUploader';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AuthGate from './components/AuthGate';
import { CheckCircle } from './components/Icons';
import { MOCK_SYLLABUS } from './constants';
import {
  AppView,
  AuthIdentity,
  AuthProviderOption,
  FileDocument,
  Message,
  UserProfile,
} from './types';
import {
  isFirebaseAuthConfigured,
  signInWithProvider,
  signOutCurrentUser,
  subscribeToAuth,
  toAuthErrorMessage,
} from './services/authService';

const GameCenter = lazy(() => import('./components/GameCenter'));
const ExamSimulator = lazy(() => import('./components/ExamSimulator'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const KnowledgeUniverse = lazy(() => import('./components/KnowledgeUniverse'));
const MetaLearningEngine = lazy(() => import('./components/MetaLearningEngine'));
const CognitiveLab = lazy(() => import('./components/CognitiveLab'));
const CreativeStudio = lazy(() => import('./components/CreativeStudio'));
const LessonStudio = lazy(() => import('./components/LessonStudio'));

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthIdentity | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  const firebaseAuthConfigured = useMemo(() => isFirebaseAuthConfigured(), []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('study_os_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch {
        localStorage.removeItem('study_os_profile');
      }
    }
  }, []);

  useEffect(() => {
    if (!firebaseAuthConfigured) {
      setGuestMode(true);
      setAuthReady(true);
      return;
    }

    const unsubscribe = subscribeToAuth((user) => {
      setAuthUser(user);
      setAuthReady(true);
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseAuthConfigured]);

  const handleOnboardingComplete = (profile: UserProfile, initialFiles: FileDocument[]) => {
    if (!profile.knowledgeGraph) profile.knowledgeGraph = [];
    if (!profile.metaInsights) profile.metaInsights = [];
    if (!profile.lifeMode) profile.lifeMode = 'STUDENT';

    if (!profile.digitalTwin) {
      profile.digitalTwin = {
        knowledgeMap: {},
        examSkills: { precision: 50, timeManagement: 50, reasoning: 50 },
        weaknesses: [],
        recentMood: 'focused',
      };
    }

    setUserProfile(profile);
    setFiles(initialFiles);
    localStorage.setItem('study_os_profile', JSON.stringify(profile));
  };

  const handleSignIn = async (provider: AuthProviderOption) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithProvider(provider);
      setGuestMode(false);
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
    setAuthError(null);
    setAuthReady(true);
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOutCurrentUser();
      setAuthUser(null);
      setGuestMode(true);
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.KNOWLEDGE_UNIVERSE:
        return <KnowledgeUniverse files={files} />;
      case AppView.META_LEARNING:
        return <MetaLearningEngine history={chatHistory} />;
      case AppView.COGNITIVE_LAB:
        return <CognitiveLab />;
      case AppView.EXAM_SIMULATOR:
        return <ExamSimulator files={files} />;
      case AppView.SOCIAL_HUB:
        return <SocialHub />;
      case AppView.GAME_CENTER:
        return <GameCenter files={files} />;
      case AppView.CREATIVE_STUDIO:
        return <CreativeStudio />;
      case AppView.LESSON_STUDIO:
        return <LessonStudio files={files} />;
      case AppView.FILES:
        return <FileUploader files={files} setFiles={setFiles} />;
      case AppView.SYLLABUS:
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Syllabus Tracker</h2>
            <div className="space-y-4">
              {MOCK_SYLLABUS.map((topic) => (
                <div key={topic.id} className="bg-white p-6 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{topic.title}</h3>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      {topic.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {topic.children?.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded border ${
                            sub.status === 'mastered' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                          }`}
                        >
                          {sub.status === 'mastered' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-slate-600">{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case AppView.DASHBOARD:
        return (
          <div className="p-8 max-w-6xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Good Afternoon, {userProfile?.name || authUser?.displayName || 'Student'}
            </h1>
            <p className="text-slate-500 mb-8">
              {userProfile?.goal ? `Goal: ${userProfile.goal}` : 'Build AI-powered mastery from your own sources.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">Twin Precision</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {userProfile?.digitalTwin?.examSkills.precision || 50}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">Sources Uploaded</div>
                <div className="text-3xl font-bold text-emerald-600">{files.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">AI Lesson Modes</div>
                <div className="text-3xl font-bold text-fuchsia-600">9+</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">Next Focus Block</div>
                <div className="text-3xl font-bold text-amber-600">25 min</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div
                className="bg-indigo-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer min-h-[300px]"
                onClick={() => setCurrentView(AppView.LESSON_STUDIO)}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">AI Lesson Studio</h3>
                  <p className="text-indigo-200 max-w-sm">
                    Generate reports, flashcards, quizzes, slide decks, infographics, podcast scripts, audio, video plans, and image prompts from your sources.
                  </p>
                </div>
                <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold w-fit relative z-10 group-hover:scale-105 transition-transform">
                  Launch Studio
                </button>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                  <div className="w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col gap-3">
                <h3 className="text-lg font-bold mb-2">Recommended Actions</h3>
                <button
                  className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-left"
                  onClick={() => setCurrentView(AppView.CHAT)}
                >
                  <span className="block font-medium text-slate-800">Talk to The Council</span>
                  <span className="text-xs text-slate-500">Grounded Q&A from your uploaded sources</span>
                </button>
                <button
                  className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-left"
                  onClick={() => setCurrentView(AppView.CREATIVE_STUDIO)}
                >
                  <span className="block font-medium text-slate-800">Open Creative Studio</span>
                  <span className="text-xs text-slate-500">Generate visuals, video plans, and voice outputs</span>
                </button>
                <button
                  className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-left"
                  onClick={() => setCurrentView(AppView.EXAM_SIMULATOR)}
                >
                  <span className="block font-medium text-slate-800">Run Exam Simulation</span>
                  <span className="text-xs text-slate-500">Stress-test recall with invigilated practice</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const hasSession = guestMode || Boolean(authUser) || !firebaseAuthConfigured;
  const sessionStateLoaded = authReady;

  if (!authReady || (hasSession && !sessionStateLoaded)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-5 h-5 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin" />
          <span>Preparing Galactic Maestro...</span>
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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {!userProfile && <Onboarding onComplete={handleOnboardingComplete} />}
      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        authUser={authUser}
        guestMode={guestMode}
        authBusy={authBusy}
        onSignOut={handleSignOut}
        onSwitchToSignIn={() => setGuestMode(false)}
      />
      <main className="flex-1 h-full overflow-hidden relative">
        {currentView === AppView.CHAT && (
          <div className="h-full w-full">
            <div className="h-screen p-4 md:p-6 bg-slate-100/50">
              {/* ⚡ Bolt Optimization: Prevent heavy ChatInterface from rendering when hidden */}
              <ChatInterface files={files} onMessagesChange={setChatHistory} initialMessages={chatHistory} />
            </div>
          </div>
        )}

        <Suspense
          fallback={<div className="h-full w-full flex items-center justify-center text-slate-500">Loading view...</div>}
        >
          {currentView !== AppView.CHAT && renderContent()}
        </Suspense>

      </main>
    </div>
  );
};

export default App;
