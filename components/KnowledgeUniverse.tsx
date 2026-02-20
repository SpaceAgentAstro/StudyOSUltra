
import React, { useState, useEffect, useMemo } from 'react';
import { FileDocument, KnowledgeNode } from '../types';
import { generateKnowledgeGraph } from '../services/geminiService';
import { Network, Loader, Compass } from './Icons';

interface KnowledgeUniverseProps {
  files: FileDocument[];
}

const KnowledgeUniverse: React.FC<KnowledgeUniverseProps> = ({ files }) => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  useEffect(() => {
    // Check if we need to generate initial graph
    if (files.length > 0 && nodes.length === 0) {
      handleGenerate();
    }
  }, [files]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateKnowledgeGraph(files);
    
    // Assign random positions for simple visualization (Force-directed simulation omitted for simplicity)
    const spacedNodes = result.map(node => ({
      ...node,
      x: Math.random() * 800 + 100,
      y: Math.random() * 500 + 50
    }));
    
    setNodes(spacedNodes);
    setIsGenerating(false);
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgeNode>();
    nodes.forEach(node => {
      map.set(node.id, node);
    });
    return map;
  }, [nodes]);

  const connections = useMemo(() => {
    const lines: React.ReactNode[] = [];
    nodes.forEach(node => {
        node.connections.forEach(targetId => {
            const target = nodeMap.get(targetId);
            if (target && node.x && node.y && target.x && target.y) {
                lines.push(
                    <line 
                        key={`${node.id}-${targetId}`}
                        x1={node.x} y1={node.y}
                        x2={target.x} y2={target.y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        className="opacity-50"
                    />
                );
            }
        });
    });
    return lines;
  }, [nodes, nodeMap]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden relative">
      {/* HUD */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Network className="w-6 h-6 text-indigo-400" />
                Knowledge Universe
            </h1>
            <p className="text-slate-400 text-sm">Visualizing {nodes.length} concepts across your life.</p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 rounded-lg text-sm font-bold text-indigo-300 transition-colors flex items-center gap-2"
            >
                {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                {isGenerating ? "Scanning..." : "Re-Scan Sources"}
            </button>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="flex-1 relative cursor-move">
          <svg className="w-full h-full">
             <defs>
                <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.5" />
                </radialGradient>
             </defs>
             
             {/* Background Grid */}
             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid)" />

             {connections}

             {nodes.map(node => (
                 <g key={node.id} 
                    transform={`translate(${node.x},${node.y})`} 
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                 >
                     <circle r={20 + (node.mastery / 5)} fill="url(#nodeGradient)" className="animate-pulse" style={{animationDuration: '3s'}} />
                     <text y={35} textAnchor="middle" fill="white" className="text-xs font-medium pointer-events-none select-none shadow-black drop-shadow-md">
                         {node.label}
                     </text>
                 </g>
             ))}
          </svg>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
          <div className="absolute right-6 top-6 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl animate-slideLeft">
              <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{selectedNode.label}</h2>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white"><Compass className="w-5 h-5 rotate-45" /></button>
              </div>
              <div className="space-y-4">
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</span>
                      <p className="text-indigo-400">{selectedNode.category}</p>
                  </div>
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mastery Level</span>
                      <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
                          <div className="bg-indigo-500 h-full rounded-full" style={{width: `${selectedNode.mastery}%`}}></div>
                      </div>
                      <p className="text-right text-xs text-slate-400 mt-1">{selectedNode.mastery}%</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800">
                      <button className="w-full py-2 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                          Inspect Concept
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default KnowledgeUniverse;
