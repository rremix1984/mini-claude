/**
 * /history command
 * List and manage session history
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../../commands/types.js'
import type { SessionListEntry } from '../../storage/types.js'

// ─── Helper Functions ─────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString()
}

function formatSessionEntry(entry: SessionListEntry): string {
  const pinned = entry.isPinned ? '📌 ' : ''
  const archived = entry.isArchived ? '📦 ' : ''
  const tags = entry.tags.length > 0 ? ` [${entry.tags.join(', ')}]` : ''

  return `  ${pinned}${archived}${entry.id.slice(0, 12)}... | ${entry.title}${tags} | ${entry.messageCount} messages | ${formatDate(entry.updatedAt)}`
}

// ─── Subcommands ─────────────────────────────────────────────────────────

/**
 * List all sessions
 */
async function handleList(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const sessions = storage.listSessions()

  if (sessions.length === 0) {
    return {
      success: true,
      message: 'No sessions found. Start a conversation to create your first session!',
    }
  }

  const output = [
    'Sessions History:',
    '=================',
    '',
    `Total sessions: ${sessions.length}`,
    '',
    ...sessions.map(formatSessionEntry),
    '',
    'Use /history show <id> to view a session',
    'Use /resume <id> to restore a session',
  ].join('\n')

  return { success: true, message: output }
}

/**
 * Show session details
 */
async function handleShow(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /history show <id>',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const session = storage.loadSession(sessionId)

  if (!session) {
    return {
      success: false,
      error: `Session not found: ${sessionId}`,
    }
  }

  const { metadata, messages } = session

  const output = [
    `Session: ${metadata.title}`,
    `ID: ${metadata.id}`,
    `Created: ${metadata.createdAt.toISOString()}`,
    `Updated: ${metadata.updatedAt.toISOString()}`,
    `Messages: ${metadata.messageCount}`,
    `Model: ${metadata.model}`,
    `CWD: ${metadata.cwd}`,
    `Tags: ${metadata.tags.join(', ') || 'none'}`,
    `Pinned: ${metadata.isPinned ? 'Yes' : 'No'}`,
    `Archived: ${metadata.isArchived ? 'Yes' : 'No'}`,
    '',
    'Messages:',
    '---------',
    ...messages.slice(-5).map(m => `[${m.role}] ${typeof m.content === 'string' ? m.content.slice(0, 100) + '...' : '[non-text content]'}`),
  ].join('\n')

  return { success: true, message: output }
}

/**
 * Delete a session
 */
async function handleDelete(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /history delete <id>',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const deleted = storage.deleteSession(sessionId)

  if (!deleted) {
    return {
      success: false,
      error: `Session not found: ${sessionId}`,
    }
  }

  return {
    success: true,
    message: `Session ${sessionId} deleted successfully.`,
  }
}

/**
 * Archive a session
 */
async function handleArchive(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /history archive <id>',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const archived = storage.archiveSession(sessionId)

  if (!archived) {
    return {
      success: false,
      error: `Session not found: ${sessionId}`,
    }
  }

  return {
    success: true,
    message: `Session ${sessionId} archived successfully.`,
  }
}

/**
 * Unarchive a session
 */
async function handleUnarchive(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /history unarchive <id>',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const unarchived = storage.unarchiveSession(sessionId)

  if (!unarchived) {
    return {
      success: false,
      error: `Session not found: ${sessionId}`,
    }
  }

  return {
    success: true,
    message: `Session ${sessionId} unarchived successfully.`,
  }
}

/**
 * Pin a session
 */
async function handlePin(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /history pin <id>',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const pinned = storage.pinSession(sessionId)

  if (!pinned) {
    return {
      success: false,
      error: `Session not found: ${sessionId}`,
    }
  }

  return {
    success: true,
    message: `Session ${sessionId} pinned successfully.`,
  }
}

/**
 * Unpin a session
 */
async function handleUnpin(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /history unpin <id>',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const unpinned = storage.unpinSession(sessionId)

  if (!unpinned) {
    return {
      success: false,
      error: `Session not found: ${sessionId}`,
    }
  }

  return {
    success: true,
    message: `Session ${sessionId} unpinned successfully.`,
  }
}

/**
 * Show session statistics
 */
async function handleStats(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const stats = storage.getStatistics()

  const output = [
    'Session Statistics:',
    '===================',
    '',
    `Total sessions: ${stats.totalSessions}`,
    `Active sessions: ${stats.activeSessions}`,
    `Archived sessions: ${stats.archivedSessions}`,
    `Total messages: ${stats.totalMessages}`,
    '',
    `Oldest session: ${stats.oldestSession ? stats.oldestSession.toISOString() : 'N/A'}`,
    `Newest session: ${stats.newestSession ? stats.newestSession.toISOString() : 'N/A'}`,
  ].join('\n')

  return { success: true, message: output }
}

/**
 * Clean up old sessions
 */
async function handleCleanup(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const daysArg = args._[0]
  const days = daysArg ? Number.parseInt(daysArg, 10) : 30

  if (Number.isNaN(days) || days < 1) {
    return {
      success: false,
      error: 'Usage: /history cleanup [days]',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const deletedCount = storage.cleanupOldSessions(days)

  return {
    success: true,
    message: `Deleted ${deletedCount} session(s) older than ${days} days.`,
  }
}

// ─── Main Command ─────────────────────────────────────────────────────────

export const historyCommand: Command = {
  name: 'history',
  aliases: ['hist', 'sessions'],
  description: 'List and manage session history',
  usage: '/history <subcommand> [options]',
  examples: [
    '/history list                    - List all sessions',
    '/history show <id>              - Show session details',
    '/history delete <id>            - Delete a session',
    '/history archive <id>            - Archive a session',
    '/history unarchive <id>          - Unarchive a session',
    '/history pin <id>               - Pin a session',
    '/history unpin <id>             - Unpin a session',
    '/history stats                   - Show session statistics',
    '/history cleanup [days]          - Clean up old sessions',
  ],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const subcommand = args._[0] || 'list'

    const subcommands: Record<string, (args: CommandArgs, ctx: CommandContext) => Promise<CommandResult>> = {
      list: handleList,
      ls: handleList,
      show: handleShow,
      view: handleShow,
      delete: handleDelete,
      remove: handleDelete,
      rm: handleDelete,
      archive: handleArchive,
      unarchive: handleUnarchive,
      pin: handlePin,
      unpin: handleUnpin,
      stats: handleStats,
      stat: handleStats,
      statistics: handleStats,
      cleanup: handleCleanup,
      clean: handleCleanup,
    }

    const handler = subcommands[subcommand]

    if (!handler) {
      return {
        success: false,
        error: `Unknown subcommand: ${subcommand}\n\nAvailable subcommands: ${Object.keys(subcommands).join(', ')}`,
      }
    }

    return handler(args, context)
  },
}
