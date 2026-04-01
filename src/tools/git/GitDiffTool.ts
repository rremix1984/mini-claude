/**
 * GitDiffTool - 查看 Git 变更
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitDiffTool: ToolDefinition = {
  name: 'git_diff',
  description: 'View changes in the Git repository. Can show unstaged, staged, or all changes.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      staged: {
        type: 'boolean',
        description: 'Show staged changes (default: false)',
      },
      cached: {
        type: 'boolean',
        description: 'Alias for staged (default: false)',
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific files to diff (default: all)',
      },
      color: {
        type: 'boolean',
        description: 'Enable colored output (default: true)',
      },
      unified: {
        type: 'number',
        description: 'Number of context lines (default: 3)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      staged = false,
      cached = false,
      files,
      color = true,
      unified,
    } = input as {
      path?: string
      staged?: boolean
      cached?: boolean
      files?: string[]
      color?: boolean
      unified?: number
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

      // Build git diff command
      const args = ['git', '-C', path, 'diff']

      if (staged || cached) {
        args.push('--staged')
      }

      if (color) {
        args.push('--color=always')
      } else {
        args.push('--no-color')
      }

      if (unified !== undefined) {
        args.push('-U' + unified)
      }

      if (files && files.length > 0) {
        args.push(...files)
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      return {
        success: true,
        output: result.trim() || 'No changes found.',
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
