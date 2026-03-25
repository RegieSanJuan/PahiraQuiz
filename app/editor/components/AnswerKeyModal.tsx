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
  // Group items by type
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
          <Scroll className="w-4 h-4" />
          View Answer Key
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Answer Key</DialogTitle>
          <DialogDescription>
            Complete answer key for all questions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {Array.from(itemsByType.entries()).map(([type, typeItems]) => (
            <div key={type} className="space-y-3">
              <h3 className="font-bold text-lg text-primary">
                {typeLabels[type]}
              </h3>

              <div className="space-y-2 border-l-4 border-primary/30 pl-4">
                {typeItems.map((item) => (
                  <div key={item.id} className="pb-3 border-b border-border last:border-b-0">
                    {item.type === 'sir-dong-style' || item.type === 'multiple-choice' ? (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          Question {item.number}
                        </p>
                        <p className="text-base font-bold">
                          Answer: <span className="text-primary">
                            {(item as SirDongStyleItem | MultipleChoiceItem).correctAnswer}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          Question {item.number}
                        </p>
                        <p className="text-base font-bold">
                          Answer: <span className="text-primary">
                            {(item as IdentificationItem | FillInBlankItem).correctAnswer}
                          </span>
                        </p>
                      </div>
                    )}
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
