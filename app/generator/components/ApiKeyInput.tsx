'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { validateApiKey } from '@/lib/gemini'
import { toast } from 'sonner'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
  onValidationChange: (isValid: boolean) => void
}

export function ApiKeyInput({
  value,
  onChange,
  onValidationChange,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')

  // Debounced validation
  useEffect(() => {
    if (!value) {
      setValidationStatus('idle')
      onValidationChange(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsValidating(true)
      try {
        const isValid = await validateApiKey(value)
        setValidationStatus(isValid ? 'valid' : 'invalid')
        onValidationChange(isValid)
        if (!isValid) {
          toast.error('Invalid API key. Please check and try again.')
        }
      } catch (error) {
        console.error('Validation error:', error)
        setValidationStatus('invalid')
        onValidationChange(false)
      } finally {
        setIsValidating(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [value, onValidationChange])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="api-key" className="text-base font-semibold mb-2 block">
          Gemini API Key
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Enter your Google Gemini API key. Get one free at{' '}
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      <div className="relative">
        <Input
          id="api-key"
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="AIza... (your API key)"
          className="pr-24"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1 hover:bg-secondary rounded"
            type="button"
            aria-label={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {isValidating && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {!isValidating && validationStatus === 'valid' && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          {!isValidating && validationStatus === 'invalid' && (
            <X className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {validationStatus === 'valid' && (
        <p className="text-sm text-green-600">API key is valid and ready to use.</p>
      )}
    </div>
  )
}
