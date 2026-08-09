import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';

export default function FinalResults() {
  const { sessionScore, questionStatus, restartSession, returnToDatabase } = useQuiz();

  const completedCount = Object.values(questionStatus).filter(s => s === 'COMPLETED').length;

  return (
    <div className="min-h-screen flex flex-col justify-between items-center p-6 md:p-12 relative overflow-hidden bg-black text-cyan-400 font-sans">
       {/* Ambient grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="w-full max-w-xl z-10 my-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="p-8 md:p-12 border border-cyan-500/50 bg-cyan-950/20 backdrop-blur-md rounded relative overflow-hidden flex flex-col gap-8 w-full shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs tracking-[0.3em] text-cyan-600 mb-2">// TECHNODIAZ SYSTEM V1.0</div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              SESSION COMPLETE
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 border border-cyan-900/50 bg-black/40">
                <div className="text-[10px] tracking-widest text-cyan-600 mb-1">QUESTIONS COMPLETED</div>
                <div className="text-3xl font-black text-white">{completedCount}</div>
             </div>
             <div className="p-4 border border-cyan-900/50 bg-black/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <div className="text-[10px] tracking-widest text-cyan-600 mb-1">TOTAL SCORE</div>
                <div className="text-3xl font-black text-green-400">{sessionScore} <span className="text-sm">PTS</span></div>
             </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={restartSession}
              className="px-8 py-4 bg-cyan-500 text-black font-black tracking-widest uppercase hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.4)]"
            >
              RESTART SESSION
            </button>
            <button
              onClick={returnToDatabase}
              className="px-8 py-4 border border-cyan-900/50 text-cyan-500 font-bold tracking-widest uppercase hover:bg-cyan-950 transition-colors"
            >
              RETURN TO QUESTION DATABASE
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="text-center text-[10px] text-cyan-700 tracking-widest uppercase select-none z-10 mt-8">
        © 2026 Priyadarshini Bhagwati College of Engineering, Nagpur
      </footer>
    </div>
  );
}
