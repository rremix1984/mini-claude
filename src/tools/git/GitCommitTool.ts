/**
 * GitCommitTool - 创建提交
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitCommitTool: ToolDefinition = {
  name: 'git_commit',
  description: 'Create a Git commit with an optional message.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      message: {
        type: 'string',
        description: 'Commit message (leave empty to use default)',
      },
      amend: {
        type: 'boolean',
        description: 'Amend the last commit (default: false)',
      },
      noVerify: {
        type: 'boolean',
        description: 'Bypass pre-commit hooks (default: false)',
      },
    },
  },
  requiresPermission: true,  // Commit operations should require permission
  execute: async (input) => {
    const {
      path = '.',
      message,
      amend = false,
      noVerify = false,
    } = input as {
      path?: string
      message?: string
      amend?: boolean
      noVerify?: boolean
    }

    try {
      const args = ['git', '-C', path, 'commit']

      if (message) {
        args.push('-m', message)
      } else {
        args.push('-m', '<commit message>')
      }

      if (amend) {
        args.push('--amend')
      }

      if (noVerify) {
        args.push('--no-verify')
      }

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (result.includes('nothing to commit')) {
        return {
          success: true,
          output: 'No changes to commit.',
        }
      }

      // Get the commit hash
      const hashResult = execSync('git rev-parse --short HEAD', {
        cwd: path,
        encoding: 'utf-8',
      })

      return {
        success: true,
        output: `Committed successfully!\n\nCommit hash: ${hashResult.trim()}\n\n${result}`,
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
