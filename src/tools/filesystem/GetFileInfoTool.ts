/**
 * GetFileInfoTool - 获取文件元数据
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { statSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export const GetFileInfoTool: ToolDefinition = {
  name: 'get_file_info',
  description: 'Get detailed information about a file or directory including size, permissions, and timestamps.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file or directory',
      },
    },
    required: ['path'],
  },
  requiresPermission: false,
  execute: async (input) => {
    const { path } = input as { path: string }

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
      const info: string[] = []

      info.push(`Path: ${resolvedPath}`)
      info.push(`Type: ${stats.isDirectory() ? 'Directory' : stats.isFile() ? 'File' : stats.isSymbolicLink() ? 'Symbolic Link' : 'Other'}`)
      info.push(`Size: ${formatBytes(stats.size)}`)
      info.push(`Created: ${stats.birthtime.toISOString()}`)
      info.push(`Modified: ${stats.mtime.toISOString()}`)
      info.push(`Accessed: ${stats.atime.toISOString()}`)

      // Node.js doesn't have easy permission parsing, skip for now
      // info.push(`Permissions: ${stats.mode.toString(8)}`)

      return {
        success: true,
        output: info.join('\n'),
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
