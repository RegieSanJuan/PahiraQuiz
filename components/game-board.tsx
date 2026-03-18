'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  GameBoard as GameBoardType,
  Position,
  checkIfWordValid,
  getSelectedWord,
} from '@/lib/game-logic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameBoard: GameBoardType;
  onWordFound: (wordText: string) => void;
  onFailedAttempt: () => void;
  solvedWords: Set<string>;
}

function getLinePath(start: Position, end: Position): Position[] | null {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);

  const isHorizontal = rowDiff === 0 && absColDiff > 0;
  const isVertical = colDiff === 0 && absRowDiff > 0;
  const isDiagonal = absRowDiff === absColDiff && absRowDiff > 0;

  if (!isHorizontal && !isVertical && !isDiagonal) {
    return null;
  }

  const stepRow = Math.sign(rowDiff);
  const stepCol = Math.sign(colDiff);
  const length = Math.max(absRowDiff, absColDiff) + 1;

  return Array.from({ length }, (_, index) => ({
    row: start.row + stepRow * index,
    col: start.col + stepCol * index,
  }));
}

export function GameBoard({
  gameBoard,
  onWordFound,
  onFailedAttempt,
  solvedWords,
}: GameBoardProps) {
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const [isResolvingSelection, setIsResolvingSelection] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resolveWord = (path: Position[]) => {
    setSelectedPath(path);
    setIsResolvingSelection(true);

    timeoutRef.current = setTimeout(() => {
      const selectedWord = getSelectedWord(path, gameBoard.grid);
      const foundWord = checkIfWordValid(selectedWord, gameBoard.words);

      if (foundWord && !solvedWords.has(foundWord.text)) {
        onWordFound(foundWord.text);
      } else if (!foundWord) {
        onFailedAttempt();
      }

      setSelectedPath([]);
      setIsResolvingSelection(false);
      timeoutRef.current = null;
    }, 180);
  };

  const handleCellTap = (row: number, col: number) => {
    if (isResolvingSelection) {
      return;
    }

    const position = { row, col };

    if (selectedPath.length === 0) {
      setSelectedPath([position]);
      return;
    }

    if (selectedPath.length > 1) {
      setSelectedPath([position]);
      return;
    }

    const start = selectedPath[0];
    if (start.row === row && start.col === col) {
      setSelectedPath([]);
      return;
    }

    const linePath = getLinePath(start, position);
    if (!linePath) {
      setSelectedPath([position]);
      return;
    }

    resolveWord(linePath);
  };

  const handleClearSelection = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSelectedPath([]);
    setIsResolvingSelection(false);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full max-w-[32rem]">
        <div
          className="grid gap-1 rounded-[1.4rem] border-2 border-foreground/10 bg-background/85 p-2 shadow-[0_18px_36px_rgba(19,31,67,0.12)] backdrop-blur sm:gap-2 sm:p-4"
          style={{
            gridTemplateColumns: `repeat(${gameBoard.grid.length}, minmax(0, 1fr))`,
          }}
        >
          {gameBoard.grid.map((row, rowIdx) =>
            row.map((letter, colIdx) => {
              const isSelected = selectedPath.some(
                (cell) => cell.row === rowIdx && cell.col === colIdx
              );
              const isSolved = gameBoard.words.some(
                (word) =>
                  solvedWords.has(word.text) &&
                  word.positions.some(
                    (cell) => cell.row === rowIdx && cell.col === colIdx
                  )
              );

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  type="button"
                  onClick={() => handleCellTap(rowIdx, colIdx)}
                  disabled={isResolvingSelection}
                  className={cn(
                    'aspect-square w-full touch-manipulation rounded-lg text-base font-black transition-all disabled:cursor-wait sm:rounded-xl sm:text-lg',
                    isSelected
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-[0_8px_18px_rgba(15,118,110,0.35)]'
                      : isSolved
                        ? 'bg-accent text-accent-foreground ring-2 ring-accent/25 shadow-[0_8px_18px_rgba(132,204,22,0.3)]'
                        : 'bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/85 hover:shadow-sm'
                  )}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex min-h-12 flex-col items-center gap-3">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Tap the first letter, then tap the last letter.
        </p>

        {selectedPath.length > 0 && (
          <div className="rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-primary shadow-sm sm:text-base">
            {getSelectedWord(selectedPath, gameBoard.grid)}
          </div>
        )}
      </div>

      <div className="flex w-full max-w-[32rem] flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleClearSelection}
          disabled={selectedPath.length === 0 && !isResolvingSelection}
          className="flex-1 rounded-[1rem] border border-border bg-background/85 px-4 py-3 font-bold text-foreground transition hover:bg-secondary/35 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
