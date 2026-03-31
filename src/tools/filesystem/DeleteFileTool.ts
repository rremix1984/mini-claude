/**
 * DeleteFileTool - 删除文件或目录
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { rmSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

export const DeleteFileTool: ToolDefinition = {
  name: 'delete_file',
  description: 'Delete a file or directory. Be careful as this operation cannot be undone.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file or directory to delete',
      },
      recursive: {
        type: 'boolean',
        description: 'Delete directory recursively (default: false)',
      },
      force: {
        type: 'boolean',
        description: 'Force delete even if file is read-only (default: false)',
      },
    },
    required: ['path'],
  },
  requiresPermission: true,
  execute: async (input) => {
    const { path, recursive = false, force = false } = input as {
      path: string
      recursive?: boolean
      force?: boolean
    }

    try {
      const resolvedPath = resolve(path)

      if (!existsSync(resolvedPath)) {
        return {
          success: false,
          output: '',
          error: `File not found: ${resolvedPath}`,
        }
      }

      const stats = statSync(resolvedPath)

      // Check if it's a directory
      if (stats.isDirectory() && !recursive) {
        return {
          success: false,
          output: '',
          error: `Cannot delete directory without recursive: true. Directory: ${resolvedPath}`,
        }
      }

      // Delete file or directory
      rmSync(resolvedPath, {
        recursive,
        force,
      })

      return {
        success: true,
        output: `Deleted ${resolvedPath}`,
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
