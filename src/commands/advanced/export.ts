/**
 * Export Command
 * Export current session to file
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const exportCommand: Command = {
  name: 'export',
  description: 'Export current session to a file',
  usage: '/export [filename] [--format json|markdown|txt]',
  examples: [
    '/export session.json',
    '/export --format markdown',
    '/export my-session.txt --format txt',
  ],
  category: 'advanced',
  options: [
    {
      name: '--format',
      alias: 'f',
      description: 'Export format (json, markdown, txt)',
      type: 'string',
      choices: ['json', 'markdown', 'txt'],
      default: 'json',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    try {
      const filename = args._[0] || `session-${Date.now()}`
      const format = (args.format as string) || 'json'

      // Determine file extension
      let extension = format
      if (format === 'json') extension = 'json'
      else if (format === 'markdown') extension = 'md'
      else if (format === 'txt') extension = 'txt'

      const fullFilename = filename.includes('.')
        ? filename
        : `${filename}.${extension}`

      const filePath = resolve(fullFilename)

      // Get session data
      const sessionData = context.session

      if (!sessionData) {
        return {
          success: false,
          error: 'No active session to export',
        }
      }

      // Format content based on format
      let content = ''

      switch (format) {
        case 'json':
          content = JSON.stringify(sessionData, null, 2)
          break

        case 'markdown':
          content = `# Session Export\n\n`
          content += `**Date:** ${new Date().toISOString()}\n\n`
          content += `**Messages:** ${sessionData.messages?.length || 0}\n\n`
          content += `---\n\n`

          if (sessionData.messages) {
            sessionData.messages.forEach((msg: any) => {
              const role = msg.role?.toUpperCase() || 'UNKNOWN'
              content += `## ${role}\n\n`
              content += `${msg.content || ''}\n\n`
            })
          }
          break

        case 'txt':
          content = `Session Export\n`
          content += `Date: ${new Date().toISOString()}\n\n`
          content += `${'='.repeat(60)}\n\n`

          if (sessionData.messages) {
            sessionData.messages.forEach((msg: any) => {
              const role = msg.role?.toUpperCase() || 'UNKNOWN'
              content += `[${role}]\n${msg.content || ''}\n\n`
            })
          }
          break

        default:
          return {
            success: false,
            error: `Unknown format: ${format}`,
          }
      }

      // Write file
      writeFileSync(filePath, content, 'utf-8')

      return {
        success: true,
        message: `✅ Session exported to ${filePath}\n\nFormat: ${format}\nMessages: ${sessionData.messages?.length || 0}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
