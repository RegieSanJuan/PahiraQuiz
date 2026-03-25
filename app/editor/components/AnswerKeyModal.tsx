'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Scroll } from 'lucide-react'
import {
  AnyQuizItem,
  SirDongStyleItem,
  MultipleChoiceItem,
  IdentificationItem,
  FillInBlankItem,
} from '@/lib/types'

interface AnswerKeyModalProps {
  items: AnyQuizItem[]
}

export function AnswerKeyModal({ items }: AnswerKeyModalProps) {
  const itemsByType = new Map<string, AnyQuizItem[]>()
  items.forEach((item) => {
    if (!itemsByType.has(item.type)) {
      itemsByType.set(item.type, [])
    }
    itemsByType.get(item.type)!.push(item)
  })

  const typeLabels: Record<string, string> = {
    'sir-dong-style': 'Sir Dong Style',
    'multiple-choice': 'Multiple Choice',
    identification: 'Identification',
    'fill-in-blank': 'Fill in the Blank',
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Scroll className="h-4 w-4" />
          View answer key
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Answer key</DialogTitle>
          <DialogDescription>Review all answers before you print or export.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Array.from(itemsByType.entries()).map(([type, typeItems]) => (
            <div key={type} className="space-y-3">
              <h3 className="text-xl font-semibold">{typeLabels[type]}</h3>

              <div className="space-y-3">
                {typeItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Question {item.number}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      Answer:{' '}
                      <span className="text-primary">
                        {item.type === 'sir-dong-style' || item.type === 'multiple-choice'
                          ? (item as SirDongStyleItem | MultipleChoiceItem).correctAnswer
                          : (item as IdentificationItem | FillInBlankItem).correctAnswer}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
