import React from 'react';

/**
 * Circular countdown timer with animated ring.
 * Props: seconds, total, running, size ('sm' | 'md' | 'lg')
 */
export default function TimerDisplay({ seconds, total, running, size = 'md' }) {
  const fraction = total > 0 ? seconds / total : 0;
  const isLow = seconds <= 5 && seconds > 0;
  const isZero = seconds <= 0;

  const dims = { sm: 64, md: 96, lg: 128 }[size] || 96;
  const stroke = size === 'sm' ? 4 : 6;
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);

  const textSize = { sm: 'text-lg', md: 'text-3xl', lg: 'text-5xl' }[size] || 'text-3xl';

  return (
    <div className="relative flex items-center justify-center" style={{ width: dims, height: dims }}>
      <svg width={dims} height={dims} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={dims / 2} cy={dims / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={dims / 2} cy={dims / 2} r={radius}
          fill="none"
          stroke={isZero ? '#ef4444' : isLow ? '#f59e0b' : '#10b981'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className={`absolute ${textSize} font-display font-black ${
        isZero ? 'text-red-400' : isLow ? 'text-yellow-400 animate-pulse' : 'text-white'
      }`}>
        {String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
