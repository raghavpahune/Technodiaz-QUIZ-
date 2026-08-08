import React from 'react';

export default function CollegeBadge({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Sharp Vector Crest SVG */}
      <svg
        className="w-10 h-10 md:w-12 h-12 text-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Border */}
        <path
          d="M50 5L15 25V55C15 75 35 90 50 95C65 90 85 75 85 55V25L50 5Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(15, 23, 42, 0.6)"
        />
        {/* Shield Inner Gold Line */}
        <path
          d="M50 12L22 29V53C22 69 38 82 50 86C62 82 78 69 78 53V29L50 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Academic Torch */}
        <path
          d="M50 35V65M45 42H55M48 65H52"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Flame */}
        <path
          d="M50 22C53 26 55 29 55 32C55 35 52 37 50 37C48 37 45 35 45 32C45 29 47 26 50 22Z"
          fill="currentColor"
        />
        {/* Inner Details / Stars */}
        <circle cx="35" cy="45" r="3" fill="currentColor" />
        <circle cx="65" cy="45" r="3" fill="currentColor" />
        <circle cx="50" cy="72" r="3" fill="currentColor" />
      </svg>
      <div className="flex flex-col text-left">
        <span className="font-display font-black text-xs md:text-sm tracking-wider text-yellow-500 uppercase leading-none">
          Chrono Health
        </span>
        <span className="font-sans font-medium text-[9px] md:text-[10px] text-gray-400 tracking-widest uppercase leading-none mt-1">
          Quiz Championship
        </span>
      </div>
    </div>
  );
}
