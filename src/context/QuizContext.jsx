import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { syncSend, syncListen } from '../utils/sync';
import { questionDatabase } from '../data';

const QuizContext = createContext();

const urlParams = new URLSearchParams(window.location.search);
const APP_MODE = urlParams.get('mode') || 'host'; // 'host' | 'projector'
const IS_PROJECTOR = APP_MODE === 'projector';

const DEFAULT_TIMER_DURATION = 30;

export function QuizProvider({ children }) {
  // Navigation State
  const [activePage, setActivePage] = useState('landing');
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Database State
  const [questionStatus, setQuestionStatus] = useState(() => {
    const statusMap = {};
    questionDatabase.forEach(q => {
      statusMap[q.globalId] = 'READY';
    });
    return statusMap;
  });

  // Active Question State
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [revealState, setRevealState] = useState('WAITING_FOR_SELECTION'); // WAITING_FOR_SELECTION -> SELECTED -> REVEALED
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  
  // Timer State
  const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER_DURATION);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Score State
  const [sessionScore, setSessionScore] = useState(0);

  // Sync Logic
  const lastBroadcastRef = useRef('');
  
  // Broadcaster (Host)
  useEffect(() => {
    if (IS_PROJECTOR) return;
    const snapshot = {
      type: 'quiz-state',
      activePage,
      questionStatus,
      currentQuestionId,
      revealState,
      selectedOptionIdx,
      timerSeconds,
      timerRunning,
      sessionScore
    };
    const key = JSON.stringify(snapshot);
    if (key !== lastBroadcastRef.current) {
      lastBroadcastRef.current = key;
      syncSend(snapshot);
    }
  });

  // Receiver (Projector)
  useEffect(() => {
    if (!IS_PROJECTOR) return;
    return syncListen((s) => {
      if (s.type !== 'quiz-state') return;
      setActivePage(s.activePage);
      setQuestionStatus(s.questionStatus);
      setCurrentQuestionId(s.currentQuestionId);
      setRevealState(s.revealState);
      setSelectedOptionIdx(s.selectedOptionIdx);
      setTimerSeconds(s.timerSeconds);
      setSessionScore(s.sessionScore);
      setTimerRunning(false); // Projector doesn't run its own interval
    });
  }, []);

  // Audio helper
  const triggerSound = useCallback((type) => {
    playSound(type, soundEnabled);
  }, [soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            if (revealState === 'WAITING_FOR_SELECTION') {
               triggerSound('timeup');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timerSeconds, soundEnabled, revealState]);

  // Actions
  const toggleSound = () => {
    playSound('click', !soundEnabled);
    setSoundEnabled(prev => !prev);
  };

  const startQuiz = () => {
    triggerSound('transition');
    setActivePage('database');
  };

  const selectQuestion = (globalId) => {
    triggerSound('transition');
    setCurrentQuestionId(globalId);
    setRevealState('WAITING_FOR_SELECTION');
    setSelectedOptionIdx(null);
    setTimerSeconds(timerDuration);
    setTimerRunning(false); // Timer is manually started or auto-started depending on UI design. Let's start it.
    setActivePage('quiz');
  };
  
  const startTimer = () => {
    if (timerSeconds > 0 && revealState === 'WAITING_FOR_SELECTION') {
        setTimerRunning(true);
    }
  }

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const restartTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(timerDuration);
  };

  const selectOption = (idx) => {
    if (revealState === 'REVEALED') return;
    triggerSound('click');
    setSelectedOptionIdx(idx);
    setRevealState('SELECTED');
    setTimerRunning(false); // Stop timer on selection
  };

  const revealAnswer = () => {
    if (revealState === 'REVEALED') return;
    triggerSound('reveal');
    setRevealState('REVEALED');
    
    // Update score if correct
    const currentQ = questionDatabase.find(q => q.globalId === currentQuestionId);
    if (currentQ) {
      // Mark as completed
      setQuestionStatus(prev => ({ ...prev, [currentQuestionId]: 'COMPLETED' }));
      
      // If it's MCQ and selected is correct, or Riddle (host manually awards points later, but for now we'll assume +10 for Riddle on reveal is wrong without selection. Let's handle score manually for riddles or automatically if MCQ)
      if (currentQ.type === 'mcq' && selectedOptionIdx === currentQ.correctAnswer) {
          setTimeout(() => {
             triggerSound('correct');
             setSessionScore(prev => prev + (currentQ.points || 10));
             confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          }, 1500); // delay for decryption animation
      } else if (currentQ.type === 'mcq' && selectedOptionIdx !== null) {
          setTimeout(() => {
             triggerSound('incorrect');
          }, 1500);
      }
    }
  };

  const returnToDatabase = () => {
    triggerSound('click');
    if (currentQuestionId) {
      // Ensure it's marked completed if we leave
      setQuestionStatus(prev => ({ ...prev, [currentQuestionId]: 'COMPLETED' }));
    }
    setActivePage('database');
    setCurrentQuestionId(null);
  };

  const goToFinalResults = () => {
    triggerSound('complete');
    setActivePage('final-results');
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
  };
  
  const manuallyUpdateScore = (amount) => {
      setSessionScore(prev => prev + amount);
  }

  const restartSession = () => {
    triggerSound('transition');
    setQuestionStatus(() => {
        const statusMap = {};
        questionDatabase.forEach(q => {
        statusMap[q.globalId] = 'READY';
        });
        return statusMap;
    });
    setSessionScore(0);
    setActivePage('landing');
    setCurrentQuestionId(null);
  };

  const currentQuestion = currentQuestionId ? questionDatabase.find(q => q.globalId === currentQuestionId) : null;

  return (
    <QuizContext.Provider value={{
      // App State
      activePage,
      APP_MODE,
      IS_PROJECTOR,
      soundEnabled,
      toggleSound,
      
      // Data
      allQuestions: questionDatabase,
      questionStatus,
      currentQuestion,
      currentQuestionId,
      sessionScore,
      
      // Question State
      revealState,
      selectedOptionIdx,
      timerSeconds,
      timerRunning,
      
      // Actions
      startQuiz,
      selectQuestion,
      startTimer,
      pauseTimer,
      restartTimer,
      selectOption,
      revealAnswer,
      returnToDatabase,
      goToFinalResults,
      restartSession,
      manuallyUpdateScore
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  return useContext(QuizContext);
}
