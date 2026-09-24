"use client";

import React from 'react';

const ColorLegend: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-4 px-4 py-3 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 rounded-lg border border-border/60 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 text-[0.75rem]">
        <span className="font-semibold text-foreground mr-2">Color legend:</span>
        
        {/* Sort (Yes) - Green */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-green-400/50 bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-teal-500/10"></div>
          <span className="text-muted-foreground font-medium">Sort</span>
        </div>

        {/* No Sort - Red */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-red-400/50 bg-gradient-to-br from-red-500/15 via-rose-500/10 to-pink-500/10"></div>
          <span className="text-muted-foreground font-medium">No Sort</span>
        </div>

        {/* Adhoc - Orange */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-orange-400/50 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-yellow-500/10"></div>
          <span className="text-muted-foreground font-medium">Adhoc Service</span>
        </div>

        {/* Submitted - Gray */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-slate-400/50 bg-gradient-to-br from-slate-500/15 via-slate-400/10 to-slate-500/10"></div>
          <span className="text-muted-foreground font-medium">Submitted</span>
        </div>

        {/* Finished - White */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-slate-300 bg-white shadow-sm"></div>
          <span className="text-muted-foreground font-medium">Finished</span>
        </div>
      </div>
    </div>
  );
};

export default ColorLegend;

