/**
 * CreateDirectoryTool - 创建目录
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export const CreateDirectoryTool: ToolDefinition = {
  name: 'create_directory',
  description: 'Create a new directory. Supports creating nested directories.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the directory to create',
      },
      recursive: {
        type: 'boolean',
        description: 'Create parent directories if they do not exist (default: true)',
      },
    },
    required: ['path'],
  },
  requiresPermission: true,
  execute: async (input) => {
    const { path, recursive = true } = input as {
      path: string
      recursive?: boolean
    }

    try {
      const resolvedPath = resolve(path)

      if (existsSync(resolvedPath)) {
        return {
          success: false,
          output: '',
          error: `Directory already exists: ${resolvedPath}`,
        }
      }

      // Create directory
      mkdirSync(resolvedPath, { recursive })

      return {
        success: true,
        output: `Created directory: ${resolvedPath}`,
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
