import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import CollegeBadge from '../components/CollegeBadge';
import SoundToggle from '../components/SoundToggle';

export default function RoundComplete() {
  const { activeRound, roundsState, teams, playRoundAgain, goToRoundSelect, pointsPerCorrect } = useQuiz();

  const round = roundConfig[activeRound];
  const state = roundsState[activeRound];
  const attempted = state.attempted;

  // Neon glow per round
  const neonGlow = 
    activeRound === 'movies' ? 'neon-glow-red border-red-500/30' :
    activeRound === 'gk' ? 'neon-glow-teal border-teal-500/30' :
    activeRound === 'history' ? 'neon-glow-gold border-amber-500/30' :
    activeRound === 'riddles' ? 'neon-glow-purple border-purple-500/30' :
    'neon-glow-blue border-blue-500/30';

  const accentColor = 
    activeRound === 'movies' ? 'text-red-400' :
    activeRound === 'gk' ? 'text-teal-400' :
    activeRound === 'history' ? 'text-amber-400' :
    activeRound === 'riddles' ? 'text-purple-400' :
    'text-blue-400';

  // Sort teams by score for this round
  const teamRoundScores = teams.map((t, i) => ({
    ...t,
    idx: i,
    roundScore: state.teamScores?.[i] || 0
  })).sort((a, b) => b.roundScore - a.roundScore);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-6 md:py-8 relative">
      <header className="w-full max-w-5xl flex justify-between items-center z-10 pointer-events-none">
        <CollegeBadge />
        <SoundToggle />
      </header>

      <main className="w-full max-w-md z-10 my-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, type: 'spring', damping: 20 }}
          className={`glass-panel p-8 rounded-3xl w-full text-center relative overflow-hidden flex flex-col gap-6 border ${neonGlow}`}
        >
          <div className="flex flex-col gap-1 items-center">
            <span className="text-4xl filter drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">{round.icon}</span>
            <h1 className="font-display font-black text-2xl tracking-wide text-white uppercase mt-2">
              Round Complete
            </h1>
            <p className={`font-display font-extrabold text-sm uppercase tracking-wider ${accentColor}`}>
              {round.name}
            </p>
          </div>

          {/* Questions answered */}
          <div className="text-center">
            <span className="text-[9px] text-gray-500 font-display font-bold uppercase tracking-widest">Questions Answered</span>
            <span className="block text-2xl font-display font-black text-white mt-1">{attempted}</span>
          </div>

          {/* Team standings for this round */}
          <div className="flex flex-col gap-2 text-left">
            <h3 className="font-display font-black text-xs tracking-wider uppercase text-gray-400 pl-1">
              Round Standings
            </h3>
            {teamRoundScores.map((team, rank) => (
              <div
                key={team.idx}
                className={`flex justify-between items-center p-3 rounded-xl border font-sans ${
                  rank === 0 && team.roundScore > 0
                    ? 'border-yellow-500/25 bg-yellow-950/10'
                    : 'border-white/5 bg-slate-900/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {rank === 0 && team.roundScore > 0 && <span>🏆</span>}
                  <span className="text-sm font-bold text-gray-200">{team.name}</span>
                </div>
                <span className={`font-display font-black text-sm ${
                  rank === 0 && team.roundScore > 0 ? 'text-yellow-400' : 'text-emerald-400'
                }`}>
                  {team.roundScore} pts
                </span>
              </div>
            ))}
          </div>

          {/* Options Row */}
          <div className="flex gap-3 mt-1 pointer-events-auto">
            <button
              onClick={playRoundAgain}
              className="flex-1 py-3.5 rounded-xl font-display font-black text-xs tracking-wider border border-white/15 hover:bg-white/5 active:scale-95 transition-all text-gray-300 hover:text-white"
            >
              REPLAY ROUND
            </button>
            <button
              onClick={goToRoundSelect}
              className="flex-1 py-3.5 rounded-xl font-display font-black text-xs tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center gap-1.5 group"
            >
              <span>NEXT ROUND</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="text-center text-[10px] text-gray-500 tracking-widest uppercase select-none z-10 mt-6">
        Congrats on completing this round! Keep leveling up.
      </footer>
    </div>
  );
}
