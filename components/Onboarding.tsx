import React, { useState } from 'react';
import { UserProfile, FileDocument } from '../types';
import { Brain, UploadCloud, CheckCircle, BookOpen } from './Icons';
import FileUploader from './FileUploader';

interface OnboardingProps {
  onComplete: (profile: UserProfile, files: FileDocument[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    if (step === 2) {
       // Simulate "Ingestion" delay for effect
       setIsProcessing(true);
       setTimeout(() => {
         setIsProcessing(false);
         setStep(3);
       }, 2000);
    } else if (step === 3) {
      onComplete({
        name,
        subjects: [],
        goal,
        hasCompletedOnboarding: true,
        digitalTwin: {
          knowledgeMap: {},
          examSkills: {
            timeManagement: 50,
            precision: 50,
            reasoning: 50
          },
          weaknesses: [],
          recentMood: 'focused'
        },
        lifeMode: 'STUDENT',
        knowledgeGraph: [],
        metaInsights: []
      }, files);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl min-h-[600px] flex overflow-hidden shadow-2xl">
        
        {/* Left Side: Visuals */}
        <div className="w-1/3 bg-indigo-600 p-8 text-white hidden md:flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Study OS</h2>
            <p className="text-indigo-200">The world's most advanced AI study companion. Grounded, accurate, and ready to help you ace your exams.</p>
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className={`flex items-center gap-3 transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold">1</div>
              <span>Profile Setup</span>
            </div>
            <div className="h-8 w-0.5 bg-indigo-400 ml-4"></div>
             <div className={`flex items-center gap-3 transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold">2</div>
              <span>Knowledge Ingestion</span>
            </div>
            <div className="h-8 w-0.5 bg-indigo-400 ml-4"></div>
             <div className={`flex items-center gap-3 transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold">3</div>
              <span>Ready</span>
            </div>
          </div>

          {/* Abstract blobs */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Right Side: Forms */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
          
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center animate-fadeIn">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to the Future of Studying</h1>
              <p className="text-slate-500 mb-8">Let's set up your profile to personalize your AI tutor.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">What should we call you?</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">What is your main study goal?</label>
                  <input 
                    type="text" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Ace my Biology Finals"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="flex-1 flex flex-col animate-fadeIn">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Brain</h1>
                <p className="text-slate-500 mb-4">Study OS works best when it knows what you know. Upload your notes, textbooks, or syllabus.</p>
                
                <div className="flex-1 overflow-y-auto min-h-[300px] border border-slate-100 rounded-2xl bg-slate-50/50">
                  <FileUploader files={files} setFiles={setFiles} />
                </div>

                {isProcessing && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-xl flex items-center gap-3 text-indigo-700">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Ingesting documents, performing OCR, and generating vector embeddings...</span>
                  </div>
                )}
             </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">You're All Set, {name}!</h1>
              <p className="text-slate-500 mb-8 max-w-md">
                Your documents are processed. You can now chat with your sources, generate quizzes, or ask deep reasoning questions using Thinking Mode.
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                    <div className="font-bold text-slate-900">Chat with Sources</div>
                    <div className="text-xs text-slate-500">Strict hallucination control</div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                    <div className="font-bold text-slate-900">Thinking Mode</div>
                    <div className="text-xs text-slate-500">Deep reasoning & logic</div>
                 </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleNext}
              disabled={step === 1 && !name}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              {step === 3 ? "Launch Study OS" : "Next Step"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;