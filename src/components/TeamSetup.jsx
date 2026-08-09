import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import AnimatedButton from './AnimatedButton';

/**
 * Team setup screen — configure team names before starting a round.
 * Shown as a modal/overlay when teamSetupDone is false.
 */
export default function TeamSetup() {
  const { teams, updateTeamName, addTeam, removeTeam, confirmTeamSetup } = useQuiz();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="glass-panel p-8 rounded-3xl w-full max-w-md flex flex-col gap-6 border border-white/10"
      >
        <div className="text-center">
          <h2 className="font-display font-black text-xl tracking-wide text-white uppercase">
            Team Setup
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-sans">
            Name your teams before starting
          </p>
        </div>

        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {teams.map((team, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-display font-bold text-xs text-gray-400 shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={team.name}
                onChange={(e) => updateTeamName(idx, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950/50 border border-white/10 text-gray-200 font-sans text-sm focus:outline-none focus:border-yellow-500/50 transition-colors"
                maxLength={20}
              />
              {teams.length > 2 && (
                <AnimatedButton
                  onClick={() => removeTeam(idx)}
                  className="w-7 h-7 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/30 flex items-center justify-center text-xs transition-colors"
                >
                  ✕
                </AnimatedButton>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {teams.length < 8 && (
            <AnimatedButton
              onClick={addTeam}
              className="flex-1 py-2.5 rounded-xl border border-white/10 font-display font-bold text-xs tracking-wider text-gray-400 hover:text-white hover:border-white/20 transition-colors"
            >
              + ADD TEAM
            </AnimatedButton>
          )}
          <AnimatedButton
            onClick={confirmTeamSetup}
            className="flex-1 py-2.5 rounded-xl font-display font-black text-sm tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.35)]"
          >
            START →
          </AnimatedButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
