import React, { Suspense, useEffect, useState } from 'react';
import { FileDocument, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AuthGate from './components/AuthGate';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { isFirebaseAuthConfigured } from './services/authService';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const SyllabusTracker = React.lazy(() => import('./components/SyllabusTracker'));
const GameCenter = React.lazy(() => import('./components/GameCenter'));

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'syllabus' | 'game'>('chat');
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  const auth = isFirebaseAuthConfigured() ? getAuth() : null;
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    // Check for existing guest session
    const guestSession = localStorage.getItem('guest_session');
    if (guestSession === 'true') {
      setIsGuest(true);
    }
    setAuthInitialized(true);
  }, []);

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
    setIsGuest(false);
    localStorage.removeItem('guest_session');
    setMessages([]);
    setFiles([]);
    setActiveView('chat');
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    localStorage.setItem('guest_session', 'true');
  };

  if (!authInitialized || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200"></div>
          <div className="h-4 w-32 rounded bg-slate-200"></div>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthGate onContinueAsGuest={handleGuestLogin} error={error} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onSignOut={handleSignOut}
        isGuest={isGuest}
        userEmail={user?.email || undefined}
      />

      <main className="flex-1 h-full overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'chat' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="h-full p-4 md:p-6 max-w-7xl mx-auto">
            <ChatInterface
              files={files}
              initialMessages={messages}
              onMessagesChange={setMessages}
            />
          </div>
        </div>

        {activeView !== 'chat' && (
          <div className="h-full p-4 md:p-6 max-w-7xl mx-auto overflow-y-auto z-20 relative">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            }>
              {activeView === 'dashboard' && <Dashboard messages={messages} files={files} />}
              {activeView === 'syllabus' && <SyllabusTracker />}
              {activeView === 'game' && <GameCenter files={files} />}
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
