import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import CollegeBadge from '../components/CollegeBadge';
import SoundToggle from '../components/SoundToggle';

export default function RoundSelect() {
  const { selectRound, roundsState, teams, finishQuiz } = useQuiz();

  const rounds = Object.entries(roundConfig);
  const completedCount = rounds.filter(([key]) => roundsState[key].completed).length;
  const totalScore = teams.reduce((sum, t) => sum + t.score, 0);
  const totalAttempted = rounds.reduce((sum, [key]) => sum + roundsState[key].attempted, 0);

  const allRoundsCompleted = completedCount === rounds.length;

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-6 md:py-8 relative">
      {/* Header Row */}
      <header className="w-full max-w-5xl flex justify-between items-center z-10 pointer-events-none">
        <CollegeBadge />
        <SoundToggle />
      </header>

      {/* Main Dashboard */}
      <main className="w-full max-w-4xl z-10 my-auto flex flex-col gap-6 items-center">
        {/* Championship Standing Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 md:p-6 rounded-2xl w-full flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left select-none border border-white/8"
        >
          <div>
            <h2 className="font-display font-black text-lg md:text-xl tracking-wide text-white uppercase">Competition Standing</h2>

            <p className="font-sans text-xs md:text-sm text-gray-400 mt-1">Select a category below to test your abilities.</p>
          </div>
          <div className="flex items-center gap-6 font-display">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Rounds Complete</span>
              <span className="text-lg md:text-xl font-black text-yellow-500">{completedCount} / 5</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Score</span>
              <span className="text-lg md:text-xl font-black text-emerald-400">{totalScore} <span className="text-xs text-gray-500">pts</span></span>
            </div>
          </div>
        </motion.div>

        {/* Interactive 5-Round Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          {rounds.map(([key, config], index) => {
            const state = roundsState[key];
            const isCompleted = state.completed;
            const isStarted = state.attempted > 0;

            let statusLabel = 'Not Started';
            let statusIcon = '○';
            let statusColor = 'text-gray-500 border-white/5 bg-slate-900/10';
            let bgGlow = 'hover:border-white/10';

            if (isCompleted) {
              statusLabel = 'Completed';
              statusIcon = '✓';
              statusColor = 'text-emerald-400 border-emerald-500/25 bg-emerald-950/20';
              bgGlow = 'hover:border-emerald-500/30';
            } else if (isStarted) {
              statusLabel = 'In Progress';
              statusIcon = '●';
              statusColor = 'text-yellow-400 border-yellow-500/25 bg-yellow-950/20';
              bgGlow = 'hover:border-yellow-500/30';
            }

            // Environment glowing class
            const hoverGlowClass = 
              key === 'movies' ? 'hover:neon-glow-red hover:bg-red-950/20' :
              key === 'gk' ? 'hover:neon-glow-teal hover:bg-teal-950/20' :
              key === 'history' ? 'hover:neon-glow-gold hover:bg-amber-950/20' :
              key === 'riddles' ? 'hover:neon-glow-purple hover:bg-purple-950/20' :
              'hover:neon-glow-blue hover:bg-blue-950/20';

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => selectRound(key)}
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between items-start text-left h-44 cursor-pointer border border-white/5 transition-all duration-300 pointer-events-auto active:scale-[0.97] group ${hoverGlowClass} ${bgGlow}`}
              >
                <div className="w-full flex justify-between items-start">
                  <span className="text-3xl filter drop-shadow-[0_0_6px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform duration-300">{config.icon}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-display font-black border uppercase tracking-wider ${statusColor}`}>
                    {statusIcon} {statusLabel}
                  </span>
                </div>

                <div className="flex flex-col mt-4">
                  <h3 className="font-display font-black text-sm md:text-base text-white uppercase group-hover:text-yellow-400 transition-colors leading-tight">
                    {config.name}
                  </h3>
                  <span className="font-sans text-xs text-gray-400 mt-1 font-bold">
                    {config.db.length} Questions
                  </span>
                  {isStarted && (
                    <span className="font-sans text-[10px] text-gray-500 mt-0.5 font-bold">
                      Current: {state.attempted} answered
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Finale Reveal Button */}
        {allRoundsCompleted && (
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={finishQuiz}
            className="w-full max-w-md py-4 rounded-2xl font-display font-black text-base tracking-wider bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-slate-950 hover:from-yellow-400 hover:to-amber-400 active:scale-95 transition-all shadow-[0_0_25px_rgba(234,179,8,0.45)] cursor-pointer pointer-events-auto flex items-center justify-center gap-2 group mt-3"
          >
            <span>PROCEED TO FINALE 🏆</span>
          </motion.button>
        )}
      </main>

      <footer className="text-center text-[10px] text-gray-500 tracking-widest uppercase select-none z-10 mt-6">
        Select a category to play. Complete all 5 categories to view overall scoreboard.
      </footer>
    </div>
  );
}
