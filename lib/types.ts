// Quiz type definitions for PahiraQuiz

export type QuizType = 'sir-dong-style' | 'multiple-choice' | 'identification' | 'fill-in-blank'

// Base interface for all quiz items
export interface QuizItem {
  id: string
  type: QuizType
  number: number
}

// Sir Dong Style: Two statements with relationship choices
export interface SirDongStyleItem extends QuizItem {
  type: 'sir-dong-style'
  statement1: string
  statement2: string
  choices: [string, string, string, string] // A, B, C, D
  correctAnswer: 'A' | 'B' | 'C' | 'D'
}

// Multiple Choice: Standard MCQ format
export interface MultipleChoiceItem extends QuizItem {
  type: 'multiple-choice'
  question: string
  choices: [string, string, string, string] // A, B, C, D
  correctAnswer: 'A' | 'B' | 'C' | 'D'
}

// Identification: Short answer questions
export interface IdentificationItem extends QuizItem {
  type: 'identification'
  question: string
  correctAnswer: string
}

// Fill in the Blank: Sentence with blank to fill
export interface FillInBlankItem extends QuizItem {
  type: 'fill-in-blank'
  sentence: string
  correctAnswer: string
}

// Union type for any quiz item
export type AnyQuizItem = 
  | SirDongStyleItem 
  | MultipleChoiceItem 
  | IdentificationItem 
  | FillInBlankItem

// Main Quiz interface
export interface Quiz {
  id: string
  title: string
  lessonContent: string
  types: QuizType[]
  items: AnyQuizItem[]
  createdAt: Date
  updatedAt: Date
}

// Answer Key structure
export interface AnswerKey {
  quizId: string
  items: AnyQuizItem[]
  byType: Record<QuizType, AnyQuizItem[]>
  generatedAt: Date
}
