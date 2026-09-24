"use client";

import React from 'react';

const ColorLegend: React.FC = () => {
  return (
    <div className="w-full mb-4 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 text-[0.75rem]">
        <span className="font-semibold text-slate-700 mr-2">Color Legend:</span>
        
        {/* Deposit - Blue */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-blue-400 bg-gradient-to-br from-blue-500 to-indigo-500"></div>
          <span className="text-slate-600 font-medium">Deposit</span>
        </div>

        {/* Service Type - Indigo */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-indigo-300 bg-indigo-100"></div>
          <span className="text-slate-600 font-medium">Service Type</span>
        </div>

        {/* Loop - Slate */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-slate-300 bg-slate-100"></div>
          <span className="text-slate-600 font-medium">Loop</span>
        </div>

        {/* Route Active - Emerald */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-emerald-300 bg-emerald-100"></div>
          <span className="text-slate-600 font-medium">Route (Active)</span>
        </div>

        {/* Route Inactive - Rose */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-rose-300 bg-rose-100"></div>
          <span className="text-slate-600 font-medium">Route (Inactive)</span>
        </div>
      </div>
    </div>
  );
};

export default ColorLegend;



