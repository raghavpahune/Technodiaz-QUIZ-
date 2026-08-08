import React from 'react';

export default function ProgressBar({ current, total, color = 'purple' }) {
  const percentage = Math.min(((current) / total) * 100, 100);

  // Color theme mapper for the progress bar glow
  const colorMap = {
    red: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    teal: 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]',
    bronze: 'bg-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.6)]',
    purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    blue: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]',
  };

  const activeBarClass = colorMap[color] || colorMap.purple;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs md:text-sm font-display tracking-wider">
        <span className="text-gray-400 font-medium">Progress</span>
        <span className="text-gray-200 font-bold">{current} / {total} Questions</span>
      </div>
      <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${activeBarClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
