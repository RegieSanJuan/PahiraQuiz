'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, Loader2 } from 'lucide-react'
import { Quiz } from '@/lib/types'
import { generatePDF } from '@/lib/pdfExport'
import { toast } from 'sonner'

interface ExportButtonProps {
  quiz: Quiz
}

export function ExportButton({ quiz }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExport = async () => {
    setIsGenerating(true)

    try {
      await generatePDF(quiz, includeAnswerKey)
      toast.success('PDF exported successfully.')
      setIsOpen(false)
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to generate PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export quiz to PDF</DialogTitle>
          <DialogDescription>Choose whether to include the answer key.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4">
            <Checkbox
              checked={includeAnswerKey}
              onCheckedChange={(checked) => setIncludeAnswerKey(Boolean(checked))}
            />
            <div>
              <Label className="cursor-pointer font-medium">Include answer key</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {includeAnswerKey
                  ? 'The file will include a separate answer key section.'
                  : 'Only the quiz questions will be included.'}
              </p>
            </div>
          </label>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold">Export summary</p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <p>Title: {quiz.title}</p>
              <p>Total questions: {quiz.items.length}</p>
              <p>Answer key: {includeAnswerKey ? 'Included' : 'Not included'}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
