import React, { useEffect, useMemo, useState } from 'react';
import { FileDocument, GameMode, GameSession, TopicMastery } from '../types';
import { generateGameQuestions, gradeOpenEndedAnswer } from '../services/geminiService';
import { BookOpen, CheckCircle, Trophy, X, Zap } from './Icons';
import { calculateAccuracy, generateId } from '../utils';

interface GameCenterProps {
  files: FileDocument[];
}

type LeaderboardPeriod = 'WEEKLY' | 'SEASONAL' | 'HOLIDAY';
type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legend';

interface CompetitivePlayer {
  id: string;
  name: string;
  isBot: boolean;
  league: LeagueTier;
  weeklyPoints: number;
  weeklyKey: string;
  seasonalPoints: number;
  seasonKey: string;
  holidayPoints: number;
  holidayKey: string;
  wins: number;
  games: number;
  streak: number;
  lastUpdated: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  isBot: boolean;
  league: LeagueTier;
  points: number;
  wins: number;
  games: number;
  streak: number;
  rank: number;
}

interface SessionRewardSummary {
  pointsEarned: number;
  accuracy: number;
  movementNotice: string | null;
}

const TOPICS_MOCK: TopicMastery[] = [
  { topicId: '1', title: 'Cell Biology', level: 'Secure', xp: 450 },
  { topicId: '2', title: 'Atomic Structure', level: 'Developing', xp: 120 },
  { topicId: '3', title: 'Energetics', level: 'Novice', xp: 0 },
];

const LEAGUES: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legend'];

const LEAGUE_COLORS: Record<LeagueTier, string> = {
  Bronze: 'bg-amber-100 text-amber-700 border-amber-200',
  Silver: 'bg-slate-100 text-slate-700 border-slate-200',
  Gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Platinum: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Diamond: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Legend: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
};

const BOT_NAMES = [
  'NovaScholar',
  'ExamRanger',
  'FlashCardFox',
  'QuizTitan',
  'SyllabusSniper',
  'CortexCruiser',
  'RecallRebel',
  'DeepFocusAI',
  'MindMapMonk',
  'PaperCrusher',
  'AstraLearner',
  'TopicalTactician',
  'ReasoningRay',
  'ProofPilot',
  'LogicLynx',
  'VaultVortex',
  'NeuralNinja',
  'RapidRevision',
  'ScholarStorm',
  'BloomBoss',
  'PeakPrepper',
  'CosmicCrammer',
  'TurboTutor',
  'RankRaptor',
  'HyperHabit',
  'MeritMachine',
  'ArcaneAnalyst',
  'SummitSolver',
  'CruxCommander',
  'SigmaStudy',
  'LumenLeague',
  'BrightBracket',
  'PulsePractice',
  'OrbitOutcome',
  'TierTracker',
  'RevisionRogue',
];

const PLAYER_ID_STORAGE_KEY = 'study_os_player_id_v1';
const LEADERBOARD_STORAGE_KEY = 'study_os_competitive_players_v1';

const seeded01 = (seed: string) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = (hash >>> 0) / 4294967295;
  return normalized;
};

const getISOWeekKey = (date: Date) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getSeasonMeta = (date: Date) => {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month >= 2 && month <= 4) {
    return { name: `Spring ${year}`, key: `${year}-SPRING` };
  }
  if (month >= 5 && month <= 7) {
    return { name: `Summer ${year}`, key: `${year}-SUMMER` };
  }
  if (month >= 8 && month <= 10) {
    return { name: `Autumn ${year}`, key: `${year}-AUTUMN` };
  }
  const winterYear = month === 11 ? year : year - 1;
  return { name: `Winter ${winterYear}-${winterYear + 1}`, key: `${winterYear}-WINTER` };
};

const getHolidayMeta = (date: Date) => {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month === 1) {
    return { name: `Love to Learn Cup ${year}`, key: `${year}-LOVE-TO-LEARN` };
  }
  if (month === 9) {
    return { name: `Spooky Study Sprint ${year}`, key: `${year}-SPOOKY-STUDY` };
  }
  if (month === 10 || month === 11) {
    return { name: `Winter Fest Challenge ${year}`, key: `${year}-WINTER-FEST` };
  }

  return { name: `Global Celebration Cup ${year}`, key: `${year}-GLOBAL-CELEBRATION` };
};

const readProfileName = () => {
  try {
    const raw = localStorage.getItem('study_os_profile');
    if (!raw) return 'You';
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === 'string' && parsed.name.trim()) {
      return parsed.name.trim();
    }
  } catch {
    // Ignore parse errors.
  }
  return 'You';
};

const createBlankPlayer = (
  id: string,
  name: string,
  weekKey: string,
  seasonKey: string,
  holidayKey: string,
): CompetitivePlayer => ({
  id,
  name,
  isBot: false,
  league: 'Bronze',
  weeklyPoints: 0,
  weeklyKey: weekKey,
  seasonalPoints: 0,
  seasonKey,
  holidayPoints: 0,
  holidayKey,
  wins: 0,
  games: 0,
  streak: 0,
  lastUpdated: Date.now(),
});

const normalizePlayerForBuckets = (
  player: CompetitivePlayer,
  weekKey: string,
  seasonKey: string,
  holidayKey: string,
): CompetitivePlayer => {
  const normalized = { ...player };

  if (normalized.weeklyKey !== weekKey) {
    normalized.weeklyKey = weekKey;
    normalized.weeklyPoints = 0;
  }

  if (normalized.seasonKey !== seasonKey) {
    normalized.seasonKey = seasonKey;
    normalized.seasonalPoints = 0;
  }

  if (normalized.holidayKey !== holidayKey) {
    normalized.holidayKey = holidayKey;
    normalized.holidayPoints = 0;
  }

  return normalized;
};

const loadPersistedPlayers = (): CompetitivePlayer[] => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((player): player is CompetitivePlayer => {
      return (
        player &&
        typeof player.id === 'string' &&
        typeof player.name === 'string' &&
        typeof player.league === 'string' &&
        typeof player.weeklyPoints === 'number' &&
        typeof player.seasonalPoints === 'number' &&
        typeof player.holidayPoints === 'number'
      );
    });
  } catch {
    return [];
  }
};

const persistPlayers = (players: CompetitivePlayer[]) => {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(players));
};

const generateBotPlayers = (
  period: LeaderboardPeriod,
  periodSeed: string,
  count: number,
): CompetitivePlayer[] => {
  const weeklyBase = [180, 260, 340, 440, 560, 680];
  const seasonalBase = [880, 1300, 1900, 2600, 3400, 4300];
  const holidayBase = [220, 320, 430, 560, 690, 820];

  const baseByPeriod = period === 'WEEKLY' ? weeklyBase : period === 'SEASONAL' ? seasonalBase : holidayBase;

  return Array.from({ length: count }, (_, index) => {
    const a = seeded01(`${periodSeed}-bot-a-${index}`);
    const b = seeded01(`${periodSeed}-bot-b-${index}`);
    const c = seeded01(`${periodSeed}-bot-c-${index}`);

    const leagueIndex = Math.min(LEAGUES.length - 1, Math.floor(Math.pow(a, 1.2) * LEAGUES.length));
    const league = LEAGUES[leagueIndex];
    const baseline = baseByPeriod[leagueIndex];
    const points = Math.max(0, Math.round(baseline + (b - 0.5) * baseline * 0.35));
    const games = 8 + Math.floor(c * 42);
    const wins = Math.min(games, Math.floor(games * (0.38 + b * 0.56)));
    const streak = Math.floor(a * 9);

    return {
      id: `bot-${index}`,
      name: BOT_NAMES[index % BOT_NAMES.length],
      isBot: true,
      league,
      weeklyPoints: period === 'WEEKLY' ? points : 0,
      weeklyKey: periodSeed,
      seasonalPoints: period === 'SEASONAL' ? points : 0,
      seasonKey: periodSeed,
      holidayPoints: period === 'HOLIDAY' ? points : 0,
      holidayKey: periodSeed,
      wins,
      games,
      streak,
      lastUpdated: Date.now(),
    };
  });
};

const pointsForPeriod = (player: CompetitivePlayer, period: LeaderboardPeriod) => {
  if (period === 'SEASONAL') return player.seasonalPoints;
  if (period === 'HOLIDAY') return player.holidayPoints;
  return player.weeklyPoints;
};

const buildLeaderboard = (
  period: LeaderboardPeriod,
  periodSeed: string,
  realPlayers: CompetitivePlayer[],
): LeaderboardEntry[] => {
  const minGlobalPlayers = 24;
  const botsNeeded = Math.max(0, minGlobalPlayers - realPlayers.length);
  const botPlayers = generateBotPlayers(period, periodSeed, botsNeeded);

  return [...realPlayers, ...botPlayers]
    .map((player) => ({
      id: player.id,
      name: player.name,
      isBot: player.isBot,
      league: player.league,
      points: pointsForPeriod(player, period),
      wins: player.wins,
      games: player.games,
      streak: player.streak,
      rank: 0,
    }))
    .sort((left, right) => {
      if (right.points !== left.points) return right.points - left.points;
      if (right.wins !== left.wins) return right.wins - left.wins;
      return right.streak - left.streak;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
};

const findUserLeagueRank = (entries: LeaderboardEntry[], userId: string) => {
  const user = entries.find((entry) => entry.id === userId);
  if (!user) return null;

  const sameLeague = entries.filter((entry) => entry.league === user.league);
  const rank = sameLeague.findIndex((entry) => entry.id === userId) + 1;

  return {
    league: user.league,
    rank,
    total: sameLeague.length,
  };
};

const evaluateLeagueMovement = (
  userLeague: LeagueTier,
  rank: number,
  total: number,
): { nextLeague: LeagueTier; notice: string | null } => {
  const currentIndex = LEAGUES.indexOf(userLeague);

  if (total >= 6 && rank <= 2 && currentIndex < LEAGUES.length - 1) {
    const nextLeague = LEAGUES[currentIndex + 1];
    return {
      nextLeague,
      notice: `Promotion unlocked: ${userLeague} -> ${nextLeague}. Keep finishing in the top 2 to climb.`,
    };
  }

  if (total >= 10 && rank === total && currentIndex > 0) {
    const nextLeague = LEAGUES[currentIndex - 1];
    return {
      nextLeague,
      notice: `Relegated to ${nextLeague}. Push back into the top tier next run.`,
    };
  }

  return { nextLeague: userLeague, notice: null };
};

const GameCenter: React.FC<GameCenterProps> = ({ files }) => {
  const [view, setView] = useState<'DASHBOARD' | 'PLAYING'>('DASHBOARD');
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openAnswer, setOpenAnswer] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState<{ score: number; maxScore: number; feedback: string } | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('You');
  const [players, setPlayers] = useState<CompetitivePlayer[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('WEEKLY');
  const [sessionReward, setSessionReward] = useState<SessionRewardSummary | null>(null);
  const [leagueNotice, setLeagueNotice] = useState<string | null>(null);

  const now = new Date();
  const weekKey = getISOWeekKey(now);
  const seasonMeta = getSeasonMeta(now);
  const holidayMeta = getHolidayMeta(now);

  useEffect(() => {
    const existingPlayerId = localStorage.getItem(PLAYER_ID_STORAGE_KEY) || generateId();
    localStorage.setItem(PLAYER_ID_STORAGE_KEY, existingPlayerId);
    setPlayerId(existingPlayerId);

    const displayName = readProfileName();
    setPlayerName(displayName);

    const loaded = loadPersistedPlayers()
      .filter((player) => !player.isBot)
      .map((player) => normalizePlayerForBuckets(player, weekKey, seasonMeta.key, holidayMeta.key));

    const existingUser = loaded.find((player) => player.id === existingPlayerId);

    const mergedPlayers = existingUser
      ? loaded.map((player) =>
          player.id === existingPlayerId
            ? {
                ...player,
                name: displayName,
              }
            : player,
        )
      : [...loaded, createBlankPlayer(existingPlayerId, displayName, weekKey, seasonMeta.key, holidayMeta.key)];

    setPlayers(mergedPlayers);
    persistPlayers(mergedPlayers);
  }, [holidayMeta.key, seasonMeta.key, weekKey]);

  const weeklyLeaderboard = useMemo(
    () => buildLeaderboard('WEEKLY', weekKey, players.map((player) => normalizePlayerForBuckets(player, weekKey, seasonMeta.key, holidayMeta.key))),
    [holidayMeta.key, players, seasonMeta.key, weekKey],
  );

  const seasonalLeaderboard = useMemo(
    () => buildLeaderboard('SEASONAL', seasonMeta.key, players.map((player) => normalizePlayerForBuckets(player, weekKey, seasonMeta.key, holidayMeta.key))),
    [holidayMeta.key, players, seasonMeta.key, weekKey],
  );

  const holidayLeaderboard = useMemo(
    () => buildLeaderboard('HOLIDAY', holidayMeta.key, players.map((player) => normalizePlayerForBuckets(player, weekKey, seasonMeta.key, holidayMeta.key))),
    [holidayMeta.key, players, seasonMeta.key, weekKey],
  );

  const activeLeaderboard =
    leaderboardPeriod === 'SEASONAL'
      ? seasonalLeaderboard
      : leaderboardPeriod === 'HOLIDAY'
        ? holidayLeaderboard
        : weeklyLeaderboard;

  const activeRealPlayers = activeLeaderboard.filter((entry) => !entry.isBot).length;
  const activeBotPlayers = activeLeaderboard.filter((entry) => entry.isBot).length;

  const userWeeklyLeagueRank = playerId ? findUserLeagueRank(weeklyLeaderboard, playerId) : null;
  const userWeeklyEntry = weeklyLeaderboard.find((entry) => entry.id === playerId) || null;
  const userSeasonalEntry = seasonalLeaderboard.find((entry) => entry.id === playerId) || null;

  const startGame = async (mode: GameMode, topic: string) => {
    setIsLoading(true);
    const questions = await generateGameQuestions(topic, mode, files, 5);

    setActiveSession({
      id: Date.now().toString(),
      mode,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      status: 'active',
    });

    setIsLoading(false);
    setView('PLAYING');
    setOpenAnswer('');
    setGradingFeedback(null);
    setSessionReward(null);
    setLeagueNotice(null);
  };

  const handleMCQSubmit = (optionIndex: number) => {
    if (!activeSession) return;

    const currentQ = activeSession.questions[activeSession.currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctOptionIndex;

    const newAnswers = [
      ...activeSession.answers,
      {
        questionId: currentQ.id,
        userAnswer: currentQ.options?.[optionIndex] || '',
        isCorrect,
      },
    ];

    setActiveSession({
      ...activeSession,
      score: isCorrect ? activeSession.score + 1 : activeSession.score,
      answers: newAnswers,
    });
  };

  const handleOpenSubmit = async () => {
    if (!activeSession) return;

    setIsGrading(true);
    const currentQ = activeSession.questions[activeSession.currentQuestionIndex];

    const result = await gradeOpenEndedAnswer(currentQ.text, openAnswer, currentQ.markScheme || [], files);

    setGradingFeedback(result);
    setIsGrading(false);

    const newAnswers = [
      ...activeSession.answers,
      {
        questionId: currentQ.id,
        userAnswer: openAnswer,
        isCorrect: result.score >= result.maxScore / 2,
        feedback: result.feedback,
      },
    ];

    setActiveSession({
      ...activeSession,
      score: activeSession.score + result.score,
      answers: newAnswers,
    });
  };

  const finalizeSession = (session: GameSession) => {
    const completedSession = { ...session, status: 'completed' as const };
    setActiveSession(completedSession);

    const answered = completedSession.answers.length;
    const correct = completedSession.answers.filter((answer) => answer.isCorrect).length;
    const accuracy = answered > 0 ? calculateAccuracy(correct, completedSession.questions.length) : 0;
    const modeBonus = completedSession.mode === 'EXPLAIN_TO_WIN' ? 20 : 12;
    const pointsEarned = Math.max(30, Math.round(accuracy * 0.9 + completedSession.questions.length * 7 + modeBonus));

    let movementNotice: string | null = null;

    setPlayers((previousPlayers) => {
      const normalizedPlayers = previousPlayers
        .map((player) => normalizePlayerForBuckets(player, weekKey, seasonMeta.key, holidayMeta.key))
        .filter((player) => !player.isBot);

      const userIndex = normalizedPlayers.findIndex((player) => player.id === playerId);
      const targetUser =
        userIndex >= 0
          ? { ...normalizedPlayers[userIndex] }
          : createBlankPlayer(playerId, playerName, weekKey, seasonMeta.key, holidayMeta.key);

      targetUser.name = playerName;
      targetUser.weeklyPoints += pointsEarned;
      targetUser.seasonalPoints += pointsEarned;
      targetUser.holidayPoints += Math.round(pointsEarned * 1.1);
      targetUser.games += 1;
      targetUser.wins += accuracy >= 60 ? 1 : 0;
      targetUser.streak = accuracy >= 70 ? targetUser.streak + 1 : 0;
      targetUser.lastUpdated = Date.now();

      const mergedPlayers =
        userIndex >= 0
          ? normalizedPlayers.map((player, index) => (index === userIndex ? targetUser : player))
          : [...normalizedPlayers, targetUser];

      const provisionalWeekly = buildLeaderboard('WEEKLY', weekKey, mergedPlayers);
      const leagueRank = findUserLeagueRank(provisionalWeekly, playerId);

      if (leagueRank) {
        const movement = evaluateLeagueMovement(targetUser.league, leagueRank.rank, leagueRank.total);
        if (movement.nextLeague !== targetUser.league) {
          targetUser.league = movement.nextLeague;
          movementNotice = movement.notice;
        }
      }

      const finalPlayers = mergedPlayers.map((player) => (player.id === targetUser.id ? targetUser : player));
      persistPlayers(finalPlayers);
      return finalPlayers;
    });

    setSessionReward({ pointsEarned, accuracy, movementNotice });
    setLeagueNotice(movementNotice);
  };

  const nextQuestion = () => {
    if (!activeSession) return;

    if (activeSession.currentQuestionIndex >= activeSession.questions.length - 1) {
      finalizeSession(activeSession);
    } else {
      setActiveSession({
        ...activeSession,
        currentQuestionIndex: activeSession.currentQuestionIndex + 1,
      });
      setOpenAnswer('');
      setGradingFeedback(null);
    }
  };

  if (view === 'DASHBOARD') {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Game Center
          </h1>
          <p className="text-slate-500 mt-2">Turn your notes into high-stakes exams. Master topics, climb leagues, and dominate global boards.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TOPICS_MOCK.map((topic) => (
            <div key={topic.topicId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-800">{topic.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      topic.level === 'Secure'
                        ? 'bg-green-100 text-green-700'
                        : topic.level === 'Developing'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {topic.level}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mb-4">{topic.xp} XP</div>

                <div className="space-y-2">
                  <button
                    onClick={() => startGame('MCQ_ARENA', topic.title)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Smart MCQ
                  </button>
                  <button
                    onClick={() => startGame('EXPLAIN_TO_WIN', topic.title)}
                    className="w-full py-2 bg-white border-2 border-slate-100 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" /> Explain to Win
                  </button>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
            </div>
          ))}
        </div>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Global League Leaderboards</h2>
              <p className="text-sm text-slate-500 mt-1">Weekly promotion ladder, seasonal race, and special holiday cup.</p>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setLeaderboardPeriod('WEEKLY')}
                className={`px-3 py-2 rounded-lg text-xs font-bold ${
                  leaderboardPeriod === 'WEEKLY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setLeaderboardPeriod('SEASONAL')}
                className={`px-3 py-2 rounded-lg text-xs font-bold ${
                  leaderboardPeriod === 'SEASONAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Seasonal ({seasonMeta.name})
              </button>
              <button
                onClick={() => setLeaderboardPeriod('HOLIDAY')}
                className={`px-3 py-2 rounded-lg text-xs font-bold ${
                  leaderboardPeriod === 'HOLIDAY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Holiday ({holidayMeta.name})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-xs uppercase tracking-wider text-slate-500">Your League</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full border text-xs font-bold ${LEAGUE_COLORS[userWeeklyEntry?.league || 'Bronze']}`}>
                  {userWeeklyEntry?.league || 'Bronze'}
                </span>
                <span className="text-sm font-semibold text-slate-700">{playerName}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-xs uppercase tracking-wider text-slate-500">Weekly Rank</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {userWeeklyEntry ? `#${userWeeklyEntry.rank}` : '--'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-xs uppercase tracking-wider text-slate-500">Seasonal Rank</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {userSeasonalEntry ? `#${userSeasonalEntry.rank}` : '--'}
              </p>
            </div>
          </div>

          {activeRealPlayers < 6 && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
              Real global competitors are sparse right now, so {activeBotPlayers} bot challengers were auto-filled to keep promotion leagues active.
            </div>
          )}

          {leagueNotice && (
            <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 px-4 py-3 text-sm font-medium">
              {leagueNotice}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-2">Rank</th>
                  <th className="py-2 pr-2">Player</th>
                  <th className="py-2 pr-2">League</th>
                  <th className="py-2 pr-2">Points</th>
                  <th className="py-2 pr-2">Win Rate</th>
                  <th className="py-2">Streak</th>
                </tr>
              </thead>
              <tbody>
                {activeLeaderboard.slice(0, 12).map((entry) => {
                  const isUser = entry.id === playerId;
                  const winRate = entry.games > 0 ? Math.round((entry.wins / entry.games) * 100) : 0;

                  return (
                    <tr key={entry.id} className={`border-b border-slate-100 ${isUser ? 'bg-indigo-50' : ''}`}>
                      <td className="py-3 pr-2 font-bold text-slate-700">#{entry.rank}</td>
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{entry.name}</span>
                          {entry.isBot && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">BOT</span>}
                          {isUser && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">YOU</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-1 rounded-full border text-xs font-bold ${LEAGUE_COLORS[entry.league]}`}>{entry.league}</span>
                      </td>
                      <td className="py-3 pr-2 font-bold text-slate-900">{entry.points}</td>
                      <td className="py-3 pr-2 text-slate-600">{winRate}%</td>
                      <td className="py-3 text-slate-600">{entry.streak}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>Promotion rule: Top 2 in your weekly league with at least 6 players.</span>
            <span>Relegation rule: Last place in league with at least 10 players.</span>
            <span>League movement is evaluated after each completed session.</span>
          </div>

          {userWeeklyLeagueRank && (
            <div className="mt-3 text-xs text-indigo-600 font-semibold">
              You are #{userWeeklyLeagueRank.rank} / {userWeeklyLeagueRank.total} in {userWeeklyLeagueRank.league} this week.
            </div>
          )}
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-slate-800">Constructing Exam...</h2>
        <p className="text-slate-500">Analyzing {files.length} documents for syllabus alignment.</p>
      </div>
    );
  }

  if (!activeSession) return null;

  if (activeSession.questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <X className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Questions Available</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          We couldn't generate questions from the current sources. Try adding more content or choosing a different topic.
        </p>
        <button
          onClick={() => setView('DASHBOARD')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (activeSession.status === 'completed') {
    const accuracy = sessionReward?.accuracy ?? calculateAccuracy(activeSession.score, activeSession.questions.length);

    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
          <Trophy className="w-12 h-12 text-yellow-600" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-2">Session Complete!</h2>
        <p className="text-slate-500 mb-8 text-lg">
          You scored {activeSession.score} and earned {sessionReward?.pointsEarned ?? 0} leaderboard points.
        </p>

        <div className="w-full max-w-lg bg-white p-6 rounded-2xl border border-slate-200 mb-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-700">Accuracy</span>
              <span className="font-bold text-indigo-600">{accuracy}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
            </div>
          </div>

          {sessionReward?.movementNotice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 font-medium">
              {sessionReward.movementNotice}
            </div>
          )}

          {!sessionReward?.movementNotice && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Keep pushing for top 2 in your weekly league to secure promotion.
            </div>
          )}
        </div>

        <button
          onClick={() => setView('DASHBOARD')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
        >
          Return to Game Center
        </button>
      </div>
    );
  }

  const currentQ = activeSession.questions[activeSession.currentQuestionIndex];
  const hasAnswered = activeSession.answers.some((answer) => answer.questionId === currentQ.id);
  const answerState = activeSession.answers.find((answer) => answer.questionId === currentQ.id);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setView('DASHBOARD')} className="text-slate-400 hover:text-slate-600 font-medium">
          Exit Game
        </button>
        <div className="flex gap-2">
          {activeSession.questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx === activeSession.currentQuestionIndex
                  ? 'bg-indigo-600 scale-125'
                  : idx < activeSession.currentQuestionIndex
                    ? 'bg-indigo-200'
                    : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="font-bold text-indigo-600">Score: {activeSession.score}</div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-indigo-900/5 border border-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {currentQ.difficulty} Difficulty
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-relaxed">{currentQ.text}</h2>

            {activeSession.mode === 'MCQ_ARENA' && currentQ.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((option, idx) => {
                  let btnClass = 'p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 hover:scale-[1.02] ';

                  if (hasAnswered) {
                    if (idx === currentQ.correctOptionIndex) btnClass += 'bg-green-50 border-green-500 text-green-700 ';
                    else if (answerState?.userAnswer === option) btnClass += 'bg-red-50 border-red-500 text-red-700 ';
                    else btnClass += 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 ';
                  } else {
                    btnClass += 'bg-white border-slate-200 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer ';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleMCQSubmit(idx)}
                      className={btnClass}
                    >
                      <span className="mr-2 opacity-50">{String.fromCharCode(65 + idx)}.</span> {option}
                    </button>
                  );
                })}
              </div>
            )}

            {activeSession.mode === 'EXPLAIN_TO_WIN' && (
              <div className="space-y-4">
                {!hasAnswered ? (
                  <>
                    <textarea
                      value={openAnswer}
                      onChange={(event) => setOpenAnswer(event.target.value)}
                      placeholder="Type your explanation here. Be specific and use keywords..."
                      className="w-full h-40 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                    />
                    <button
                      onClick={handleOpenSubmit}
                      disabled={!openAnswer.trim() || isGrading}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isGrading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          Grading with Mark Scheme...
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </button>
                  </>
                ) : (
                  <div className={`p-6 rounded-xl border ${gradingFeedback && gradingFeedback.score > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900">Examiner Feedback</span>
                      <span className="font-bold text-lg">
                        {gradingFeedback?.score} / {gradingFeedback?.maxScore} Marks
                      </span>
                    </div>
                    <p className="text-slate-700 mb-4">{gradingFeedback?.feedback}</p>
                    <div className="text-sm font-semibold text-slate-900">Your Answer:</div>
                    <p className="text-slate-600 text-sm italic">"{answerState?.userAnswer}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {hasAnswered && (
          <div className="mt-6 animate-slideUp">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  Galactic Maestro Logic
                </div>
                <p className="text-slate-100 leading-relaxed">{currentQ.explanation}</p>
                <div className="mt-2 text-xs text-slate-500 font-mono">Source: {currentQ.sourceCitation}</div>
              </div>
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform whitespace-nowrap"
              >
                {activeSession.currentQuestionIndex >= activeSession.questions.length - 1 ? 'Finish Game' : 'Next Question'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCenter;
