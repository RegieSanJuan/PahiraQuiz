'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const FLOATING_SYMBOLS = ['*', '+', 'o'];
const REVEAL_STEPS = [
  {
    message: 'Congrats behh! Galing galing naman ng abunjing bunjing na yan',
  },
  {
    message: 'buti nalang na solve mo beh, kundi tatalon ako sa building hehehe joke lang..',
    image: '/buti%20nalang%20na%20solve%20mo%20beh.png',
    alt: 'Cute nervous character',
  },
  {
    message: 'goodluck po sa araw niyo po love you hehe i hope i enjoy ^_^',
    image: '/Dabbing%20girl.png',
    alt: 'Girl dabbing',
  },
] as const;

interface FinalRevealProps {
  isVisible: boolean;
  onClose: () => void;
}

export function FinalReveal({ isVisible, onClose }: FinalRevealProps) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; delay: number }>
  >([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStep(0);
      return;
    }

    setStep(0);
    setConfetti(
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
      }))
    );
  }, [isVisible]);

  if (!isVisible) return null;

  const activeStep = REVEAL_STEPS[step];
  const isLastStep = step === REVEAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      return;
    }

    setStep((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-foreground/35 p-4 backdrop-blur-sm">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={cn(
              'absolute h-3 w-3 rounded-full animate-pulse',
              piece.id % 3 === 0 ? 'bg-primary' : piece.id % 3 === 1 ? 'bg-accent' : 'bg-secondary'
            )}
            style={{
              left: `${piece.x}%`,
              top: '-16px',
              animation: `fall ${2 + Math.random()}s linear ${piece.delay}s forwards`,
            }}
          />
        ))}

        {Array.from({ length: 14 }).map((_, index) => (
          <div
            key={`symbol-${index}`}
            className="absolute text-2xl font-black text-secondary-foreground/70"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-24px',
              animation: `float-up ${3 + Math.random() * 2}s ease-in ${index * 0.15}s forwards`,
            }}
          >
            {FLOATING_SYMBOLS[index % FLOATING_SYMBOLS.length]}
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-3xl rounded-[2rem] border-2 border-foreground/10 bg-card/95 p-6 shadow-[0_24px_80px_rgba(19,31,67,0.24)] sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
            Final dialog
          </p>
          <div className="flex items-center gap-2">
            {REVEAL_STEPS.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all',
                  index === step ? 'bg-primary scale-110' : 'bg-border'
                )}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div className={cn('space-y-4', !activeStep.image && 'md:col-span-2 text-center')}>
            <p className="text-2xl font-black leading-relaxed text-foreground sm:text-3xl">
              {activeStep.message}
            </p>

            {!activeStep.image && (
              <div className="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
            )}
          </div>

          {activeStep.image && (
            <div className="flex justify-center">
              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-background/80 p-3 shadow-sm">
                <Image
                  src={activeStep.image}
                  alt={activeStep.alt}
                  width={408}
                  height={612}
                  className="h-auto w-full max-w-[240px] object-contain sm:max-w-[280px]"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNext}
            className="rounded-[1.15rem] bg-primary px-6 py-3 font-semibold text-primary-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
          >
            {isLastStep ? 'Back to Start' : 'Next'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }

        @keyframes float-up {
          to {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
