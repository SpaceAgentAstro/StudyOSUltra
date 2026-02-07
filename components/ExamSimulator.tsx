
import React, { useState, useEffect } from 'react';
import { FileDocument, ExamPaper } from '../types';
import { generateExamPaper } from '../services/geminiService';
import { BookOpen, X, Eye, Lock, AlertTriangle } from './Icons';
import { formatTime } from '../utils';

interface ExamSimulatorProps {
  files: FileDocument[];
}

const ExamSimulator: React.FC<ExamSimulatorProps> = ({ files }) => {
  const [view, setView] = useState<'SETUP' | 'EXAM' | 'RESULTS' | 'DISQUALIFIED'>('SETUP');
  const [currentExam, setCurrentExam] = useState<ExamPaper | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Invigilator State
  const [warnings, setWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const startExam = async () => {
    // 1. Secure Environment First (Must happen synchronously with user click)
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
    } catch (e) {
        console.warn("Fullscreen denied or failed:", e);
        alert("Exam requires Fullscreen mode. Please allow fullscreen to proceed.");
        return;
    }

    setIsGenerating(true);
    // Simulate Topic Selection (Mock)
    const topic = "Cell Biology & Transport"; 
    
    try {
        const questions = await generateExamPaper(topic, files);
        
        const newExam: ExamPaper = {
            id: 'exam-' + Date.now(),
            title: `Paper 1: ${topic}`,
            durationMinutes: 10, // Short for demo
            totalMarks: questions.reduce((acc, q) => acc + (q.marks || 1), 0),
            questions
        };

        setCurrentExam(newExam);
        setTimeLeft(newExam.durationMinutes * 60);
        setWarnings(0);
        setWarningMessage(null);
        setView('EXAM');
    } catch (error) {
        console.error("Exam start failed:", error);
        // If generation fails, exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (view === 'EXAM' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (view === 'EXAM' && timeLeft === 0) {
      submitExam();
    }
  }, [view, timeLeft]);

  // --- AI INVIGILATOR LOGIC ---
  useEffect(() => {
      if (view !== 'EXAM') return;

      const handleVisibilityChange = () => {
          if (document.hidden) {
              issueWarning("Visual attention loss detected (Tab Switch). Focus is required.");
          }
      };

      const handleBlur = () => {
          issueWarning("Focus lost (Window Click-away). Remain in the exam environment.");
      };

      const handleFullscreenChange = () => {
          if (!document.fullscreenElement) {
              issueWarning("Secure environment breach (Fullscreen Exit).");
          }
      };

      const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault();
          issueWarning("Unauthorized interface interaction (Right Click).");
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("blur", handleBlur);
          document.removeEventListener("fullscreenchange", handleFullscreenChange);
          document.removeEventListener("contextmenu", handleContextMenu);
      };
  }, [view, warnings]); // Dependency on warnings to ensure state updates correctly

  const issueWarning = (reason: string) => {
      // Functional state update to prevent race conditions in event listeners
      setWarnings(prev => {
          const newCount = prev + 1;
          
          setWarningMessage(`VIOLATION ${newCount}/3: ${reason}`);

          if (newCount >= 3) {
             // Disqualify logic
             if (document.fullscreenElement) {
                 document.exitFullscreen().catch(() => {});
             }
             // Small delay to let the user see the final warning
             setTimeout(() => setView('DISQUALIFIED'), 1500);
          } else {
             // Clear warning after 4 seconds
             setTimeout(() => setWarningMessage(null), 4000);
          }
          return newCount;
      });
  };

  const handleAnswerChange = (qId: string, val: string) => {
    // Invigilator: Content Monitoring (Prompt Injection / Cheating)
    const suspiciousPhrases = [
        'hey google', 'chatgpt', 'help me', 
        'what is the answer', 'ignore previous instructions', 
        'as an ai', 'system prompt'
    ];
    
    if (suspiciousPhrases.some(phrase => val.toLowerCase().includes(phrase))) {
        if (!warningMessage) { 
             issueWarning("Unauthorized linguistic pattern detected (Possible Agent Injection).");
        }
    }
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const preventCheating = (e: React.ClipboardEvent) => {
      e.preventDefault();
      issueWarning("External data injection (Paste/Copy) prohibited.");
  };

  const submitExam = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    setView('RESULTS');
  };

  if (view === 'SETUP') {
    return (
        <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Exam Simulator</h1>
            <p className="text-slate-500 max-w-lg mb-8">
                Enter strict examination conditions. The <strong>AI Invigilator</strong> will monitor your:
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md w-full mb-8">
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-left flex items-center gap-3">
                    <Eye className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-bold text-slate-700">Tab & Focus</span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-left flex items-center gap-3">
                    <Lock className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-bold text-slate-700">Fullscreen</span>
                </div>
            </div>
            
            <button 
                onClick={startExam}
                disabled={isGenerating}
                className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
                {isGenerating ? "Securing Environment..." : "Begin Proctored Exam"}
            </button>
        </div>
    );
  }

  if (view === 'DISQUALIFIED') {
      return (
          <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center animate-fadeIn">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/40 animate-pulse">
                  <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">DISQUALIFIED</h1>
              <p className="text-red-600 font-bold mb-6 text-xl">Academic Malpractice Detected</p>
              
              <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-md w-full mb-8">
                  <p className="text-slate-700 font-medium">
                      The AI Invigilator terminated your session due to repeated violations of the secure environment protocols.
                  </p>
                  <div className="mt-4 pt-4 border-t border-red-200 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-500">Violations Recorded</span>
                      <span className="text-2xl font-bold text-red-600">{warnings}</span>
                  </div>
              </div>

              <button 
                onClick={() => setView('SETUP')}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                  Return to Dashboard
              </button>
          </div>
      );
  }

  if (view === 'RESULTS') {
      return (
          <div className="p-8 max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Exam Report</h1>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">{currentExam?.title}</h2>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold text-sm">Grading Pending</span>
                  </div>
                  <p className="text-slate-600">
                      Your paper has been submitted to The Examiner agent. 
                      Check your Digital Twin profile later for the detailed breakdown and grade prediction.
                  </p>
                  {warnings > 0 ? (
                      <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                              <h4 className="font-bold text-red-700 text-sm">Invigilator Report</h4>
                              <p className="text-red-600 text-sm">{warnings} behavioral flags recorded. This may affect your predicted grade credibility.</p>
                          </div>
                      </div>
                  ) : (
                      <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700 text-sm">
                          <Eye className="w-5 h-5" />
                          <span>Clean session. No behavioral anomalies detected.</span>
                      </div>
                  )}
              </div>
               <button 
                onClick={() => setView('SETUP')}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg"
              >
                  Return to Simulator
              </button>
          </div>
      )
  }

  return (
    <div className={`h-full flex flex-col bg-slate-50 relative ${warningMessage ? 'ring-4 ring-inset ring-red-500' : ''}`}>
        {/* Warning Overlay */}
        {warningMessage && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
                <div className="bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold uppercase tracking-wider text-xs text-red-200 mb-1">Invigilator Intervention</h3>
                        <p className="font-bold text-md leading-tight">{warningMessage.split(': ')[1]}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Header / Invigilator Bar */}
        <div className="h-16 bg-slate-900 text-white flex justify-between items-center px-6 shadow-md z-10 sticky top-0">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-mono font-bold tracking-widest text-red-400">REC</span>
                </div>
                
                {/* Eye Tracker Visual */}
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <Eye className={`w-4 h-4 ${warnings > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span className="text-xs font-bold text-slate-300">
                        {warnings === 0 ? "MONITORING ACTIVE" : "SUSPICIOUS ACTIVITY"}
                    </span>
                </div>

                <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
                <div className="flex items-center gap-2 text-sm hidden md:flex">
                    <span className={warnings > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>
                        Strikes: {warnings}/3
                    </span>
                </div>
            </div>
            <div className={`font-mono text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
            </div>
            <button onClick={submitExam} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors">
                Submit Paper
            </button>
        </div>

        {/* Paper Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full select-none">
            <div className="bg-white p-8 md:p-12 rounded-none shadow-sm min-h-[1000px] relative border border-slate-200">
                 {/* Paper Header */}
                <div className="text-center border-b-2 border-slate-900 pb-8 mb-12">
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">{currentExam?.title}</h2>
                    <p className="text-slate-600 font-serif italic">Candidate Name: Study OS User</p>
                    <p className="text-slate-600 font-serif italic">Time Allowed: {currentExam?.durationMinutes} minutes</p>
                </div>

                <div className="space-y-12">
                    {currentExam?.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-4">
                            <div className="flex items-start gap-4">
                                <span className="font-serif font-bold text-xl text-slate-400">{idx + 1}</span>
                                <div className="flex-1">
                                    <p className="font-serif text-lg text-slate-900 mb-2">
                                        {q.text}
                                        <span className="float-right text-base font-sans font-bold text-slate-500">[{q.marks} marks]</span>
                                    </p>
                                    
                                    {q.type === 'MCQ' ? (
                                        <div className="space-y-2 mt-4 pl-4 border-l-2 border-slate-100">
                                            {q.options?.map((opt, i) => (
                                                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                                    <input 
                                                        type="radio" 
                                                        name={q.id} 
                                                        onChange={() => handleAnswerChange(q.id, opt)}
                                                        className="w-4 h-4 text-slate-900 focus:ring-slate-900" 
                                                    />
                                                    <span className="font-serif text-slate-700 group-hover:text-black">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 bg-slate-50 border-b border-slate-300">
                                            <textarea 
                                                className="w-full bg-transparent p-4 font-serif text-lg outline-none min-h-[150px] resize-y"
                                                placeholder="Write your answer here..."
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                onPaste={preventCheating}
                                                onCopy={preventCheating}
                                                onCut={preventCheating}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 font-serif text-sm">
                    End of Paper
                </div>
            </div>
        </div>
    </div>
  );
};

export default ExamSimulator;
