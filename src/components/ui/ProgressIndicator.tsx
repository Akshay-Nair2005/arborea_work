'use client';

import React from 'react';
import { TimelineSnapshot } from '@/data/experience';
import { EXPERIENCE_STAGES } from '@/data/experience';

interface ProgressIndicatorProps {
  timeline: TimelineSnapshot;
  onJumpToProgress: (progress: number) => void;
}

export function ProgressIndicator({
  timeline,
  onJumpToProgress,
}: ProgressIndicatorProps) {
  const activeIdx = timeline.stageIndex;
  const isFinale = timeline.scrollProgress >= 0.94;

  return (
    <>
      {/* Left Hairline Stage Navigation Dots */}
      <aside
        aria-label="Experience stages"
        className="pointer-events-none fixed left-8 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-start gap-5 md:flex"
      >
        <div className="flex flex-col gap-5">
          {EXPERIENCE_STAGES.map((stg, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={stg.id}
                onClick={() => onJumpToProgress(stg.scrollRange[0] + 0.01)}
                className="pointer-events-auto group flex items-center gap-3 text-left focus:outline-none"
              >
                <div
                  className={`h-2 w-2 rounded-full border transition-all duration-300 ${
                    isActive
                      ? 'border-[#ffe18a] bg-[#ffe18a] shadow-[0_0_8px_#ffe18a]'
                      : 'border-white/30 bg-transparent group-hover:border-white/60'
                  }`}
                />
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 ${
                    isActive ? 'text-[#ffe18a] font-semibold' : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  {stg.stageNumber}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Floating Bottom Card: Only visible during early growth stages (01-05), HIDDEN during Finale */}
      {!isFinale && timeline.activeBranchIndex === -1 && (
        <div className="pointer-events-none fixed bottom-10 left-1/2 z-20 -translate-x-1/2 text-center">
          <div className="rounded-xl border border-white/10 bg-black/60 px-6 py-4 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#e5c992]">
              {EXPERIENCE_STAGES[activeIdx]?.subheadline || ''}
            </p>
            <h2 className="mt-1 font-serif text-xl italic text-white/90">
              {EXPERIENCE_STAGES[activeIdx]?.headline || ''}
            </h2>
          </div>
        </div>
      )}
    </>
  );
}