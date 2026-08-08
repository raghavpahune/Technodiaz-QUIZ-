import React from 'react';
import { useQuiz, roundConfig } from '../context/QuizContext';

export default function RoundTabs() {
  const { activeRound, selectRound, roundsState } = useQuiz();

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pointer-events-auto py-1.5">
      <div className="flex items-center gap-2.5 min-w-max md:justify-center px-1">
        {Object.entries(roundConfig).map(([key, config]) => {
          const isActive = activeRound === key;
          const status = roundsState[key];
          
          let statusText = '○'; // Not started
          let statusColor = 'text-gray-500';
          
          if (status.completed) {
            statusText = '✓'; // Completed
            statusColor = 'text-emerald-400 font-bold';
          } else if (status.attempted > 0) {
            statusText = '●'; // In progress / Current
            statusColor = 'text-yellow-400 font-extrabold animate-pulse';
          }

          // Active theme border and background styling
          const themeClass = isActive
            ? key === 'movies' ? 'border-red-500/50 bg-red-950/30 text-red-200 neon-glow-red' :
              key === 'gk' ? 'border-teal-500/50 bg-teal-950/30 text-teal-200 neon-glow-teal' :
              key === 'history' ? 'border-amber-500/50 bg-amber-950/30 text-amber-200 neon-glow-gold' :
              key === 'riddles' ? 'border-purple-500/50 bg-purple-950/30 text-purple-200 neon-glow-purple' :
              'border-blue-500/50 bg-blue-950/30 text-blue-200 neon-glow-blue'
            : 'border-white/5 bg-slate-950/40 text-gray-400 hover:text-gray-200 hover:border-white/15';

          return (
            <button
              key={key}
              onClick={() => selectRound(key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-full border text-xs md:text-sm font-display font-bold tracking-wide transition-all duration-300 active:scale-95 pointer-events-auto ${themeClass}`}
            >
              <span className="text-base">{config.icon}</span>
              <span>{config.name}</span>
              <span className={`text-[10px] md:text-xs ml-1.5 ${statusColor}`} title={
                status.completed ? "Completed" : status.attempted > 0 ? "In Progress" : "Not Started"
              }>
                {statusText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
