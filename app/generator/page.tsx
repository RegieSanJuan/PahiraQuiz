'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiKeyInput } from './components/ApiKeyInput'
import { LessonInput } from './components/LessonInput'
import { QuizTypeSelector } from './components/QuizTypeSelector'
import { ItemDistribution } from './components/ItemDistribution'
import { Quiz, QuizType } from '@/lib/types'
import { generateQuiz } from '@/lib/gemini'
import { saveDraft } from '@/lib/localStorage'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function GeneratorPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
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

  const totalQuestions = Object.values(distribution).reduce((a, b) => a + b, 0)

  const canProceed = {
    1: apiKeyValid,
    2: lessonContent.length >= 50,
    3: selectedTypes.length > 0,
    4: totalQuestions > 0 && totalQuestions <= 100,
  }

  const handleNext = () => {
    if (canProceed[step as keyof typeof canProceed]) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleGenerate = async () => {
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title')
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

      // Save draft
      saveDraft(quiz)

      // Redirect to editor
      router.push(`/editor?id=${quiz.id}`)
      toast.success('Quiz generated successfully!')
    } catch (error) {
      console.error('Quiz generation error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to generate quiz. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="font-bold">PahiraQuiz</span>
          </Link>
          <span className="text-muted-foreground">/ Generator</span>
        </div>
        <span className="text-sm text-muted-foreground">Step {step} of 5</span>
      </nav>

      <div className="px-6 py-12 max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  s < step
                    ? 'bg-primary text-primary-foreground'
                    : s === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="mb-8">
          <CardHeader>
            {step === 1 && (
              <>
                <CardTitle>Configure API Key</CardTitle>
                <CardDescription>
                  Set up your Google Gemini API key to start generating quizzes
                </CardDescription>
              </>
            )}
            {step === 2 && (
              <>
                <CardTitle>Upload Lesson Content</CardTitle>
                <CardDescription>
                  Provide the lesson material that your quiz will be based on
                </CardDescription>
              </>
            )}
            {step === 3 && (
              <>
                <CardTitle>Select Quiz Types</CardTitle>
                <CardDescription>
                  Choose which types of questions to include in your quiz
                </CardDescription>
              </>
            )}
            {step === 4 && (
              <>
                <CardTitle>Set Question Distribution</CardTitle>
                <CardDescription>
                  Specify how many questions of each type you want
                </CardDescription>
              </>
            )}
            {step === 5 && (
              <>
                <CardTitle>Review & Generate</CardTitle>
                <CardDescription>
                  Finalize your settings and generate the quiz
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-8">
            {step === 1 && (
              <ApiKeyInput
                value={apiKey}
                onChange={setApiKey}
                onValidationChange={setApiKeyValid}
              />
            )}

            {step === 2 && (
              <LessonInput
                value={lessonContent}
                onChange={setLessonContent}
                fileName={fileName}
                onFileNameChange={setFileName}
              />
            )}

            {step === 3 && (
              <QuizTypeSelector
                selectedTypes={selectedTypes}
                onChange={setSelectedTypes}
              />
            )}

            {step === 4 && (
              <ItemDistribution
                selectedTypes={selectedTypes}
                distribution={distribution}
                onChange={setDistribution}
              />
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="p-4 bg-card border border-border rounded-lg">
                  <Label className="text-sm font-semibold mb-4 block">
                    Quiz Title
                  </Label>
                  <Input
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Quiz Summary</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Types selected:</span>
                      <span className="font-medium">{selectedTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total questions:</span>
                      <span className="font-medium">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content length:</span>
                      <span className="font-medium">
                        {Math.round(lessonContent.length / 100)} × 100 chars
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-accent">
                    Your quiz will be generated using the Gemini API. This may take a moment depending on the size.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {step < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed[step as keyof typeof canProceed]}
                  className="ml-auto gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !quizTitle.trim()}
                  className="ml-auto gap-2"
                >
                  {isGenerating && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Quiz'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
