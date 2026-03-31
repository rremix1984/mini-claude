/**
 * CodeSearchTool - 代码搜索
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const CodeSearchTool: ToolDefinition = {
  name: 'code_search',
  description: 'Search code using ripgrep. Supports regex, file patterns, and language filtering.',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Search pattern or regex',
      },
      path: {
        type: 'string',
        description: 'Directory to search in (default: current directory)',
      },
      filePattern: {
        type: 'string',
        description: 'File pattern (e.g., "*.ts", "*.js")',
      },
      language: {
        type: 'string',
        description: 'Filter by language (e.g., "typescript", "javascript", "python")',
      },
      caseSensitive: {
        type: 'boolean',
        description: 'Case sensitive search (default: false)',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return (default: 50)',
      },
    },
    required: ['pattern'],
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      pattern,
      path = '.',
      filePattern,
      language,
      caseSensitive = false,
      maxResults = 50,
    } = input as {
      pattern: string
      path?: string
      filePattern?: string
      language?: string
      caseSensitive?: boolean
      maxResults?: number
    }

    try {
      // Build ripgrep command
      const args = ['rg', pattern, path]

      // Add options
      if (!caseSensitive) {
        args.push('-i')  // Case insensitive
      }

      if (language) {
        args.push('-t', language)  // Type language
      }

      if (filePattern) {
        args.push('-g', filePattern)  // Glob pattern
      }

      args.push('-l')  // Only show file names
      args.push('-c')  // Show count
      args.push('--no-heading')
      args.push('--max-count', String(maxResults))

      // Execute ripgrep
      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (!result.trim()) {
        return {
          success: true,
          output: `No matches found for pattern: "${pattern}"`,
        }
      }

      return {
        success: true,
        output: `Code search results for "${pattern}":\n\n${result}`,
      }
    } catch (error: any) {
      // Check if ripgrep is installed
      if (error.code === 127 || error.code === 'ENOENT') {
        return {
          success: false,
          output: '',
          error: 'ripgrep (rg) is not installed. Please install it: https://github.com/BurntSushi/ripgrep',
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
