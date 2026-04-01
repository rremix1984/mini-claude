/**
 * GitBranchTool - Git 分支操作
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const GitBranchTool: ToolDefinition = {
  name: 'git_branch',
  description: 'Manage Git branches. List, create, rename, or delete branches.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
      list: {
        type: 'boolean',
        description: 'List all branches (default: true)',
      },
      create: {
        type: 'string',
        description: 'Create a new branch with this name',
      },
      delete: {
        type: 'string',
        description: 'Delete the branch with this name',
      },
      forceDelete: {
        type: 'string',
        description: 'Force delete the branch (even if unmerged)',
      },
      rename: {
        type: 'string',
        description: 'Rename current branch',
      },
      current: {
        type: 'string',
        description: 'New name for the branch when renaming',
      },
      checkout: {
        type: 'string',
        description: 'Switch to this branch',
      },
      showCurrent: {
        type: 'boolean',
        description: 'Show only current branch name',
      },
      remote: {
        type: 'boolean',
        description: 'List remote branches instead of local',
      },
      all: {
        type: 'boolean',
        description: 'List both local and remote branches',
      },
    },
  },
  requiresPermission: true,
  execute: async (input) => {
    const {
      path = '.',
      list = true,
      create,
      delete: deleteBranch,
      forceDelete,
      rename,
      current: newName,
      checkout,
      showCurrent,
      remote = false,
      all = false,
    } = input as {
      path?: string
      list?: boolean
      create?: string
      delete?: string
      forceDelete?: string
      rename?: string
      current?: string
      checkout?: string
      showCurrent?: boolean
      remote?: boolean
      all?: boolean
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

      // Create branch
      if (create) {
        const args = ['git', '-C', path, 'branch', create]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Branch '${create}' created successfully.\nSwitch to it with: git checkout ${create}`,
        }
      }

      // Delete branch
      if (forceDelete) {
        const args = ['git', '-C', path, 'branch', '-D', forceDelete]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Branch '${forceDelete}' force deleted successfully.`,
        }
      }

      if (deleteBranch) {
        const args = ['git', '-C', path, 'branch', '-d', deleteBranch]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Branch '${deleteBranch}' deleted successfully.`,
        }
      }

      // Rename branch
      if (rename && newName) {
        const args = ['git', '-C', path, 'branch', '-m', rename, newName]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Branch renamed from '${rename}' to '${newName}' successfully.`,
        }
      }

      // Checkout branch
      if (checkout) {
        const args = ['git', '-C', path, 'checkout', checkout]
        execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: `Switched to branch '${checkout}' successfully.`,
        }
      }

      // Show current branch only
      if (showCurrent) {
        const result = execSync('git -C ' + path + ' rev-parse --abbrev-ref HEAD', {
          encoding: 'utf-8',
        })
        return {
          success: true,
          output: result.trim(),
        }
      }

      // List branches
      if (list) {
        const args = ['git', '-C', path, 'branch']

        if (all) {
          args.push('-a')
        } else if (remote) {
          args.push('-r')
        }

        args.push('--color=always')

        const result = execSync(args.join(' '), { encoding: 'utf-8' })
        return {
          success: true,
          output: result.trim(),
        }
      }

      return {
        success: false,
        output: '',
        error: 'No valid operation specified. Use create, delete, rename, checkout, or list.',
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
