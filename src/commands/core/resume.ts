/**
 * /resume command
 * Resume a previous session or the latest session
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../../commands/types.js'
import type { SessionData } from '../../storage/types.js'

// ─── Subcommands ─────────────────────────────────────────────────────────

/**
 * Resume a specific session by ID
 */
async function handleResume(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const sessionId = args._[0]

  if (!sessionId) {
    return {
      success: false,
      error: 'Usage: /resume <id>\n       /resume latest',
    }
  }

  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  let session: SessionData | null = null

  if (sessionId === 'latest') {
    session = storage.loadLatest()
    if (!session) {
      return {
        success: false,
        error: 'No latest session found.',
      }
    }
  } else {
    session = storage.loadSession(sessionId)
    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`,
      }
    }
  }

  // Update the session as latest
  storage.saveAsLatest(session)

  const { metadata, messages } = session

  const output = [
    `Resumed session: ${metadata.title}`,
    '',
    `Session ID: ${metadata.id}`,
    `Last updated: ${metadata.updatedAt.toISOString()}`,
    `Messages: ${metadata.messageCount}`,
    `Model: ${metadata.model}`,
    `CWD: ${metadata.cwd}`,
    '',
    'Last 5 messages:',
    '----------------',
    ...messages.slice(-5).map(m => {
      const role = m.role.toUpperCase()
      const content = typeof m.content === 'string' ? m.content.slice(0, 200) : '[non-text content]'
      return `[${role}] ${content}${content.length >= 200 ? '...' : ''}`
    }),
  ].join('\n')

  // Store session data in context for the app to use
  if (context.session) {
    context.session.data = session
  }

  return {
    success: true,
    message: output,
    data: session,
  }
}

/**
 * List recent sessions (alias for /history list)
 */
async function handleList(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const { getSessionManager } = await import('../../storage/SessionManager.js')
  const storage = getSessionManager()

  const sessions = storage.listSessions()

  if (sessions.length === 0) {
    return {
      success: true,
      message: 'No sessions found.',
    }
  }

  const output = [
    'Recent Sessions:',
    '===============',
    '',
    ...sessions.slice(0, 10).map((entry, index) => {
      const pinned = entry.isPinned ? '📌 ' : ''
      const date = entry.updatedAt.toLocaleDateString()
      return `  ${index + 1}. ${pinned}${entry.title} | ${entry.messageCount} msgs | ${date}`
    }),
    '',
    `Use /resume <id> to resume a session`,
    `Use /history list for all sessions`,
  ].join('\n')

  return { success: true, message: output }
}

// ─── Main Command ─────────────────────────────────────────────────────────

export const resumeCommand: Command = {
  name: 'resume',
  aliases: ['restore'],
  description: 'Resume a previous session',
  usage: '/resume <id|latest>',
  examples: [
    '/resume latest                - Resume the latest session',
    '/resume session-1234567890-abc - Resume a specific session',
    '/resume list                  - List recent sessions',
  ],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const subcommand = args._[0]

    // If subcommand is 'list', handle it specially
    if (subcommand === 'list') {
      return handleList(args, context)
    }

    // Otherwise, treat as resume command
    return handleResume(args, context)
  },
}
