
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import FileUploader from './components/FileUploader';
import Onboarding from './components/Onboarding';
import { AppView, FileDocument, UserProfile, Message } from './types';
import { MOCK_SYLLABUS } from './constants';
import { CheckCircle } from './components/Icons';

const STORAGE_KEYS = {
  profile: 'study_os_profile',
  files: 'study_os_files',
  chat: 'study_os_chat_history'
};

const GameCenter = lazy(() => import('./components/GameCenter'));
const ExamSimulator = lazy(() => import('./components/ExamSimulator'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const KnowledgeUniverse = lazy(() => import('./components/KnowledgeUniverse'));
const MetaLearningEngine = lazy(() => import('./components/MetaLearningEngine'));
const CognitiveLab = lazy(() => import('./components/CognitiveLab'));
const CreativeStudio = lazy(() => import('./components/CreativeStudio'));
const CodexSkills = lazy(() => import('./components/CodexSkills'));

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]); // Lifted state for Meta Analysis

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.profile);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.warn('Failed to read saved profile', e);
    }

    try {
      const savedFiles = localStorage.getItem(STORAGE_KEYS.files);
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      }
    } catch (e) {
      console.warn('Failed to read saved files', e);
    }

    try {
      const savedChat = localStorage.getItem(STORAGE_KEYS.chat);
      if (savedChat) {
        setChatHistory(JSON.parse(savedChat));
      }
    } catch (e) {
      console.warn('Failed to read saved chat history', e);
    }
  }, []);

  // Persist profile/files/chat locally so sessions survive refreshes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.files, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      localStorage.removeItem(STORAGE_KEYS.chat);
      return;
    }
    // Trim to avoid unbounded storage growth
    const recent = chatHistory.slice(-60);
    localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(recent));
  }, [chatHistory]);

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
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.files, JSON.stringify(initialFiles));
    localStorage.removeItem(STORAGE_KEYS.chat);
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
        return <CreativeStudio />;
      case AppView.EXAM_SIMULATOR:
        return <ExamSimulator files={files} />;
      case AppView.SOCIAL_HUB:
        return <SocialHub />;
      case AppView.GAME_CENTER:
        return <GameCenter files={files} />;
      case AppView.FILES:
        return <FileUploader files={files} setFiles={setFiles} />;
      case AppView.SYLLABUS:
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Syllabus Tracker</h2>
            <div className="space-y-4">
              {MOCK_SYLLABUS.map(topic => (
                <div key={topic.id} className="bg-white p-6 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{topic.title}</h3>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{topic.status}</span>
                  </div>
                  <div className="space-y-2">
                    {topic.children?.map(sub => (
                      <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                        <div className={`w-4 h-4 rounded border ${sub.status === 'mastered' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
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
          <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Good Afternoon, {userProfile?.name || 'Student'}</h1>
            <p className="text-slate-500 mb-8">{userProfile?.goal ? `Goal: ${userProfile.goal}` : 'Ready to continue your mastery?'}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">Twin Precision</div>
                <div className="text-3xl font-bold text-indigo-600">{userProfile?.digitalTwin?.examSkills.precision || 50}%</div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${userProfile?.digitalTwin?.examSkills.precision}%` }}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">Sources Uploaded</div>
                <div className="text-3xl font-bold text-emerald-600">{files.length}</div>
                <p className="text-xs text-slate-400 mt-2">Documents indexed for retrieval</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 font-medium mb-2">Next Exam</div>
                <div className="text-3xl font-bold text-amber-600">3 Days</div>
                <p className="text-xs text-slate-400 mt-2">Biology Paper 1</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
              <div className="bg-indigo-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer" onClick={() => setCurrentView(AppView.KNOWLEDGE_UNIVERSE)}>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Knowledge Universe</h3>
                  <p className="text-indigo-200 max-w-sm">Visualize your lifelong learning graph. Connect concepts across time.</p>
                </div>
                <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold w-fit relative z-10 group-hover:scale-105 transition-transform">
                  Enter Universe
                </button>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                  <div className="w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col">
                <h3 className="text-lg font-bold mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between group" onClick={() => setCurrentView(AppView.CHAT)}>
                    <div>
                      <span className="block font-medium text-slate-800">Talk to The Coach</span>
                      <span className="text-xs text-slate-500">Reduce exam anxiety</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">→</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between group" onClick={() => setCurrentView(AppView.META_LEARNING)}>
                    <div>
                      <span className="block font-medium text-slate-800">Meta Analysis</span>
                      <span className="text-xs text-slate-500">Check for cognitive biases</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">→</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {!userProfile && <Onboarding onComplete={handleOnboardingComplete} />}
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 h-full overflow-y-auto relative">
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
