import { AnyQuizItem, Quiz, QuizType } from './types'

export const GEMINI_MODEL = 'gemini-2.5-flash'

interface GenerateQuizParams {
  apiKey: string
  lessonContent: string
  quizTitle: string
  selectedTypes: QuizType[]
  distribution: Record<QuizType, number>
}

interface ValidateApiKeyResponse {
  valid: boolean
  model: string
}

interface RawGeneratedItem {
  type?: string
  statement1?: string
  statement2?: string
  question?: string
  sentence?: string
  choices?: unknown
  correctAnswer?: string
}

function cleanJsonText(rawText: string): string {
  const trimmed = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  const jsonStartsAt = Math.min(
    ...['{', '[']
      .map((token) => trimmed.indexOf(token))
      .filter((index) => index >= 0)
  )
  const jsonEndsAt = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'))

  if (Number.isFinite(jsonStartsAt) && jsonEndsAt >= jsonStartsAt) {
    return trimmed.slice(jsonStartsAt, jsonEndsAt + 1)
  }

  return trimmed
}

function extractTextContent(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts
  const text = Array.isArray(parts)
    ? parts
        .map((part) => (typeof part?.text === 'string' ? part.text : ''))
        .join('')
        .trim()
    : ''

  if (text) {
    return text
  }

  const blockReason = data?.promptFeedback?.blockReason
  if (blockReason) {
    throw new Error(`Gemini blocked the request: ${blockReason}`)
  }

  throw new Error('Gemini returned an empty response.')
}

function parseGeneratedPayload(data: any): { items: RawGeneratedItem[] } {
  const parsedText = cleanJsonText(extractTextContent(data))

  try {
    const parsed = JSON.parse(parsedText)

    if (Array.isArray(parsed)) {
      return { items: parsed }
    }

    if (Array.isArray(parsed?.items)) {
      return { items: parsed.items }
    }
  } catch (error) {
    console.error('Failed to parse Gemini response:', parsedText, error)
  }

  throw new Error('Failed to parse the quiz returned by Gemini.')
}

function normalizeChoice(choice: string): string {
  return choice.replace(/^[A-D][\s:.):-]+/i, '').trim()
}

function normalizeChoices(choices: unknown): [string, string, string, string] {
  const normalizedChoices = Array.isArray(choices)
    ? choices.map((choice) => normalizeChoice(String(choice ?? ''))).slice(0, 4)
    : []

  while (normalizedChoices.length < 4) {
    normalizedChoices.push('')
  }

  return normalizedChoices as [string, string, string, string]
}

function normalizeCorrectAnswer(value?: string): 'A' | 'B' | 'C' | 'D' {
  const answer = value?.trim().toUpperCase()
  return answer === 'B' || answer === 'C' || answer === 'D' ? answer : 'A'
}

export function buildQuizPrompt(
  lessonContent: string,
  selectedTypes: QuizType[],
  distribution: Record<QuizType, number>
): string {
  const typeInstructions: Record<QuizType, string> = {
    'sir-dong-style':
      'Create a Multiple Statement Quiz ( Sir dong inspired ) item with two statements and four plain-text choices. The correct answer must be one of A, B, C, or D.',
    'multiple-choice':
      'Create one question and four plain-text choices. The correct answer must be one of A, B, C, or D.',
    identification:
      'Create one short-answer question. The answer should be concise and directly supported by the lesson.',
    'fill-in-blank':
      'Create one sentence that contains _____ and provide the missing word or phrase.',
  }

  return `You are creating a classroom quiz from the lesson content below.

LESSON CONTENT:
${lessonContent}

QUIZ REQUIREMENTS:
Generate exactly these item counts:
${selectedTypes.map((type) => `- ${type}: ${distribution[type]} item(s). ${typeInstructions[type]}`).join('\n')}

OUTPUT RULES:
1. Return JSON only.
2. Put the quiz items in an "items" array.
3. For multiple-choice and sir-dong-style items, "choices" must contain exactly 4 answer texts without A/B/C/D prefixes.
4. The "sir-dong-style" type is the Multiple Statement Quiz ( Sir dong inspired ) format.
5. "correctAnswer" for multiple-choice and sir-dong-style items must be a single letter: A, B, C, or D.
6. Keep the language clear, direct, and suitable for students.
7. Use only details supported by the lesson content.
8. Avoid repeating the same correct letter too often.

JSON FORMAT:
{
  "items": [
    {
      "type": "sir-dong-style",
      "statement1": "first statement",
      "statement2": "second statement",
      "choices": ["choice one", "choice two", "choice three", "choice four"],
      "correctAnswer": "A"
    },
    {
      "type": "multiple-choice",
      "question": "question text",
      "choices": ["choice one", "choice two", "choice three", "choice four"],
      "correctAnswer": "B"
    },
    {
      "type": "identification",
      "question": "question text",
      "correctAnswer": "answer text"
    },
    {
      "type": "fill-in-blank",
      "sentence": "A sentence with a _____ in it.",
      "correctAnswer": "word or phrase"
    }
  ]
}`
}

export function extractGeneratedItems(data: any): RawGeneratedItem[] {
  const payload = parseGeneratedPayload(data)
  if (!payload.items.length) {
    throw new Error('Gemini did not return any quiz items.')
  }

  return payload.items
}

export async function validateApiKey(apiKey: string): Promise<ValidateApiKeyResponse> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'validate',
      apiKey,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Unable to validate the Gemini API key.')
  }

  return {
    valid: Boolean(data.valid),
    model: data.model ?? GEMINI_MODEL,
  }
}

export async function generateQuiz({
  apiKey,
  lessonContent,
  quizTitle,
  selectedTypes,
  distribution,
}: GenerateQuizParams): Promise<Quiz> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generate',
      apiKey,
      lessonContent,
      selectedTypes,
      distribution,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Unable to generate the quiz.')
  }

  const items: AnyQuizItem[] = (data.items as RawGeneratedItem[]).map((item, index) => {
    const id = `item-${Date.now()}-${index}`
    const number = index + 1

    if (item.type === 'sir-dong-style') {
      return {
        id,
        type: 'sir-dong-style',
        number,
        statement1: item.statement1?.trim() ?? '',
        statement2: item.statement2?.trim() ?? '',
        choices: normalizeChoices(item.choices),
        correctAnswer: normalizeCorrectAnswer(item.correctAnswer),
      }
    }

    if (item.type === 'multiple-choice') {
      return {
        id,
        type: 'multiple-choice',
        number,
        question: item.question?.trim() ?? '',
        choices: normalizeChoices(item.choices),
        correctAnswer: normalizeCorrectAnswer(item.correctAnswer),
      }
    }

    if (item.type === 'identification') {
      return {
        id,
        type: 'identification',
        number,
        question: item.question?.trim() ?? '',
        correctAnswer: item.correctAnswer?.trim() ?? '',
      }
    }

    if (item.type === 'fill-in-blank') {
      return {
        id,
        type: 'fill-in-blank',
        number,
        sentence: item.sentence?.trim() ?? '',
        correctAnswer: item.correctAnswer?.trim() ?? '',
      }
    }

    throw new Error(`Unknown quiz type returned by Gemini: ${item.type}`)
  })

  const now = new Date()
  return {
    id: `quiz-${Date.now()}`,
    title: quizTitle.trim(),
    lessonContent,
    types: selectedTypes,
    items,
    createdAt: now,
    updatedAt: now,
  }
}
