import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import CollegeBadge from '../components/CollegeBadge';
import SoundToggle from '../components/SoundToggle';

export default function Landing() {
  const { startQuiz } = useQuiz();

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-6 md:py-8 relative">
      {/* Universal header row containing college badge and sound toggle */}
      <header className="w-full max-w-5xl flex justify-between items-center z-10 pointer-events-none">
        <CollegeBadge />
        <SoundToggle />
      </header>

      {/* Interactive glassmorphism hero panel */}
      <main className="w-full max-w-xl z-10 my-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="glass-panel p-8 md:p-10 rounded-3xl w-full text-center relative overflow-hidden flex flex-col gap-6"
        >
          {/* Premium shimmer scan line */}
          <div className="absolute inset-0 shimmer-effect pointer-events-none rounded-3xl opacity-40" />
          
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight text-white uppercase leading-tight select-none">
            COLLEGE QUIZ <span className="text-yellow-500 block mt-1 drop-shadow-[0_0_12px_rgba(234,179,8,0.35)]">COMPETITION</span>
          </h1>
          
          <p className="font-sans font-medium text-sm md:text-base text-gray-300 max-w-md mx-auto leading-relaxed select-none">
            Welcome to the ultimate academic challenge. Test your knowledge across 5 beautiful 3D environments and themed categories of increasing complexity.
          </p>

          {/* Core rounds description grid */}
          <div className="grid grid-cols-2 gap-3 text-left font-sans text-xs md:text-sm text-gray-400 bg-slate-950/45 p-4 rounded-2xl border border-white/5 select-none">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">🎬</span> Movies & Anime
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-500 font-bold">🌍</span> General Knowledge
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">🏛️</span> History & Monuments
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500 font-bold">🧩</span> Playful Riddles
            </div>
            <div className="flex items-center gap-2 col-span-2 justify-center border-t border-white/5 pt-2 mt-1.5 text-blue-400 font-bold">
              <span>💻</span> Round 5: Tech Trivia Special
            </div>
          </div>

          {/* Action Trigger Button */}
          <motion.button
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
            onClick={startQuiz}
            className="w-full py-4 mt-1.5 rounded-2xl font-display font-black text-base md:text-lg tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 cursor-pointer pointer-events-auto flex items-center justify-center gap-2 group"
          >
            <span>START QUIZ CHAMPIONSHIP</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </motion.button>
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-[10px] md:text-xs text-gray-500 tracking-widest uppercase select-none z-10">
        © 2026 Chrono Health Academy • Excellence in Academic Trivia
      </footer>
    </div>
  );
}
