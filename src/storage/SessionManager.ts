/**
 * Session Manager
 * Handles session persistence, loading, and management
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type {
  SessionData,
  SessionMetadata,
  SessionListEntry,
  SessionFilter,
  SessionStatistics,
  ApiMessage,
} from './types.js'

// ─── Utility Functions ───────────────────────────────────────────────────

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatDate(date: Date): string {
  return date.toISOString()
}

function parseDate(dateString: string): Date {
  return new Date(dateString)
}

function generateTitle(messages: ApiMessage[]): string {
  // Use the first user message as title, truncate if too long
  const firstUserMessage = messages.find(m => m.role === 'user')
  if (firstUserMessage && typeof firstUserMessage.content === 'string') {
    const title = firstUserMessage.content.trim()
    return title.length > 50 ? title.slice(0, 47) + '...' : title
  }
  return 'Untitled Session'
}

// ─── Session Manager Class ───────────────────────────────────────────────

export class SessionManager {
  private sessionDir: string

  constructor(sessionDir?: string) {
    this.sessionDir = sessionDir ?? join(homedir(), '.miniclaude', 'sessions')

    // Ensure directory exists
    if (!existsSync(this.sessionDir)) {
      mkdirSync(this.sessionDir, { recursive: true })
    }
  }

  /**
   * Get the path to a session file
   */
  private getSessionPath(sessionId: string): string {
    return join(this.sessionDir, `${sessionId}.json`)
  }

  /**
   * Check if a session exists
   */
  public hasSession(sessionId: string): boolean {
    return existsSync(this.getSessionPath(sessionId))
  }

  /**
   * Create a new session
   */
  public createSession(
    messages: ApiMessage[],
    options: {
      cwd?: string
      model?: string
      title?: string
      tags?: string[]
    } = {},
  ): SessionData {
    const sessionId = generateSessionId()
    const now = new Date()

    const metadata: SessionMetadata = {
      id: sessionId,
      title: options.title ?? generateTitle(messages),
      createdAt: now,
      updatedAt: now,
      cwd: options.cwd ?? process.cwd(),
      model: options.model ?? 'glm-4',
      messageCount: messages.length,
      tags: options.tags ?? [],
      isPinned: false,
      isArchived: false,
    }

    const sessionData: SessionData = {
      metadata,
      messages,
      extra: {
        totalTokens: 0,
        toolCallCount: 0,
      },
    }

    this.saveSession(sessionData)

    return sessionData
  }

  /**
   * Save a session to disk
   */
  public saveSession(sessionData: SessionData): void {
    const path = this.getSessionPath(sessionData.metadata.id)

    // Update timestamps
    sessionData.metadata.updatedAt = new Date()
    sessionData.metadata.messageCount = sessionData.messages.length

    try {
      writeFileSync(path, JSON.stringify(sessionData, null, 2), 'utf-8')
    } catch (error) {
      throw new Error(`Failed to save session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Load a session from disk
   */
  public loadSession(sessionId: string): SessionData | null {
    const path = this.getSessionPath(sessionId)

    if (!existsSync(path)) {
      return null
    }

    try {
      const content = readFileSync(path, 'utf-8')
      const data = JSON.parse(content) as SessionData

      // Parse dates
      data.metadata.createdAt = parseDate(data.metadata.createdAt as any as string)
      data.metadata.updatedAt = parseDate(data.metadata.updatedAt as any as string)

      return data
    } catch (error) {
      throw new Error(`Failed to load session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Delete a session
   */
  public deleteSession(sessionId: string): boolean {
    const path = this.getSessionPath(sessionId)

    if (!existsSync(path)) {
      return false
    }

    try {
      unlinkSync(path)
      return true
    } catch (error) {
      throw new Error(`Failed to delete session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Update session metadata
   */
  public updateMetadata(sessionId: string, updates: Partial<SessionMetadata>): SessionData | null {
    const session = this.loadSession(sessionId)

    if (!session) {
      return null
    }

    Object.assign(session.metadata, updates)
    this.saveSession(session)

    return session
  }

  /**
   * Archive a session
   */
  public archiveSession(sessionId: string): boolean {
    const session = this.loadSession(sessionId)

    if (!session) {
      return false
    }

    session.metadata.isArchived = true
    this.saveSession(session)

    return true
  }

  /**
   * Unarchive a session
   */
  public unarchiveSession(sessionId: string): boolean {
    const session = this.loadSession(sessionId)

    if (!session) {
      return false
    }

    session.metadata.isArchived = false
    this.saveSession(session)

    return true
  }

  /**
   * Pin a session
   */
  public pinSession(sessionId: string): boolean {
    const session = this.loadSession(sessionId)

    if (!session) {
      return false
    }

    session.metadata.isPinned = true
    this.saveSession(session)

    return true
  }

  /**
   * Unpin a session
   */
  public unpinSession(sessionId: string): boolean {
    const session = this.loadSession(sessionId)

    if (!session) {
      return false
    }

    session.metadata.isPinned = false
    this.saveSession(session)

    return true
  }

  /**
   * List all sessions
   */
  public listSessions(filter?: SessionFilter): SessionListEntry[] {
    try {
      const files = readdirSync(this.sessionDir)
      const sessions: SessionListEntry[] = []

      for (const file of files) {
        if (!file.endsWith('.json')) continue

        const path = join(this.sessionDir, file)
        const content = readFileSync(path, 'utf-8')
        const data = JSON.parse(content) as SessionData

        const entry: SessionListEntry = {
          id: data.metadata.id,
          title: data.metadata.title,
          createdAt: parseDate(data.metadata.createdAt as any as string),
          updatedAt: parseDate(data.metadata.updatedAt as any as string),
          messageCount: data.metadata.messageCount,
          tags: data.metadata.tags,
          isPinned: data.metadata.isPinned,
          isArchived: data.metadata.isArchived,
        }

        // Apply filters
        if (filter) {
          // Archive filter
          if (!filter.includeArchived && entry.isArchived) continue
          if (filter.onlyPinned && !entry.isPinned) continue

          // Tag filter
          if (filter.tags && filter.tags.length > 0) {
            const hasAnyTag = filter.tags.some(tag => entry.tags.includes(tag))
            if (!hasAnyTag) continue
          }

          // Date range filter
          if (filter.dateRange) {
            if (filter.dateRange.start && entry.createdAt < filter.dateRange.start) continue
            if (filter.dateRange.end && entry.createdAt > filter.dateRange.end) continue
          }

          // Search query
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase()
            if (!entry.title.toLowerCase().includes(query)) continue
          }
        }

        sessions.push(entry)
      }

      // Sort by pinned first, then by updated date descending
      return sessions.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1
        }
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      })
    } catch (error) {
      throw new Error(`Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get session statistics
   */
  public getStatistics(): SessionStatistics {
    const sessions = this.listSessions({ includeArchived: true })

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => !s.isArchived).length,
      archivedSessions: sessions.filter(s => s.isArchived).length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      oldestSession: sessions.length > 0 ? sessions[sessions.length - 1].createdAt : null,
      newestSession: sessions.length > 0 ? sessions[0].createdAt : null,
    }
  }

  /**
   * Clean up old sessions (older than specified days)
   */
  public cleanupOldSessions(daysOld: number): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const sessions = this.listSessions({ includeArchived: true })
    let deletedCount = 0

    for (const session of sessions) {
      if (session.isPinned) continue  // Don't delete pinned sessions
      if (session.createdAt < cutoffDate) {
        this.deleteSession(session.id)
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * Save a session as the "latest" session (quick resume)
   */
  public saveAsLatest(sessionData: SessionData): void {
    const latestPath = join(this.sessionDir, 'latest.json')

    try {
      writeFileSync(latestPath, JSON.stringify(sessionData, null, 2), 'utf-8')
    } catch (error) {
      throw new Error(`Failed to save latest session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Load the latest session
   */
  public loadLatest(): SessionData | null {
    const latestPath = join(this.sessionDir, 'latest.json')

    if (!existsSync(latestPath)) {
      return null
    }

    try {
      const content = readFileSync(latestPath, 'utf-8')
      const data = JSON.parse(content) as SessionData

      // Parse dates
      data.metadata.createdAt = parseDate(data.metadata.createdAt as any as string)
      data.metadata.updatedAt = parseDate(data.metadata.updatedAt as any as string)

      return data
    } catch (error) {
      throw new Error(`Failed to load latest session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Export a session to a file
   */
  public exportSession(sessionId: string, exportPath: string): void {
    const session = this.loadSession(sessionId)

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    try {
      writeFileSync(exportPath, JSON.stringify(session, null, 2), 'utf-8')
    } catch (error) {
      throw new Error(`Failed to export session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Import a session from a file
   */
  public importSession(importPath: string): SessionData {
    try {
      const content = readFileSync(importPath, 'utf-8')
      const data = JSON.parse(content) as SessionData

      // Generate a new ID to avoid conflicts
      data.metadata.id = generateSessionId()
      data.metadata.createdAt = new Date()
      data.metadata.updatedAt = new Date()

      this.saveSession(data)

      return data
    } catch (error) {
      throw new Error(`Failed to import session: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

// ─── Singleton Instance ─────────────────────────────────────────────────────

let sessionManagerInstance: SessionManager | null = null

/**
 * Get the global session manager instance
 */
export function getSessionManager(sessionDir?: string): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager(sessionDir)
  }
  return sessionManagerInstance
}

/**
 * Reset the global session manager instance (useful for testing)
 */
export function resetSessionManager(): void {
  sessionManagerInstance = null
}
