/**
 * Diff Command
 * View Git changes
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { execSync } from 'node:child_process'

export const diffCommand: Command = {
  name: 'diff',
  description: 'View Git changes (staged or unstaged)',
  usage: '/diff [--staged]',
  examples: [
    '/diff',
    '/diff --staged',
    '/diff -s',
  ],
  category: 'dev',
  options: [
    {
      name: '--staged',
      alias: 's',
      description: 'Show staged changes',
      type: 'boolean',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const staged = args['staged'] === true || args['s'] === true

    try {
      // Check if we're in a Git repository
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' })
      } catch {
        return {
          success: false,
          error: 'Not in a Git repository',
        }
      }

      // Build diff command
      let command = 'git diff'
      if (staged) {
        command = 'git diff --staged'
      }

      const result = execSync(command, { encoding: 'utf-8' })

      if (!result.trim()) {
        return {
          success: true,
          message: staged ? 'No staged changes.' : 'No changes.',
        }
      }

      return {
        success: true,
        message: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
