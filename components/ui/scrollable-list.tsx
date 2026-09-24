"use client";

import React, { useRef } from "react";

interface ScrollableListProps {
  children: React.ReactNode;
  maxItems: number;
  className?: string;
  itemHeight?: number;
}

export function ScrollableList({ 
  children, 
  maxItems, 
  className = "", 
  itemHeight = 60 
}: ScrollableListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate height based on maxItems
  const containerHeight = maxItems * itemHeight;

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={scrollRef}
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 max-h-[25vh] sm:max-h-[30vh] md:max-h-[35vh] lg:max-h-[40vh] xl:max-h-[45vh]"
        style={{
          height: `${containerHeight}px`,
        }}
      >
        {children}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
