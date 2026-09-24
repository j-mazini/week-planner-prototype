"use client";

import React from 'react';

export const SuccessAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] opacity-0 animate-[fadeIn_0.2s_forwards]">
      <div className="w-[120px] h-[120px] p-2.5 bg-green-500 rounded-full animate-scale-in-checkmark shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-visible">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
          strokeWidth={5}
          stroke="currentColor"
          strokeMiterlimit={10}
        >
          <circle 
            className="stroke-[#7db043] fill-none animate-stroke-circle"
            cx="26" 
            cy="26" 
            r="25"
            strokeDasharray={166}
            strokeDashoffset={166}
          />
          <path
            className="stroke-white fill-none origin-center animate-stroke-check"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
            strokeDasharray={48}
            strokeDashoffset={48}
          />
        </svg>
      </div>
    </div>
  );
};

