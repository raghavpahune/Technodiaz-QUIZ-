import React from 'react';

export default function CollegeBadge({ className = '' }) {
  // Respects Vite's base path for dev server vs production repo path
  const badgeUrl = `${import.meta.env.BASE_URL}badge.jpeg`;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={badgeUrl}
        alt="Technodiaz Logo"
        className="w-10 h-10 md:w-12 h-12 object-contain rounded-full border border-yellow-500/25 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.3)] bg-slate-900"
      />
      <div className="flex flex-col text-left">
        <span className="font-display font-black text-xs md:text-sm tracking-wider text-yellow-500 uppercase leading-none">
          Technodiaz
        </span>
        <span className="font-sans font-medium text-[9.5px] md:text-[10px] text-gray-400 tracking-widest uppercase leading-none mt-1">
          Quiz Competition
        </span>
      </div>
    </div>
  );
}
