/**
 * GetEnvVarTool - 获取环境变量
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { env } from 'node:process'

export const GetEnvVarTool: ToolDefinition = {
  name: 'get_env_var',
  description: 'Get environment variable(s). Can retrieve all variables or specific ones.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the environment variable (optional)',
      },
      search: {
        type: 'string',
        description: 'Search for variables by name pattern',
      },
      list: {
        type: 'boolean',
        description: 'List all environment variables',
      },
      format: {
        type: 'string',
        description: 'Output format: text, json, env (default: text)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const { name, search, list = false, format = 'text' } = input as {
      name?: string
      search?: string
      list?: boolean
      format?: string
    }

    try {
      // Get specific variable
      if (name) {
        const value = env[name]

        if (value === undefined) {
          return {
            success: false,
            output: '',
            error: `Environment variable '${name}' not found`,
          }
        }

        if (format === 'json') {
          return {
            success: true,
            output: JSON.stringify({ name, value }, null, 2),
          }
        }

        if (format === 'env') {
          return {
            success: true,
            output: `${name}=${value}`,
          }
        }

        return {
          success: true,
          output: `🔑 Environment Variable\n\n${name}=${value}`,
        }
      }

      // Search for variables
      if (search) {
        const searchLower = search.toLowerCase()
        const matches = Object.entries(env)
          .filter(([key]) => key.toLowerCase().includes(searchLower))
          .sort((a, b) => a[0].localeCompare(b[0]))

        if (matches.length === 0) {
          return {
            success: false,
            output: '',
            error: `No environment variables found matching '${search}'`,
          }
        }

        if (format === 'json') {
          return {
            success: true,
            output: JSON.stringify(Object.fromEntries(matches), null, 2),
          }
        }

        if (format === 'env') {
          return {
            success: true,
            output: matches.map(([k, v]) => `${k}=${v}`).join('\n'),
          }
        }

        const output = `🔍 Environment Variables matching '${search}':\n\n`
        const list = matches.map(([k, v]) => `  ${k} = ${v}`).join('\n')
        return {
          success: true,
          output: output + list,
        }
      }

      // List all variables
      if (list) {
        const sortedVars = Object.entries(env).sort((a, b) => a[0].localeCompare(b[0]))

        if (format === 'json') {
          return {
            success: true,
            output: JSON.stringify(Object.fromEntries(sortedVars), null, 2),
          }
        }

        if (format === 'env') {
          return {
            success: true,
            output: sortedVars.map(([k, v]) => `${k}=${v}`).join('\n'),
          }
        }

        const output = `🔑 All Environment Variables (${sortedVars.length} total):\n\n`
        const list = sortedVars.map(([k, v]) => `  ${k} = ${v}`).join('\n')
        return {
          success: true,
          output: output + list,
        }
      }

      // No specific request, return some common variables
      const commonVars = {
        PATH: env.PATH,
        HOME: env.HOME,
        USER: env.USER || env.USERNAME,
        SHELL: env.SHELL,
        NODE_ENV: env.NODE_ENV,
        LANG: env.LANG,
      }

      if (format === 'json') {
        return {
          success: true,
          output: JSON.stringify(commonVars, null, 2),
        }
      }

      let output = '🔑 Common Environment Variables:\n\n'
      Object.entries(commonVars).forEach(([key, value]) => {
        output += `  ${key} = ${value || '(not set)'}\n`
      })
      output += `\n💡 Use --list to see all ${Object.keys(env).length} variables, or --name <VAR> for a specific variable.`

      return {
        success: true,
        output,
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
