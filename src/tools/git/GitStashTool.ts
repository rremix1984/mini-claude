/**
 * GitStashTool - 暂存变更
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitStashTool: ToolDefinition = {
  name: 'git_stash',
  description: 'Stash and unstash Git working directory changes.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      action: {
        type: 'string',
        enum: ['list', 'save', 'show', 'pop', 'apply', 'drop', 'clear'],
        description: 'Stash action to perform (default: list)',
      },
      message: {
        type: 'string',
        description: 'Message for stash save (default: auto-generated)',
      },
      includeUntracked: {
        type: 'boolean',
        description: 'Include untracked files (default: false)',
      },
      stashRef: {
        type: 'string',
        description: 'Stash reference to apply (for apply/pop)',
      },
    },
  },
  requiresPermission: true,  // Stash operations modify working directory
  execute: async (input) => {
    const {
      path = '.',
      action = 'list',
      message,
      includeUntracked = false,
      stashRef,
    } = input as {
      path?: string
      action?: string
      message?: string
      includeUntracked?: boolean
      stashRef?: string
    }

    try {
      const args = ['git', '-C', path]

      switch (action) {
        case 'list':
          args.push('stash', 'list')
          break

        case 'save':
          const saveArgs = [...args, 'stash', 'push']
          if (message) {
            saveArgs.push('-m', message)
          } else {
            saveArgs.push('-m', `WIP on ${new Date().toISOString()}`)
          }
          if (includeUntracked) {
            saveArgs.push('--include-untracked')
          }
          args.length = 0
          args.push(...saveArgs)
          break

        case 'show':
          if (!stashRef) {
            return {
              success: false,
              output: '',
              error: 'Stash reference is required for show action.',
            }
          }
          args.push('stash', 'show', stashRef)
          break

        case 'pop':
          args.push('stash', 'pop')
          break

        case 'apply':
          if (!stashRef) {
            return {
              success: false,
              output: '',
              error: 'Stash reference is required for apply action.',
            }
          }
          args.push('stash', 'apply', stashRef)
          break

        case 'drop':
          if (!stashRef) {
            return {
              success: false,
              output: '',
              error: 'Stash reference is required for drop action.',
            }
          }
          args.push('stash', 'drop', stashRef)
          break

        case 'clear':
          args.push('stash', 'clear')
          break

        default:
          args.push('stash', 'list')
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (!result.trim() && action === 'list') {
        return {
          success: true,
          output: 'No stashes found.',
        }
      }

      return {
        success: true,
        output: `Git stash (${action}):\n${result}`,
      }
    } catch (error: any) {
      if (error.code === 128 || error.killed) {
        return {
          success: false,
          output: '',
          error: 'Git command was interrupted.',
        }
      }

      if (error.stderr && error.stderr.includes('not a git repository')) {
        return {
          success: false,
          output: '',
          error: 'Not a git repository. Initialize with `git init`.',
        }
      }

      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
