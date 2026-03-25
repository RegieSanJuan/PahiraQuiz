'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuizType } from '@/lib/types'

interface ItemDistributionProps {
  selectedTypes: QuizType[]
  distribution: Record<QuizType, number>
  onChange: (distribution: Record<QuizType, number>) => void
}

const TYPE_LABELS: Record<QuizType, string> = {
  'sir-dong-style': 'Sir Dong Style',
  'multiple-choice': 'Multiple Choice',
  identification: 'Identification',
  'fill-in-blank': 'Fill in the Blank',
}

const TYPE_DESCRIPTIONS: Record<QuizType, string> = {
  'sir-dong-style': 'Statement pairs with relationship choices',
  'multiple-choice': 'Standard multiple choice questions',
  identification: 'Short answer questions',
  'fill-in-blank': 'Complete the sentence questions',
}

export function ItemDistribution({
  selectedTypes,
  distribution,
  onChange,
}: ItemDistributionProps) {
  const handleChange = (type: QuizType, value: string) => {
    const num = Math.max(0, Math.min(50, parseInt(value) || 0))
    onChange({
      ...distribution,
      [type]: num,
    })
  }

  const totalItems = selectedTypes.reduce(
    (sum, type) => sum + (distribution[type] || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Quiz Distribution
        </Label>
        <p className="text-sm text-muted-foreground">
          Specify how many questions of each type you want
        </p>
      </div>

      <div className="grid gap-4">
        {selectedTypes.map((type) => (
          <div
            key={type}
            className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <Label htmlFor={`dist-${type}`} className="font-semibold block mb-1">
                  {TYPE_LABELS[type]}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {TYPE_DESCRIPTIONS[type]}
                </p>
              </div>
              <div className="flex items-end gap-2">
                <Input
                  id={`dist-${type}`}
                  type="number"
                  min="0"
                  max="50"
                  value={distribution[type] || 0}
                  onChange={(e) => handleChange(type, e.target.value)}
                  className="w-20 text-center"
                />
                <span className="text-sm text-muted-foreground font-semibold pb-2">
                  questions
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Questions:</span>
          <span className="text-xl font-bold text-primary">{totalItems}</span>
        </div>
        {totalItems === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Please set at least one question to continue.
          </p>
        )}
        {totalItems > 0 && totalItems <= 100 && (
          <p className="text-xs text-green-600 mt-2">
            Perfect! Ready to generate your quiz.
          </p>
        )}
        {totalItems > 100 && (
          <p className="text-xs text-orange-600 mt-2">
            Large quizzes may take longer to generate.
          </p>
        )}
      </div>

      <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 space-y-2">
        <p className="text-sm font-semibold text-accent">Tips for best results:</p>
        <ul className="text-xs text-accent space-y-1 list-disc list-inside">
          <li>Mix different question types for comprehensive assessment</li>
          <li>Keep total questions between 10-50 for optimal quality</li>
          <li>Longer content enables more diverse questions</li>
        </ul>
      </div>
    </div>
  )
}
