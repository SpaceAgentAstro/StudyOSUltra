import React, { memo } from 'react';
import { FileDocument } from '../types';
import { Brain } from './Icons';

interface MessageContentProps {
  text: string;
  files: FileDocument[];
  onExplain: (code: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ text, files, onExplain }) => {
  return (
    <div className="prose prose-sm max-w-none whitespace-pre-wrap mt-1">
      {text.split(/(```[\s\S]*?```)/g).map((blockPart, blockIdx) => {
        // Code Block Handling
        if (blockPart.startsWith('```') && blockPart.endsWith('```')) {
          const codeContent = blockPart.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return (
            <div key={blockIdx} className="my-3 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Code Snippet</span>
                <button
                  onClick={() => onExplain(codeContent)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-2 py-1 rounded hover:bg-indigo-50 transition-colors shadow-sm"
                                title="Ask Teacher to explain code snippet"
                                aria-label="Ask Teacher to explain code snippet"
                >
                  <Brain className="w-3 h-3" /> Explain
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-xs font-mono text-slate-800 bg-white">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Regular Text with Citations
        return (
          <span key={blockIdx}>
            {blockPart.split(/(\[.*?\])/g).map((part, i) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                const isFile = files.some(f => part.includes(f.name));
                return (
                  <span
                    key={i}
                    className={`text-xs font-bold px-1 py-0.5 rounded cursor-pointer transition-colors ${isFile ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                  >
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </span>
        );
      })}
    </div>
  );
};

export default memo(MessageContent);
