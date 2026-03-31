import type { ToolDefinition, ToolResult } from '../../../types.js'
import { execSync } from 'node:child_process'

export const ${name}Tool: ToolDefinition = {
  name: 'git_${name,,?toLower}',
  description: 'Git ${name} operation',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const { path = '.' } = input as { path?: string }
    try {
      const args = ['git', '-C', path, '${name}']
      const result = execSync(args.join(' '), { encoding: 'utf-8' })
      return {
        success: true,
        output: result,
      }
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
