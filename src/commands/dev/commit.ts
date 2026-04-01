/**
 * Commit Command
 * Create a Git commit with optional message
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { execSync } from 'node:child_process'

export const commitCommand: Command = {
  name: 'commit',
  description: 'Create a Git commit with an optional message',
  usage: '/commit [message]',
  examples: [
    '/commit',
    '/commit "Fix bug in authentication"',
    '/commit "Add new feature: user profiles"',
  ],
  category: 'dev',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const message = args._.join(' ') || ''

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

      // Check if there are any changes
      const status = execSync('git status --porcelain', { encoding: 'utf-8' })
      if (!status.trim()) {
        return {
          success: false,
          error: 'No changes to commit',
        }
      }

      // Stage all changes
      execSync('git add -A', { stdio: 'pipe' })

      // Create commit
      let commitMessage = message || 'Update'
      const result = execSync(`git commit -m "${commitMessage}"`, {
        encoding: 'utf-8',
      })

      // Get commit hash
      const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()

      return {
        success: true,
        message: `✅ Committed: ${commitMessage}\n\nCommit hash: ${hash}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
