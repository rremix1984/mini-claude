/**
 * GetProcessInfoTool - 获取进程信息
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { pid as currentPid } from 'node:process'
import { execSync } from 'node:child_process'

export const GetProcessInfoTool: ToolDefinition = {
  name: 'get_process_info',
  description: 'Get information about running processes or a specific process.',
  inputSchema: {
    type: 'object',
    properties: {
      pid: {
        type: 'number',
        description: 'Process ID (default: current process)',
      },
      search: {
        type: 'string',
        description: 'Search for processes by name',
      },
      limit: {
        type: 'number',
        description: 'Limit number of results (default: 20)',
      },
      format: {
        type: 'string',
        description: 'Output format: text, json (default: text)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const { pid: processId = currentPid, search, limit = 20, format = 'text' } = input as {
      pid?: number
      search?: string
      limit?: number
      format?: string
    }

    try {
      const platform = process.platform

      if (search) {
        // Search for processes by name
        let command = ''
        if (platform === 'darwin' || platform === 'linux') {
          command = `ps aux | grep -i "${search}" | grep -v grep | head -n ${limit}`
        } else if (platform === 'win32') {
          command = `tasklist | findstr /i "${search}" | more +0`
        } else {
          return {
            success: false,
            output: '',
            error: 'Unsupported platform for process search',
          }
        }

        const result = execSync(command, { encoding: 'utf-8' })

        if (format === 'json') {
          return {
            success: true,
            output: JSON.stringify(
              {
                search,
                platform,
                limit,
                results: result.trim().split('\n'),
              },
              null,
              2
            ),
          }
        }

        return {
          success: true,
          output: `🔍 Process Search Results\nSearch: "${search}"\nPlatform: ${platform}\n\n${result.trim()}`,
        }
      }

      // Get info for specific PID
      let command = ''
      if (platform === 'darwin' || platform === 'linux') {
        command = `ps -p ${processId} -o pid,ppid,pgid,comm,%cpu,%mem,vsz,rss,etime,command`
      } else if (platform === 'win32') {
        command = `tasklist /fi "PID eq ${processId}" /fo table /v`
      } else {
        return {
          success: false,
          output: '',
          error: 'Unsupported platform',
        }
      }

      const result = execSync(command, { encoding: 'utf-8' })

      // Get process environment (only for current process)
      let envInfo = ''
      if (processId === currentPid) {
        const envKeys = Object.keys(process.env).sort().slice(0, 10)
        envInfo = '\n\n🔧 Environment (sample):\n'
        envKeys.forEach((key) => {
          envInfo += `  ${key} = ${process.env[key]}\n`
        })
        envInfo += `  ... and ${Object.keys(process.env).length - 10} more variables\n`
      }

      if (format === 'json') {
        return {
          success: true,
          output: JSON.stringify(
            {
              pid: processId,
              platform,
              processInfo: result.trim(),
              ...(processId === currentPid && {
                currentProcess: {
                  uptime: `${Math.floor(process.uptime())}s`,
                  memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                },
              }),
            },
            null,
            2
          ),
        }
      }

      let output = `📊 Process Information\n`
      output += `PID: ${processId}\n`
      output += `Platform: ${platform}\n\n`
      output += result.trim()
      output += envInfo

      return {
        success: true,
        output,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        output: '',
        error: errorMessage.includes('not found') ? `Process ${processId} not found` : errorMessage,
      }
    }
  },
}
