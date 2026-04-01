/**
 * GitLogTool - 查看 Git 提交历史
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitLogTool: ToolDefinition = {
  name: 'git_log',
  description: 'View Git commit history. Supports various formats and filtering options.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      maxCount: {
        type: 'number',
        description: 'Maximum number of commits to show (default: 10)',
      },
      oneline: {
        type: 'boolean',
        description: 'Use one-line format (default: false)',
      },
      graph: {
        type: 'boolean',
        description: 'Show commit graph (default: false)',
      },
      pretty: {
        type: 'string',
        description: 'Custom pretty format (default: medium)',
      },
      author: {
        type: 'string',
        description: 'Filter by author',
      },
      since: {
        type: 'string',
        description: 'Show commits since this date (e.g., "1 week ago")',
      },
      until: {
        type: 'string',
        description: 'Show commits until this date',
      },
      branches: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific branches to show history for',
      },
      file: {
        type: 'string',
        description: 'Show history for a specific file',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      maxCount = 10,
      oneline = false,
      graph = false,
      pretty,
      author,
      since,
      until,
      branches,
      file,
    } = input as {
      path?: string
      maxCount?: number
      oneline?: boolean
      graph?: boolean
      pretty?: string
      author?: string
      since?: string
      until?: string
      branches?: string[]
      file?: string
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

      // Build git log command
      const args = ['git', '-C', path, 'log']

      // Limit number of commits
      if (maxCount > 0) {
        args.push('-n', String(maxCount))
      }

      // Format options
      if (oneline) {
        args.push('--oneline')
      } else if (pretty) {
        args.push('--pretty=' + pretty)
      } else {
        args.push('--pretty=format:%h - %an, %ar : %s')
      }

      // Graph option
      if (graph) {
        args.push('--graph', '--decorate')
      }

      // Date filters
      if (since) {
        args.push('--since=' + since)
      }
      if (until) {
        args.push('--until=' + until)
      }

      // Author filter
      if (author) {
        args.push('--author=' + author)
      }

      // Color output
      args.push('--color=always')

      // Add branches or paths at the end
      if (branches && branches.length > 0) {
        args.push(...branches)
      } else if (file) {
        args.push('--', file)
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      return {
        success: true,
        output: result.trim(),
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
