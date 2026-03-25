'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { QuizType } from '@/lib/types'
import { BookOpen, List, PenTool, HelpCircle } from 'lucide-react'

interface QuizTypeSelectorProps {
  selectedTypes: QuizType[]
  onChange: (types: QuizType[]) => void
}

const QUIZ_TYPES: Array<{
  id: QuizType
  name: string
  description: string
  icon: React.ReactNode
}> = [
  {
    id: 'sir-dong-style',
    name: 'Sir Dong Style',
    description: 'Two statements with four choices about how the statements relate to each other.',
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description: 'Standard four-choice questions for review, quizzes, and seatwork.',
    icon: <List className="h-5 w-5" />,
  },
  {
    id: 'identification',
    name: 'Identification',
    description: 'Short-answer items for terms, concepts, names, and direct recall.',
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    id: 'fill-in-blank',
    name: 'Fill in the Blank',
    description: 'Sentence-based items with one missing word or short phrase.',
    icon: <BookOpen className="h-5 w-5" />,
  },
]

export function QuizTypeSelector({
  selectedTypes,
  onChange,
}: QuizTypeSelectorProps) {
  const toggleType = (type: QuizType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((selectedType) => selectedType !== type))
      return
    }

    onChange([...selectedTypes, type])
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {QUIZ_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.id)

          return (
            <label
              key={type.id}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                isSelected
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-background hover:bg-secondary/50'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleType(type.id)}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-primary">{type.icon}</span>
                  <p className="font-semibold">{type.name}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{type.description}</p>
              </div>
            </label>
          )
        })}
      </div>

      {selectedTypes.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          Select at least one quiz type to continue.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} selected.
        </div>
      )}
    </div>
  )
}
