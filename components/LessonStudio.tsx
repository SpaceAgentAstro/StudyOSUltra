import React, { useMemo, useState } from 'react';
import { FileDocument, LessonSuite } from '../types';
import {
  buildPodcastTranscript,
  calculateLessonScore,
  generateImage,
  generateLessonSuite,
} from '../services/geminiService';
import { BookOpen, Brain, CheckCircle, Image as ImageIcon, Loader, Mic, Play, StopCircle, Video } from './Icons';

type LessonTab = 'report' | 'flashcards' | 'quiz' | 'slides' | 'infographic' | 'media';

interface LessonStudioProps {
  files: FileDocument[];
}

const LessonStudio: React.FC<LessonStudioProps> = ({ files }) => {
  const [topic, setTopic] = useState('Cell Biology: Membrane Transport');
  const [activeTab, setActiveTab] = useState<LessonTab>('report');
  const [suite, setSuite] = useState<LessonSuite | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImagePrompt, setSelectedImagePrompt] = useState('');

  const [isSpeaking, setIsSpeaking] = useState(false);

  const score = useMemo(() => {
    if (!suite) return null;
    return calculateLessonScore(suite, quizAnswers);
  }, [suite, quizAnswers]);

  const handleGenerateLesson = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setImageUrl(null);
    setImageError(null);
    setQuizAnswers({});

    try {
      const result = await generateLessonSuite(topic, files);
      setSuite(result);
      setSelectedImagePrompt(result.imagePrompts[0] || 'Educational infographic');
      setActiveTab('report');
    } catch (error: any) {
      setGenerationError(error?.message || 'Failed to generate lesson suite.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImagePrompt.trim()) return;

    setImageLoading(true);
    setImageError(null);
    setImageUrl(null);

    try {
      const result = await generateImage(selectedImagePrompt);
      setImageUrl(result);
    } catch (error: any) {
      setImageError(error?.message || 'Failed to generate image.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!suite || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const script = `${suite.podcast.intro}\n\n${buildPodcastTranscript(suite.podcast.segments)}\n\n${suite.podcast.outro}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <header className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-3">
              <Brain className="w-4 h-4" />
              AI Intelligence Pipeline
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Lesson Studio</h1>
            <p className="text-slate-600 mt-2 max-w-3xl">
              Generate source-grounded reports, flashcards, quizzes, slide decks, infographics, audio podcast scripts, video storyboards, and images from your uploaded learning materials.
            </p>
          </div>

          {score && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-wider text-slate-400">AI Mastery Score</p>
              <p className="text-4xl font-bold mt-1">{score.overall}</p>
              <p className="text-xs text-slate-300 mt-2">{score.recommendation}</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
          <label htmlFor="lesson-topic" className="sr-only">Lesson Topic</label>
          <input
            id="lesson-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Enter lesson topic"
            disabled={isGenerating}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleGenerateLesson}
            disabled={isGenerating || !topic.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating && <Loader className="w-4 h-4 animate-spin" />}
            {isGenerating ? 'Generating Lesson...' : 'Generate from Sources'}
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {files.filter((file) => file.status === 'ready').length} ready sources available
        </div>

        {generationError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{generationError}</div>
        )}
      </header>

      {!suite ? (
        <div className="bg-slate-100 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          Generate a lesson to unlock report, flashcards, quiz, slides, infographic, and media outputs.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2">
            {[
              ['report', 'Report'],
              ['flashcards', 'Flashcards'],
              ['quiz', 'Quiz + Score'],
              ['slides', 'Slide Deck'],
              ['infographic', 'Infographic'],
              ['media', 'Audio/Video/Image'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as LessonTab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'report' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Executive Summary</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">{suite.report.executiveSummary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Key Takeaways</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {suite.report.keyTakeaways.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h4 className="font-bold text-amber-900">Common Misconceptions</h4>
                  <ul className="mt-2 space-y-2 text-sm text-amber-800">
                    {suite.report.misconceptions.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <h4 className="font-bold text-emerald-900">Practice Plan</h4>
                  <ul className="mt-2 space-y-2 text-sm text-emerald-800">
                    {suite.report.practicePlan.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4">
                  <h4 className="font-bold">Source Coverage Map</h4>
                  <ul className="mt-2 space-y-2 text-xs">
                    {suite.sourceMap.map((source, index) => (
                      <li key={index}>
                        <span className="font-semibold">{source.sourceName}</span>: {source.coverageNote}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {suite.flashcards.map((card) => (
                <details
                  key={card.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 group open:bg-indigo-50 open:border-indigo-200"
                >
                  <summary className="cursor-pointer list-none">
                    <p className="font-bold text-slate-900">{card.front}</p>
                    <p className="text-xs text-slate-500 mt-2">Tap to reveal</p>
                  </summary>
                  <p className="mt-4 text-sm text-slate-700 leading-relaxed">{card.back}</p>
                  <p className="mt-3 text-[11px] text-indigo-600 font-semibold">Source: {card.sourceCitation}</p>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {score && (
                  <>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-500">Quiz Performance</p>
                      <p className="text-2xl font-bold text-indigo-600">{score.breakdown.quizPerformance}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-500">Source Grounding</p>
                      <p className="text-2xl font-bold text-emerald-600">{score.breakdown.sourceGrounding}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-500">Retention Readiness</p>
                      <p className="text-2xl font-bold text-amber-600">{score.breakdown.retentionReadiness}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-500">Multimodal Coverage</p>
                      <p className="text-2xl font-bold text-fuchsia-600">{score.breakdown.multimodalCoverage}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                {suite.quiz.map((question, index) => {
                  const selected = quizAnswers[question.id];
                  const isCorrect = selected === question.correctOptionIndex;

                  return (
                    <div key={question.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-900">
                          {index + 1}. {question.prompt}
                        </h3>
                        <span className="text-xs font-bold uppercase rounded-full px-2 py-1 bg-slate-100 text-slate-600">
                          {question.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() =>
                              setQuizAnswers((previous) => ({
                                ...previous,
                                [question.id]: optionIndex,
                              }))
                            }
                            className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                              selected === optionIndex
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </button>
                        ))}
                      </div>

                      {selected !== undefined && (
                        <div
                          className={`mt-4 p-3 rounded-xl text-sm ${
                            isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          <p className="font-semibold">{isCorrect ? 'Correct.' : 'Not quite.'}</p>
                          <p className="mt-1">{question.explanation}</p>
                          <p className="mt-1 text-xs">Source: {question.sourceCitation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'slides' && (
            <div className="space-y-4">
              {suite.slideDeck.map((slide, index) => (
                <div key={slide.id} className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Slide {index + 1}: {slide.title}
                    </h3>
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {slide.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>• {bullet}</li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                    <strong>Speaker Notes:</strong> {slide.speakerNotes}
                  </div>
                  <p className="mt-2 text-xs text-indigo-600 font-semibold">Source: {slide.sourceCitation}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'infographic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {suite.infographic.map((panel) => (
                <div key={panel.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-900">{panel.title}</h3>
                  <p className="mt-2 text-2xl font-extrabold text-indigo-600">{panel.stat}</p>
                  <p className="mt-3 text-sm text-slate-700">{panel.explanation}</p>
                  <p className="mt-3 text-xs text-slate-500">Visual: {panel.visualHint}</p>
                  <p className="mt-1 text-xs text-indigo-600 font-semibold">Source: {panel.sourceCitation}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                      AI Image Prompt
                    </h3>
                  </div>
                  <select
                    value={selectedImagePrompt}
                    onChange={(event) => setSelectedImagePrompt(event.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  >
                    {suite.imagePrompts.map((prompt, index) => (
                      <option key={index} value={prompt}>
                        {prompt}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenerateImage}
                    disabled={imageLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-60 flex items-center gap-2"
                  >
                    {imageLoading && <Loader className="w-4 h-4 animate-spin" />}
                    {imageLoading ? 'Generating...' : 'Generate Image'}
                  </button>
                  {imageError && <p className="text-sm text-red-600">{imageError}</p>}
                  {imageUrl && <img src={imageUrl} alt="Generated learning visual" className="w-full rounded-xl border border-slate-200" />}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-emerald-600" />
                    Audio + Podcast
                  </h3>
                  <p className="text-sm text-slate-600">{suite.audioNarrationScript}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSpeak}
                      disabled={isSpeaking}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 disabled:opacity-60 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Play Podcast
                    </button>
                    <button
                      onClick={stopSpeak}
                      disabled={!isSpeaking}
                      className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 disabled:opacity-60 flex items-center gap-2"
                    >
                      <StopCircle className="w-4 h-4" /> Stop
                    </button>
                  </div>
                  <div className="space-y-2">
                    {suite.podcast.segments.map((segment) => (
                      <div key={segment.id} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700">
                        <p className="font-semibold">{segment.title}</p>
                        <p className="mt-1">Host: {segment.hostLine}</p>
                        <p>Expert: {segment.expertLine}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-fuchsia-600" />
                  Video Storyboard
                </h3>
                <p className="text-sm text-slate-600">{suite.video.title}</p>
                <p className="text-xs text-slate-500">Duration: {suite.video.durationSeconds}s</p>
                <div className="space-y-3">
                  {suite.video.shots.map((shot) => (
                    <div key={shot.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="text-xs font-bold uppercase text-fuchsia-600">Scene {shot.id}</p>
                      <p className="font-semibold text-slate-900">{shot.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{shot.visual}</p>
                      <p className="text-xs text-slate-500 mt-2">VO: {shot.voiceover}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-fuchsia-50 text-fuchsia-800 rounded-xl text-sm font-semibold">
                  CTA: {suite.video.callToAction}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonStudio;
