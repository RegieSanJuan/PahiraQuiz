import { AnyQuizItem, Quiz, QuizType } from './types'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// Validate API key with a test call
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Test',
              },
            ],
          },
        ],
      }),
    })
    return response.ok
  } catch (error) {
    console.error('API key validation failed:', error)
    return false
  }
}

// Build the prompt for quiz generation
function buildQuizPrompt(
  lessonContent: string,
  selectedTypes: QuizType[],
  distribution: Record<QuizType, number>
): string {
  const typeInstructions: Record<QuizType, string> = {
    'sir-dong-style': `Sir Dong Style: Create pairs of statements (statement1, statement2) with 4 multiple choice answers (A, B, C, D). The correct answer should indicate the relationship between statements (both true, both false, first true/second false, etc.).`,
    'multiple-choice': `Multiple Choice: Create a question with 4 options (A, B, C, D) labeled as "choices". All options must be plausible.`,
    'identification': `Identification: Create a question with a short answer (one phrase or word). Format: question field with answer in correctAnswer field.`,
    'fill-in-blank': `Fill in the Blank: Create a sentence with a blank space (use _____ to indicate the blank) and provide the correct word to fill it.`,
  }

  let prompt = `You are an expert educational content creator. Generate a quiz based on the following lesson content.

LESSON CONTENT:
${lessonContent}

QUIZ REQUIREMENTS:
Generate exactly these types and quantities:
${selectedTypes.map((type) => `- ${typeInstructions[type]}: ${distribution[type]} items`).join('\n')}

RESPONSE FORMAT:
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "items": [
    For Sir Dong Style items:
    {
      "type": "sir-dong-style",
      "statement1": "first statement",
      "statement2": "second statement",
      "choices": ["A: option A", "B: option B", "C: option C", "D: option D"],
      "correctAnswer": "A"
    },
    For Multiple Choice items:
    {
      "type": "multiple-choice",
      "question": "the question",
      "choices": ["A: option A", "B: option B", "C: option C", "D: option D"],
      "correctAnswer": "A"
    },
    For Identification items:
    {
      "type": "identification",
      "question": "the question",
      "correctAnswer": "the answer"
    },
    For Fill in the Blank items:
    {
      "type": "fill-in-blank",
      "sentence": "This is a sentence with a _____ to be filled",
      "correctAnswer": "word"
    }
  ]
}

QUALITY REQUIREMENTS:
1. All questions must directly relate to the lesson content
2. For multiple choice and sir dong style: Vary correct answers (don't use same letter repeatedly)
3. Use clear, grammatically correct English
4. Ensure distractors are plausible but distinguishably incorrect
5. Avoid ambiguous questions
6. Make sure answers are appropriate for the educational level`

  return prompt
}

interface GenerateQuizParams {
  apiKey: string
  lessonContent: string
  quizTitle: string
  selectedTypes: QuizType[]
  distribution: Record<QuizType, number>
}

export async function generateQuiz({
  apiKey,
  lessonContent,
  quizTitle,
  selectedTypes,
  distribution,
}: GenerateQuizParams): Promise<Quiz> {
  const prompt = buildQuizPrompt(lessonContent, selectedTypes, distribution)

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()

  // Extract the text response
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textContent) {
    throw new Error('No content in Gemini response')
  }

  // Parse the JSON from the response
  let parsedResponse: { items: any[] }
  try {
    // Remove markdown code blocks if present
    const cleanedText = textContent
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    parsedResponse = JSON.parse(cleanedText)
  } catch (error) {
    console.error('Failed to parse Gemini response:', textContent)
    throw new Error('Failed to parse quiz generation response')
  }

  // Convert response items to typed quiz items with IDs and numbers
  const items: AnyQuizItem[] = parsedResponse.items.map((item: any, index: number) => {
    const id = `item-${Date.now()}-${index}`
    const number = index + 1

    if (item.type === 'sir-dong-style') {
      return {
        id,
        type: 'sir-dong-style',
        number,
        statement1: item.statement1 || '',
        statement2: item.statement2 || '',
        choices: item.choices || ['', '', '', ''],
        correctAnswer: (item.correctAnswer || 'A') as 'A' | 'B' | 'C' | 'D',
      }
    } else if (item.type === 'multiple-choice') {
      return {
        id,
        type: 'multiple-choice',
        number,
        question: item.question || '',
        choices: item.choices || ['', '', '', ''],
        correctAnswer: (item.correctAnswer || 'A') as 'A' | 'B' | 'C' | 'D',
      }
    } else if (item.type === 'identification') {
      return {
        id,
        type: 'identification',
        number,
        question: item.question || '',
        correctAnswer: item.correctAnswer || '',
      }
    } else if (item.type === 'fill-in-blank') {
      return {
        id,
        type: 'fill-in-blank',
        number,
        sentence: item.sentence || '',
        correctAnswer: item.correctAnswer || '',
      }
    }

    throw new Error(`Unknown quiz type: ${item.type}`)
  })

  const now = new Date()
  return {
    id: `quiz-${Date.now()}`,
    title: quizTitle,
    lessonContent,
    types: selectedTypes,
    items,
    createdAt: now,
    updatedAt: now,
  }
}
