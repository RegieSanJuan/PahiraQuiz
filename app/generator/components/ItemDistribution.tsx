'use client'

import { QuizTypeLabel } from '@/components/quiz-type-label'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuizType } from '@/lib/types'

interface ItemDistributionProps {
  selectedTypes: QuizType[]
  distribution: Record<QuizType, number>
  onChange: (distribution: Record<QuizType, number>) => void
}

const TYPE_DESCRIPTIONS: Record<QuizType, string> = {
  'sir-dong-style': 'Statement pairs with relationship choices',
  'multiple-choice': 'Standard four-choice questions',
  identification: 'Short-answer questions',
  'fill-in-blank': 'Sentence completion questions',
}

export function ItemDistribution({
  selectedTypes,
  distribution,
  onChange,
}: ItemDistributionProps) {
  const handleChange = (type: QuizType, value: string) => {
    const num = Math.max(0, Math.min(50, parseInt(value, 10) || 0))
    onChange({
      ...distribution,
      [type]: num,
    })
  }

  const totalItems = selectedTypes.reduce((sum, type) => sum + (distribution[type] || 0), 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        {selectedTypes.map((type) => (
          <div
            key={type}
            className="grid gap-4 rounded-xl border border-border bg-background p-4 md:grid-cols-[minmax(0,1fr)_140px]"
          >
            <div className="min-w-0">
              <Label htmlFor={`dist-${type}`} className="mb-1 block font-semibold">
                <QuizTypeLabel type={type} />
              </Label>
              <p className="text-sm text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
            </div>

            <div className="flex items-center gap-3">
              <Input
                id={`dist-${type}`}
                type="number"
                min="0"
                max="50"
                value={distribution[type] || 0}
                onChange={(e) => handleChange(type, e.target.value)}
                className="text-center"
              />
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary/50 p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total questions</span>
          <span className="text-2xl font-semibold text-primary">{totalItems}</span>
        </div>

        {totalItems === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Add at least one question before generating.
          </p>
        ) : null}

        {totalItems > 0 && totalItems <= 100 ? (
          <p className="mt-2 text-sm text-emerald-700">This total is ready to generate.</p>
        ) : null}

        {totalItems > 100 ? (
          <p className="mt-2 text-sm text-amber-700">Keep the total at 100 or below.</p>
        ) : null}
      </div>
    </div>
  )
}
