
import React, { useState, useEffect } from 'react';
import { CognitiveExercise } from '../types';
import { generateCognitiveExercises } from '../services/geminiService';
import { Layers, Brain, Zap } from './Icons';

const CognitiveLab: React.FC = () => {
  const [exercises, setExercises] = useState<CognitiveExercise[]>([]);
  const [activeExercise, setActiveExercise] = useState<CognitiveExercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const data = await generateCognitiveExercises();
    setExercises(data);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fadeIn">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Layers className="w-8 h-8 text-teal-600" />
                Cognitive Skills Lab
            </h1>
            <p className="text-slate-500 mt-2">
                Train abstract reasoning, logic, and argumentation separate from subject matter.
            </p>
        </header>

        {!activeExercise ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((ex, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group" onClick={() => setActiveExercise(ex)}>
                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                            <Brain className="w-6 h-6 text-teal-600 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{ex.title}</h3>
                        <p className="text-sm text-slate-500 mb-4">{ex.description}</p>
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>{ex.skill.replace('_', ' ')}</span>
                            <span>{ex.difficulty}</span>
                        </div>
                    </div>
                ))}
                {exercises.length === 0 && (
                    <div className="col-span-3 text-center py-20">
                        <div className="animate-pulse text-slate-400">Loading Neuro-Training Modules...</div>
                    </div>
                )}
            </div>
        ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-teal-600 font-bold tracking-wider text-xs uppercase">{activeExercise.skill}</span>
                    <button onClick={() => setActiveExercise(null)} className="text-slate-400 hover:text-slate-600">Close</button>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{activeExercise.title}</h2>
                <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-lg text-slate-600">{activeExercise.description}</p>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
                        <h4 className="font-bold text-slate-900 mb-2">Exercise Prompt:</h4>
                        <p>Identify the flaw in the following reasoning...</p>
                        {/* Dynamic content would go here in a full implementation */}
                    </div>
                </div>
                <button className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-transform active:scale-95">
                    Begin Analysis
                </button>
            </div>
        )}
    </div>
  );
};

export default CognitiveLab;
