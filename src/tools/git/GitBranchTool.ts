/**
 * GitBranchTool - 分支操作
 */

import type { ToolDefinition, ToolResult } from '../../../types.js'
import { execSync } from 'node:child_process'

export const GitBranchTool: ToolDefinition = {
  name: 'git_branch',
  description: 'Show, create, or delete Git branches.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      action: {
        type: 'string',
        enum: ['list', 'create', 'delete', 'rename', 'switch', 'checkout', 'merge'],
        description: 'Action to perform on branches (default: list)',
      },
      branchName: {
        type: 'string',
        description: 'Branch name (for create, delete, switch, merge actions)',
      },
      baseBranch: {
        type: 'string',
        description: 'Base branch for merge or creation (default: main or master)',
      },
      force: {
        type: 'boolean',
        description: 'Force operation (e.g., discard changes when switching)',
      },
    },
  },
  requiresPermission: true,
  execute: async (input) => {
    const {
      path = '.',
      action = 'list',
      branchName,
      baseBranch,
      force = false,
    } = input as {
      path?: string
      action?: string
      branchName?: string
      baseBranch?: string
      force?: boolean
    }

    try {
      let args = ['git', '-C', path]

      switch (action) {
        case 'list':
          args.push('branch', '-a')
          break

        case 'create':
          if (!branchName) {
            return {
              success: false,
              output: '',
              error: 'Branch name is required for create action.',
            }
          }
          args.push('branch', branchName)
          break

        case 'delete':
          if (!branchName) {
            return {
              success: false,
              output: '',
              error: 'Branch name is required for delete action.',
            }
          }
          args.push('branch', '-D', branchName)
          break

        case 'rename':
          if (!branchName || !baseBranch) {
            return {
              success: false,
              output: '',
              error: 'Both branchName and baseBranch are required for rename action.',
            }
          }
          args.push('branch', '-m', branchName, baseBranch)
          break

        case 'switch':
          if (!branchName) {
            return {
              success: false,
              output: '',
              error: 'Branch name is required for switch action.',
            }
          }
          args.push('switch', branchName)
          if (force) {
            args.push('--discard-changes')
          }
          break

        case 'checkout':
          if (!branchName) {
            return {
              success: false,
              output: '',
              error: 'Branch name is required for checkout action.',
            }
          }
          args.push('checkout', branchName)
          if (force) {
            args.push('--force')
          }
          break

        case 'merge':
          if (!branchName) {
            return {
              success: false,
              output: '',
              error: 'Branch name is required for merge action.',
            }
          }
          args.push('merge', branchName)
          if (force) {
            args.push('--no-ff')
          }
          break

        default:
          return {
            success: false,
            output: '',
            error: `Unknown action: ${action}. Valid actions: list, create, delete, rename, switch, checkout, merge`,
          }
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      return {
        success: true,
        output: `Git branch (${action}):\n${result}`,
      }
    } catch (error: any) {
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
