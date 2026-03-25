'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AnyQuizItem,
  SirDongStyleItem,
  MultipleChoiceItem,
  IdentificationItem,
  FillInBlankItem,
} from '@/lib/types'
import { Trash2, Copy } from 'lucide-react'

interface QuestionEditorProps {
  items: AnyQuizItem[]
  onItemsChange: (items: AnyQuizItem[]) => void
  onItemDelete: (id: string) => void
}

function previewText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) {
    return 'Untitled question'
  }

  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed
}

export function QuestionEditor({
  items,
  onItemsChange,
  onItemDelete,
}: QuestionEditorProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const updateItem = (id: string, updatedItem: AnyQuizItem) => {
    const newItems = items.map((item) => (item.id === id ? updatedItem : item))
    onItemsChange(newItems)
  }

  const duplicateItem = (item: AnyQuizItem) => {
    const newItem: AnyQuizItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: `item-${Date.now()}`,
      number: Math.max(...items.map((i) => i.number)) + 1,
    }
    onItemsChange([...items, newItem])
  }

  const groupedByType = new Map<string, AnyQuizItem[]>()
  items.forEach((item) => {
    if (!groupedByType.has(item.type)) {
      groupedByType.set(item.type, [])
    }
    groupedByType.get(item.type)!.push(item)
  })

  const typeLabels: Record<string, string> = {
    'sir-dong-style': 'Sir Dong Style',
    'multiple-choice': 'Multiple Choice',
    identification: 'Identification',
    'fill-in-blank': 'Fill in the Blank',
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full" defaultValue={items.slice(0, 3).map((i) => i.id)}>
        {Array.from(groupedByType.entries()).map(([type, typeItems]) => (
          <div key={type} className="space-y-2">
            <h3 className="font-semibold text-lg text-primary mt-6 mb-3 px-2">
              {typeLabels[type]} ({typeItems.length})
            </h3>

            {typeItems.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border border-border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50">
                  <div className="flex-1 text-left">
                    <span className="font-semibold">{item.number}. </span>
                    {item.type === 'sir-dong-style' && (
                      <span className="text-muted-foreground">
                        {previewText((item as SirDongStyleItem).statement1)}
                      </span>
                    )}
                    {item.type === 'multiple-choice' && (
                      <span className="text-muted-foreground">
                        {previewText((item as MultipleChoiceItem).question)}
                      </span>
                    )}
                    {item.type === 'identification' && (
                      <span className="text-muted-foreground">
                        {previewText((item as IdentificationItem).question)}
                      </span>
                    )}
                    {item.type === 'fill-in-blank' && (
                      <span className="text-muted-foreground">
                        {previewText((item as FillInBlankItem).sentence)}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 py-4 space-y-4">
                  {item.type === 'sir-dong-style' && (
                    <SirDongStyleEditor
                      item={item as SirDongStyleItem}
                      onChange={(updated) => updateItem(item.id, updated)}
                    />
                  )}
                  {item.type === 'multiple-choice' && (
                    <MultipleChoiceEditor
                      item={item as MultipleChoiceItem}
                      onChange={(updated) => updateItem(item.id, updated)}
                    />
                  )}
                  {item.type === 'identification' && (
                    <IdentificationEditor
                      item={item as IdentificationItem}
                      onChange={(updated) => updateItem(item.id, updated)}
                    />
                  )}
                  {item.type === 'fill-in-blank' && (
                    <FillInBlankEditor
                      item={item as FillInBlankItem}
                      onChange={(updated) => updateItem(item.id, updated)}
                    />
                  )}

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateItem(item)}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(item.id)}
                      className="gap-2 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Question</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this question? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onItemDelete(deleteConfirm)
                  setDeleteConfirm(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Individual Type Editors

function SirDongStyleEditor({
  item,
  onChange,
}: {
  item: SirDongStyleItem
  onChange: (item: SirDongStyleItem) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Statement 1</Label>
        <Textarea
          value={item.statement1}
          onChange={(e) => onChange({ ...item, statement1: e.target.value })}
          className="resize-none"
          rows={2}
        />
      </div>
      <div>
        <Label className="text-sm font-semibold mb-2 block">Statement 2</Label>
        <Textarea
          value={item.statement2}
          onChange={(e) => onChange({ ...item, statement2: e.target.value })}
          className="resize-none"
          rows={2}
        />
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Choices</Label>
        {item.choices.map((choice, idx) => (
          <div key={idx}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {String.fromCharCode(65 + idx)}.
            </label>
            <Input
              value={choice.replace(/^[A-D]:\s*/, '')}
              onChange={(e) => {
                const newChoices = [...item.choices] as [string, string, string, string]
                newChoices[idx] = e.target.value
                onChange({ ...item, choices: newChoices })
              }}
            />
          </div>
        ))}
      </div>
      <CorrectAnswerSelector
        idPrefix={item.id}
        value={item.correctAnswer}
        onChange={(val) => onChange({ ...item, correctAnswer: val as 'A' | 'B' | 'C' | 'D' })}
      />
    </div>
  )
}

function MultipleChoiceEditor({
  item,
  onChange,
}: {
  item: MultipleChoiceItem
  onChange: (item: MultipleChoiceItem) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Question</Label>
        <Textarea
          value={item.question}
          onChange={(e) => onChange({ ...item, question: e.target.value })}
          className="resize-none"
          rows={2}
        />
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Choices</Label>
        {item.choices.map((choice, idx) => (
          <div key={idx}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {String.fromCharCode(65 + idx)}.
            </label>
            <Input
              value={choice.replace(/^[A-D]:\s*/, '')}
              onChange={(e) => {
                const newChoices = [...item.choices] as [string, string, string, string]
                newChoices[idx] = e.target.value
                onChange({ ...item, choices: newChoices })
              }}
            />
          </div>
        ))}
      </div>
      <CorrectAnswerSelector
        idPrefix={item.id}
        value={item.correctAnswer}
        onChange={(val) => onChange({ ...item, correctAnswer: val as 'A' | 'B' | 'C' | 'D' })}
      />
    </div>
  )
}

function IdentificationEditor({
  item,
  onChange,
}: {
  item: IdentificationItem
  onChange: (item: IdentificationItem) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Question</Label>
        <Textarea
          value={item.question}
          onChange={(e) => onChange({ ...item, question: e.target.value })}
          className="resize-none"
          rows={2}
        />
      </div>
      <div>
        <Label className="text-sm font-semibold mb-2 block">Correct Answer</Label>
        <Input
          value={item.correctAnswer}
          onChange={(e) => onChange({ ...item, correctAnswer: e.target.value })}
          placeholder="Enter the answer"
        />
      </div>
    </div>
  )
}

function FillInBlankEditor({
  item,
  onChange,
}: {
  item: FillInBlankItem
  onChange: (item: FillInBlankItem) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Sentence</Label>
        <Textarea
          value={item.sentence}
          onChange={(e) => onChange({ ...item, sentence: e.target.value })}
          className="resize-none"
          rows={2}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Use _____ to indicate the blank space
        </p>
      </div>
      <div>
        <Label className="text-sm font-semibold mb-2 block">Correct Answer</Label>
        <Input
          value={item.correctAnswer}
          onChange={(e) => onChange({ ...item, correctAnswer: e.target.value })}
          placeholder="Word to fill in the blank"
        />
      </div>
    </div>
  )
}

function CorrectAnswerSelector({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string
  value: 'A' | 'B' | 'C' | 'D'
  onChange: (val: string) => void
}) {
  return (
    <div>
      <Label className="text-sm font-semibold mb-3 block">Correct Answer</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-4 gap-3">
          {['A', 'B', 'C', 'D'].map((letter) => (
            <label
              key={letter}
              className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/50"
            >
              <RadioGroupItem value={letter} id={`${idPrefix}-ans-${letter}`} />
              <span className="font-semibold">{letter}</span>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
