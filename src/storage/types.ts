/**
 * Storage types for session persistence
 */

import type { ApiMessage } from '../types.js'

// Re-export ApiMessage for convenience
export type { ApiMessage }

// ─── Session Metadata ─────────────────────────────────────────────────────

export interface SessionMetadata {
  /** Unique session ID */
  id: string
  /** Session title (auto-generated or user-provided) */
  title: string
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
  /** Working directory when session was created */
  cwd: string
  /** Model used in this session */
  model: string
  /** Number of messages in this session */
  messageCount: number
  /** User-defined tags */
  tags: string[]
  /** Is this session pinned/archived? */
  isPinned: boolean
  /** Is this session archived? */
  isArchived: boolean
}

// ─── Session Data ─────────────────────────────────────────────────────────

export interface SessionData {
  /** Session metadata */
  metadata: SessionMetadata
  /** Message history */
  messages: ApiMessage[]
  /** Additional session-specific data */
  extra?: {
    /** Total tokens used in this session */
    totalTokens?: number
    /** Number of tool calls made */
    toolCallCount?: number
    /** Session notes */
    notes?: string
  }
}

// ─── Session List Entry ──────────────────────────────────────────────────

export interface SessionListEntry {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  tags: string[]
  isPinned: boolean
  isArchived: boolean
}

// ─── Session Filter Options ───────────────────────────────────────────────

export interface SessionFilter {
  /** Filter by tags (any match) */
  tags?: string[]
  /** Filter by date range */
  dateRange?: {
    start?: Date
    end?: Date
  }
  /** Include archived sessions? */
  includeArchived?: boolean
  /** Include only pinned sessions? */
  onlyPinned?: boolean
  /** Search in titles */
  searchQuery?: string
}

// ─── Session Statistics ──────────────────────────────────────────────────

export interface SessionStatistics {
  /** Total number of sessions */
  totalSessions: number
  /** Number of active sessions */
  activeSessions: number
  /** Number of archived sessions */
  archivedSessions: number
  /** Total messages across all sessions */
  totalMessages: number
  /** Oldest session date */
  oldestSession: Date | null
  /** Newest session date */
  newestSession: Date | null
}
