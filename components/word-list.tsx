'use client';

import React from 'react';
import { Word } from '@/lib/game-logic';

interface WordListProps {
  words: Word[];
  solvedWords: Set<string>;
  hintWord: Word | null;
}

export function WordList({ words, solvedWords, hintWord }: WordListProps) {
  const completion = words.length === 0 ? 0 : (solvedWords.size / words.length) * 100;

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-[1.6rem] border border-border bg-background/80 p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-muted-foreground">
          Hard mode
        </p>
        <p className="mt-3 text-lg font-black leading-relaxed text-foreground">
          Find very cutie words, parang ikaw beh Kath.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Walang spoiler list today, so trust the kilig instincts.
        </p>
      </div>

      {hintWord && (
        <div className="mt-4 rounded-[1.6rem] border border-accent bg-accent/25 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-accent-foreground/80">
            Clue unlocked
          </p>
          <p className="mt-3 text-lg font-black leading-relaxed text-accent-foreground">
            {hintWord.clue}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-accent-foreground/80">
            Ayan na beh, one word clue muna.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-[1.4rem] border border-border bg-muted/80 p-4">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted-foreground">
          <span>Progress mo</span>
          <span>
            {solvedWords.size} / {words.length}
          </span>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-background/70">
          <div
            className="h-3 rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
