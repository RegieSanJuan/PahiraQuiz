'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuizTypeLabel } from '@/components/quiz-type-label'
import { SiteBrand } from '@/components/site-brand'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  FileText,
  KeyRound,
  NotebookPen,
  Trash2,
} from 'lucide-react'
import { getDraftsList, deleteDraft } from '@/lib/localStorage'

export default function HomePage() {
  const [drafts, setDrafts] = useState<Array<{ id: string; title: string; savedAt: string }>>([])

  useEffect(() => {
    const savedDrafts = getDraftsList()
    setDrafts(savedDrafts)
  }, [])

  const handleDeleteDraft = (id: string) => {
    deleteDraft(id)
    setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== id))
  }

  return (
    <div className="min-h-screen text-foreground">
      <header className="border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="site-shell flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <SiteBrand size="compact" />

          <Link href="/generator">
            <Button className="gap-2">
              Open generator
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="site-shell py-10 sm:py-14">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="paper-panel p-6 sm:p-8">
            <p className="section-label">Classroom quiz builder</p>
            <h1 className="page-title mt-3 max-w-3xl">
              Build a working quiz draft from your lesson, then clean it up before you print.
            </h1>
            <p className="muted-copy mt-5 max-w-2xl">
              PahiraQuiz keeps the workflow simple: validate your Gemini 2.5 key, upload a PDF or
              paste your lesson, choose the question formats you need, and edit everything before
              export.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/generator">
                <Button size="lg" className="gap-2">
                  Start a quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              {drafts[0] ? (
                <Link href={`/editor?id=${drafts[0].id}`}>
                  <Button size="lg" variant="outline">
                    Continue latest draft
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="paper-panel p-6">
            <p className="section-label">Before you start</p>
            <h2 className="mt-3 text-3xl">What you need</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-4 w-4 text-primary" />
                <p>A valid Google AI Studio key for the Gemini 2.5 Flash model.</p>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-primary" />
                <p>Lesson content in PDF, TXT, or pasted text form.</p>
              </div>
              <div className="flex items-start gap-3">
                <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
                <p>Five minutes to review the generated questions before export.</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="paper-panel p-6">
            <p className="section-label">How it works</p>
            <div className="mt-5 space-y-5">
              {[
                'Add your Gemini key and validate it once.',
                'Paste notes or upload a lesson file.',
                'Choose quiz types, set counts, then edit before saving or exporting.',
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-foreground/90">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-panel p-6">
            <p className="section-label">Question formats</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  type: 'sir-dong-style' as const,
                  description: 'Two statements plus four choices about their relationship.',
                },
                {
                  type: 'multiple-choice' as const,
                  description: 'Standard four-choice questions for quick checking.',
                },
                {
                  type: 'identification' as const,
                  description: 'Short-answer questions for terms, names, and concepts.',
                },
                {
                  type: 'fill-in-blank' as const,
                  description: 'Sentence-based items with one missing word or phrase.',
                },
              ].map((format) => (
                <div key={format.type} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <h3 className="text-xl">
                    <QuizTypeLabel type={format.type} />
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {format.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {drafts.length > 0 && (
          <section className="paper-panel mt-8 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label">Saved work</p>
                <h2 className="mt-2 text-3xl">Recent drafts</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Drafts stay on this browser until you delete them.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {drafts.slice(0, 6).map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link href={`/editor?id=${draft.id}`} className="font-semibold hover:text-primary">
                      {draft.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Last saved{' '}
                      {new Date(draft.savedAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/editor?id=${draft.id}`}>
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDraft(draft.id)}
                      aria-label={`Delete ${draft.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border/80 py-6">
        <div className="site-shell flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>Built for quicker classroom prep.</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpenText className="h-4 w-4" />
            <span>All drafts stay on your device.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
