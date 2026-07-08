import React from 'react';
import { AppView, UserProfile, FileDocument } from '../types';

interface DashboardProps {
  userProfile: UserProfile | null;
  files: FileDocument[];
  setCurrentView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, files, setCurrentView }) => {
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
        <button className="bg-indigo-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer w-full text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none" onClick={() => setCurrentView(AppView.KNOWLEDGE_UNIVERSE)}>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Knowledge Universe</h3>
            <p className="text-indigo-200 max-w-sm">Visualize your lifelong learning graph. Connect concepts across time.</p>
          </div>
          <span className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold w-fit relative z-10 group-hover:scale-105 transition-transform inline-block">
            Enter Universe
          </span>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
            <div className="w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            <button className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between group w-full text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none" onClick={() => setCurrentView(AppView.CHAT)}>
              <div>
                <span className="block font-medium text-slate-800">Talk to The Coach</span>
                <span className="text-xs text-slate-500">Reduce exam anxiety</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">→</div>
            </button>
            <button className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between group w-full text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none" onClick={() => setCurrentView(AppView.META_LEARNING)}>
              <div>
                <span className="block font-medium text-slate-800">Meta Analysis</span>
                <span className="text-xs text-slate-500">Check for cognitive biases</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
