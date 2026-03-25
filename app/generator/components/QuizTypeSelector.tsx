'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
    description:
      'Two statements with multiple choice answers about their relationship. Great for testing understanding of connections and implications.',
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description:
      'Standard MCQ format with four options. Ideal for testing recall and comprehension.',
    icon: <List className="w-5 h-5" />,
  },
  {
    id: 'identification',
    name: 'Identification',
    description:
      'Short answer questions. Perfect for testing specific facts, terms, and important details.',
    icon: <PenTool className="w-5 h-5" />,
  },
  {
    id: 'fill-in-blank',
    name: 'Fill in the Blank',
    description:
      'Complete sentences by filling in missing words. Great for testing vocabulary and context understanding.',
    icon: <BookOpen className="w-5 h-5" />,
  },
]

export function QuizTypeSelector({
  selectedTypes,
  onChange,
}: QuizTypeSelectorProps) {
  const toggleType = (type: QuizType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type))
    } else {
      onChange([...selectedTypes, type])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Select Quiz Types
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose at least one type. You&apos;ll specify quantities in the next step.
        </p>
      </div>

      <div className="grid gap-4">
        {QUIZ_TYPES.map((type) => (
          <label
            key={type.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <Checkbox
              checked={selectedTypes.includes(type.id)}
              onCheckedChange={() => toggleType(type.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-primary">{type.icon}</span>
                <p className="font-semibold">{type.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          </label>
        ))}
      </div>

      {selectedTypes.length === 0 && (
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-accent">
            Please select at least one quiz type to continue.
          </p>
        </div>
      )}
    </div>
  )
}
