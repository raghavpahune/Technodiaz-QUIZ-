import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import CollegeBadge from '../components/CollegeBadge';
import SoundToggle from '../components/SoundToggle';

export default function FinalResults() {
  const { roundsState, restartQuiz } = useQuiz();

  const rounds = Object.entries(roundConfig);
  const totalScore = rounds.reduce((sum, [key]) => sum + roundsState[key].score, 0);
  const totalAttempted = rounds.reduce((sum, [key]) => sum + roundsState[key].attempted, 0);
  const totalWrong = totalAttempted - totalScore;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalScore / totalAttempted) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-6 md:py-8 relative">
      {/* Header Row */}
      <header className="w-full max-w-5xl flex justify-between items-center z-10 pointer-events-none">
        <CollegeBadge />
        <SoundToggle />
      </header>

      {/* Main Scoreboard Panel */}
      <main className="w-full max-w-xl z-10 my-auto flex flex-col gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="glass-panel p-8 rounded-3xl w-full text-center relative overflow-hidden flex flex-col gap-6 border border-yellow-500/20 neon-glow-gold"
        >
          {/* Confetti Shimmer */}
          <div className="absolute inset-0 shimmer-effect pointer-events-none rounded-3xl opacity-20" />

          {/* Heading Logo & Metadata */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-5xl filter drop-shadow-[0_0_10px_rgba(234,179,8,0.45)] animate-bounce">🏆</span>
            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white uppercase mt-4 select-none">
              QUIZ COMPETITION COMPLETE
            </h1>

            <p className="font-sans font-semibold text-xs text-yellow-500 uppercase tracking-widest mt-1">
              Grand Scorecard Summary
            </p>
          </div>

          {/* Stats breakdown row */}
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/45 p-4 rounded-2xl border border-white/5 font-display select-none">
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Accuracy</span>
              <span className="text-lg md:text-xl font-black text-yellow-500 mt-1">{overallAccuracy}%</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Total Pts</span>
              <span className="text-lg md:text-xl font-black text-emerald-400 mt-1">{totalScore}</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Correct</span>
              <span className="text-lg md:text-xl font-black text-teal-400 mt-1">{totalScore}</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Wrong</span>
              <span className="text-lg md:text-xl font-black text-red-400 mt-1">{totalWrong}</span>
            </div>
          </div>

          {/* Detailed Category-by-Category List */}
          <div className="flex flex-col gap-2.5 text-left">
            <h3 className="font-display font-black text-xs tracking-wider uppercase text-gray-400 select-none pl-1">
              Round Breakdown
            </h3>
            
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {rounds.map(([key, config]) => {
                const state = roundsState[key];
                const accuracy = state.attempted > 0 ? Math.round((state.score / state.attempted) * 100) : 0;
                
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
                        <span className="text-[10px] text-gray-500 font-bold">{state.attempted} of {config.db.length} Answered</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 font-display">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-gray-500 font-bold">Accuracy</span>
                        <span className="text-xs font-black text-gray-300">{accuracy}%</span>
                      </div>
                      <div className="flex flex-col items-end min-w-[45px]">
                        <span className="text-[9px] text-gray-500 font-bold">Score</span>
                        <span className={`text-xs md:text-sm font-black ${accent}`}>{state.score} / {config.db.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset quiz control */}
          <button
            onClick={restartQuiz}
            className="w-full py-4 mt-1 rounded-2xl font-display font-black text-base tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer pointer-events-auto flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>RESTART COMPETITION</span>
          </button>
        </motion.div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center text-[9px] md:text-xs text-gray-500 tracking-wider uppercase select-none z-10 mt-6 leading-normal max-w-lg">
        © 2026 Priyadarshini Bhagwati College of Engineering, Nagpur <span className="block md:inline md:ml-1.5">• Department of Computer Science & Engineering</span>
      </footer>

    </div>
  );
}
