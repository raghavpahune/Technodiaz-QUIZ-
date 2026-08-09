import React from 'react';
import { useQuiz } from '../context/QuizContext';

export default function HostControls() {
  const {
    timerRunning,
    timerSeconds,
    startTimer,
    pauseTimer,
    restartTimer,
    revealState,
    selectedOptionIdx,
    revealAnswer,
    returnToDatabase,
    currentQuestion
  } = useQuiz();

  const isRevealed = revealState === 'REVEALED';
  const hasSelection = selectedOptionIdx !== null;
  const timeUp = timerSeconds === 0;

  // Reveal is enabled if: not already revealed, AND (an option is selected OR time is up OR it's a riddle)
  const canReveal = !isRevealed && (hasSelection || timeUp || currentQuestion?.type === 'riddle');

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-cyan-900/50 p-4 z-50 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="flex gap-4">
        {/* Timer Controls */}
        <button
          onClick={timerRunning ? pauseTimer : startTimer}
          disabled={isRevealed || timeUp}
          className="px-6 py-3 bg-cyan-950 border border-cyan-500 text-cyan-400 font-bold tracking-widest text-sm uppercase hover:bg-cyan-900 disabled:opacity-30 transition-colors"
        >
          {timerRunning ? 'PAUSE TIMER' : 'START TIMER'}
        </button>
        <button
          onClick={restartTimer}
          disabled={timerRunning && !timeUp}
          className="px-4 py-3 border border-gray-600 text-gray-400 font-bold tracking-widest text-sm uppercase hover:bg-gray-800 disabled:opacity-30 transition-colors"
        >
          RESTART
        </button>
      </div>

      <div className="flex gap-4">
        {/* State Alerts */}
        {!canReveal && !isRevealed && currentQuestion?.type === 'mcq' && (
          <div className="flex items-center text-red-500 text-xs tracking-widest uppercase animate-pulse pr-4 border-r border-gray-800">
             SELECT AN OPTION OR <br/> WAIT FOR TIMEOUT
          </div>
        )}

        <button
          onClick={revealAnswer}
          disabled={!canReveal}
          className="px-8 py-3 bg-cyan-500 border border-cyan-400 text-black font-black tracking-widest text-sm uppercase hover:bg-cyan-400 disabled:opacity-30 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        >
          REVEAL ANSWER
        </button>

        <button
          onClick={returnToDatabase}
          disabled={!isRevealed && currentQuestion?.type !== 'riddle' && !hasSelection} // Host can force back, but usually waits for reveal
          className="px-8 py-3 border-2 border-green-500 text-green-500 font-black tracking-widest text-sm uppercase hover:bg-green-950 disabled:opacity-30 transition-colors ml-4"
        >
          NEXT QUESTION →
        </button>
      </div>
    </div>
  );
}
