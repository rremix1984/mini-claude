/**
 * GetSystemInfoTool - 获取系统信息
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { platform, release, totalmem, freemem, cpus, arch, homedir, tmpdir } from 'node:os'
import { env } from 'node:process'

export const GetSystemInfoTool: ToolDefinition = {
  name: 'get_system_info',
  description: 'Get detailed system information including OS, CPU, memory, and more.',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: 'Output format: text, json (default: text)',
      },
      includeEnv: {
        type: 'boolean',
        description: 'Include environment variables (default: false)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const { format = 'text', includeEnv = false } = input as {
      format?: string
      includeEnv?: boolean
    }

    try {
      const osType = platform()
      const osRelease = release()
      const osArch = arch()
      const totalMemory = totalmem()
      const freeMemory = freemem()
      const usedMemory = totalMemory - freeMemory
      const cpuInfo = cpus()

      const memoryInfo = {
        total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
        used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usagePercent: `${((usedMemory / totalMemory) * 100).toFixed(1)}%`,
      }

      const cpuDetails = {
        model: cpuInfo[0]?.model || 'Unknown',
        cores: cpuInfo.length,
        speed: `${cpuInfo[0]?.speed || 0} MHz`,
      }

      const osInfo = {
        platform: osType,
        release: osRelease,
        arch: osArch,
        homedir: homedir(),
        tmpdir: tmpdir(),
      }

      const nodeInfo = {
        version: process.version,
        architecture: process.arch,
        platform: process.platform,
        pid: process.pid,
        uptime: `${Math.floor(process.uptime())}s`,
      }

      const userInfo = {
        username: env.USER || env.USERNAME || 'unknown',
        home: homedir(),
        shell: env.SHELL || 'N/A',
      }

      if (format === 'json') {
        return {
          success: true,
          output: JSON.stringify(
            {
              os: osInfo,
              memory: memoryInfo,
              cpu: cpuDetails,
              node: nodeInfo,
              user: userInfo,
              ...(includeEnv && { env: env }),
            },
            null,
            2
          ),
        }
      }

      // Text format
      let output = '🖥️  System Information\n'
      output += '='.repeat(50) + '\n\n'

      output += '📌 Operating System:\n'
      output += `  Platform: ${osInfo.platform}\n`
      output += `  Release:  ${osInfo.release}\n`
      output += `  Architecture: ${osInfo.arch}\n`
      output += `  Home Dir:  ${osInfo.homedir}\n`
      output += `  Temp Dir:  ${osInfo.tmpdir}\n\n`

      output += '💾 Memory:\n'
      output += `  Total:    ${memoryInfo.total}\n`
      output += `  Used:     ${memoryInfo.used} (${memoryInfo.usagePercent})\n`
      output += `  Free:     ${memoryInfo.free}\n\n`

      output += '🔧 CPU:\n'
      output += `  Model:    ${cpuDetails.model}\n`
      output += `  Cores:    ${cpuDetails.cores}\n`
      output += `  Speed:    ${cpuDetails.speed}\n\n`

      output += '🟢 Node.js:\n'
      output += `  Version:  ${nodeInfo.version}\n`
      output += `  Arch:     ${nodeInfo.architecture}\n`
      output += `  Platform: ${nodeInfo.platform}\n`
      output += `  PID:      ${nodeInfo.pid}\n`
      output += `  Uptime:   ${nodeInfo.uptime}\n\n`

      output += '👤 User:\n'
      output += `  Username: ${userInfo.username}\n`
      output += `  Shell:    ${userInfo.shell}\n`

      if (includeEnv) {
        output += '\n🔧 Environment Variables:\n'
        const envKeys = Object.keys(env).sort()
        output += `  Total: ${envKeys.length} variables\n`
        output += `  Examples:\n`
        envKeys.slice(0, 10).forEach((key) => {
          output += `    ${key} = ${env[key]}\n`
        })
        if (envKeys.length > 10) {
          output += `    ... and ${envKeys.length - 10} more\n`
        }
      }

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
