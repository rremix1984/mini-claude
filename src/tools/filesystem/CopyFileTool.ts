/**
 * CopyFileTool - 复制文件
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { copyFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

export const CopyFileTool: ToolDefinition = {
  name: 'copy_file',
  description: 'Copy a file or directory to a new location.',
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

      // Create destination directory if needed
      const destDir = dirname(destPath)
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true })
      }

      // Copy file
      copyFileSync(sourcePath, destPath)

      const stats = statSync(destPath)

      return {
        success: true,
        output: `Copied ${sourcePath} to ${destPath}\nSize: ${formatBytes(stats.size)}`,
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
