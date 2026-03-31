/**
 * GitDiffTool - 查看变更
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitDiffTool: ToolDefinition = {
  name: 'git_diff',
  description: 'Show changes between commits, branches, or working directory.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      target: {
        type: 'string',
        description: 'Branch, commit, or "staged" to compare against',
      },
      staged: {
        type: 'boolean',
        description: 'Show staged changes (default: false)',
      },
      files: {
        type: 'array',
        description: 'Show only specific files',
        items: { type: 'string' },
      },
      contextLines: {
        type: 'number',
        description: 'Number of context lines (default: 3)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      target,
      staged = false,
      files = [],
      contextLines = 3,
    } = input as {
      path?: string
      target?: string
      staged?: boolean
      files?: string[]
      contextLines?: number
    }

    try {
      const args = ['git', '-C', path, 'diff']

      if (staged) {
        args.push('--staged')
      } else if (target) {
        args.push(target)
      }

      args.push(`-U${contextLines}`)

      if (files.length > 0) {
        args.push('--')
        args.push(...files)
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (!result.trim()) {
        return {
          success: true,
          output: staged ? 'No staged changes.' : 'No uncommitted changes.',
        }
      }

      return {
        success: true,
        output: `Git diff${staged ? ' (staged)' : target ? ` (vs ${target})` : ''}:\n${result}`,
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
