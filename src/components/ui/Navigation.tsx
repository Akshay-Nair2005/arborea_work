'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Eye } from 'lucide-react';
import { EXPERIENCE_STAGES, TimelineSnapshot } from '@/data/experience';
import { audioEngine } from '@/lib/audioEngine';

interface NavigationProps {
  timeline: TimelineSnapshot;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onJumpToProgress: (target: number) => void;
}

export function Navigation({
  timeline,
  reducedMotion,
  onToggleReducedMotion,
  onJumpToProgress,
}: NavigationProps) {
  const [audioOn, setAudioOn] = useState(false);

  const handleToggleAudio = () => {
    const nextState = audioEngine.toggle();
    setAudioOn(nextState);
  };

  const navWaypoints = [
    { label: '01 Sapling', target: 0.04 },
    { label: '02 Stem', target: 0.24 },
    { label: '03 Young', target: 0.44 },
    { label: '04 Crown', target: 0.64 },
    { label: '05 Branches', target: 0.735 },
    { label: '06 Finale', target: 0.985 },
  ];

  const activeStage = EXPERIENCE_STAGES[timeline.stageIndex] || EXPERIENCE_STAGES[0];

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-10 md:py-7">
      {/* Left: Minimal Brand Mark & Live Camera Scale Telemetry */}
      <div className="pointer-events-auto flex items-center gap-4">
        <button
          onClick={() => onJumpToProgress(0)}
          className="group flex items-center gap-3 text-left focus:outline-none"
          aria-label="Return to microscopic origin"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#0b120d]/80 text-xs text-[#e5c992] transition-colors group-hover:border-[#d4af37]">
            ✦
          </span>
          <div>
            <span className="block font-display text-lg tracking-[0.22em] text-[#f3efe6]">
              ARBOREA
            </span>
            <span className="block font-mono text-[10px] tracking-[0.2em] text-[#9ba89d]">
              LIVING 3D ARCHIVE
            </span>
          </div>
        </button>

        <div className="hidden h-5 w-[1px] bg-white/10 sm:block" />

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#070b08]/70 px-3 py-1 backdrop-blur-md sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#84cc8e] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c7d2c8]">
            LENS · {timeline.cameraScale}
          </span>
        </div>
      </div>

      {/* Center: Whisper-quiet Stage Waypoints (Desktop) */}
      <nav
        aria-label="Experience stages"
        className="pointer-events-auto hidden items-center gap-1 rounded-full border border-white/10 bg-[#070b08]/65 px-2 py-1 backdrop-blur-md lg:flex"
      >
        {navWaypoints.map((wp, idx) => {
          const isActive = timeline.stageIndex === idx;
          return (
            <button
              key={wp.label}
              onClick={() => onJumpToProgress(wp.target)}
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-all ${
                isActive
                  ? 'bg-[#d4af37]/20 text-[#f5e6c8] border border-[#d4af37]/40'
                  : 'text-[#8c968e] hover:text-[#e5ece6]'
              }`}
            >
              {wp.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Audio & Reduced Motion Controls */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-[#8c968e] xl:inline-block">
          {activeStage.stageNumber}
        </span>

        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] backdrop-blur-md transition-all ${
            audioOn
              ? 'border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f5e6c8]'
              : 'border-white/10 bg-[#070b08]/70 text-[#9ba89d] hover:border-white/25 hover:text-white'
          }`}
          aria-pressed={audioOn}
          aria-label={audioOn ? 'Mute forest ambience' : 'Enable spatial forest audio'}
        >
          {audioOn ? <Volume2 className="h-3.5 w-3.5 text-[#e5c992]" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{audioOn ? 'SOUND ON' : 'SOUND'}</span>
        </button>

        <button
          onClick={onToggleReducedMotion}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] backdrop-blur-md transition-all ${
            reducedMotion
              ? 'border-[#84cc8e]/50 bg-[#84cc8e]/15 text-[#d8f3dc]'
              : 'border-white/10 bg-[#070b08]/70 text-[#9ba89d] hover:border-white/25 hover:text-white'
          }`}
          aria-pressed={reducedMotion}
          title="Toggle reduced motion accessibility mode"
        >
          {reducedMotion ? <Eye className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          <span className="hidden md:inline">
            {reducedMotion ? 'CALM MOTION' : 'CINEMA MOTION'}
          </span>
        </button>
      </div>
    </header>
  );
}
