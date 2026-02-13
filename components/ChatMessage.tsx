import React, { memo } from 'react';
import { Message, FileDocument, AgentRole } from '../types';
import { AGENTS } from '../constants';
import { Brain, Globe } from './Icons';

interface ChatMessageProps {
  msg: Message;
  files: FileDocument[];
  onExplain: (text: string, agent: AgentRole) => void;
  useThinking?: boolean;
  useSearch?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({ msg, files, onExplain, useThinking, useSearch }) => {
  const agentInfo = AGENTS.find(a => a.role === msg.agent) || AGENTS[0];

  return (
    <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
        ${msg.role === 'model' ? `${agentInfo.color} text-white` : 'bg-slate-900 text-white'}`}>
        {msg.role === 'model' ? (
            <span className="text-[10px] font-bold">{msg.agent?.[0] || 'C'}</span>
        ) : <span className="font-bold text-xs">U</span>}
        </div>

        <div className={`max-w-[85%] space-y-2`}>
        <div className={`p-4 rounded-2xl shadow-sm relative
            ${msg.role === 'user'
            ? 'bg-slate-900 text-white rounded-tr-none'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>

            {msg.role === 'model' && (
                <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${agentInfo.color}`}>
                    {agentInfo.label}
                </div>
            )}

            {msg.attachments?.map((att, idx) => (
            <div key={idx} className="mb-3 rounded-lg overflow-hidden border border-slate-200">
                <img src={att.url} alt="attachment" className="max-h-64 object-contain" />
            </div>
            ))}

            {msg.isThinking && !msg.text ? (
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex gap-1 h-6 items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                </div>
                {useThinking && <span className="text-xs text-indigo-400 font-medium animate-pulse">Thinking deeply...</span>}
                {useSearch && <span className="text-xs text-blue-400 font-medium animate-pulse">Searching the web...</span>}
            </div>
            ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap mt-1">
                {msg.text.split(/(```[\s\S]*?```)/g).map((blockPart, blockIdx) => {
                    // Code Block Handling
                    if (blockPart.startsWith('```') && blockPart.endsWith('```')) {
                        const codeContent = blockPart.replace(/^```\w*\n?/, '').replace(/```$/, '');
                        return (
                            <div key={blockIdx} className="my-3 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group">
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Code Snippet</span>
                                    <button
                                        onClick={() => onExplain(`Could you explain this code in detail as a teacher?\n\n${codeContent}`, 'TEACHER')}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-2 py-1 rounded hover:bg-indigo-50 transition-colors shadow-sm"
                                        title="Ask Teacher to explain"
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
            )}
        </div>

        {msg.groundingUrls && msg.groundingUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
                {msg.groundingUrls.map((url, idx) => (
                    <a
                        key={idx}
                        href={url.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                    >
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span className="truncate max-w-[150px]">{url.title}</span>
                    </a>
                ))}
            </div>
        )}
        </div>
    </div>
  );
});

export default ChatMessage;
