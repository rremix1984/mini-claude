/**
 * GitCommitTool - 创建 Git 提交
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitCommitTool: ToolDefinition = {
  name: 'git_commit',
  description: 'Create a new Git commit. Stages all changes by default or specific files if specified.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      message: {
        type: 'string',
        description: 'Commit message (required)',
      },
      addAll: {
        type: 'boolean',
        description: 'Stage all changes before committing (default: true)',
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific files to stage and commit (default: all)',
      },
      amend: {
        type: 'boolean',
        description: 'Amend the previous commit (default: false)',
      },
      signoff: {
        type: 'boolean',
        description: 'Add Signed-off-by line (default: false)',
      },
      allowEmpty: {
        type: 'boolean',
        description: 'Allow empty commits (default: false)',
      },
    },
  },
  requiresPermission: true,
  execute: async (input) => {
    const {
      path = '.',
      message,
      addAll = true,
      files,
      amend = false,
      signoff = false,
      allowEmpty = false,
    } = input as {
      path?: string
      message?: string
      addAll?: boolean
      files?: string[]
      amend?: boolean
      signoff?: boolean
      allowEmpty?: boolean
    }

    try {
      // Validate message
      if (!message || message.trim().length === 0) {
        return {
          success: false,
          output: '',
          error: 'Commit message is required',
        }
      }

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

      // Stage files
      if (files && files.length > 0) {
        // Stage specific files
        const addArgs = ['git', '-C', path, 'add', ...files]
        execSync(addArgs.join(' '), { encoding: 'utf-8' })
      } else if (addAll && !amend) {
        // Stage all changes
        execSync('git -C ' + path + ' add -A', { encoding: 'utf-8' })
      }

      // Build git commit command
      const args = ['git', '-C', path, 'commit']

      if (amend) {
        args.push('--amend')
        args.push('--no-edit') // Use provided message instead
      }

      if (signoff) {
        args.push('--signoff')
      }

      if (allowEmpty) {
        args.push('--allow-empty')
      }

      args.push('-m', message)

      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      // Get the commit hash
      const hash = execSync('git -C ' + path + ' rev-parse --short HEAD', {
        encoding: 'utf-8',
      }).trim()

      return {
        success: true,
        output: `Commit created successfully!\n\n${result.trim()}\n\nCommit hash: ${hash}`,
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
