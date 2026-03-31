/**
 * GitLogTool - 查看提交历史
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitLogTool: ToolDefinition = {
  name: 'git_log',
  description: 'Show commit log history using git log.',
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
        description: 'Show each commit on one line (default: false)',
      },
      graph: {
        type: 'boolean',
        description: 'Show ASCII graph of commit history (default: false)',
      },
      author: {
        type: 'string',
        description: 'Filter by author',
      },
      since: {
        type: 'string',
        description: 'Show commits more recent than a date (e.g., "1 week ago", "2023-01-01")',
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
      author,
      since,
    } = input as {
      path?: string
      maxCount?: number
      oneline?: boolean
      graph?: boolean
      author?: string
      since?: string
    }

    try {
      const args = ['git', '-C', path, 'log', `--max-count=${maxCount}`]

      if (oneline) {
        args.push('--oneline')
      } else {
        args.push('--pretty=format:%h - %an <%ae> %s')
        args.push('--date=short')
      }

      if (graph) {
        args.push('--graph')
      }

      if (author) {
        args.push('--author', author)
      }

      if (since) {
        args.push('--since', since)
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (!result.trim()) {
        return {
          success: true,
          output: 'No commits found.',
        }
      }

      return {
        success: true,
        output: `Git log (${maxCount} most recent commits):\n${result}`,
      }
    } catch (error: any) {
      if (error.code === 128 || error.killed) {
        return {
          success: false,
          output: '',
          error: 'Git command was interrupted.',
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
