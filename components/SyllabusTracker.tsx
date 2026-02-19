import React from 'react';
import { MOCK_SYLLABUS } from '../constants';
import { CheckCircle } from './Icons';

const SyllabusTracker: React.FC = () => {
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
};

export default SyllabusTracker;
