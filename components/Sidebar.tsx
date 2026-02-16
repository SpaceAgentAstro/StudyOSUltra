
import React from 'react';
import { AppView } from '../types';
import { Brain, MessageSquare, BookOpen, UploadCloud, Trophy, Zap, FileText, Network, Activity, Layers, Image as ImageIcon, Compass } from './Icons';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: Brain },
    { id: AppView.CODEX_SKILLS, label: 'Codex Skills', icon: Compass },
    { id: AppView.KNOWLEDGE_UNIVERSE, label: 'Universe', icon: Network }, // New
    { id: AppView.CHAT, label: 'Council Chat', icon: MessageSquare },
    { id: AppView.META_LEARNING, label: 'Meta Engine', icon: Activity }, // New
    { id: AppView.COGNITIVE_LAB, label: 'Skills Lab', icon: Layers }, // New
    { id: AppView.CREATIVE_STUDIO, label: 'Creative Studio', icon: ImageIcon }, // Media gen
    { id: AppView.GAME_CENTER, label: 'Game Center', icon: Trophy },
    { id: AppView.EXAM_SIMULATOR, label: 'Exam Simulator', icon: FileText },
    { id: AppView.SOCIAL_HUB, label: 'Social Hub', icon: Zap },
    { id: AppView.FILES, label: 'Sources', icon: UploadCloud },
    { id: AppView.SYLLABUS, label: 'Syllabus', icon: BookOpen },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="font-bold text-lg">S</span>
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight">Study OS</span>
      </div>
      
      <nav className="flex-1 py-6 px-2 md:px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            aria-label={item.label}
            title={item.label}
            aria-current={currentView === item.id ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
              ${currentView === item.id 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 hidden md:block mb-2">Study Streak</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-bold hidden md:block">Day 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
