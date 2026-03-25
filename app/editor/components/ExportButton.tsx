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
      toast.success('PDF exported successfully!')
      setIsOpen(false)
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export to PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Quiz to PDF</DialogTitle>
          <DialogDescription>
            Choose your export options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={includeAnswerKey}
                onCheckedChange={(checked) =>
                  setIncludeAnswerKey(!!checked)
                }
              />
              <Label className="cursor-pointer">
                Include answer key in PDF
              </Label>
            </label>
            <p className="text-xs text-muted-foreground ml-6">
              {includeAnswerKey
                ? 'The PDF will include a separate answer key section'
                : 'Only the quiz questions will be included'}
            </p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm font-semibold mb-2">Export Summary:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Title: {quiz.title}</li>
              <li>• Total questions: {quiz.items.length}</li>
              <li>
                • Answer key: {includeAnswerKey ? 'Included' : 'Not included'}
              </li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
