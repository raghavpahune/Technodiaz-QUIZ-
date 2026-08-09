import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { syncSend, syncListen } from '../utils/sync';

// Import question databases
import moviesQs from '../data/movies';
import gkQs from '../data/gk';
import historyQs from '../data/history';
import riddlesQs from '../data/riddles';
import techQs from '../data/tech';

const QuizContext = createContext();

// ponytail: detect mode for cross-window/cross-device sync
const urlParams = new URLSearchParams(window.location.search);
const APP_MODE = urlParams.get('mode') || 'quizmaster'; // 'quizmaster' | 'projector' | 'buzzer'
const IS_RECEIVER = APP_MODE !== 'quizmaster'; // projector and buzzer receive state, don't broadcast
const BUZZER_TEAM_IDX = APP_MODE === 'buzzer' ? parseInt(urlParams.get('team') || '0', 10) : null;

export const roundConfig = {
  movies: { name: 'Movies & Anime', db: moviesQs, palette: 'red', icon: '🎬' },
  gk: { name: 'General Knowledge', db: gkQs, palette: 'teal', icon: '🌍' },
  history: { name: 'History & Monuments', db: historyQs, palette: 'bronze', icon: '🏛️' },
  riddles: { name: 'Riddles', db: riddlesQs, palette: 'purple', icon: '🧩' },
  tech: { name: 'Tech Trivia', db: techQs, palette: 'blue', icon: '💻' }
};

// ponytail: defaults — adjust here if requirements change
const DEFAULT_TEAM_COUNT = 4;
const DEFAULT_TIMER_DURATION = 30;
const POINTS_PER_CORRECT = 10;

/**
 * Quiz phases (state machine):
 *   IDLE              — no question active (between questions, setup, etc.)
 *   QUESTION_ACTIVE   — question shown, timer running, waiting for buzzer
 *   TEAM_ANSWERING    — a team buzzed, quizmaster decides correct/incorrect
 *   TEAM_INCORRECT    — brief display: team was wrong, about to pass
 *   TEAM_CORRECT      — quizmaster pressed CORRECT → triggers ANSWER_REVEALED
 *   ANSWER_REVEALED   — correct answer + explanation visible on projector
 *   TIME_UP           — timer expired with no correct answer
 */

export function QuizProvider({ children }) {
  // ── Shuffle helpers (unchanged) ──
  const shuffleQuestion = (q) => {
    const correctText = q.options[q.correctAnswer];
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    return { ...q, options: shuffledOptions, correctAnswer: shuffledOptions.indexOf(correctText) };
  };

  const shuffleDatabase = (db) => db.map(q => shuffleQuestion(q));

  // ── Existing state (preserved) ──
  const [shuffledDbs, setShuffledDbs] = useState({
    movies: shuffleDatabase(moviesQs),
    gk: shuffleDatabase(gkQs),
    history: shuffleDatabase(historyQs),
    riddles: shuffleDatabase(riddlesQs),
    tech: shuffleDatabase(techQs)
  });

  const [activePage, setActivePage] = useState('landing');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeRound, setActiveRound] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ── Team state ──
  const [teams, setTeams] = useState(() =>
    Array.from({ length: DEFAULT_TEAM_COUNT }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }))
  );
  const [teamSetupDone, setTeamSetupDone] = useState(false);

  // ── Round-specific stats (now per-team) ──
  const makeEmptyRoundState = () => ({
    movies: { completed: false, teamScores: {}, attempted: 0, answers: [] },
    gk: { completed: false, teamScores: {}, attempted: 0, answers: [] },
    history: { completed: false, teamScores: {}, attempted: 0, answers: [] },
    riddles: { completed: false, teamScores: {}, attempted: 0, answers: [] },
    tech: { completed: false, teamScores: {}, attempted: 0, answers: [] }
  });
  const [roundsState, setRoundsState] = useState(makeEmptyRoundState);

  // ── Quiz phase state machine ──
  const [quizPhase, setQuizPhase] = useState('IDLE');
  const [buzzerQueue, setBuzzerQueue] = useState([]);         // team indices in buzz order
  const [currentBuzzerIdx, setCurrentBuzzerIdx] = useState(0); // index into buzzerQueue
  const [incorrectTeams, setIncorrectTeams] = useState([]);    // teams marked wrong this question

  // ── Timer ──
  const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER_DURATION);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // ── Connection tracking ──
  const [connectedTeams, setConnectedTeams] = useState({});

  // ── LAN address for buzzer URLs (sent by server in dev mode) ──
  const [lanAddress, setLanAddress] = useState(null);

  // ── Projector window ref ──
  const projectorRef = useRef(null);

  // ── Sync: all clients listen for server-info + connection-status messages ──
  useEffect(() => {
    return syncListen((msg) => {
      if (msg.type === 'connection-status') {
        setConnectedTeams(msg.teams || {});
      }
      if (msg.type === 'server-info' && msg.lanIp) {
        const proto = window.location.protocol;
        setLanAddress(`${proto}//${msg.lanIp}:${msg.port}`);
      }
    });
  }, []);

  // ── Sync: receivers (projector/buzzer) listen for state updates ──
  useEffect(() => {
    if (!IS_RECEIVER) return;
    return syncListen((s) => {
      if (s.type !== 'quiz-state') return;
      setActivePage(s.activePage);
      setActiveRound(s.activeRound);
      setCurrentQuestionIndex(s.currentQuestionIndex);
      setTeams(s.teams);
      setTeamSetupDone(s.teamSetupDone);
      setRoundsState(s.roundsState);
      setQuizPhase(s.quizPhase);
      setBuzzerQueue(s.buzzerQueue);
      setCurrentBuzzerIdx(s.currentBuzzerIdx);
      setIncorrectTeams(s.incorrectTeams);
      setTimerSeconds(s.timerSeconds);
      setTimerRunning(false); // receivers don't run their own timer
      if (s.shuffledDbs) setShuffledDbs(s.shuffledDbs);
    });
  }, []);

  // ── Sync: quizmaster listens for buzz events from remote devices ──
  useEffect(() => {
    if (IS_RECEIVER) return;
    return syncListen((msg) => {
      if (msg.type === 'buzz' && typeof msg.teamIdx === 'number') {
        // Trigger buzz as if pressed locally
        teamBuzzRef.current?.(msg.teamIdx);
      }
    });
  }, []);
  const teamBuzzRef = useRef(null);

  // ── Sync: quizmaster broadcasts state on changes ──
  const lastBroadcastRef = useRef('');
  useEffect(() => {
    if (IS_RECEIVER) return;
    const snapshot = {
      type: 'quiz-state',
      activePage, activeRound, currentQuestionIndex,
      teams, teamSetupDone, roundsState,
      quizPhase, buzzerQueue, currentBuzzerIdx,
      incorrectTeams, timerSeconds,
      shuffledDbs
    };
    const key = JSON.stringify([activePage, activeRound, currentQuestionIndex, quizPhase, buzzerQueue, currentBuzzerIdx, incorrectTeams, timerSeconds, teams]);
    if (key !== lastBroadcastRef.current) {
      lastBroadcastRef.current = key;
      syncSend(snapshot);
    }
  });

  // Sound helper
  const triggerSound = useCallback((type) => {
    playSound(type, soundEnabled);
  }, [soundEnabled]);

  // ── Timer logic ──
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            // Time's up — only if still in QUESTION_ACTIVE (no one buzzed or still waiting)
            setQuizPhase(phase => {
              if (phase === 'QUESTION_ACTIVE') {
                playSound('timeup', soundEnabled);
                return 'TIME_UP';
              }
              return phase;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timerSeconds, soundEnabled]);

  // ── Navigation (preserved) ──
  const startQuiz = () => {
    triggerSound('click');
    setActivePage('round-select');
  };

  const toggleSound = () => {
    playSound('click', !soundEnabled);
    setSoundEnabled(prev => !prev);
  };

  const selectRound = (roundKey) => {
    triggerSound('transition');
    setActiveRound(roundKey);
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setActivePage('quiz');
  };

  // ── Team setup ──
  const updateTeamName = (idx, name) => {
    setTeams(prev => prev.map((t, i) => i === idx ? { ...t, name } : t));
  };

  const addTeam = () => {
    setTeams(prev => [...prev, { name: `Team ${prev.length + 1}`, score: 0 }]);
  };

  const removeTeam = (idx) => {
    if (teams.length <= 2) return; // ponytail: min 2 teams
    setTeams(prev => prev.filter((_, i) => i !== idx));
  };

  const confirmTeamSetup = () => {
    setTeamSetupDone(true);
    triggerSound('click');
  };

  // ── Reset question state (between questions) ──
  const resetQuestionState = () => {
    setQuizPhase('IDLE');
    setBuzzerQueue([]);
    setCurrentBuzzerIdx(0);
    setIncorrectTeams([]);
    setTimerSeconds(timerDuration);
    setTimerRunning(false);
    clearInterval(timerRef.current);
  };

  // ── Start question (quizmaster triggers this) ──
  const startQuestion = () => {
    resetQuestionState();
    setQuizPhase('QUESTION_ACTIVE');
    setTimerSeconds(timerDuration);
    setTimerRunning(true);
    triggerSound('click');
  };

  // ── Buzzer ──
  const teamBuzz = (teamIdx) => {
    // Only allow during QUESTION_ACTIVE, and only if team hasn't already buzzed
    if (quizPhase !== 'QUESTION_ACTIVE') return;
    setBuzzerQueue(prev => {
      if (prev.includes(teamIdx)) return prev;
      const next = [...prev, teamIdx];
      // First buzz → pause timer, move to TEAM_ANSWERING
      if (next.length === 1) {
        setTimerRunning(false);
        setQuizPhase('TEAM_ANSWERING');
        playSound('buzzer', soundEnabled);
      }
      return next;
    });
  };
  teamBuzzRef.current = teamBuzz;

  // ── Current answering team ──
  const currentTeamIdx = buzzerQueue[currentBuzzerIdx] ?? null;

  // ── Quizmaster: CORRECT ──
  const markCorrect = () => {
    if (quizPhase !== 'TEAM_ANSWERING' || currentTeamIdx === null) return;

    triggerSound('correct');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });

    // Award points to team
    setTeams(prev => prev.map((t, i) =>
      i === currentTeamIdx ? { ...t, score: t.score + POINTS_PER_CORRECT } : t
    ));

    // Record in round state
    const questions = shuffledDbs[activeRound];
    const currentQ = questions[currentQuestionIndex];
    setRoundsState(prev => {
      const round = prev[activeRound];
      const teamScores = { ...round.teamScores };
      teamScores[currentTeamIdx] = (teamScores[currentTeamIdx] || 0) + POINTS_PER_CORRECT;
      return {
        ...prev,
        [activeRound]: {
          ...round,
          teamScores,
          attempted: round.attempted + 1,
          answers: [...round.answers, { qId: currentQ.id, correctTeam: currentTeamIdx }]
        }
      };
    });

    setQuizPhase('ANSWER_REVEALED');
  };

  // ── Quizmaster: INCORRECT ──
  const markIncorrect = () => {
    if (quizPhase !== 'TEAM_ANSWERING' || currentTeamIdx === null) return;

    triggerSound('incorrect');
    setIncorrectTeams(prev => [...prev, currentTeamIdx]);

    // Check if there's another team in the buzzer queue
    const nextIdx = currentBuzzerIdx + 1;
    if (nextIdx < buzzerQueue.length) {
      // Pass to next buzzed team
      setQuizPhase('TEAM_INCORRECT');
      setTimeout(() => {
        setCurrentBuzzerIdx(nextIdx);
        setQuizPhase('TEAM_ANSWERING');
      }, 1500);
    } else {
      // No more buzzed teams — go back to QUESTION_ACTIVE so others can buzz
      // But if ALL teams have already buzzed, go to TIME_UP-like state
      if (buzzerQueue.length >= teams.length) {
        // Everyone buzzed and failed
        setQuizPhase('TEAM_INCORRECT');
        setTimeout(() => {
          setQuizPhase('TIME_UP');
        }, 1500);
      } else {
        // Resume timer for remaining teams
        setQuizPhase('TEAM_INCORRECT');
        setTimeout(() => {
          setQuizPhase('QUESTION_ACTIVE');
          setTimerRunning(true);
        }, 1500);
      }
    }
  };

  // ── Quizmaster: REVEAL ANSWER (manual, for when no team got it) ──
  const revealAnswer = () => {
    if (quizPhase === 'ANSWER_REVEALED') return;
    triggerSound('reveal');
    setQuizPhase('ANSWER_REVEALED');
  };

  // ── Next question ──
  const nextQuestion = () => {
    triggerSound('click');
    const questions = shuffledDbs[activeRound];
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      // Round complete
      setRoundsState(prev => ({
        ...prev,
        [activeRound]: { ...prev[activeRound], completed: true }
      }));
      triggerSound('complete');
      resetQuestionState();
      setActivePage('round-complete');
    }
  };

  // ── Projector window ──
  const openProjector = () => {
    const url = `${window.location.origin}${window.location.pathname}?mode=projector`;
    projectorRef.current = window.open(url, 'projector', 'popup=true,width=1280,height=720');
  };

  // ── Replay / navigation (preserved, adapted for teams) ──
  const playRoundAgain = () => {
    triggerSound('click');
    setShuffledDbs(prev => ({
      ...prev,
      [activeRound]: shuffleDatabase(roundConfig[activeRound].db)
    }));
    setRoundsState(prev => ({
      ...prev,
      [activeRound]: { completed: false, teamScores: {}, attempted: 0, answers: [] }
    }));
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setActivePage('quiz');
  };

  const goToRoundSelect = () => {
    triggerSound('click');
    resetQuestionState();
    setActivePage('round-select');
  };

  const finishQuiz = () => {
    triggerSound('complete');
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 100, origin: { x: 0.2, y: 0.6 } });
      confetti({ particleCount: 100, spread: 100, origin: { x: 0.8, y: 0.6 } });
    }, 300);
    setActivePage('final-results');
  };

  const restartQuiz = () => {
    triggerSound('transition');
    setShuffledDbs({
      movies: shuffleDatabase(moviesQs),
      gk: shuffleDatabase(gkQs),
      history: shuffleDatabase(historyQs),
      riddles: shuffleDatabase(riddlesQs),
      tech: shuffleDatabase(techQs)
    });
    setRoundsState(makeEmptyRoundState());
    setTeams(prev => prev.map(t => ({ ...t, score: 0 })));
    setActiveRound(null);
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setActivePage('landing');
  };

  // ── Computed: safe question data (never leak correctAnswer unless revealed) ──
  const currentQuestion = activeRound ? shuffledDbs[activeRound]?.[currentQuestionIndex] : null;
  const isAnswerRevealed = quizPhase === 'ANSWER_REVEALED';

  return (
    <QuizContext.Provider value={{
      // Pages / navigation
      activePage, setActivePage,
      soundEnabled, toggleSound,
      activeRound, currentQuestionIndex,
      shuffledDbs, roundsState,
      startQuiz, selectRound, goToRoundSelect, finishQuiz, restartQuiz, playRoundAgain,
      triggerSound,

      // Teams
      teams, updateTeamName, addTeam, removeTeam, confirmTeamSetup, teamSetupDone,

      // Quiz phase state machine
      quizPhase, currentQuestion, isAnswerRevealed,
      buzzerQueue, currentBuzzerIdx, currentTeamIdx, incorrectTeams,

      // Quizmaster actions
      startQuestion, teamBuzz, markCorrect, markIncorrect, revealAnswer, nextQuestion,
      openProjector,

      // Timer
      timerSeconds, timerRunning, timerDuration, setTimerDuration,
      setTimerRunning,

      // Connection tracking
      connectedTeams,

      // LAN address for buzzer URLs
      lanAddress,

      // Constants
      pointsPerCorrect: POINTS_PER_CORRECT
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  return useContext(QuizContext);
}
