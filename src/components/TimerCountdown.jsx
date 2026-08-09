import React from 'react';
import { motion } from 'framer-motion';

export default function TimerCountdown({ seconds, total }) {
  const percentage = (seconds / total) * 100;
  
  let color = 'bg-cyan-400';
  let textColor = 'text-cyan-400';
  let shadow = 'shadow-[0_0_15px_rgba(34,211,238,0.5)]';
  let pulse = false;

  if (seconds <= 10 && seconds > 5) {
    color = 'bg-yellow-400';
    textColor = 'text-yellow-400';
    shadow = 'shadow-[0_0_20px_rgba(250,204,21,0.6)]';
    pulse = true;
  } else if (seconds <= 5 && seconds > 0) {
    color = 'bg-red-500';
    textColor = 'text-red-500';
    shadow = 'shadow-[0_0_25px_rgba(239,68,68,0.8)]';
    pulse = true;
  } else if (seconds === 0) {
    color = 'bg-red-900';
    textColor = 'text-red-600';
    shadow = '';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] tracking-[0.3em] text-gray-500 mb-2 font-mono">T-MINUS</div>
      <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-cyan-900/50 bg-black/50 ${pulse ? 'animate-pulse' : ''}`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="rgba(0, 255, 255, 0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="276"
            strokeDashoffset={276 - (276 * percentage) / 100}
            className={`${textColor} transition-all duration-1000 ease-linear`}
            style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
          />
        </svg>
        <span className={`text-4xl font-black font-mono tracking-tighter ${textColor}`}>
          {seconds}
        </span>
      </div>
      {seconds === 0 && (
        <div className="mt-4 text-xs font-bold text-red-500 tracking-widest uppercase animate-bounce">
          TIME EXPIRED<br/>ANSWER LOCKED
        </div>
      )}
    </div>
  );
}
