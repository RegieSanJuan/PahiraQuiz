'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

    // Validate file type
    if (file.type !== 'text/plain' && file.type !== 'application/pdf') {
      toast.error('Please upload a PDF or TXT file')
      return
    }

    // Validate file size (max 10MB)
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
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to extract text from file'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const clearFile = () => {
    onChange('')
    onFileNameChange('')
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Lesson Content
        </Label>
        <p className="text-sm text-muted-foreground">
          Upload your lesson materials or paste the content directly
        </p>
      </div>

      <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'file' | 'text')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="text">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Upload className="w-8 h-8 text-primary opacity-50" />
              <div>
                <p className="font-semibold">
                  {isLoading ? 'Processing...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF or TXT files (max 10MB)
                </p>
              </div>
            </label>
          </div>

          {fileName && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.ceil(value.length / 100)} characters extracted
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {value && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Preview</Label>
              <div className="bg-secondary rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-muted-foreground">
                {value.substring(0, 500)}
                {value.length > 500 && '...'}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your lesson content here..."
            className="min-h-64 resize-none"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{value.length} characters</span>
            <span>{value.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </TabsContent>
      </Tabs>

      {!value && (
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-accent">
            Tip: Provide comprehensive lesson content for better quiz generation. At least 200 characters recommended.
          </p>
        </div>
      )}
    </div>
  )
}
