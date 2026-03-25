import { QuizType } from '@/lib/types'
import { cn } from '@/lib/utils'

const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  'sir-dong-style': 'Multiple Statement Quiz ( Sir dong inspired )',
  'multiple-choice': 'Multiple Choice',
  identification: 'Identification',
  'fill-in-blank': 'Fill in the Blank',
}

export function getQuizTypeLabel(type: QuizType): string {
  return QUIZ_TYPE_LABELS[type]
}

export function QuizTypeLabel({
  type,
  className,
  subtitleClassName,
}: {
  type: QuizType
  className?: string
  subtitleClassName?: string
}) {
  if (type !== 'sir-dong-style') {
    return <span className={className}>{getQuizTypeLabel(type)}</span>
  }

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1', className)}>
      <span>Multiple Statement Quiz</span>
      <span
        className={cn(
          'text-[0.72em] font-medium leading-none text-muted-foreground',
          subtitleClassName
        )}
      >
        ( Sir dong inspired )
      </span>
    </span>
  )
}
