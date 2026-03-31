/**
 * FindReferencesTool - 查找符号引用
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'

export const FindReferencesTool: ToolDefinition = {
  name: 'find_references',
  description: 'Find references to a symbol across the codebase using ripgrep.',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'Symbol or identifier to find references for',
      },
      path: {
        type: 'string',
        description: 'Directory to search in (default: current directory)',
      },
      language: {
        type: 'string',
        description: 'Filter by language (e.g., "typescript", "javascript")',
      },
      includeDefinitions: {
        type: 'boolean',
        description: 'Include definition locations (default: false)',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results (default: 50)',
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
      includeDefinitions = false,
      maxResults = 50,
    } = input as {
      symbol: string
      path?: string
      language?: string
      includeDefinitions?: boolean
      maxResults?: number
    }

    try {
      // Build ripgrep command for word search
      const args = ['rg', `\\b${symbol}\\b`, path]  // Word boundary search

      // Add options
      args.push('--no-heading')
      args.push('--line-number')
      args.push('--column')

      if (language) {
        args.push('-t', language)
      }

      args.push('--max-count', String(maxResults))
      args.push('-C', '2')  // Show 2 lines of context

      // Execute ripgrep
      const result = execSync(args.join(' '), { encoding: 'utf-8' })

      if (!result.trim()) {
        return {
          success: true,
          output: `No references found for symbol: "${symbol}"`,
        }
      }

      // Filter out definition comments if requested
      let output = result
      if (!includeDefinitions) {
        // Simple heuristic: filter lines that look like definitions
        const lines = result.split('\n')
        output = lines
          .filter(line => {
            // Skip lines that look like definitions
            const lowerLine = line.toLowerCase()
            const isDefinition = /\b(function|class|const|let|var|interface|type|export)\s+/.test(lowerLine)
            return !isDefinition
          })
          .join('\n')
      }

      return {
        success: true,
        output: `References to "${symbol}":\n\n${output}`,
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
