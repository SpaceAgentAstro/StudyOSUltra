
import React, { useState, useEffect } from 'react';
import { Message, MetaInsight } from '../types';
import { generateMetaAnalysis } from '../services/geminiService';
import { Activity, Brain, CheckCircle, Zap } from './Icons';

interface MetaLearningEngineProps {
  history: Message[]; // Chat history to analyze
}

const MetaLearningEngine: React.FC<MetaLearningEngineProps> = ({ history }) => {
  const [insights, setInsights] = useState<MetaInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (history.length > 0 && insights.length === 0) {
        analyze();
    }
  }, [history]);

  const analyze = async () => {
    setIsAnalyzing(true);
    const results = await generateMetaAnalysis(history);
    setInsights(results);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fadeIn">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-rose-500" />
                Meta-Learning Engine
            </h1>
            <p className="text-slate-500 mt-2">
                Diagnosing <i>how</i> you learn, not just <i>what</i> you learn.
            </p>
        </header>

        {isAnalyzing ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="font-bold text-slate-800">Analyzing Cognitive Patterns...</h3>
                <p className="text-slate-500">Scanning for depth of processing, bias, and recall strategies.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full 
                            ${insight.type === 'BIAS_DETECTED' ? 'bg-red-500' : 
                              insight.type === 'STRENGTH' ? 'bg-green-500' : 'bg-blue-500'}`} 
                        />
                        <div className="flex items-start justify-between mb-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase
                                ${insight.type === 'BIAS_DETECTED' ? 'bg-red-100 text-red-700' : 
                                  insight.type === 'STRENGTH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {insight.type.replace('_', ' ')}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{insight.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{insight.description}</p>
                    </div>
                ))}
                
                {/* Fallback if no history */}
                {insights.length === 0 && (
                    <div className="col-span-3 p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-400">Not Enough Data</h3>
                        <p className="text-slate-400">Chat more with the Council to generate a cognitive profile.</p>
                    </div>
                )}
            </div>
        )}
        
        <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recommended Interventions</h2>
            <div className="bg-indigo-900 text-white p-8 rounded-3xl flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Space Your Repetition</h3>
                    <p className="text-indigo-200 max-w-xl">
                        Our analysis suggests you cram before deadlines. Switching to distributed practice could increase retention by 40%.
                    </p>
                </div>
                <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:scale-105 transition-transform">
                    Adjust Schedule
                </button>
            </div>
        </div>
    </div>
  );
};

export default MetaLearningEngine;
