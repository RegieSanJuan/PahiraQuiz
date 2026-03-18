'use client';

import React, { useEffect, useState } from 'react';
import { initializeBoard, isGameComplete } from '@/lib/game-logic';
import type { GameBoard as GameBoardType, Word } from '@/lib/game-logic';
import { FinalReveal } from '@/components/final-reveal';
import { GameBoard } from '@/components/game-board';
import { WordList } from '@/components/word-list';

const instructions = [
  'Mag-click ka lang sa isang letter, then drag mo sa katabing letter para makabuo ng word.',
  'Puwede siyang pahiga, pababa, or pakanto, so kebs basta magkadikit sila.',
  'Hanapin mo lahat ng naka-hide na words para ma-reveal yung full love message, syempre.',
  'Every time may tama kang word, magli-light up siya sa puzzle like the main character that it is.',
];

const moodBadges = ['cutie-only mode', 'funny colors only', 'zero pink energy'];
const FAILED_ATTEMPTS_FOR_HINT = 5;

export default function Home() {
  const [gameBoard, setGameBoard] = useState<GameBoardType | null>(null);
  const [solvedWords, setSolvedWords] = useState<Set<string>>(new Set());
  const [showReveal, setShowReveal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [hintWord, setHintWord] = useState<Word | null>(null);

  useEffect(() => {
    const board = initializeBoard();
    setGameBoard(board);
  }, []);

  useEffect(() => {
    if (!gameBoard || failedAttempts < FAILED_ATTEMPTS_FOR_HINT) {
      return;
    }

    const unsolvedWords = gameBoard.words.filter((word) => !solvedWords.has(word.text));
    if (unsolvedWords.length === 0) {
      return;
    }

    const freshHintOptions = unsolvedWords.filter((word) => word.text !== hintWord?.text);
    const hintPool = freshHintOptions.length > 0 ? freshHintOptions : unsolvedWords;
    const nextHint = hintPool[Math.floor(Math.random() * hintPool.length)];

    setHintWord(nextHint);
    setFailedAttempts(0);
  }, [failedAttempts, gameBoard, hintWord, solvedWords]);

  const handleWordFound = (wordText: string) => {
    setFailedAttempts(0);
    setHintWord(null);

    setSolvedWords((prev) => {
      const newSolved = new Set(prev);
      newSolved.add(wordText);

      if (gameBoard && isGameComplete(newSolved, gameBoard.words)) {
        setTimeout(() => setShowReveal(true), 300);
      }

      return newSolved;
    });
  };

  const handleFailedAttempt = () => {
    setFailedAttempts((prev) => prev + 1);
  };

  const handleReset = () => {
    const board = initializeBoard();
    setGameBoard(board);
    setSolvedWords(new Set());
    setShowReveal(false);
    setGameStarted(false);
    setFailedAttempts(0);
    setHintWord(null);
  };

  if (!gameBoard) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        <div className="pointer-events-none absolute -left-8 top-10 h-52 w-52 rounded-full bg-secondary/50 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative rounded-[2rem] border-2 border-foreground/10 bg-card/90 px-10 py-8 text-center shadow-[0_24px_80px_rgba(19,31,67,0.14)] backdrop-blur">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-secondary/70 px-4 py-2">
            <span className="h-3 w-3 animate-bounce rounded-full bg-primary" />
            <span className="h-3 w-3 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
            <span className="h-3 w-3 animate-bounce rounded-full bg-foreground [animation-delay:240ms]" />
          </div>
          <p className="text-lg font-semibold text-foreground">Loading the cutie word hunt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-10 top-6 h-56 w-56 rounded-full bg-secondary/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-6">
        {!gameStarted ? (
          <section className="relative w-full rounded-[2.25rem] border-2 border-foreground/10 bg-card/90 p-6 shadow-[0_24px_80px_rgba(19,31,67,0.16)] backdrop-blur sm:p-10">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              {moodBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-foreground/10 bg-background/80 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="text-center lg:text-left">
                <span className="inline-flex rounded-full bg-secondary px-4 py-2 text-sm font-black uppercase tracking-[0.28em] text-secondary-foreground shadow-sm">
                  Tiny landi puzzle
                </span>
                <h1 className="mt-5 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Laruin mo to my very own cutie
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  May pa-word hunt ako for you kasi plain intros are boring, and ikaw obviously deserve something more fun.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm">
                    medyo sweet
                  </span>
                  <span className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-sm">
                    medyo chaotic
                  </span>
                  <span className="rounded-full bg-background px-4 py-2 text-sm font-bold text-foreground shadow-sm">
                    very ikaw
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -right-4 -top-4 h-24 w-24 rotate-12 rounded-[1.5rem] bg-accent/70 blur-2xl" />
                <div className="relative rounded-[1.9rem] border-2 border-foreground/10 bg-background/85 p-6 shadow-[0_18px_50px_rgba(19,31,67,0.12)]">
                  <h2 className="text-2xl font-black text-foreground sm:text-3xl">Paano Maglaro:</h2>
                  <ol className="mt-6 space-y-4">
                    {instructions.map((instruction, index) => (
                      <li
                        key={instruction}
                        className="flex items-start gap-4 rounded-[1.4rem] border border-border bg-card/80 p-4"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-black text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="text-base leading-relaxed text-foreground">
                          {instruction}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <button
                    onClick={() => setGameStarted(true)}
                    className="mt-8 w-full rounded-[1.35rem] bg-primary px-6 py-4 text-lg font-black tracking-[0.08em] text-primary-foreground shadow-[0_18px_32px_rgba(19,31,67,0.2)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(19,31,67,0.24)]"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="w-full py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-muted-foreground">
                  Word hunt mode
                </p>
                <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                  Go find the hidden kilig words
                </h2>
              </div>
              <div className="rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-bold text-foreground shadow-sm">
                {solvedWords.size} of {gameBoard.words.length} words found
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-[1.9rem] border-2 border-foreground/10 bg-card/90 p-6 shadow-[0_20px_60px_rgba(19,31,67,0.14)] backdrop-blur">
                  <h3 className="text-center text-2xl font-black text-foreground sm:text-3xl">
                    Hanapin mo na
                  </h3>
                  <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                    Drag lang nang drag, tapos let the cutie instincts do the rest.
                  </p>

                  <div className="mt-6">
                    <GameBoard
                      gameBoard={gameBoard}
                      onWordFound={handleWordFound}
                      onFailedAttempt={handleFailedAttempt}
                      solvedWords={solvedWords}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6 rounded-[1.9rem] border-2 border-foreground/10 bg-card/90 p-6 shadow-[0_20px_60px_rgba(19,31,67,0.14)] backdrop-blur">
                  <WordList
                    words={gameBoard.words}
                    solvedWords={solvedWords}
                    hintWord={hintWord}
                  />

                  <div className="mt-8 border-t border-border pt-6">
                    <p className="mb-4 text-sm font-medium text-muted-foreground">
                      {solvedWords.size === gameBoard.words.length
                        ? 'Slay. Kumpleto mo na yung puzzle.'
                        : `${gameBoard.words.length - solvedWords.size} words pa, kaya mo 'yan.`}
                    </p>
                    <button
                      onClick={handleReset}
                      className="w-full rounded-[1.15rem] bg-secondary px-4 py-3 font-bold text-secondary-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-secondary/85"
                    >
                      Back to Start
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FinalReveal isVisible={showReveal} onClose={handleReset} />
    </div>
  );
}
