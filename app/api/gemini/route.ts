import { NextResponse } from 'next/server'
import { buildQuizPrompt, extractGeneratedItems, GEMINI_MODEL } from '@/lib/gemini'
import { QuizType } from '@/lib/types'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

interface ValidateRequestBody {
  action: 'validate'
  apiKey?: string
}

interface GenerateRequestBody {
  action: 'generate'
  apiKey?: string
  lessonContent?: string
  selectedTypes?: QuizType[]
  distribution?: Record<QuizType, number>
}

type RequestBody = ValidateRequestBody | GenerateRequestBody

async function getGeminiErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json()
    return data?.error?.message || `Gemini request failed with status ${response.status}.`
  } catch {
    return `Gemini request failed with status ${response.status}.`
  }
}

function isValidDistribution(
  distribution: Record<QuizType, number>,
  selectedTypes: QuizType[]
): boolean {
  return selectedTypes.every(
    (type) => Number.isInteger(distribution[type]) && distribution[type] >= 0 && distribution[type] <= 50
  )
}

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: RequestBody

  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body.apiKey?.trim()) {
    return NextResponse.json({ error: 'Please provide a Gemini API key.' }, { status: 400 })
  }

  if (body.action === 'validate') {
    const response = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_MODEL}`, {
      headers: {
        'x-goog-api-key': body.apiKey.trim(),
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const message = await getGeminiErrorMessage(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({
      valid: true,
      model: GEMINI_MODEL,
    })
  }

  if (body.action !== 'generate') {
    return NextResponse.json({ error: 'Unsupported Gemini action.' }, { status: 400 })
  }

  const lessonContent = body.lessonContent?.trim()
  const selectedTypes = body.selectedTypes ?? []
  const distribution = body.distribution

  if (!lessonContent || lessonContent.length < 50) {
    return NextResponse.json(
      { error: 'Please provide enough lesson content to generate a quiz.' },
      { status: 400 }
    )
  }

  if (!selectedTypes.length) {
    return NextResponse.json({ error: 'Select at least one quiz type.' }, { status: 400 })
  }

  if (!distribution || !isValidDistribution(distribution, selectedTypes)) {
    return NextResponse.json(
      { error: 'Enter valid question counts for each selected type.' },
      { status: 400 }
    )
  }

  const totalQuestions = selectedTypes.reduce((sum, type) => sum + distribution[type], 0)
  if (totalQuestions <= 0 || totalQuestions > 100) {
    return NextResponse.json(
      { error: 'Choose a total question count between 1 and 100.' },
      { status: 400 }
    )
  }

  const response = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': body.apiKey.trim(),
    },
    cache: 'no-store',
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: buildQuizPrompt(lessonContent, selectedTypes, distribution),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.9,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const message = await getGeminiErrorMessage(response)
    return NextResponse.json({ error: message }, { status: response.status })
  }

  try {
    const data = await response.json()
    const items = extractGeneratedItems(data)

    return NextResponse.json({
      items,
      model: GEMINI_MODEL,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Gemini returned a response that could not be parsed.',
      },
      { status: 502 }
    )
  }
}
