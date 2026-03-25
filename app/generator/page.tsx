'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiKeyInput } from './components/ApiKeyInput'
import { LessonInput } from './components/LessonInput'
import { QuizTypeSelector } from './components/QuizTypeSelector'
import { ItemDistribution } from './components/ItemDistribution'
import { QuizType } from '@/lib/types'
import { generateQuiz } from '@/lib/gemini'
import { saveDraft } from '@/lib/localStorage'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const MIN_CONTENT_LENGTH = 120
const MAX_TOTAL_QUESTIONS = 100
const QUIZ_TYPE_ORDER: QuizType[] = [
  'sir-dong-style',
  'multiple-choice',
  'identification',
  'fill-in-blank',
]

export default function GeneratorPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [apiKeyValid, setApiKeyValid] = useState(false)
  const [quizTitle, setQuizTitle] = useState('My Quiz')
  const [lessonContent, setLessonContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<QuizType[]>([])
  const [distribution, setDistribution] = useState<Record<QuizType, number>>({
    'sir-dong-style': 0,
    'multiple-choice': 0,
    identification: 0,
    'fill-in-blank': 0,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const totalQuestions = selectedTypes.reduce((sum, type) => sum + (distribution[type] || 0), 0)
  const lessonIsReady = lessonContent.trim().length >= MIN_CONTENT_LENGTH
  const quizTitleIsReady = quizTitle.trim().length > 0
  const canGenerate =
    apiKeyValid &&
    lessonIsReady &&
    selectedTypes.length > 0 &&
    totalQuestions > 0 &&
    totalQuestions <= MAX_TOTAL_QUESTIONS &&
    quizTitleIsReady

  const checklist = {
    'Gemini key validated': apiKeyValid,
    'Lesson content added': lessonIsReady,
    'Quiz types selected': selectedTypes.length > 0,
    'Question count ready': totalQuestions > 0 && totalQuestions <= MAX_TOTAL_QUESTIONS,
    'Title filled in': quizTitleIsReady,
  }

  const handleTypeChange = (types: QuizType[]) => {
    setSelectedTypes(types)
    setDistribution((currentDistribution) => {
      const nextDistribution = { ...currentDistribution }

      QUIZ_TYPE_ORDER.forEach((type) => {
        if (!types.includes(type)) {
          nextDistribution[type] = 0
        }
      })

      return nextDistribution
    })
  }

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('Please complete each section before generating.')
      return
    }

    setIsGenerating(true)

    try {
      const quiz = await generateQuiz({
        apiKey,
        lessonContent,
        quizTitle,
        selectedTypes,
        distribution,
      })

      saveDraft(quiz)
      router.push(`/editor?id=${quiz.id}`)
      toast.success('Quiz generated successfully!')
    } catch (error) {
      console.error('Quiz generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
    }
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

          <Link href="/" className="inline-flex">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Button>
          </Link>
        </div>
      </header>

      <main className="site-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="paper-panel p-6 sm:p-8">
              <p className="section-label">Generator</p>
              <h1 className="mt-3 text-4xl sm:text-5xl">Build one quiz at a time.</h1>
              <p className="muted-copy mt-4 max-w-3xl">
                Everything stays on one page so you can see the key, source material, question
                types, counts, and title before you run Gemini.
              </p>
            </section>

            <section className="paper-panel p-6">
              <div className="mb-5">
                <p className="section-label">Step 1</p>
                <h2 className="mt-2 text-3xl">Validate your Gemini key</h2>
              </div>
              <ApiKeyInput
                value={apiKey}
                onChange={setApiKey}
                onValidationChange={setApiKeyValid}
              />
            </section>

            <section className="paper-panel p-6">
              <div className="mb-5">
                <p className="section-label">Step 2</p>
                <h2 className="mt-2 text-3xl">Add lesson content</h2>
              </div>
              <LessonInput
                value={lessonContent}
                onChange={setLessonContent}
                fileName={fileName}
                onFileNameChange={setFileName}
              />
            </section>

            <section className="paper-panel p-6">
              <div className="mb-5">
                <p className="section-label">Step 3</p>
                <h2 className="mt-2 text-3xl">Choose quiz formats</h2>
              </div>
              <QuizTypeSelector selectedTypes={selectedTypes} onChange={handleTypeChange} />
            </section>

            {selectedTypes.length > 0 ? (
              <section className="paper-panel p-6">
                <div className="mb-5">
                  <p className="section-label">Step 4</p>
                  <h2 className="mt-2 text-3xl">Set item counts</h2>
                </div>
                <ItemDistribution
                  selectedTypes={selectedTypes}
                  distribution={distribution}
                  onChange={setDistribution}
                />
              </section>
            ) : null}

            <section className="paper-panel p-6">
              <div className="mb-5">
                <p className="section-label">Step 5</p>
                <h2 className="mt-2 text-3xl">Name your quiz</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="quiz-title" className="mb-2 block text-sm font-semibold">
                    Quiz title
                  </Label>
                  <Input
                    id="quiz-title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Example: Chapter 4 Review Quiz"
                  />
                </div>

                <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                  The generated draft opens in the editor right away, where you can revise
                  questions, answers, and export settings.
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="paper-panel p-6">
              <p className="section-label">Readiness check</p>
              <div className="mt-5 space-y-3">
                {Object.entries(checklist).map(([label, ready]) => (
                  <div key={label} className="flex items-start gap-3 text-sm">
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 ${ready ? 'text-emerald-600' : 'text-muted-foreground/50'}`}
                    />
                    <span className={ready ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="paper-panel p-6">
              <p className="section-label">Summary</p>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lesson length</span>
                  <span className="font-medium">{lessonContent.trim().length.toLocaleString()} chars</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Formats selected</span>
                  <span className="font-medium">{selectedTypes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total questions</span>
                  <span className="font-medium">{totalQuestions}</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                className="mt-6 w-full gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isGenerating ? 'Generating quiz...' : 'Generate quiz'}
              </Button>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Minimum lesson length: {MIN_CONTENT_LENGTH} characters. Maximum total questions:{' '}
                {MAX_TOTAL_QUESTIONS}.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
