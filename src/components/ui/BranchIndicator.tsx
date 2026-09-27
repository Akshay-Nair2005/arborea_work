'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Compass, Maximize2, X } from 'lucide-react';
import { branches, BranchStoryData } from '@/data/branches';
import { TimelineSnapshot } from '@/data/experience';

interface BranchIndicatorProps {
  timeline: TimelineSnapshot;
  selectedModalBranch: BranchStoryData | null;
  onCloseModal: () => void;
  onSelectModalBranch: (branch: BranchStoryData) => void;
  onJumpToBranchIndex: (index: number) => void;
}

export function BranchIndicator({
  timeline,
  selectedModalBranch,
  onCloseModal,
  onSelectModalBranch,
  onJumpToBranchIndex,
}: BranchIndicatorProps) {
  const activeIdx = timeline.activeBranchIndex;
  const activeBranch = activeIdx >= 0 ? branches[activeIdx] : null;

  return (
    <>
      {/* Minimal Branch Counter & Navigation Rail (Active during Branch Exploration 71% -> 95%) */}
      {activeBranch && (
        <div className="pointer-events-none fixed inset-x-0 bottom-14 top-20 z-20 flex flex-col justify-between px-6 md:px-12">
          {/* Top-Right Branch Counter: 01 / 05 */}
          <div className="flex justify-end">
            <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-[#d4af37]/30 bg-[#070b08]/80 px-4 py-2 backdrop-blur-md">
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#e5c992]">
                BRANCH {activeBranch.index} / {String(branches.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1.5">
                {branches.map((b, idx) => {
                  const isCurrent = idx === activeIdx;
                  return (
                    <React.Fragment key={b.id}>
                      <button
                        onClick={() => onJumpToBranchIndex(idx)}
                        className={`px-1.5 py-0.5 font-mono text-[10px] tracking-[0.15em] transition-all ${
                          isCurrent
                            ? 'text-[#f5e6c8] underline decoration-[#d4af37] underline-offset-4'
                            : 'text-[#7c877e] hover:text-white'
                        }`}
                        aria-label={`Travel to ${b.title}`}
                      >
                        {b.index}
                      </button>
                      {idx < branches.length - 1 && (
                        <span className="text-[10px] text-white/20">──</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right-Side Editorial Companion Plaque (Supports Screen Readers, Keyboard & Deep Reading) */}
          <div className="flex items-end justify-end">
            <article
              aria-live="polite"
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/12 bg-[#070b08]/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5c992]">
                  {activeBranch.category} · {activeBranch.year}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-[#84cc8e]">
                  <Compass className="h-3 w-3" />
                  {activeBranch.metadata.coordinates}
                </span>
              </div>

              <h2 className="mt-3 font-display text-2xl italic text-[#f4efe4] sm:text-3xl">
                “{activeBranch.title}”
              </h2>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#9ba89d]">
                {activeBranch.subtitle}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-[#c9d2cb] sm:text-sm">
                {activeBranch.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 font-mono text-[10px]">
                <div>
                  <span className="block text-[#7c877e]">ELEVATION</span>
                  <span className="text-[#e5ece6]">{activeBranch.metadata.elevation}</span>
                </div>
                <div>
                  <span className="block text-[#7c877e]">SPECIMEN</span>
                  <span className="text-[#e5ece6]">{activeBranch.metadata.specimen}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectModalBranch(activeBranch)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/15 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#f5e6c8] transition-all hover:bg-[#d4af37]/30"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  {activeBranch.ctaLabel}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onJumpToBranchIndex(
                        (activeIdx - 1 + branches.length) % branches.length
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#c9d2cb] transition-colors hover:border-white/30 hover:text-white"
                    aria-label="Previous branch"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      onJumpToBranchIndex((activeIdx + 1) % branches.length)
                    }
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#c9d2cb] transition-colors hover:border-white/30 hover:text-white"
                    aria-label="Next branch"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* High-Resolution Archival Print & Story Modal when user clicks a 3D Hanging Card or CTA */}
      {selectedModalBranch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-branch-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md sm:p-8"
          onClick={onCloseModal}
        >
          <div
            className="relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl border border-[#d4af37]/35 bg-[#0a0f0b] shadow-2xl md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Archival Framed Print Preview */}
            <div className="relative flex items-center justify-center bg-[#121613] p-6 sm:p-8">
              <div className="overflow-hidden rounded-lg border-4 border-[#2b251b] bg-[#f4efe4] p-3 shadow-2xl">
                <Image
                  src={selectedModalBranch.image}
                  alt={selectedModalBranch.title}
                  width={600}
                  height={800}
                  className="h-72 w-full object-cover sm:h-96"
                />
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#5c5549]">
                  <span>{selectedModalBranch.category}</span>
                  <span>{selectedModalBranch.metadata.specimen}</span>
                </div>
              </div>
            </div>

            {/* Archival Story Details */}
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                    {selectedModalBranch.category} · {selectedModalBranch.year}
                  </span>
                  <button
                    onClick={onCloseModal}
                    className="rounded-full border border-white/15 p-2 text-[#9ba89d] transition-colors hover:border-white/40 hover:text-white"
                    aria-label="Close specimen inspection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <h2
                  id="modal-branch-title"
                  className="mt-4 font-display text-3xl italic text-[#f4efe4] sm:text-4xl"
                >
                  “{selectedModalBranch.title}”
                </h2>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-[#84cc8e]">
                  {selectedModalBranch.subtitle}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-[#d7dfd9]">
                  {selectedModalBranch.description}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#9ba89d]">
                  {selectedModalBranch.extendedStory}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 font-mono text-xs">
                  <div>
                    <dt className="text-[10px] text-[#7c877e]">ELEVATION</dt>
                    <dd className="mt-0.5 text-[#f3efe6]">
                      {selectedModalBranch.metadata.elevation}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#7c877e]">EPOCH</dt>
                    <dd className="mt-0.5 text-[#f3efe6]">
                      {selectedModalBranch.metadata.epoch}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#7c877e]">SPECIMEN</dt>
                    <dd className="mt-0.5 text-[#f3efe6]">
                      {selectedModalBranch.metadata.specimen}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#7c877e]">COORDINATES</dt>
                    <dd className="mt-0.5 text-[#f3efe6]">
                      {selectedModalBranch.metadata.coordinates}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  onClick={() => {
                    const currIdx = branches.findIndex(
                      (b) => b.id === selectedModalBranch.id
                    );
                    const prev =
                      branches[(currIdx - 1 + branches.length) % branches.length];
                    onSelectModalBranch(prev);
                    onJumpToBranchIndex(
                      (currIdx - 1 + branches.length) % branches.length
                    );
                  }}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#c9d2cb] hover:text-[#f5e6c8]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> PREV BRANCH
                </button>

                <button
                  onClick={() => {
                    const currIdx = branches.findIndex(
                      (b) => b.id === selectedModalBranch.id
                    );
                    const next = branches[(currIdx + 1) % branches.length];
                    onSelectModalBranch(next);
                    onJumpToBranchIndex((currIdx + 1) % branches.length);
                  }}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#e5c992] hover:text-[#f5e6c8]"
                >
                  NEXT BRANCH <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
