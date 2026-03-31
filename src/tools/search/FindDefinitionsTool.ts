/**
 * FindDefinitionsTool - 查找符号定义
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const FindDefinitionsTool: ToolDefinition = {
  name: 'find_definitions',
  description: 'Find definitions of symbols using ripgrep. Matches common definition patterns.',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'Symbol or identifier to find definitions for',
      },
      path: {
        type: 'string',
        description: 'Directory to search in (default: current directory)',
      },
      language: {
        type: 'string',
        description: 'Filter by language (e.g., "typescript", "javascript")',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results (default: 20)',
      },
    },
    required: ['symbol'],
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      symbol,
      path = '.',
      language,
      maxResults = 20,
    } = input as {
      symbol: string
      path?: string
      language?: string
      maxResults?: number
    }

    try {
      // Build ripgrep command for definition search
      const args = ['rg', `\\b${symbol}\\b`, path]

      // Match common definition patterns
      args.push('--no-heading')
      args.push('--line-number')
      args.push('--column')

      if (language) {
        args.push('-t', language)
      }

      args.push('--max-count', String(maxResults))

      // Match patterns that look like definitions
      const pattern = String.raw`\b(function|class|interface|type|enum|const|let|var|def|\s+${symbol}\s*=)\s+\b${symbol}\b`
      args.push('-e', pattern)
      args.push('-C', '1')  // Show 1 line of context

      // Execute ripgrep
      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (!result.trim()) {
        return {
          success: true,
          output: `No definitions found for symbol: "${symbol}"`,
        }
      }

      return {
        success: true,
        output: `Definitions of "${symbol}":\n\n${result}`,
      }
    } catch (error: any) {
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
