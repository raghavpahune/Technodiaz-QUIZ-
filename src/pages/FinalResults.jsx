import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import CollegeBadge from '../components/CollegeBadge';
import SoundToggle from '../components/SoundToggle';
import AnimatedButton from '../components/AnimatedButton';

export default function FinalResults() {
  const { roundsState, teams, restartQuiz } = useQuiz();

  const rounds = Object.entries(roundConfig);

  // Sort teams by total score
  const rankedTeams = [...teams]
    .map((t, i) => ({ ...t, idx: i }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-6 md:py-8 relative">
      <header className="w-full max-w-5xl flex justify-between items-center z-10 pointer-events-none">
        <CollegeBadge />
        <SoundToggle />
      </header>

      <main className="w-full max-w-xl z-10 my-auto flex flex-col gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="glass-panel p-8 rounded-3xl w-full text-center relative overflow-hidden flex flex-col gap-6 border border-yellow-500/20 neon-glow-gold"
        >
          {/* Confetti Shimmer */}
          <div className="absolute inset-0 shimmer-effect pointer-events-none rounded-3xl opacity-20" />

          {/* Heading */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-5xl filter drop-shadow-[0_0_10px_rgba(234,179,8,0.45)] animate-bounce">🏆</span>
            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white uppercase mt-4 select-none">
              QUIZ COMPETITION COMPLETE
            </h1>
            <p className="font-sans font-semibold text-xs text-yellow-500 uppercase tracking-widest mt-1">
              Final Standings
            </p>
          </div>

          {/* Team Podium */}
          <div className="flex flex-col gap-3">
            {rankedTeams.map((team, rank) => {
              const medals = ['🥇', '🥈', '🥉'];
              const borderClass = rank === 0
                ? 'border-yellow-500/30 bg-yellow-950/15 neon-glow-gold'
                : rank === 1
                  ? 'border-gray-400/20 bg-slate-900/20'
                  : rank === 2
                    ? 'border-amber-700/20 bg-amber-950/10'
                    : 'border-white/5';

              return (
                <motion.div
                  key={team.idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rank * 0.1 }}
                  className={`flex justify-between items-center p-4 rounded-2xl border font-sans ${borderClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{medals[rank] || `#${rank + 1}`}</span>
                    <div className="flex flex-col text-left">
                      <span className={`text-base font-bold ${rank === 0 ? 'text-yellow-300' : 'text-gray-200'}`}>
                        {team.name}
                      </span>
                    </div>
                  </div>
                  <span className={`font-display font-black text-xl ${
                    rank === 0 ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    {team.score} <span className="text-xs text-gray-500">pts</span>
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Round Breakdown */}
          <div className="flex flex-col gap-2.5 text-left">
            <h3 className="font-display font-black text-xs tracking-wider uppercase text-gray-400 select-none pl-1">
              Round Breakdown
            </h3>
            
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {rounds.map(([key, config]) => {
                const state = roundsState[key];
                const accent = 
                  key === 'movies' ? 'text-red-400' :
                  key === 'gk' ? 'text-teal-400' :
                  key === 'history' ? 'text-amber-400' :
                  key === 'riddles' ? 'text-purple-400' :
                  'text-blue-400';

                return (
                  <div
                    key={key}
                    className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-slate-900/10 font-sans"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{config.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200">{config.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{state.attempted} Questions</span>
                      </div>
                    </div>
                    <span className={`font-display font-black text-xs ${accent}`}>
                      {state.completed ? '✓' : '○'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restart */}
          <AnimatedButton
            onClick={restartQuiz}
            className="w-full py-4 mt-1 rounded-2xl font-display font-black text-base tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer pointer-events-auto flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>RESTART COMPETITION</span>
          </AnimatedButton>
        </motion.div>
      </main>

      <footer className="text-center text-[9px] md:text-xs text-gray-500 tracking-wider uppercase select-none z-10 mt-6 leading-normal max-w-lg">
        © 2026 Priyadarshini Bhagwati College of Engineering, Nagpur <span className="block md:inline md:ml-1.5">• Department of Computer Science & Engineering</span>
      </footer>

    </div>
  );
}
