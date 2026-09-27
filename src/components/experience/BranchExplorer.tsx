'use client';

import React from 'react';
import { finaleCards } from '@/data/branches';
import { HangingCard } from './HangingCard';
import { ScrollStateRef } from '@/hooks/useScrollProgress';

interface BranchExplorerProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  reducedMotion: boolean;
  onSelectBranch: (branch: any) => void;
}

export function BranchExplorer({ scrollRef, reducedMotion, onSelectBranch }: BranchExplorerProps) {
  return (
    <group name="branch-chronicle-cards">
      {finaleCards.map((branch, index) => (
        <HangingCard
          key={branch.id}
          branch={branch}
          index={index}
          scrollRef={scrollRef}
          reducedMotion={reducedMotion}
          onSelectBranch={onSelectBranch}
        />
      ))}
    </group>
  );
}