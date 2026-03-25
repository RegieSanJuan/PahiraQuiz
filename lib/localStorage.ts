import { Quiz } from './types'

const LEGACY_DRAFT_KEY = 'pahira-quiz-draft'
const CURRENT_DRAFT_ID_KEY = 'pahira-quiz-current-draft-id'
const DRAFTS_KEY = 'pahira-quiz-drafts'
const API_KEY_STORAGE = 'pahira-quiz-gemini-api-key'

interface DraftSummary {
  id: string
  title: string
  savedAt: string
}

function getDraftStorageKey(id: string): string {
  return `pahira-quiz-draft:${id}`
}

function parseQuiz(serialized: string | null): Quiz | null {
  if (!serialized) return null

  try {
    const quiz = JSON.parse(serialized) as Quiz
    return {
      ...quiz,
      createdAt: new Date(quiz.createdAt),
      updatedAt: new Date(quiz.updatedAt),
    }
  } catch (error) {
    console.error('Failed to parse draft:', error)
    return null
  }
}

function writeDraftsList(drafts: DraftSummary[]) {
  localStorage.setItem(
    DRAFTS_KEY,
    JSON.stringify(
      drafts
        .slice()
        .sort((left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime())
    )
  )
}

function migrateLegacyDraft(): Quiz | null {
  const legacyDraft = parseQuiz(localStorage.getItem(LEGACY_DRAFT_KEY))
  if (!legacyDraft) return null

  saveDraft(legacyDraft)
  localStorage.removeItem(LEGACY_DRAFT_KEY)

  return legacyDraft
}

export function saveDraft(quiz: Quiz): void {
  if (typeof window === 'undefined') return

  try {
    const serialized = JSON.stringify(quiz)
    const savedAt = new Date().toISOString()
    const existingDrafts = getDraftsList().filter((draft) => draft.id !== quiz.id)

    localStorage.setItem(getDraftStorageKey(quiz.id), serialized)
    localStorage.setItem(CURRENT_DRAFT_ID_KEY, quiz.id)
    writeDraftsList([
      {
        id: quiz.id,
        title: quiz.title,
        savedAt,
      },
      ...existingDrafts,
    ])
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

export function loadDraft(): Quiz | null {
  if (typeof window === 'undefined') return null

  try {
    const currentDraftId = localStorage.getItem(CURRENT_DRAFT_ID_KEY)
    if (currentDraftId) {
      return loadDraftById(currentDraftId)
    }

    const migratedDraft = migrateLegacyDraft()
    if (migratedDraft) {
      return migratedDraft
    }

    const latestDraft = getDraftsList()[0]
    return latestDraft ? loadDraftById(latestDraft.id) : null
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

export function getDraftsList(): DraftSummary[] {
  if (typeof window === 'undefined') return []

  try {
    const serialized = localStorage.getItem(DRAFTS_KEY)
    if (!serialized) return []

    const drafts = JSON.parse(serialized) as DraftSummary[]
    return drafts.sort(
      (left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime()
    )
  } catch (error) {
    console.error('Failed to load drafts list:', error)
    return []
  }
}

export function loadDraftById(id: string): Quiz | null {
  if (typeof window === 'undefined') return null

  try {
    const serialized = localStorage.getItem(getDraftStorageKey(id))
    if (serialized) {
      return parseQuiz(serialized)
    }

    const migratedDraft = migrateLegacyDraft()
    return migratedDraft?.id === id ? migratedDraft : null
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getDraftStorageKey(id))

    const remainingDrafts = getDraftsList().filter((draft) => draft.id !== id)
    writeDraftsList(remainingDrafts)

    const currentDraftId = localStorage.getItem(CURRENT_DRAFT_ID_KEY)
    if (currentDraftId === id) {
      if (remainingDrafts[0]) {
        localStorage.setItem(CURRENT_DRAFT_ID_KEY, remainingDrafts[0].id)
      } else {
        localStorage.removeItem(CURRENT_DRAFT_ID_KEY)
      }
    }
  } catch (error) {
    console.error('Failed to delete draft:', error)
  }
}

export function clearAllDrafts(): void {
  if (typeof window === 'undefined') return

  try {
    getDraftsList().forEach((draft) => {
      localStorage.removeItem(getDraftStorageKey(draft.id))
    })
    localStorage.removeItem(LEGACY_DRAFT_KEY)
    localStorage.removeItem(CURRENT_DRAFT_ID_KEY)
    localStorage.removeItem(DRAFTS_KEY)
  } catch (error) {
    console.error('Failed to clear drafts:', error)
  }
}

export function saveApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(API_KEY_STORAGE, apiKey)
  } catch (error) {
    console.error('Failed to save API key:', error)
  }
}

export function loadApiKey(): string {
  if (typeof window === 'undefined') return ''

  try {
    return localStorage.getItem(API_KEY_STORAGE) ?? ''
  } catch (error) {
    console.error('Failed to load API key:', error)
    return ''
  }
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(API_KEY_STORAGE)
  } catch (error) {
    console.error('Failed to clear API key:', error)
  }
}
