'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  GameBoard as GameBoardType,
  Position,
  isAdjacentCell,
  getSelectedWord,
  checkIfWordValid,
} from '@/lib/game-logic';
import { cn } from '@/lib/utils';

const SELECTION_STROKE = '#0f766e';
const TRAIL_STROKE = 'rgba(15, 118, 110, 0.35)';

interface GameBoardProps {
  gameBoard: GameBoardType;
  onWordFound: (wordText: string) => void;
  onFailedAttempt: () => void;
  solvedWords: Set<string>;
}

export function GameBoard({
  gameBoard,
  onWordFound,
  onFailedAttempt,
  solvedWords,
}: GameBoardProps) {
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const cellSize = 50;
  const gridSize = gameBoard.grid.length;

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    setSelectedPath([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDrawing) return;

    const position = { row, col };
    setSelectedPath((prev) => {
      const lastPos = prev[prev.length - 1];

      // Check if this position is already in the path (allow backtracking)
      const existingIndex = prev.findIndex(
        (p) => p.row === row && p.col === col
      );
      if (existingIndex !== -1) {
        // If clicking the previous cell, allow backtracking
        if (existingIndex === prev.length - 1) return prev;
        if (existingIndex === prev.length - 2) {
          return prev.slice(0, -1);
        }
        return prev;
      }

      // Check if adjacent
      if (!isAdjacentCell(lastPos, position)) return prev;

      return [...prev, position];
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);

    if (selectedPath.length > 1) {
      const selectedWord = getSelectedWord(selectedPath, gameBoard.grid);
      const foundWord = checkIfWordValid(selectedWord, gameBoard.words);

      if (foundWord && !solvedWords.has(foundWord.text)) {
        onWordFound(foundWord.text);
      } else if (!foundWord) {
        onFailedAttempt();
      }
    }

    setSelectedPath([]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Draw selection path
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedPath.length > 1) {
      ctx.strokeStyle = SELECTION_STROKE;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const startX = selectedPath[0].col * cellSize + cellSize / 2;
      const startY = selectedPath[0].row * cellSize + cellSize / 2;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < selectedPath.length; i++) {
        const x = selectedPath[i].col * cellSize + cellSize / 2;
        const y = selectedPath[i].row * cellSize + cellSize / 2;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    // Draw line to current mouse position while dragging
    if (isDrawing && selectedPath.length > 0 && mousePos) {
      ctx.strokeStyle = TRAIL_STROKE;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      const lastX = selectedPath[selectedPath.length - 1].col * cellSize + cellSize / 2;
      const lastY = selectedPath[selectedPath.length - 1].row * cellSize + cellSize / 2;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    }
  }, [selectedPath, isDrawing, mousePos, cellSize]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div
        ref={boardRef}
        className="relative inline-block select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={cellSize * gridSize}
          height={cellSize * gridSize}
          className="absolute inset-0 pointer-events-none"
        />

        <div
          className="grid gap-2 rounded-[1.5rem] border-2 border-foreground/10 bg-background/85 p-4 shadow-[0_18px_36px_rgba(19,31,67,0.12)] backdrop-blur sm:p-5"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {gameBoard.grid.map((row, rowIdx) =>
            row.map((letter, colIdx) => {
              const isSelected = selectedPath.some(
                (p) => p.row === rowIdx && p.col === colIdx
              );
              const isSolved = gameBoard.words.some(
                (word) =>
                  solvedWords.has(word.text) &&
                  word.positions.some(
                    (p) => p.row === rowIdx && p.col === colIdx
                  )
              );

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  className={cn(
                    'flex h-12 w-12 select-none items-center justify-center rounded-xl text-lg font-black transition-all sm:h-12 sm:w-12',
                    isSelected
                      ? 'scale-105 bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(15,118,110,0.35)]'
                      : isSolved
                        ? 'bg-accent text-accent-foreground shadow-[0_8px_18px_rgba(132,204,22,0.3)]'
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

      {selectedPath.length > 0 && (
        <div className="rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-primary shadow-sm sm:text-base">
          {getSelectedWord(selectedPath, gameBoard.grid)}
        </div>
      )}
    </div>
  );
}
