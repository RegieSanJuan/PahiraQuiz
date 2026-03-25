'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X } from 'lucide-react'
import { extractTextFromFile } from '@/lib/pdfExtraction'
import { toast } from 'sonner'

interface LessonInputProps {
  value: string
  onChange: (value: string) => void
  fileName: string
  onFileNameChange: (name: string) => void
}

export function LessonInput({
  value,
  onChange,
  fileName,
  onFileNameChange,
}: LessonInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return

    const lowerFileName = file.name.toLowerCase()
    const isTextFile = file.type === 'text/plain' || lowerFileName.endsWith('.txt')
    const isPdfFile = file.type === 'application/pdf' || lowerFileName.endsWith('.pdf')

    if (!isTextFile && !isPdfFile) {
      toast.error('Please upload a PDF or TXT file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsLoading(true)
    try {
      const text = await extractTextFromFile(file)
      onChange(text)
      onFileNameChange(file.name)
      toast.success(`Extracted text from ${file.name}`)
    } catch (error) {
      console.error('File extraction error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to extract text from file')
    } finally {
      setIsLoading(false)
    }
  }

  const clearFile = () => {
    onChange('')
    onFileNameChange('')
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
        Upload a PDF or TXT file, or paste the lesson directly. Longer, cleaner content usually
        gives better quiz items.
      </div>

      <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'file' | 'text')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload file</TabsTrigger>
          <TabsTrigger value="text">Paste text</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4 pt-3">
          <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center gap-3">
              <Upload className="h-7 w-7 text-primary" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {isLoading ? 'Reading your file...' : 'Choose a PDF or TXT file'}
                </p>
                <p className="text-sm text-muted-foreground">Maximum file size: 10MB</p>
              </div>
            </label>
          </div>

          {fileName ? (
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {value.length.toLocaleString()} characters extracted
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Clear uploaded file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {value ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Preview</Label>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                {value.substring(0, 700)}
                {value.length > 700 ? '...' : ''}
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="text" className="space-y-4 pt-3">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the lesson text here..."
            className="min-h-72 resize-y"
          />

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="data-pill">{value.length.toLocaleString()} characters</span>
            <span className="data-pill">
              {value.split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
          </div>
        </TabsContent>
      </Tabs>

      {!value ? (
        <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          Tip: aim for at least one complete lesson section, not just a short outline.
        </div>
      ) : null}
    </div>
  )
}
