'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'
import { GEMINI_MODEL, validateApiKey } from '@/lib/gemini'
import { clearApiKey, loadApiKey, saveApiKey } from '@/lib/localStorage'
import { toast } from 'sonner'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
  onValidationChange: (isValid: boolean) => void
}

type ValidationStatus = 'idle' | 'saved' | 'validating' | 'valid' | 'invalid'

export function ApiKeyInput({
  value,
  onChange,
  onValidationChange,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [statusMessage, setStatusMessage] = useState(
    'Your key is stored only in this browser. Validate it before generating.'
  )
  const [hasStoredKey, setHasStoredKey] = useState(false)

  useEffect(() => {
    const storedKey = loadApiKey()
    if (!value && storedKey) {
      onChange(storedKey)
      setHasStoredKey(true)
      setValidationStatus('saved')
      setStatusMessage('Saved key loaded from this browser. Validate it to continue.')
    }
  }, [onChange, value])

  const handleValidate = async () => {
    const trimmedKey = value.trim()
    if (!trimmedKey) {
      toast.error('Paste your Gemini API key first.')
      return
    }

    setValidationStatus('validating')
    setStatusMessage(`Checking your key against ${GEMINI_MODEL}...`)
    onValidationChange(false)

    try {
      const result = await validateApiKey(trimmedKey)
      if (!result.valid) {
        throw new Error('The Gemini API key could not be validated.')
      }

      onChange(trimmedKey)
      onValidationChange(true)
      setValidationStatus('valid')
      setStatusMessage(`Key accepted for ${result.model}. It is saved only on this browser.`)
      setHasStoredKey(true)
      saveApiKey(trimmedKey)
      toast.success('API key validated.')
    } catch (error) {
      console.error('Validation error:', error)
      setValidationStatus('invalid')
      setStatusMessage(error instanceof Error ? error.message : 'Unable to validate the API key.')
      toast.error(error instanceof Error ? error.message : 'Unable to validate the API key.')
    }
  }

  const handleClearStoredKey = () => {
    clearApiKey()
    onChange('')
    onValidationChange(false)
    setValidationStatus('idle')
    setStatusMessage('Saved key removed from this browser.')
    setHasStoredKey(false)
    toast.success('Saved API key removed.')
  }

  const handleValueChange = (nextValue: string) => {
    onChange(nextValue)
    onValidationChange(false)
    setValidationStatus(nextValue ? 'idle' : hasStoredKey ? 'saved' : 'idle')
    setStatusMessage(
      nextValue
        ? 'Click validate to confirm the key before generating.'
        : 'Paste your Gemini API key here.'
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-4 w-4 text-primary" />
          <p>
            Use a Google AI Studio API key with <span className="font-medium text-foreground">{GEMINI_MODEL}</span>.
            The key is kept only in this browser unless you remove it.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="api-key" className="mb-2 block text-sm font-semibold">
          Gemini API key
        </Label>
        <p className="mb-3 text-sm text-muted-foreground">
          Get a key from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
          .
        </p>
      </div>

      <div className="relative">
        <Input
          id="api-key"
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="AIza... (your API key)"
          className="pr-12"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <button
            onClick={() => setShowKey(!showKey)}
            className="rounded p-1 hover:bg-secondary"
            type="button"
            aria-label={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleValidate}
          disabled={validationStatus === 'validating'}
          className="gap-2"
        >
          {validationStatus === 'validating' ? 'Validating...' : 'Validate key'}
        </Button>

        {hasStoredKey ? (
          <Button type="button" variant="outline" onClick={handleClearStoredKey}>
            Remove saved key
          </Button>
        ) : null}
      </div>

      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          validationStatus === 'valid'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : validationStatus === 'invalid'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-border bg-background text-muted-foreground'
        }`}
      >
        <div className="flex items-start gap-3">
          {validationStatus === 'valid' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
          ) : validationStatus === 'invalid' ? (
            <AlertCircle className="mt-0.5 h-4 w-4" />
          ) : (
            <KeyRound className="mt-0.5 h-4 w-4" />
          )}
          <p>{statusMessage}</p>
        </div>
      </div>
    </div>
  )
}
