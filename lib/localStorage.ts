import { Quiz } from './types'

const STORAGE_KEY = 'pahira-quiz-draft'
const DRAFTS_KEY = 'pahira-quiz-drafts'

// Save quiz draft
export function saveDraft(quiz: Quiz): void {
  if (typeof window === 'undefined') return

  try {
    const serialized = JSON.stringify(quiz)
    localStorage.setItem(STORAGE_KEY, serialized)
    
    // Also add to drafts list
    const drafts = getDraftsList()
    const existingIndex = drafts.findIndex(d => d.id === quiz.id)
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = {
        id: quiz.id,
        title: quiz.title,
        savedAt: new Date().toISOString(),
      }
    } else {
      drafts.push({
        id: quiz.id,
        title: quiz.title,
        savedAt: new Date().toISOString(),
      })
    }
    
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

// Load latest draft
export function loadDraft(): Quiz | null {
  if (typeof window === 'undefined') return null

  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null

    const quiz = JSON.parse(serialized)
    // Convert date strings back to Date objects
    quiz.createdAt = new Date(quiz.createdAt)
    quiz.updatedAt = new Date(quiz.updatedAt)
    return quiz
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

// Get list of all saved drafts
export function getDraftsList(): Array<{
  id: string
  title: string
  savedAt: string
}> {
  if (typeof window === 'undefined') return []

  try {
    const serialized = localStorage.getItem(DRAFTS_KEY)
    return serialized ? JSON.parse(serialized) : []
  } catch (error) {
    console.error('Failed to load drafts list:', error)
    return []
  }
}

// Load specific draft by ID
export function loadDraftById(id: string): Quiz | null {
  if (typeof window === 'undefined') return null

  try {
    const drafts = getDraftsList()
    const draft = drafts.find(d => d.id === id)
    
    if (!draft) return null
    
    // For now, only the current draft is stored
    // In a full implementation, you'd store all drafts separately
    const current = loadDraft()
    return current?.id === id ? current : null
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

// Delete draft
export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const current = loadDraft()
    if (current?.id === id) {
      localStorage.removeItem(STORAGE_KEY)
    }

    const drafts = getDraftsList()
    const filtered = drafts.filter(d => d.id !== id)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete draft:', error)
  }
}

// Clear all drafts
export function clearAllDrafts(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(DRAFTS_KEY)
  } catch (error) {
    console.error('Failed to clear drafts:', error)
  }
}
