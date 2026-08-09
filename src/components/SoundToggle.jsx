import React from 'react';
import { useQuiz } from '../context/QuizContext';
import AnimatedButton from './AnimatedButton';

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useQuiz();

  return (
    <AnimatedButton
      onClick={toggleSound}
      className="p-2.5 rounded-full glass-panel hover:bg-white/10 transition-colors text-gray-300 hover:text-white pointer-events-auto flex items-center justify-center"
      aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
    >
      {soundEnabled ? (
        // Sound On Icon
        <svg
          className="w-5 h-5 text-yellow-500 filter drop-shadow-[0_0_5px_rgba(234,179,8,0.4)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      ) : (
        // Sound Off Icon
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6H4.51c-.88 0-1.704.507-1.938 1.354A9.01 9.01 0 002.25 12c0 .83.112 1.633.322 2.396C2.806 15.244 3.63 15.75 4.51 15.75H6.75l4.72 4.72a.75.75 0 001.28-.53V3.69a.75.75 0 00-1.28-.53L6.75 8.25z"
          />
        </svg>
      )}
    </AnimatedButton>
  );
}
