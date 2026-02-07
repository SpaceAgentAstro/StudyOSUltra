import React from 'react';

const SocialHub: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
       <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Study Rooms</h1>
            <p className="text-slate-500 mt-2">Join a controlled environment to study with AI peers or real users.</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700">
              Create Room
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Room Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">SILENT STUDY</span>
                    <span className="text-slate-400 text-sm">12/20</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Deep Work: Pomodoro</h3>
                <p className="text-slate-500 text-sm mb-4">25min focus • 5min break</p>
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                            U{i}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">+8</div>
                </div>
            </div>

            {/* Room Card 2 */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md">CO-OP QUIZ</span>
                    <span className="text-slate-400 text-sm">3/5</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Cell Biology Boss Raid</h3>
                <p className="text-slate-500 text-sm mb-4">Team up to defeat the 2019 Past Paper.</p>
                 <div className="flex -space-x-2">
                    {[1,2].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                            U{i}
                        </div>
                    ))}
                </div>
            </div>

            {/* Room Card 3 */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group opacity-75">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">DEBATE</span>
                    <span className="text-slate-400 text-sm">FULL</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Ethics of AI in Exams</h3>
                <p className="text-slate-500 text-sm mb-4">Moderated by The Teacher Agent.</p>
            </div>
        </div>
    </div>
  );
};

export default SocialHub;
