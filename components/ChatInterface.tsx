
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, FileDocument, AgentRole } from '../types';
import { AGENTS } from '../constants';
import { Send, Paperclip, Brain, Image as ImageIcon, Mic, Zap, StopCircle, Loader, Globe, FileText } from './Icons';

let geminiServicePromise: Promise<typeof import('../services/geminiService')> | null = null;

interface ChatInterfaceProps {
  files: FileDocument[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ files }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      agent: 'COUNCIL',
      text: "Welcome to your Study Universe. I am The Council. I will route your queries to the best agent. Try asking for a strict mark scheme check (Examiner) or a simple analogy (Teacher).",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>('COUNCIL');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useFlashLite, setUseFlashLite] = useState(false);
  
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress for visual feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 95));
      }, 50);

      const reader = new FileReader();
      reader.onload = (evt) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
            setImageAttachment(evt.target?.result as string);
            setIsUploading(false);
            setUploadProgress(0);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (overrideInput?: string, overrideAgent?: AgentRole) => {
    const textToSend = overrideInput || input;
    const isManualSend = !overrideInput;

    // Check valid input: either text exists, or (if manual) an image exists
    if (!textToSend.trim() && (!isManualSend || !imageAttachment)) return;
    if (isLoading || isUploading) return;

    const attachmentToSend = (isManualSend && imageAttachment) ? imageAttachment : null;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      attachments: attachmentToSend ? [{ type: 'image', url: attachmentToSend }] : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    
    if (isManualSend) {
        setInput('');
        setImageAttachment(null);
    }
    
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const actingAgent = overrideAgent || selectedAgent; 

    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      agent: actingAgent,
      text: '', 
      timestamp: Date.now(),
      isThinking: true
    }]);

    abortControllerRef.current = new AbortController();

    let fullResponse = "";
    let accumulatedGrounding: { title: string; uri: string }[] = [];

    if (!geminiServicePromise) {
      geminiServicePromise = import('../services/geminiService');
    }
    const { streamChatResponse } = await geminiServicePromise;

    await streamChatResponse({
      history: messages,
      newMessage: userMsg.text,
      files,
      imageAttachment: attachmentToSend || undefined,
      mode: 'tutor',
      agentRole: actingAgent,
      digitalTwin: {
        knowledgeMap: {},
        examSkills: { precision: 40, timeManagement: 60, reasoning: 50 },
        weaknesses: ['Scientific terminology', 'Graph interpretation'],
        recentMood: 'focused'
      },
      useThinking: useThinking && !useFlashLite,
      useSearch,
      useFlashLite,
      signal: abortControllerRef.current.signal,
      onChunk: (text, groundingChunks) => {
        fullResponse += text;
        
        if (groundingChunks) {
          groundingChunks.forEach((chunk: any) => {
            if (chunk.web && chunk.web.uri && chunk.web.title) {
               if (!accumulatedGrounding.some(g => g.uri === chunk.web.uri)) {
                 accumulatedGrounding.push({ title: chunk.web.title, uri: chunk.web.uri });
               }
            }
          });
        }

        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { 
                ...msg, 
                text: fullResponse, 
                isThinking: false,
                groundingUrls: accumulatedGrounding.length > 0 ? accumulatedGrounding : undefined
              } 
            : msg
        ));
      }
    });

    setIsLoading(false);
    abortControllerRef.current = null;
  };

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const onExplain = useCallback((text: string, agent: AgentRole) => {
      handleSendRef.current(text, agent);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Agent Selector */}
      <div className="p-3 border-b border-slate-100 bg-white z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {AGENTS.map((agent) => (
                <button
                    key={agent.role}
                    onClick={() => setSelectedAgent(agent.role)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                        ${selectedAgent === agent.role 
                            ? `${agent.color} text-white shadow-md` 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${selectedAgent === agent.role ? 'bg-white' : agent.color}`} />
                    {agent.label}
                </button>
            ))}
        </div>

        {/* Tools */}
        <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <button 
                    onClick={() => { setUseThinking(!useThinking); if(!useThinking) setUseFlashLite(false); }}
                    className={`p-1.5 rounded-lg border transition-colors ${useThinking ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-slate-200 text-slate-400'}`}
                    title="Thinking Mode"
                >
                    <Brain className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => { setUseSearch(!useSearch); }}
                    className={`p-1.5 rounded-lg border transition-colors ${useSearch ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-400'}`}
                    title="Google Search"
                >
                    <Globe className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => { setUseFlashLite(!useFlashLite); if(!useFlashLite) setUseThinking(false); }}
                    className={`p-1.5 rounded-lg border transition-colors ${useFlashLite ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-slate-200 text-slate-400'}`}
                    title="Flash Lite (Fast)"
                >
                    <Zap className="w-4 h-4" />
                </button>
             </div>
             <span className="text-xs text-slate-400 font-medium">
                {files.length} Sources Active
             </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
           <ChatMessage
             key={msg.id}
             msg={msg}
             files={files}
             onExplain={onExplain}
             useThinking={useThinking}
             useSearch={useSearch}
           />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {imageAttachment && (
           <div className="flex items-center gap-3 mb-3 p-2 pr-4 bg-slate-50 rounded-xl w-fit border border-slate-200 animate-fadeIn group">
             <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 relative">
                <img src={imageAttachment} alt="preview" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-700">Image Attached</span>
                 <span className="text-[10px] text-slate-400">Ready to analyze</span>
             </div>
             <button onClick={() => setImageAttachment(null)} className="ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
               <div className="w-4 h-4 font-bold flex items-center justify-center">×</div>
             </button>
           </div>
        )}
        
        {isUploading && (
             <div className="mb-3 max-w-xs animate-fadeIn">
                <div className="flex justify-between text-xs font-medium text-indigo-600 mb-1">
                    <span>Processing Image...</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-100 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
             </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${AGENTS.find(a => a.role === selectedAgent)?.label}...`}
              disabled={isLoading || isUploading}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
               <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                title="Attach Image"
               >
                 <ImageIcon className="w-4 h-4" />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleImageUpload} 
               />
            </div>
          </div>
          
          {isLoading ? (
             <button
                onClick={handleStop}
                className="px-4 py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm shadow-sm"
                title="Stop Generating"
             >
                <StopCircle className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">Stop</span>
             </button>
          ) : (
             <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !imageAttachment) || isUploading}
                className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 transition-all active:scale-95"
             >
                <Send className="w-5 h-5" />
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
