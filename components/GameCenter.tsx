
import React, { useState, useEffect } from 'react';
import { FileDocument, GameMode, Question, GameSession, TopicMastery } from '../types';
import { generateGameQuestions, gradeOpenEndedAnswer } from '../services/geminiService';
import { Brain, CheckCircle, X, Trophy, Zap, BookOpen } from './Icons';
import { calculateAccuracy } from '../utils';

interface GameCenterProps {
  files: FileDocument[];
}

const TOPICS_MOCK: TopicMastery[] = [
  { topicId: '1', title: 'Cell Biology', level: 'Secure', xp: 450 },
  { topicId: '2', title: 'Atomic Structure', level: 'Developing', xp: 120 },
  { topicId: '3', title: 'Energetics', level: 'Novice', xp: 0 },
];

const GameCenter: React.FC<GameCenterProps> = ({ files }) => {
  const [view, setView] = useState<'DASHBOARD' | 'PLAYING'>('DASHBOARD');
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openAnswer, setOpenAnswer] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState<{score: number, maxScore: number, feedback: string} | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const startGame = async (mode: GameMode, topic: string) => {
    setIsLoading(true);
    // In a real app, we'd filter files by topic metadata. Here we pass all for context.
    const questions = await generateGameQuestions(topic, mode, files, 5);
    
    setActiveSession({
      id: Date.now().toString(),
      mode,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      status: 'active'
    });
    
    setIsLoading(false);
    setView('PLAYING');
    setOpenAnswer('');
    setGradingFeedback(null);
  };

  const handleMCQSubmit = (optionIndex: number) => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[activeSession.currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctOptionIndex;

    const newAnswers = [...activeSession.answers, {
      questionId: currentQ.id,
      userAnswer: currentQ.options?.[optionIndex] || '',
      isCorrect
    }];

    setActiveSession({
      ...activeSession,
      score: isCorrect ? activeSession.score + 1 : activeSession.score,
      answers: newAnswers
    });
  };

  const handleOpenSubmit = async () => {
    if (!activeSession) return;
    setIsGrading(true);
    const currentQ = activeSession.questions[activeSession.currentQuestionIndex];
    
    const result = await gradeOpenEndedAnswer(
      currentQ.text, 
      openAnswer, 
      currentQ.markScheme || [], 
      files
    );

    setGradingFeedback(result);
    setIsGrading(false);

    // Auto-advance logic implies we wait for user to read feedback first
    // Just saving state for now
    const newAnswers = [...activeSession.answers, {
        questionId: currentQ.id,
        userAnswer: openAnswer,
        isCorrect: result.score >= (result.maxScore / 2), // Rough pass/fail
        feedback: result.feedback
    }];

    setActiveSession({
        ...activeSession,
        score: activeSession.score + result.score, // Simple addition for now
        answers: newAnswers
    });
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    if (activeSession.currentQuestionIndex >= activeSession.questions.length - 1) {
      setActiveSession({ ...activeSession, status: 'completed' });
    } else {
      setActiveSession({
        ...activeSession,
        currentQuestionIndex: activeSession.currentQuestionIndex + 1
      });
      setOpenAnswer('');
      setGradingFeedback(null);
    }
  };

  if (view === 'DASHBOARD') {
    return (
      <div className="p-8 max-w-6xl mx-auto animate-fadeIn">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Game Center
          </h1>
          <p className="text-slate-500 mt-2">Turn your notes into high-stakes exams. Master topics to level up.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           {TOPICS_MOCK.map(topic => (
             <div key={topic.topicId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800">{topic.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${topic.level === 'Secure' ? 'bg-green-100 text-green-700' : 
                        topic.level === 'Developing' ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-100 text-slate-500'}`}>
                      {topic.level}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mb-4">{topic.xp} XP</div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => startGame('MCQ_ARENA', topic.title)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> Smart MCQ
                    </button>
                    <button 
                      onClick={() => startGame('EXPLAIN_TO_WIN', topic.title)}
                      className="w-full py-2 bg-white border-2 border-slate-100 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> Explain to Win
                    </button>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // --- PLAYING VIEW ---
  
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-slate-800">Constructing Exam...</h2>
        <p className="text-slate-500">Analyzing {files.length} documents for syllabus alignment.</p>
      </div>
    );
  }

  if (!activeSession) return null;

  if (activeSession.status === 'completed') {
    const accuracy = calculateAccuracy(activeSession.score, activeSession.questions.length);
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
         <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
           <Trophy className="w-12 h-12 text-yellow-600" />
         </div>
         <h2 className="text-4xl font-bold text-slate-900 mb-2">Session Complete!</h2>
         <p className="text-slate-500 mb-8 text-lg">You scored {activeSession.score} / {activeSession.questions.length}</p>
         
         <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 mb-8">
           <div className="flex justify-between items-center mb-2">
             <span className="font-semibold text-slate-700">Accuracy</span>
             <span className="font-bold text-indigo-600">{accuracy}%</span>
           </div>
           <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
             <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${accuracy}%` }}></div>
           </div>
         </div>

         <button 
           onClick={() => setView('DASHBOARD')}
           className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
         >
           Return to Game Center
         </button>
      </div>
    );
  }

  // Handle case where questions might be empty or index out of bounds
  if (!activeSession.questions || activeSession.questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Questions Available</h2>
        <p className="text-slate-500 mb-6">Could not generate questions for this topic. Please try again or choose a different topic.</p>
        <button
          onClick={() => setView('DASHBOARD')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = activeSession.questions[activeSession.currentQuestionIndex];

  // Safety check for invalid index
  if (!currentQ) {
     return (
       <div className="h-full flex flex-col items-center justify-center">
         <p className="text-red-500">Error: Question index out of bounds.</p>
         <button onClick={() => setView('DASHBOARD')} className="mt-4 text-indigo-600 underline">Return to Dashboard</button>
       </div>
     );
  }

  const hasAnswered = activeSession.answers.some(a => a.questionId === currentQ.id);
  const answerState = activeSession.answers.find(a => a.questionId === currentQ.id);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setView('DASHBOARD')} className="text-slate-400 hover:text-slate-600 font-medium">
          Exit Game
        </button>
        <div className="flex gap-2">
           {activeSession.questions.map((_, idx) => (
             <div key={idx} className={`w-3 h-3 rounded-full 
               ${idx === activeSession.currentQuestionIndex ? 'bg-indigo-600 scale-125' : 
                 idx < activeSession.currentQuestionIndex ? 'bg-indigo-200' : 'bg-slate-200'}`} 
             />
           ))}
        </div>
        <div className="font-bold text-indigo-600">
           Score: {activeSession.score}
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-indigo-900/5 border border-slate-200 relative overflow-hidden">
           <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {currentQ.difficulty} Difficulty
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-relaxed">
                {currentQ.text}
              </h2>

              {/* MCQ MODE */}
              {activeSession.mode === 'MCQ_ARENA' && currentQ.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.options.map((option, idx) => {
                    let btnClass = "p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 hover:scale-[1.02] ";
                    
                    if (hasAnswered) {
                       if (idx === currentQ.correctOptionIndex) btnClass += "bg-green-50 border-green-500 text-green-700 ";
                       else if (answerState?.userAnswer === option) btnClass += "bg-red-50 border-red-500 text-red-700 ";
                       else btnClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-50 ";
                    } else {
                       btnClass += "bg-white border-slate-200 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer ";
                    }

                    return (
                      <button 
                        key={idx}
                        disabled={hasAnswered}
                        onClick={() => handleMCQSubmit(idx)}
                        className={btnClass}
                      >
                        <span className="mr-2 opacity-50">{String.fromCharCode(65 + idx)}.</span> {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* OPEN ENDED MODE */}
              {activeSession.mode === 'EXPLAIN_TO_WIN' && (
                <div className="space-y-4">
                  {!hasAnswered ? (
                    <>
                      <textarea 
                        value={openAnswer}
                        onChange={(e) => setOpenAnswer(e.target.value)}
                        placeholder="Type your explanation here. Be specific and use keywords..."
                        className="w-full h-40 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                      />
                      <button 
                        onClick={handleOpenSubmit}
                        disabled={!openAnswer.trim() || isGrading}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isGrading ? (
                          <>
                             <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                             Grading with Mark Scheme...
                          </>
                        ) : "Submit Answer"}
                      </button>
                    </>
                  ) : (
                    <div className={`p-6 rounded-xl border ${gradingFeedback && gradingFeedback.score > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900">Examiner Feedback</span>
                        <span className="font-bold text-lg">{gradingFeedback?.score} / {gradingFeedback?.maxScore} Marks</span>
                      </div>
                      <p className="text-slate-700 mb-4">{gradingFeedback?.feedback}</p>
                      <div className="text-sm font-semibold text-slate-900">Your Answer:</div>
                      <p className="text-slate-600 text-sm italic">"{answerState?.userAnswer}"</p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* FEEDBACK & NEXT */}
        {hasAnswered && (
          <div className="mt-6 animate-slideUp">
             <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                     <BookOpen className="w-4 h-4" />
                     Study OS Logic
                   </div>
                   <p className="text-slate-100 leading-relaxed">
                     {currentQ.explanation}
                   </p>
                   <div className="mt-2 text-xs text-slate-500 font-mono">
                     Source: {currentQ.sourceCitation}
                   </div>
                </div>
                <button 
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform whitespace-nowrap"
                >
                  {activeSession.currentQuestionIndex >= activeSession.questions.length - 1 ? "Finish Game" : "Next Question"}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCenter;
