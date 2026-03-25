'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionEditor } from './components/QuestionEditor'
import { AnswerKeyModal } from './components/AnswerKeyModal'
import { ExportButton } from './components/ExportButton'
import { AnyQuizItem, Quiz, QuizType } from '@/lib/types'
import { loadDraft, loadDraftById, saveDraft } from '@/lib/localStorage'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const TYPE_LABELS: Record<QuizType, string> = {
  'sir-dong-style': 'Sir Dong Style',
  'multiple-choice': 'Multiple Choice',
  identification: 'Identification',
  'fill-in-blank': 'Fill in the Blank',
}

function renderPreview(item: AnyQuizItem) {
  if (item.type === 'sir-dong-style') {
    return (
      <div className="space-y-3 text-sm">
        <p>
          <strong>Statement 1:</strong> {item.statement1}
        </p>
        <p>
          <strong>Statement 2:</strong> {item.statement2}
        </p>
        <div className="space-y-2">
          {item.choices.map((choice, index) => (
            <p key={index}>
              {String.fromCharCode(65 + index)}. {choice}
            </p>
          ))}
        </div>
      </div>
    )
  }

  if (item.type === 'multiple-choice') {
    return (
      <div className="space-y-3 text-sm">
        <p>
          <strong>Question:</strong> {item.question}
        </p>
        <div className="space-y-2">
          {item.choices.map((choice, index) => (
            <p key={index}>
              {String.fromCharCode(65 + index)}. {choice}
            </p>
          ))}
        </div>
      </div>
    )
  }

  if (item.type === 'identification') {
    return <p className="text-sm">{item.question}</p>
  }

  return <p className="text-sm">{item.sentence}</p>
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoadingState />}>
      <EditorPageContent />
    </Suspense>
  )
}

function EditorLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <div className="site-shell flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading quiz draft...</p>
        </div>
      </div>
    </div>
  )
}

function EditorPageContent() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('id')

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')

  useEffect(() => {
    setIsLoading(true)

    const draft = quizId ? loadDraftById(quizId) : loadDraft()

    if (draft) {
      setQuiz(draft)
      setQuizTitle(draft.title)
    } else {
      toast.error('Quiz not found. Please generate a new quiz.')
    }

    setIsLoading(false)
  }, [quizId])

  useEffect(() => {
    if (!quiz) return

    const timer = setInterval(() => {
      saveDraft({ ...quiz, title: quizTitle })
    }, 30000)

    return () => clearInterval(timer)
  }, [quiz, quizTitle])

  const handleItemsChange = (items: AnyQuizItem[]) => {
    if (!quiz) return

    setQuiz({
      ...quiz,
      items,
      updatedAt: new Date(),
    })
  }

  const handleItemDelete = (id: string) => {
    if (!quiz) return

    const updatedItems = quiz.items
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        number: index + 1,
      }))

    setQuiz({
      ...quiz,
      items: updatedItems,
      updatedAt: new Date(),
    })
    toast.success('Question deleted')
  }

  const handleTitleChange = (newTitle: string) => {
    setQuizTitle(newTitle)

    if (!quiz) return

    setQuiz({
      ...quiz,
      title: newTitle,
      updatedAt: new Date(),
    })
  }

  const handleSave = async () => {
    if (!quiz) return

    setIsSaving(true)

    try {
      const quizToSave = {
        ...quiz,
        title: quizTitle,
        updatedAt: new Date(),
      }

      saveDraft(quizToSave)
      setQuiz(quizToSave)
      toast.success('Quiz saved successfully.')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save quiz.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <EditorLoadingState />
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <div className="site-shell flex min-h-screen items-center justify-center">
          <div className="paper-panel max-w-md p-6 text-center">
            <p className="section-label">Editor</p>
            <h1 className="mt-3 text-3xl">Quiz not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This draft is no longer available on this browser.
            </p>
            <Link href="/generator" className="mt-6 inline-flex">
              <Button>Create a new quiz</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="site-shell flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">PahiraQuiz</p>
            <p className="text-sm text-muted-foreground">
              Gusto mo ba pahirapan (matuto) students mo?
            </p>
          </div>

          <Link href="/generator" className="inline-flex">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to generator
            </Button>
          </Link>
        </div>
      </header>

      <main className="site-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="paper-panel p-6">
              <p className="section-label">Quiz details</p>
              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="quiz-title" className="mb-2 block text-sm font-semibold">
                    Quiz title
                  </Label>
                  <Input
                    id="quiz-title"
                    value={quizTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Total questions
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-primary">{quiz.items.length}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Formats used
                    </p>
                    <p className="mt-2 font-medium">{quiz.types.map((type) => TYPE_LABELS[type]).join(', ')}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Last updated
                    </p>
                    <p className="mt-2 font-medium">
                      {new Date(quiz.updatedAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="paper-panel p-6">
              <p className="section-label">Actions</p>
              <div className="mt-5 flex flex-col gap-3">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? 'Saving...' : 'Save draft'}
                </Button>
                <AnswerKeyModal items={quiz.items} />
                <ExportButton quiz={quiz} />
              </div>
            </section>
          </aside>

          <section className="paper-panel p-6">
            <div className="mb-5">
              <p className="section-label">Editor</p>
              <h1 className="mt-2 text-3xl">Review and clean up the quiz</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Edit the questions below, then preview the printable version before exporting.
              </p>
            </div>

            <Tabs defaultValue="editor" className="space-y-5">
              <TabsList>
                <TabsTrigger value="editor">Edit questions</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <QuestionEditor
                  items={quiz.items}
                  onItemsChange={handleItemsChange}
                  onItemDelete={handleItemDelete}
                />
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {quiz.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {TYPE_LABELS[item.type]}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">Question {item.number}</h3>
                    <div className="mt-4">{renderPreview(item)}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  )
}
