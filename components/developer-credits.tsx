'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Github, Instagram, Linkedin, User, X } from 'lucide-react'

export function DeveloperCredits() {
  const [showDeveloperModal, setShowDeveloperModal] = useState(false)

  useEffect(() => {
    if (!showDeveloperModal) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDeveloperModal(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [showDeveloperModal])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowDeveloperModal(true)}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-orange-700 hover:to-red-700 hover:shadow-xl"
          size="sm"
          aria-label="Open developer credits"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>

      {showDeveloperModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowDeveloperModal(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl duration-300 animate-in fade-in-0 zoom-in-95 dark:bg-gray-800"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="developer-info-title"
          >
            <div className="relative p-6">
              <Button
                onClick={() => setShowDeveloperModal(false)}
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close developer info"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="space-y-4">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-red-600">
                    <User className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <h3
                      id="developer-info-title"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Regie San Juan
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Algorithm Visualization
                    </p>
                  </div>

                  <div className="flex justify-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/regie-san-juan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-600 p-2 text-white transition-colors duration-200 hover:bg-blue-700"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>

                    <a
                      href="https://github.com/RegieSanJuan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-gray-800 p-2 text-white transition-colors duration-200 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>

                    <a
                      href="https://www.instagram.com/eiger____/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 p-2 text-white transition-all duration-200 hover:from-pink-600 hover:to-purple-700"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
