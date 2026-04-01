/**
 * Search Command
 * Search through session history
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const searchCommand: Command = {
  name: 'search',
  description: 'Search through session history',
  usage: '/search <query> [--limit <n>] [--session <id>]',
  examples: [
    '/search "authentication"',
    '/search "bug fix" --limit 10',
    '/search "API" --session 123',
  ],
  category: 'advanced',
  options: [
    {
      name: '--limit',
      alias: 'l',
      description: 'Limit number of results',
      type: 'number',
      default: 20,
    },
    {
      name: '--session',
      alias: 's',
      description: 'Search in specific session ID',
      type: 'string',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    try {
      const query = args._[0]?.toLowerCase() || ''
      const limit = (args.limit as number) || 20
      const sessionId = args.session as string

      if (!query) {
        return {
          success: false,
          error: 'Usage: /search <query>',
        }
      }

      // Search in current session or all sessions
      const sessionsDir = join(homedir(), '.miniclaude', 'sessions')

      if (!existsSync(sessionsDir)) {
        return {
          success: false,
          error: 'No session history found',
        }
      }

      let sessions: string[] = []

      if (sessionId) {
        // Search in specific session
        const sessionFile = join(sessionsDir, `${sessionId}.json`)
        if (existsSync(sessionFile)) {
          sessions = [sessionFile]
        } else {
          return {
            success: false,
            error: `Session not found: ${sessionId}`,
          }
        }
      } else {
        // Search in all sessions
        const allFiles = readdirSync(sessionsDir)
        sessions = allFiles
          .filter((f) => f.endsWith('.json'))
          .map((f) => join(sessionsDir, f))
      }

      // Search through sessions
      const results: Array<{
        session: string
        messageId: string
        role: string
        content: string
      }> = []

      for (const sessionFile of sessions) {
        try {
          const sessionData = JSON.parse(readFileSync(sessionFile, 'utf-8'))

          if (sessionData.messages && Array.isArray(sessionData.messages)) {
            sessionData.messages.forEach((msg: any, index: number) => {
              if (msg.content && msg.content.toLowerCase().includes(query)) {
                results.push({
                  session: sessionData.id || sessionFile,
                  messageId: String(index),
                  role: msg.role || 'unknown',
                  content: msg.content.substring(0, 200) + '...',
                })
              }
            })
          }
        } catch {
          // Skip invalid sessions
        }

        if (results.length >= limit) {
          break
        }
      }

      // Build output
      let output = `🔍 Search Results: "${query}"\n\n`

      if (results.length === 0) {
        output += 'No matches found.\n'
        output += `\nSearched ${sessions.length} session(s).\n`
      } else {
        output += `Found ${results.length} match(es):\n\n`

        results.forEach((result, index) => {
          output += `${index + 1}. [${result.session}]\n`
          output += `   ${result.role}: ${result.content}\n\n`
        })

        if (results.length >= limit) {
          output += `\n(Limited to ${limit} results. Use --limit to adjust.)\n`
        }
      }

      return {
        success: true,
        message: output,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
