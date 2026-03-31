/**
 * MoveFileTool - 移动/重命名文件
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { renameSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export const MoveFileTool: ToolDefinition = {
  name: 'move_file',
  description: 'Move or rename a file or directory to a new location.',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'Source file or directory path',
      },
      destination: {
        type: 'string',
        description: 'Destination path',
      },
      overwrite: {
        type: 'boolean',
        description: 'Overwrite if destination exists (default: false)',
      },
    },
    required: ['source', 'destination'],
  },
  requiresPermission: true,
  execute: async (input) => {
    const { source, destination, overwrite = false } = input as {
      source: string
      destination: string
      overwrite?: boolean
    }

    try {
      const sourcePath = resolve(source)
      const destPath = resolve(destination)

      if (!existsSync(sourcePath)) {
        return {
          success: false,
          output: '',
          error: `Source not found: ${sourcePath}`,
        }
      }

      if (existsSync(destPath) && !overwrite) {
        return {
          success: false,
          output: '',
          error: `Destination already exists: ${destPath}. Use overwrite: true to overwrite.`,
        }
      }

      // Move file
      renameSync(sourcePath, destPath)

      return {
        success: true,
        output: `Moved ${sourcePath} to ${destPath}`,
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
