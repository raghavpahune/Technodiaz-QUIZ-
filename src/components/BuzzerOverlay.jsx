import React, { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';

/**
 * Listens for keyboard buzzer inputs (keys 1-9 for teams)
 * and provides visual buzz buttons. Renders inline wherever placed.
 */
export default function BuzzerOverlay() {
  const { teams, teamBuzz, quizPhase, buzzerQueue } = useQuiz();

  useEffect(() => {
    const handler = (e) => {
      // Keys 1-9 map to team indices 0-8
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= teams.length) {
        teamBuzz(num - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [teams.length, teamBuzz, quizPhase]);

  const canBuzz = quizPhase === 'QUESTION_ACTIVE';

  return (
    <div className="flex flex-wrap gap-2">
      {teams.map((team, idx) => {
        const hasBuzzed = buzzerQueue.includes(idx);
        const buzzOrder = buzzerQueue.indexOf(idx);

        return (
          <button
            key={idx}
            onClick={() => teamBuzz(idx)}
            disabled={!canBuzz || hasBuzzed}
            className={`px-3 py-2 rounded-lg font-display font-bold text-xs tracking-wide transition-all duration-200 border ${
              hasBuzzed
                ? 'border-yellow-500/40 bg-yellow-950/30 text-yellow-400 cursor-not-allowed'
                : canBuzz
                  ? 'border-white/10 bg-slate-900/50 text-gray-300 hover:bg-white/10 hover:border-white/20 active:scale-95'
                  : 'border-white/5 bg-slate-950/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <span className="text-[10px] text-gray-500 block">Key {idx + 1}</span>
            {team.name}
            {hasBuzzed && <span className="ml-1 text-yellow-500 text-[10px]">#{buzzOrder + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}
