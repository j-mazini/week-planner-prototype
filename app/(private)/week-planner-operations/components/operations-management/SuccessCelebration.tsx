"use client";

import React from "react";
import type { ConfettiPiece } from "../../types/operations-management";

type Props = { show: boolean; confettiPieces: ConfettiPiece[] };

export const SuccessCelebration = React.memo(function SuccessCelebration({ show, confettiPieces }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] opacity-0 animate-[fadeIn_0.2s_forwards]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {confettiPieces.map((p, i) => (
            <span
              key={i}
              className="absolute w-2 h-3.5 -translate-y-5 rotate-0"
              style={{
                left: `${p.left}vw`,
                top: "-10px",
                backgroundColor: p.color,
                opacity: p.opacity,
                animation: `confettiFallRotate ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards, confettiRotate ${p.duration}s linear ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_12px_30px_rgba(5,150,105,0.45),inset_0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center animate-badge-pop animate-badge-glow relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_70%)] before:animate-rotate-glow">
          <svg
            className="w-[84px] h-[84px] text-white animate-icon-pop"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>
    </div>
  );
});


