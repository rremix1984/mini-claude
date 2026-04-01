/**
 * GitStatusTool - 查看 Git 仓库状态
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitStatusTool: ToolDefinition = {
  name: 'git_status',
  description: 'View the Git repository status. Shows changed files, untracked files, staged files, and branch information.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      short: {
        type: 'boolean',
        description: 'Use short format (default: false)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const { path = '.', short = false } = input as { path?: string; short?: boolean }

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

      // Build git status command
      const args = ['git', '-C', path, 'status']
      if (short) {
        args.push('-s')
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
