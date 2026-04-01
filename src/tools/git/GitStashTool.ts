/**
 * GitStashTool - Git 暂存操作
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitStashTool: ToolDefinition = {
  name: 'git_stash',
  description: 'Stash changes in the Git repository. Save uncommitted changes temporarily.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      message: {
        type: 'string',
        description: 'Description for the stash',
      },
      list: {
        type: 'boolean',
        description: 'List all stashes (default: false)',
      },
      show: {
        type: 'string',
        description: 'Show the changes in a specific stash (e.g., "stash@{0}")',
      },
      apply: {
        type: 'string',
        description: 'Apply a stash without removing it from the list',
      },
      pop: {
        type: 'string',
        description: 'Apply a stash and remove it from the list (default: latest)',
      },
      drop: {
        type: 'string',
        description: 'Remove a stash from the list',
      },
      clear: {
        type: 'boolean',
        description: 'Remove all stashes',
      },
      includeUntracked: {
        type: 'boolean',
        description: 'Include untracked files in the stash (default: false)',
      },
      keepIndex: {
        type: 'boolean',
        description: 'Keep staged changes (default: false)',
      },
    },
  },
  requiresPermission: true,
  execute: async (input) => {
    const {
      path = '.',
      message,
      list = false,
      show,
      apply,
      pop,
      drop,
      clear = false,
      includeUntracked = false,
      keepIndex = false,
    } = input as {
      path?: string
      message?: string
      list?: boolean
      show?: string
      apply?: string
      pop?: string
      drop?: string
      clear?: boolean
      includeUntracked?: boolean
      keepIndex?: boolean
    }

    try {
      // Check if this is a Git repository
      try {
        execSync('git -C ' + path + ' rev-parse --git-dir', { encoding: 'utf-8', stdio: 'pipe' })
      } catch {
        return {
          success: false,
          output: '',
          error: 'Not a Git repository: ' + path,
        }
      }

      // List stashes
      if (list) {
        const args = ['git', '-C', path, 'stash', 'list', '--color=always']
        const result = execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: result.trim() || 'No stashes found.',
        }
      }

      // Show stash
      if (show) {
        const args = ['git', '-C', path, 'stash', 'show', '-p', show, '--color=always']
        const result = execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: result.trim(),
        }
      }

      // Apply stash
      if (apply) {
        const args = ['git', '-C', path, 'stash', 'apply', apply]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Stash '${apply}' applied successfully. (Still in stash list)`,
        }
      }

      // Pop stash
      if (pop) {
        const args = ['git', '-C', path, 'stash', 'pop', pop]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Stash '${pop}' applied and removed successfully.`,
        }
      }

      // Drop stash
      if (drop) {
        const args = ['git', '-C', path, 'stash', 'drop', drop]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Stash '${drop}' removed successfully.`,
        }
      }

      // Clear all stashes
      if (clear) {
        const args = ['git', '-C', path, 'stash', 'clear']
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: 'All stashes cleared successfully.',
        }
      }

      // Create new stash (default action)
      const args = ['git', '-C', path, 'stash', 'push']

      if (message) {
        args.push('-m', message)
      }

      if (includeUntracked) {
        args.push('-u')
      }

      if (keepIndex) {
        args.push('-k')
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8', stdio: 'pipe' })

      // Get the stash reference
      const stashList = execSync('git -C ' + path + ' stash list', { encoding: 'utf-8' })
      const firstStash = stashList.split('\n')[0]

      return {
        success: true,
        output: message
          ? `Stash created: ${message}\n${firstStash}`
          : `Stash created successfully.\n${firstStash || ''}`,
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
