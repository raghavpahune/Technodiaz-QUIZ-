import React from 'react';
import { useQuiz } from '../context/QuizContext';
import CollegeBadge from '../components/CollegeBadge';
import SoundToggle from '../components/SoundToggle';
import RoundTabs from '../components/RoundTabs';
import QuestionCard from '../components/QuestionCard';

export default function Quiz() {
  const { goToRoundSelect } = useQuiz();

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-4 md:py-6 relative">
      {/* Header Container */}
      <header className="w-full max-w-5xl flex flex-col gap-4 z-10">
        <div className="w-full flex justify-between items-center pointer-events-none">
          <CollegeBadge />
          
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Back button */}
            <button
              onClick={goToRoundSelect}
              className="px-4 py-2 text-xs md:text-sm font-display font-bold uppercase tracking-wider text-gray-400 hover:text-white glass-panel hover:bg-white/10 active:scale-95 transition-all rounded-full flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Dashboard</span>
            </button>
            <SoundToggle />
          </div>
        </div>
        
        {/* Horizontal Navigation Tabs */}
        <RoundTabs />
      </header>

      {/* Focused Question Display */}
      <main className="w-full max-w-3xl z-10 my-auto flex flex-col justify-center">
        <QuestionCard />
      </main>

      {/* Footer Guide */}
      <footer className="text-center text-[10px] text-gray-500 tracking-widest uppercase select-none z-10 mt-4">
        Lock in your answer to unlock the explanation and advance.
      </footer>
    </div>
  );
}
