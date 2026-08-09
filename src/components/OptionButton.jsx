import React from 'react';
import { motion } from 'framer-motion';

export default function OptionButton({
  letter,
  text,
  isSelected = false,
  isCorrect = false,
  revealState = 'WAITING_FOR_SELECTION', // 'WAITING_FOR_SELECTION' | 'SELECTED' | 'REVEALED'
  onClick,
  disabled = false
}) {
  
  let containerClasses = "relative w-full flex items-center gap-4 p-4 rounded bg-cyan-950/20 border border-cyan-900/50 text-left font-sans text-lg md:text-xl transition-all duration-300";
  let badgeClasses = "w-10 h-10 shrink-0 rounded flex items-center justify-center font-bold text-lg border transition-colors";
  let textClasses = "text-white font-medium";
  let statusIcon = null;

  const isRevealed = revealState === 'REVEALED';

  if (isRevealed) {
    if (isCorrect) {
      containerClasses = "relative w-full flex items-center gap-4 p-4 rounded bg-green-950/40 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-left font-sans text-lg md:text-xl transition-all duration-300 transform scale-[1.02]";
      badgeClasses = "w-10 h-10 shrink-0 rounded flex items-center justify-center font-bold text-lg border-green-500 bg-green-500 text-black";
      textClasses = "text-green-50 font-bold";
      statusIcon = (
        <span className="ml-auto text-green-400 font-bold tracking-widest text-sm flex items-center gap-2 animate-pulse">
          ✓ CORRECT ANSWER
        </span>
      );
    } else if (isSelected) {
      containerClasses = "relative w-full flex items-center gap-4 p-4 rounded bg-red-950/40 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-left font-sans text-lg md:text-xl transition-all duration-300";
      badgeClasses = "w-10 h-10 shrink-0 rounded flex items-center justify-center font-bold text-lg border-red-500 bg-red-500 text-white";
      textClasses = "text-red-100 font-bold";
      statusIcon = (
        <span className="ml-auto text-red-500 font-bold tracking-widest text-sm flex items-center gap-2">
          ✕ INCORRECT
        </span>
      );
    } else {
      // Dimmed wrong options
      containerClasses = "relative w-full flex items-center gap-4 p-4 rounded bg-black/40 border border-gray-800 text-left font-sans text-lg md:text-xl opacity-40 transition-all duration-300";
      badgeClasses = "w-10 h-10 shrink-0 rounded flex items-center justify-center font-bold text-lg border-gray-700 text-gray-500";
      textClasses = "text-gray-500";
    }
  } else if (isSelected) {
    // Selected but not revealed
    containerClasses = "relative w-full flex items-center gap-4 p-4 rounded bg-cyan-900/40 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-left font-sans text-lg md:text-xl transition-all duration-300";
    badgeClasses = "w-10 h-10 shrink-0 rounded flex items-center justify-center font-bold text-lg border-cyan-400 bg-cyan-500 text-black";
    textClasses = "text-cyan-50 font-bold";
    statusIcon = (
      <span className="ml-auto text-cyan-400 font-bold tracking-widest text-sm uppercase">
        SELECTED
      </span>
    );
  } else {
    // Default Hover
    if (!disabled) {
       containerClasses += " hover:bg-cyan-900/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:scale-[1.01]";
       badgeClasses += " border-cyan-900/50 text-cyan-500";
    } else {
       badgeClasses += " border-cyan-900/50 text-cyan-500/50";
       textClasses = "text-white/50 font-medium";
    }
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isRevealed}
      whileTap={!disabled && !isRevealed ? { scale: 0.98 } : {}}
      className={containerClasses}
    >
      <div className={badgeClasses}>{letter}</div>
      <span className={textClasses}>{text}</span>
      {statusIcon}
    </motion.button>
  );
}
