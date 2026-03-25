'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionEditor } from './components/QuestionEditor'
import { AnswerKeyModal } from './components/AnswerKeyModal'
import { ExportButton } from './components/ExportButton'
import { Quiz, AnyQuizItem } from '@/lib/types'
import { loadDraft, saveDraft } from '@/lib/localStorage'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EditorPage() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('id')

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')

  // Load quiz from draft
  useEffect(() => {
    setIsLoading(true)
    const draft = loadDraft()
    
    if (draft && (!quizId || draft.id === quizId)) {
      setQuiz(draft)
      setQuizTitle(draft.title)
    } else if (!draft) {
      toast.error('Quiz not found. Please generate a new quiz.')
    }
    
    setIsLoading(false)
  }, [quizId])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!quiz) return

    const timer = setInterval(() => {
      const quizToSave = { ...quiz, title: quizTitle }
      saveDraft(quizToSave)
    }, 30000)

    return () => clearInterval(timer)
  }, [quiz, quizTitle])

  const handleItemsChange = (items: AnyQuizItem[]) => {
    if (!quiz) return
    const updated = { ...quiz, items, updatedAt: new Date() }
    setQuiz(updated)
  }

  const handleItemDelete = (id: string) => {
    if (!quiz) return
    const updated = {
      ...quiz,
      items: quiz.items.filter((item) => item.id !== id),
      updatedAt: new Date(),
    }
    // Renumber items
    updated.items.forEach((item, idx) => {
      item.number = idx + 1
    })
    setQuiz(updated)
    toast.success('Question deleted')
  }

  const handleTitleChange = (newTitle: string) => {
    setQuizTitle(newTitle)
    if (quiz) {
      setQuiz({ ...quiz, title: newTitle, updatedAt: new Date() })
    }
  }

  const handleSave = async () => {
    if (!quiz) return
    setIsSaving(true)
    try {
      const quizToSave = { ...quiz, title: quizTitle }
      saveDraft(quizToSave)
      setQuiz(quizToSave)
      toast.success('Quiz saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save quiz')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>
              The quiz you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/generator">
              <Button className="w-full">Create a New Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/generator">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">Quiz Editor</h1>
            <p className="text-xs text-muted-foreground">
              {quiz.items.length} questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnswerKeyModal items={quiz.items} />
          <ExportButton quiz={quiz} />
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Saving...' : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </nav>

      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Title Editor */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Quiz Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quiz-title" className="text-sm font-semibold mb-2 block">
                  Quiz Title
                </Label>
                <Input
                  id="quiz-title"
                  value={quizTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter quiz title"
                  className="text-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold text-primary">{quiz.items.length}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Question Types</p>
                  <p className="text-2xl font-bold text-primary">{quiz.types.length}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Last Edited</p>
                  <p className="text-xs font-semibold text-primary">
                    {new Date(quiz.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Tabs */}
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">
              Edit Questions ({quiz.items.length})
            </TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Edit Questions</CardTitle>
                <CardDescription>
                  Click on any question to edit its content, answers, or delete it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionEditor
                  items={quiz.items}
                  onItemsChange={handleItemsChange}
                  onItemDelete={handleItemDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Preview</CardTitle>
                <CardDescription>
                  How your quiz will appear to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {quiz.items.map((item) => (
                    <div key={item.id} className="border-b border-border pb-6 last:border-b-0">
                      <h3 className="font-bold mb-3">
                        {item.number}. {item.type === 'sir-dong-style' && 'Sir Dong Style'}
                        {item.type === 'multiple-choice' && 'Multiple Choice'}
                        {item.type === 'identification' && 'Identification'}
                        {item.type === 'fill-in-blank' && 'Fill in the Blank'}
                      </h3>

                      {item.type === 'sir-dong-style' && (
                        <div className="space-y-3 text-sm">
                          <p><strong>Statement 1:</strong> {(item as any).statement1}</p>
                          <p><strong>Statement 2:</strong> {(item as any).statement2}</p>
                          <div className="mt-3 space-y-2">
                            {(item as any).choices.map((choice: string, idx: number) => (
                              <p key={idx}>
                                {String.fromCharCode(65 + idx)}. {choice.replace(/^[A-D]:\s*/, '')}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.type === 'multiple-choice' && (
                        <div className="space-y-3 text-sm">
                          <p><strong>Question:</strong> {(item as any).question}</p>
                          <div className="mt-3 space-y-2">
                            {(item as any).choices.map((choice: string, idx: number) => (
                              <p key={idx}>
                                {String.fromCharCode(65 + idx)}. {choice.replace(/^[A-D]:\s*/, '')}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.type === 'identification' && (
                        <div className="text-sm">
                          <p>{(item as any).question}</p>
                        </div>
                      )}

                      {item.type === 'fill-in-blank' && (
                        <div className="text-sm">
                          <p>{(item as any).sentence}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
