import React from 'react';

/**
 * OptionButton — used by both quizmaster and projector.
 * 
 * Props:
 *   letter, text        — display
 *   isCorrect           — whether this is the correct option (from data)
 *   revealCorrect       — whether we're allowed to SHOW correct/incorrect highlights
 *   isSelected           — whether a team selected this (unused in projector mode)
 *   showResult           — legacy compat: whether answer has been locked in
 *   onClick, disabled    — interaction
 *   neutral              — force neutral styling (projector before reveal)
 */
export default function OptionButton({
  letter,
  text,
  isSelected = false,
  isCorrect = false,
  showResult = false,
  revealCorrect = false,
  onClick,
  disabled = false,
  neutral = false
}) {
  let buttonStyle = 'border-white/8 bg-slate-950/40 text-gray-200 hover:bg-slate-900/50 hover:border-white/20 active:scale-[0.99]';
  let badgeStyle = 'bg-white/10 text-gray-300';
  let icon = null;

  // ponytail: only show highlights when explicitly told to reveal
  const shouldReveal = showResult && revealCorrect && !neutral;

  if (shouldReveal) {
    if (isCorrect) {
      buttonStyle = 'border-emerald-500/50 bg-emerald-950/30 text-emerald-100 ring-2 ring-emerald-500/30 neon-glow-teal';
      badgeStyle = 'bg-emerald-500 text-white';
      icon = (
        <div className="flex items-center gap-1.5 text-emerald-400 font-display font-bold text-xs">
          <span>Correct</span>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (isSelected) {
      buttonStyle = 'border-red-500/50 bg-red-950/30 text-red-100 ring-2 ring-red-500/30 neon-glow-red';
      badgeStyle = 'bg-red-500 text-white';
      icon = (
        <div className="flex items-center gap-1.5 text-red-400 font-display font-bold text-xs">
          <span>Incorrect</span>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    } else {
      buttonStyle = 'border-white/5 bg-slate-950/10 text-gray-500 opacity-40 cursor-not-allowed';
      badgeStyle = 'bg-white/5 text-gray-600';
    }
  } else if (disabled && !neutral) {
    // Answered but not revealed yet — keep neutral but non-interactive
    buttonStyle = 'border-white/8 bg-slate-950/40 text-gray-300 cursor-not-allowed';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left font-sans text-sm md:text-base font-semibold transition-all duration-300 pointer-events-auto outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:border-transparent ${buttonStyle}`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-display font-bold text-xs md:text-sm ${badgeStyle}`}>
          {letter}
        </span>
        <span className="leading-tight">{text}</span>
      </div>
      {icon}
    </button>
  );
}
