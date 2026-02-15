
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, FileDocument, AgentRole } from '../types';
import { generateId } from '../utils';
import { Send, Paperclip, Brain, Image as ImageIcon, Mic, Zap, StopCircle, Loader, Globe, FileText, Volume, Play } from './Icons';
import { AGENTS_CONFIG } from '../constants';
import ChatMessage from './ChatMessage';

let geminiServicePromise: Promise<typeof import('../services/geminiService')> | null = null;

const LEGACY_API_KEY_STORAGE_KEY = 'study_os_api_key';
const API_KEY_STORAGE_PREFIX = 'study_os_api_key_';
const PROVIDER_STORAGE_KEY = 'study_os_provider';
const OLLAMA_BASE_STORAGE_KEY = 'study_os_ollama_base';
const OLLAMA_MODEL_STORAGE_KEY = 'study_os_ollama_model';

type ModelProvider = 'auto' | 'google' | 'openai' | 'anthropic' | 'ollama';
type KeyedProvider = Exclude<ModelProvider, 'auto' | 'ollama'>;
type ApiKeySource = 'runtime' | 'env' | 'none';

interface ProviderStatus {
  preferred: ModelProvider;
  resolved: Exclude<ModelProvider, 'auto'>;
  configured: Record<KeyedProvider | 'ollama', boolean>;
  keySource: Record<KeyedProvider, ApiKeySource>;
  ollama: { baseUrl: string; model: string };
}

const providerNeedsApiKey = (provider: ModelProvider): provider is KeyedProvider =>
  provider === 'google' || provider === 'openai' || provider === 'anthropic';

const getApiStorageKey = (provider: KeyedProvider) => `${API_KEY_STORAGE_PREFIX}${provider}`;

const providerLabel: Record<ModelProvider, string> = {
  auto: 'Auto',
  google: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  ollama: 'Ollama'
};

const healthProviders: Array<KeyedProvider | 'ollama'> = ['google', 'openai', 'anthropic', 'ollama'];

interface ChatInterfaceProps {
  files: FileDocument[];
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ files, initialMessages = [], onMessagesChange }) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [{
          id: 'welcome',
          role: 'model',
          agent: 'COUNCIL',
          text: "Welcome to your Study Universe. I am The Council. I will route your queries to the best agent. Try asking for a strict mark scheme check (Examiner) or a simple analogy (Teacher).",
          timestamp: Date.now()
        }]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>('COUNCIL');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useFlashLite, setUseFlashLite] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [provider, setProvider] = useState<ModelProvider>('auto');
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [ollamaBase, setOllamaBase] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // Ref to hold the current handleSend function for the stable callback
  const handleSendRef = useRef<(overrideInput?: string, overrideAgent?: AgentRole) => Promise<void>>(async () => {});

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const sttSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any)?.webkitSpeechRecognition);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  // Hydrate chat from parent when provided (e.g., after refresh)
  useEffect(() => {
    if (initialMessages.length === 0) return;
    // Avoid overwriting active session if already hydrated
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Set up speech recognition once
  useEffect(() => {
    if (!sttSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec: any = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput((prev) => prev.trim() ? `${prev} ${transcript}` : transcript);
    };
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [sttSupported]);

  // Speak latest assistant message if voice is enabled
  useEffect(() => {
    if (!voiceEnabled || !speechSupported) return;
    const lastModel = [...messages].reverse().find(m => m.role === 'model' && m.text.trim() && !m.isThinking);
    if (lastModel && lastModel.id !== lastSpokenId) {
      const clean = lastModel.text.replace(/```[\s\S]*?```/g, '').slice(0, 800);
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      setLastSpokenId(lastModel.id);
      utter.onend = () => setLastSpokenId(lastModel.id);
      window.speechSynthesis.speak(utter);
    }
  }, [messages, voiceEnabled, speechSupported, lastSpokenId]);

  // Load stored key once on mount
  useEffect(() => {
    const storedProvider = (localStorage.getItem(PROVIDER_STORAGE_KEY) as ModelProvider | null) || 'auto';
    const storedGoogleKey =
      localStorage.getItem(getApiStorageKey('google')) ||
      localStorage.getItem(LEGACY_API_KEY_STORAGE_KEY) ||
      '';
    const storedOpenAIKey = localStorage.getItem(getApiStorageKey('openai')) || '';
    const storedAnthropicKey = localStorage.getItem(getApiStorageKey('anthropic')) || '';
    const storedOllamaBase = localStorage.getItem(OLLAMA_BASE_STORAGE_KEY) || '';
    const storedOllamaModel = localStorage.getItem(OLLAMA_MODEL_STORAGE_KEY) || '';

    setProvider(storedProvider);
    const activeStoredKey = providerNeedsApiKey(storedProvider)
      ? (storedProvider === 'google' ? storedGoogleKey : storedProvider === 'openai' ? storedOpenAIKey : storedAnthropicKey)
      : '';
    setApiKeyInput(activeStoredKey);
    setApiKeySaved(Boolean(activeStoredKey));
    if (storedOllamaBase) setOllamaBase(storedOllamaBase);
    if (storedOllamaModel) setOllamaModel(storedOllamaModel);

    if (!geminiServicePromise) {
      geminiServicePromise = import('../services/geminiService');
    }

    geminiServicePromise.then(({ setRuntimeApiKey, setRuntimeApiKeyForProvider, setRuntimeProvider, setRuntimeOllamaConfig, getProviderRuntimeStatus }) => {
      setRuntimeProvider(storedProvider);
      // Backward compatibility for older service versions.
      if (setRuntimeApiKeyForProvider) {
        setRuntimeApiKeyForProvider('google', storedGoogleKey);
        setRuntimeApiKeyForProvider('openai', storedOpenAIKey);
        setRuntimeApiKeyForProvider('anthropic', storedAnthropicKey);
      } else {
        setRuntimeApiKey(storedGoogleKey);
      }
      setRuntimeOllamaConfig({ baseUrl: storedOllamaBase, model: storedOllamaModel });
      setProviderStatus(getProviderRuntimeStatus() as ProviderStatus);
    });
  }, []);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      // Mark last assistant message as stopped to give user feedback
      setMessages(prev => prev.map(m => m.isThinking ? { ...m, isThinking: false, text: (m.text || '') + '\n[stopped]' } : m));
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

  const handleListen = () => {
    if (!recognitionRef.current || isListening) return;
    recognitionRef.current.start();
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

    // Build history for LLM including the fresh user message to avoid stale state reads
    const historyForLLM = [...messages, userMsg];

    setMessages(prev => [...prev, userMsg]);
    
    if (isManualSend) {
        setInput('');
        setImageAttachment(null);
    }
    
    setIsLoading(true);

    const botMsgId = generateId();
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
    const { streamChatResponse, setRuntimeProvider } = await geminiServicePromise;

    // ensure runtime provider matches selection
    await setRuntimeProvider(provider);

    await streamChatResponse({
      history: historyForLLM,
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

  // Update ref
  handleSendRef.current = handleSend;

  // Stable callback for ChatMessage
  const handleExplainCode = useCallback((code: string) => {
    handleSendRef.current(`Could you explain this code in detail as a teacher?\n\n${code}`, 'TEACHER');
  }, []);

  const resolvedProviderForFeatures: Exclude<ModelProvider, 'auto'> | null =
    provider === 'auto' ? (providerStatus?.resolved || null) : provider;
  const disableSearchToggle = resolvedProviderForFeatures ? resolvedProviderForFeatures !== 'google' : false;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Agent Selector */}
      <div className="p-3 border-b border-slate-100 bg-white z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {AGENTS_CONFIG.map((agent) => (
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

        {/* API Key entry */}
        <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <div className="flex gap-2 items-center">
            <label className="text-xs font-semibold text-slate-600">Provider:</label>
            <select
              value={provider}
              onChange={async (e) => {
                const next = e.target.value as ModelProvider;
                setProvider(next);
                localStorage.setItem(PROVIDER_STORAGE_KEY, next);
                const nextStoredKey = providerNeedsApiKey(next)
                  ? localStorage.getItem(getApiStorageKey(next)) || (next === 'google' ? localStorage.getItem(LEGACY_API_KEY_STORAGE_KEY) || '' : '')
                  : '';
                setApiKeyInput(nextStoredKey);
                setApiKeySaved(Boolean(nextStoredKey));
                if (!geminiServicePromise) geminiServicePromise = import('../services/geminiService');
                const { setRuntimeProvider, getProviderRuntimeStatus } = await geminiServicePromise;
                setRuntimeProvider(next);
                setProviderStatus(getProviderRuntimeStatus() as ProviderStatus);
              }}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
            >
              <option value="auto">Auto (Best Available)</option>
              <option value="google">Gemini (Jules)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="ollama">Ollama</option>
            </select>
            <span className="text-[10px] text-slate-400">Seamless provider routing across all AI features</span>
          </div>

          {providerNeedsApiKey(provider) && (
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => { setApiKeyInput(e.target.value); setApiKeySaved(false); }}
                placeholder={`Enter ${providerLabel[provider]} API key`}
                className="flex-1 bg-transparent outline-none text-sm text-slate-700"
              />
              <button
                onClick={async () => {
                  const trimmed = apiKeyInput.trim();
                  localStorage.setItem(getApiStorageKey(provider), trimmed);
                  if (provider === 'google') {
                    localStorage.setItem(LEGACY_API_KEY_STORAGE_KEY, trimmed);
                  }
                  setApiKeySaved(true);
                  if (!geminiServicePromise) {
                    geminiServicePromise = import('../services/geminiService');
                  }
                  const { setRuntimeApiKey, setRuntimeApiKeyForProvider, getProviderRuntimeStatus } = await geminiServicePromise;
                  if (setRuntimeApiKeyForProvider) {
                    setRuntimeApiKeyForProvider(provider, trimmed);
                  } else {
                    setRuntimeApiKey(trimmed);
                  }
                  setProviderStatus(getProviderRuntimeStatus() as ProviderStatus);
                }}
                disabled={!apiKeyInput.trim()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${apiKeyInput.trim() ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500' : 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'}`}
              >
                {apiKeySaved ? 'Saved' : 'Save Key'}
              </button>
            </div>
          )}

          {provider === 'auto' && (
            <div className="text-xs text-slate-500">
              Auto mode picks the first configured provider in this order: Gemini, OpenAI, Anthropic, then Ollama.
            </div>
          )}

          {provider === 'ollama' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:items-center">
              <div className="col-span-1 md:col-span-1 flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Base URL</label>
                <input
                  type="text"
                  value={ollamaBase}
                  onChange={(e) => setOllamaBase(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
              <div className="col-span-1 md:col-span-1 flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Model</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="qwen2.5:latest"
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
              <div className="col-span-1 flex items-center gap-2 justify-end">
                <button
                  onClick={async () => {
                    localStorage.setItem(OLLAMA_BASE_STORAGE_KEY, ollamaBase.trim());
                    localStorage.setItem(OLLAMA_MODEL_STORAGE_KEY, ollamaModel.trim());
                    if (!geminiServicePromise) geminiServicePromise = import('../services/geminiService');
                    const { setRuntimeOllamaConfig, getProviderRuntimeStatus } = await geminiServicePromise;
                    setRuntimeOllamaConfig({ baseUrl: ollamaBase.trim(), model: ollamaModel.trim() });
                    setProviderStatus(getProviderRuntimeStatus() as ProviderStatus);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500 transition-colors"
                >
                  Save Ollama
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Provider Health</span>
              <span className="text-xs font-bold text-indigo-700">
                Active: {providerStatus ? providerLabel[providerStatus.resolved] : 'Checking...'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {healthProviders.map((p) => {
                const isConfigured = providerStatus?.configured?.[p] ?? false;
                const source = p === 'ollama' ? null : providerStatus?.keySource?.[p];
                return (
                  <div
                    key={p}
                    className={`rounded-lg border px-2 py-1.5 ${isConfigured ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className={`text-[11px] font-bold ${isConfigured ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {providerLabel[p]}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isConfigured ? 'Configured' : 'Not configured'}
                      {source ? ` · ${source}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                    disabled={disableSearchToggle}
                    className={`p-1.5 rounded-lg border transition-colors ${useSearch ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-400'} ${disableSearchToggle ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Web Search (Gemini)"
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
                <button 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-1.5 rounded-lg border transition-colors ${voiceEnabled ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-400'}`}
                    title="Read replies aloud"
                >
                    <Volume className="w-4 h-4" />
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
             onExplain={handleExplainCode}
             useThinking={msg.isThinking ? useThinking : undefined}
             useSearch={msg.isThinking ? useSearch : undefined}
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

        {(isListening || voiceEnabled) && (
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            {isListening && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Listening...</span>}
            {voiceEnabled && speechSupported && <span className="px-2 py-1 rounded-full bg-slate-900 text-white">Voice replies on</span>}
            {!speechSupported && voiceEnabled && <span className="text-red-500">Speech output not supported in this browser.</span>}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${AGENTS_CONFIG.find(a => a.role === selectedAgent)?.label}...`}
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
               <button
                 onClick={handleListen}
                 disabled={!sttSupported || isListening || isUploading || isLoading}
                 className={`p-1.5 rounded-lg transition-colors ${isListening ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent'}`}
                 title={sttSupported ? 'Dictate with voice' : 'Speech recognition not supported'}
               >
                 <Mic className="w-4 h-4" />
               </button>
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
