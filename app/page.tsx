'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Sparkles, BookOpen, Download, Zap, Clock } from 'lucide-react'
import { getDraftsList, deleteDraft } from '@/lib/localStorage'
import { Trash2 } from 'lucide-react'

export default function HomePage() {
  const [drafts, setDrafts] = useState<Array<{ id: string; title: string; savedAt: string }>>([])

  useEffect(() => {
    const savedDrafts = getDraftsList()
    setDrafts(savedDrafts.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ))
  }, [])

  const handleDeleteDraft = (id: string) => {
    deleteDraft(id)
    setDrafts(drafts.filter(d => d.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">PahiraQuiz</span>
        </div>
        <Link href="/generator">
          <Button className="gap-2">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">AI-Powered Quiz Generation</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-balance">
          Create Stunning Quizzes in Seconds
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-balance">
          Transform your lesson materials into comprehensive quizzes with AI. Support for 4 quiz types, instant answer keys, and PDF exports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/generator">
            <Button size="lg" className="gap-2 px-8">
              Create Your First Quiz
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="gap-2 px-8">
            View Documentation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 w-full py-12 border-y border-border">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary mb-2">4</div>
            <div className="text-sm text-muted-foreground">Quiz Types</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary mb-2">{"<1min"}</div>
            <div className="text-sm text-muted-foreground">Generation Time</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Customizable</div>
          </div>
        </div>
      </section>

      {/* Recent Drafts Section */}
      {drafts.length > 0 && (
        <section className="px-6 py-16 bg-card border-t border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Recent Drafts
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {drafts.slice(0, 4).map((draft) => (
                <div
                  key={draft.id}
                  className="p-4 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors flex items-center justify-between group"
                >
                  <Link href={`/editor?id=${draft.id}`} className="flex-1">
                    <p className="font-semibold hover:text-primary transition-colors">
                      {draft.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(draft.savedAt).toLocaleDateString()} at{' '}
                      {new Date(draft.savedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="ml-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded"
                    title="Delete draft"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">Everything you need to create professional quizzes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Generation</h3>
                <p className="text-muted-foreground">
                  Upload your lesson materials and let AI generate comprehensive quizzes in seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">4 Quiz Types</h3>
                <p className="text-muted-foreground">
                  Sir Dong Style, Multiple Choice, Identification, and Fill in the Blank formats.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Full Editing Capabilities</h3>
                <p className="text-muted-foreground">
                  Edit questions, answers, and regenerate individual items exactly how you want them.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Instant PDF Export</h3>
                <p className="text-muted-foreground">
                  Download professionally formatted quizzes with optional answer keys for printing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Types Section */}
      <section className="px-6 py-24 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quiz Type Examples</h2>
            <p className="text-lg text-muted-foreground">Support for different assessment formats</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sir Dong Style */}
            <div className="p-6 border border-border rounded-lg bg-background">
              <h3 className="font-bold text-lg mb-4 text-primary">Sir Dong Style</h3>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Statement 1:</strong> The Earth revolves around the Sun
                </p>
                <p className="text-muted-foreground">
                  <strong>Statement 2:</strong> The Sun is a fixed point in space
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">A. Both statements are true</p>
                  <p className="text-muted-foreground">B. Statement 1 is true, Statement 2 is false</p>
                  <p className="text-muted-foreground">C. Both statements are false</p>
                  <p className="text-muted-foreground">D. Statement 1 is false, Statement 2 is true</p>
                </div>
              </div>
            </div>

            {/* Multiple Choice */}
            <div className="p-6 border border-border rounded-lg bg-background">
              <h3 className="font-bold text-lg mb-4 text-primary">Multiple Choice</h3>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Question:</strong> What is the capital of France?
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">A. London</p>
                  <p className="text-muted-foreground">B. Paris</p>
                  <p className="text-muted-foreground">C. Berlin</p>
                  <p className="text-muted-foreground">D. Madrid</p>
                </div>
              </div>
            </div>

            {/* Identification */}
            <div className="p-6 border border-border rounded-lg bg-background">
              <h3 className="font-bold text-lg mb-4 text-primary">Identification</h3>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Question:</strong> Who was the first President of the United States?
                </p>
                <p className="text-muted-foreground italic">Answer: George Washington</p>
              </div>
            </div>

            {/* Fill in the Blank */}
            <div className="p-6 border border-border rounded-lg bg-background">
              <h3 className="font-bold text-lg mb-4 text-primary">Fill in the Blank</h3>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Sentence:</strong> The _____ is the largest planet in our solar system.
                </p>
                <p className="text-muted-foreground italic">Answer: Jupiter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Quiz?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Get started in minutes. No account required. All you need is your Gemini API key.
        </p>
        <Link href="/generator">
          <Button size="lg" className="gap-2 px-8">
            Create Your First Quiz
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold">PahiraQuiz</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Created with AI. No data stored. All processing is client-side.
          </p>
        </div>
      </footer>
    </div>
  )
}
