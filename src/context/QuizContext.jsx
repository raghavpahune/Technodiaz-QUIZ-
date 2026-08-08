import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';

// Import question databases
import moviesQs from '../data/movies';
import gkQs from '../data/gk';
import historyQs from '../data/history';
import riddlesQs from '../data/riddles';
import techQs from '../data/tech';

const QuizContext = createContext();

export const roundConfig = {
  movies: { name: 'Movies & Anime', db: moviesQs, palette: 'red', icon: '🎬' },
  gk: { name: 'General Knowledge', db: gkQs, palette: 'teal', icon: '🌍' },
  history: { name: 'History & Monuments', db: historyQs, palette: 'bronze', icon: '🏛️' },
  riddles: { name: 'Riddles', db: riddlesQs, palette: 'purple', icon: '🧩' },
  tech: { name: 'Tech Trivia', db: techQs, palette: 'blue', icon: '💻' }
};

export function QuizProvider({ children }) {
  const [activePage, setActivePage] = useState('landing'); // 'landing' | 'round-select' | 'quiz' | 'round-complete' | 'final-results'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeRound, setActiveRound] = useState(null); // 'movies' | 'gk' | 'history' | 'riddles' | 'tech'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // null | number (index of option chosen)
  
  // Track round-specific stats
  const [roundsState, setRoundsState] = useState({
    movies: { completed: false, score: 0, attempted: 0, answers: [] }, // answers: array of { qId, correct: bool, chosen: number }
    gk: { completed: false, score: 0, attempted: 0, answers: [] },
    history: { completed: false, score: 0, attempted: 0, answers: [] },
    riddles: { completed: false, score: 0, attempted: 0, answers: [] },
    tech: { completed: false, score: 0, attempted: 0, answers: [] }
  });

  // Sound triggering helper
  const triggerSound = (type) => {
    playSound(type, soundEnabled);
  };

  // Navigations
  const startQuiz = () => {
    triggerSound('click');
    setActivePage('round-select');
  };

  const toggleSound = () => {
    // A click is nice here, but it triggers BEFORE the new state, so play based on current toggle value
    playSound('click', !soundEnabled);
    setSoundEnabled(prev => !prev);
  };

  const selectRound = (roundKey) => {
    triggerSound('transition');
    setActiveRound(roundKey);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setActivePage('quiz');
  };

  const selectOption = (optionIdx) => {
    // Prevent answering twice
    if (selectedOption !== null) return;
    
    setSelectedOption(optionIdx);
    const questions = roundConfig[activeRound].db;
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = optionIdx === currentQ.correctAnswer;

    // Play sounds & trigger confetti if correct
    if (isCorrect) {
      triggerSound('correct');
      // Gentle confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: activeRound === 'movies' ? ['#ef4444', '#f59e0b'] : 
                activeRound === 'gk' ? ['#14b8a6', '#3b82f6'] :
                activeRound === 'history' ? ['#d97706', '#f59e0b'] :
                activeRound === 'riddles' ? ['#a855f7', '#ec4899'] :
                ['#10b981', '#3b82f6']
      });
    } else {
      triggerSound('incorrect');
    }

    // Update round state
    setRoundsState(prev => {
      const round = prev[activeRound];
      // Make sure we don't double record if state gets re-rendered
      const exists = round.answers.some(ans => ans.qId === currentQ.id);
      if (exists) return prev;

      const newAnswers = [...round.answers, { qId: currentQ.id, correct: isCorrect, chosen: optionIdx }];
      const newScore = isCorrect ? round.score + 1 : round.score;

      return {
        ...prev,
        [activeRound]: {
          ...round,
          score: newScore,
          attempted: round.attempted + 1,
          answers: newAnswers
        }
      };
    });
  };

  const nextQuestion = () => {
    triggerSound('click');
    const questions = roundConfig[activeRound].db;
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Mark round completed
      setRoundsState(prev => ({
        ...prev,
        [activeRound]: {
          ...prev[activeRound],
          completed: true
        }
      }));
      triggerSound('complete');
      setActivePage('round-complete');
    }
  };

  const playRoundAgain = () => {
    triggerSound('click');
    // Reset only the current round stats
    setRoundsState(prev => ({
      ...prev,
      [activeRound]: { completed: false, score: 0, attempted: 0, answers: [] }
    }));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setActivePage('quiz');
  };

  const goToRoundSelect = () => {
    triggerSound('click');
    setActivePage('round-select');
  };

  const finishQuiz = () => {
    triggerSound('complete');
    // Massive final results confetti shower!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });
    // Delay slightly to trigger multiple bursts
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 100, origin: { x: 0.2, y: 0.6 } });
      confetti({ particleCount: 100, spread: 100, origin: { x: 0.8, y: 0.6 } });
    }, 300);
    
    setActivePage('final-results');
  };

  const restartQuiz = () => {
    triggerSound('transition');
    // Reset all rounds
    setRoundsState({
      movies: { completed: false, score: 0, attempted: 0, answers: [] },
      gk: { completed: false, score: 0, attempted: 0, answers: [] },
      history: { completed: false, score: 0, attempted: 0, answers: [] },
      riddles: { completed: false, score: 0, attempted: 0, answers: [] },
      tech: { completed: false, score: 0, attempted: 0, answers: [] }
    });
    setActiveRound(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setActivePage('landing');
  };

  return (
    <QuizContext.Provider value={{
      activePage,
      setActivePage,
      soundEnabled,
      toggleSound,
      activeRound,
      currentQuestionIndex,
      selectedOption,
      roundsState,
      startQuiz,
      selectRound,
      selectOption,
      nextQuestion,
      playRoundAgain,
      goToRoundSelect,
      finishQuiz,
      restartQuiz,
      triggerSound
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  return useContext(QuizContext);
}
