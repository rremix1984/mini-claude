/**
 * ListDirectoryTool - 列出目录内容
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const ListDirectoryTool: ToolDefinition = {
  name: 'list_directory',
  description: 'List the contents of a directory. Supports recursive listing and filtering by file type.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the directory (default: current directory)',
      },
      recursive: {
        type: 'boolean',
        description: 'Whether to list recursively (default: false)',
      },
      showHidden: {
        type: 'boolean',
        description: 'Whether to show hidden files (default: false)',
      },
      filter: {
        type: 'string',
        description: 'Filter files by extension or pattern (e.g., "*.ts", "*.js")',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      recursive = false,
      showHidden = false,
      filter,
    } = input as {
      path?: string
      recursive?: boolean
      showHidden?: boolean
      filter?: string
    }

    try {
      const resolvedPath = resolve(path)

      if (!existsSync(resolvedPath)) {
        return {
          success: false,
          output: '',
          error: `Directory not found: ${resolvedPath}`,
        }
      }

      const stats = statSync(resolvedPath)

      if (!stats.isDirectory()) {
        return {
          success: false,
          output: '',
          error: `Path is not a directory: ${resolvedPath}`,
        }
      }

      const listFiles = (dirPath: string, depth = 0): string[] => {
        const entries = readdirSync(dirPath)
        const files: string[] = []

        for (const entry of entries) {
          // Skip hidden files
          if (!showHidden && entry.startsWith('.')) {
            continue
          }

          const fullPath = join(dirPath, entry)
          const entryStats = statSync(fullPath)
          const indent = '  '.repeat(depth)

          // Apply filter if provided
          if (filter) {
            const filterLower = filter.toLowerCase()
            const entryLower = entry.toLowerCase()
            if (!entryLower.endsWith(filterLower.replace('*.', '.'))) {
              continue
            }
          }

          if (entryStats.isDirectory()) {
            files.push(`${indent}📁 ${entry}/`)
            if (recursive) {
              files.push(...listFiles(fullPath, depth + 1))
            }
          } else if (entryStats.isSymbolicLink()) {
            files.push(`${indent}🔗 ${entry}`)
          } else {
            files.push(`${indent}📄 ${entry}`)
          }
        }

        return files
      }

      const files = listFiles(resolvedPath)
      const output = files.join('\n')

      return {
        success: true,
        output: `Directory listing for: ${resolvedPath}\n\n${output}`,
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
