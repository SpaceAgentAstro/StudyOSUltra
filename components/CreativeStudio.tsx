import React, { useEffect, useMemo, useRef, useState } from 'react';
import { generateImage, generateVideoClip, generateVideoPlan } from '../services/geminiService';
import { Loader, Mic, Play, StopCircle, Video, Image as ImageIcon } from './Icons';
import { VideoPlan } from '../types';

type Tab = 'images' | 'video' | 'voice';

const CreativeStudio: React.FC = () => {
  const [tab, setTab] = useState<Tab>('images');

  // Image state
  const [imagePrompt, setImagePrompt] = useState('ultra-detailed concept art of a student exploring a glowing knowledge nebula, cinematic lighting');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [imageSeed, setImageSeed] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Video state
  const [videoPrompt, setVideoPrompt] = useState('30s study motivation reel blending fast cuts of notes, whiteboards, and a calm narrator voice.');
  const [videoPlan, setVideoPlan] = useState<VideoPlan | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string>('');
  const [videoLoading, setVideoLoading] = useState(false);

  // Voice sandbox (browser TTS/STT)
  const [voiceText, setVoiceText] = useState('Focus for 25 minutes, then take a 5 minute break. Ready?');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSupported = typeof window !== 'undefined' && ('speechSynthesis' in window);
  const sttSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    // @ts-ignore
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!sttSupported) return;
    // @ts-ignore
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec: any = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setVoiceText((prev) => prev.trim() ? `${prev} ${transcript}` : transcript);
    };
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [sttSupported]);

  const handleGenerateImage = async () => {
    setImageLoading(true);
    setImageError(null);
    setImageSeed(null);
    try {
      const dataUrl = await generateImage(`${imagePrompt}\nStyle: ${imageStyle}`);
      setImageSeed(dataUrl);
    } catch (e: any) {
      setImageError(e?.message || 'Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleBuildVideoPlan = async () => {
    setVideoLoading(true);
    setVideoStatus('Drafting storyboard...');
    setVideoPlan(null);
    setVideoUrl(null);
    try {
      const plan = await generateVideoPlan(videoPrompt);
      setVideoPlan(plan);
      setVideoStatus('Storyboard ready');
    } catch (e: any) {
      setVideoStatus(e?.message || 'Could not build plan');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPlan) return;
    setVideoLoading(true);
    setVideoStatus('Rendering clip (beta)...');
    setVideoUrl(null);
    try {
      const url = await generateVideoClip(videoPlan);
      setVideoUrl(url || null);
      setVideoStatus(url ? 'Video ready' : 'Video queued, no URL returned');
    } catch (e: any) {
      setVideoStatus(e?.message || 'Video generation failed');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!speechSupported || !voiceText.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(voiceText);
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const handleListen = () => {
    if (!recognitionRef.current || isListening) return;
    recognitionRef.current.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const badge = (label: string) => (
    <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-900 text-white">
      {label}
    </span>
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {badge('Creative OS')}
          <span className="text-xs text-slate-500">Images · Video · Voice</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Creative Studio</h1>
        <p className="text-slate-600 max-w-3xl">
          Ship visuals, storyboards, and spoken feedback without leaving Study OS. Powered by your active AI provider with in-browser voice.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap gap-2">
        {[
          { id: 'images', label: 'Image Forge', icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'video', label: 'Video Lab', icon: <Video className="w-4 h-4" /> },
          { id: 'voice', label: 'Voice Booth', icon: <Mic className="w-4 h-4" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as Tab)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Image Tab */}
      {tab === 'images' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Prompt</h3>
              {badge('Imagen')}
            </div>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex gap-3">
              <label className="text-sm text-slate-600 font-medium flex-1">
                Style
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm"
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="watercolor">Watercolor</option>
                  <option value="isometric UI">Isometric UI</option>
                  <option value="notebook sketch">Notebook Sketch</option>
                  <option value="retro poster">Retro Poster</option>
                </select>
              </label>
            </div>
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading || !imagePrompt.trim()}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {imageLoading && <Loader className="w-4 h-4 animate-spin" />}
              {imageLoading ? 'Generating...' : 'Generate Image'}
            </button>
            {imageError && <p className="text-sm text-red-600">{imageError}</p>}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl min-h-[360px] flex items-center justify-center overflow-hidden relative">
            {imageSeed ? (
              <img src={imageSeed} alt="AI render" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto text-indigo-200" />
                <p className="text-sm text-indigo-100">Your renders land here.</p>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
              High-res JPG · ready to download
            </div>
          </div>
        </div>
      )}

      {/* Video Tab */}
      {tab === 'video' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Storyboard Prompt</h3>
              {badge('Veo 2')}
            </div>
            <textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleBuildVideoPlan}
                disabled={videoLoading || !videoPrompt.trim()}
                className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30 disabled:opacity-60"
              >
                {videoLoading ? 'Thinking...' : 'Draft Shot Plan'}
              </button>
              <button
                onClick={handleGenerateVideo}
                disabled={videoLoading || !videoPlan}
                className="px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/30 disabled:opacity-60"
              >
                {videoLoading ? 'Rendering...' : 'Render Short Clip'}
              </button>
              <span className="text-xs text-slate-500 self-center">{videoStatus}</span>
            </div>

            {videoPlan && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Shot List</h4>
                  <span className="text-xs text-slate-500">{videoPlan.durationSeconds}s total</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {videoPlan.shots.map((shot) => (
                    <div key={shot.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-[11px] font-bold uppercase text-indigo-600 mb-1">Scene {shot.id}</p>
                      <h5 className="font-semibold text-slate-900">{shot.title}</h5>
                      <p className="text-sm text-slate-600 mt-1">{shot.visual}</p>
                      <p className="text-xs text-slate-500 mt-2">VO: {shot.voiceover}</p>
                      <div className="text-[11px] font-semibold text-slate-400 mt-2">{shot.durationSeconds}s</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">
                  CTA: {videoPlan.callToAction}
                </div>
              </div>
            )}

            {videoUrl && (
              <div className="mt-4 bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">Clip ready</p>
                  <a href={videoUrl} target="_blank" rel="noreferrer" className="text-indigo-200 underline text-sm">
                    Open generated video
                  </a>
                </div>
                <Video className="w-6 h-6 text-indigo-200" />
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm text-indigo-200 uppercase font-bold mb-1">Recipe</p>
              <h3 className="text-xl font-bold">Learning Reel Blueprint</h3>
            </div>
            <ul className="space-y-2 text-sm text-indigo-100">
              <li>• Hook in 3 seconds, display goal metric.</li>
              <li>• Alternate text overlays with quick B-roll.</li>
              <li>• Keep captions high contrast and large.</li>
              <li>• End with a one-line CTA.</li>
            </ul>
            <div className="mt-auto text-xs text-indigo-200/80">
              Uses Gemini generateContent for the storyboard and Veo for rendering (beta). Works best with your Google API key saved in Chat.
            </div>
          </div>
        </div>
      )}

      {/* Voice Tab */}
      {tab === 'voice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Voice Script</h3>
              {badge('TTS')}
            </div>
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Write or dictate what you want to hear..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleSpeak}
                disabled={!speechSupported || !voiceText.trim()}
                className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition disabled:opacity-60 flex items-center gap-2"
              >
                {isSpeaking ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Speak
              </button>
              <button
                onClick={stopSpeaking}
                className="px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            </div>
            {!speechSupported && <p className="text-sm text-red-600">Speech synthesis not supported in this browser.</p>}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Dictate</h3>
              {badge('STT')}
            </div>
            <p className="text-indigo-100 text-sm">Turn your spoken ideas into prompts. We keep it on-device via Web Speech API.</p>
            <button
              onClick={handleListen}
              disabled={!sttSupported || isListening}
              className="px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition disabled:opacity-60 flex items-center gap-2"
            >
              {isListening ? <Loader className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {isListening ? 'Listening...' : 'Start Dictation'}
            </button>
            {!sttSupported && <p className="text-sm text-amber-200">Speech recognition not supported in this browser.</p>}
            <div className="bg-white/10 rounded-xl p-4 text-sm text-indigo-50 min-h-[140px] whitespace-pre-wrap">
              {voiceText || 'Transcript will appear here.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeStudio;
