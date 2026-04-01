/**
 * WhoamiTool - 获取当前用户信息
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { userInfo, hostname, homedir, platform, arch, release } from 'node:os'
import { env } from 'node:process'

export const WhoamiTool: ToolDefinition = {
  name: 'whoami',
  description: 'Get information about the current user.',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: 'Output format: text, json (default: text)',
      },
      verbose: {
        type: 'boolean',
        description: 'Show detailed user information (default: false)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const { format = 'text', verbose = false } = input as {
      format?: string
      verbose?: boolean
    }

    try {
      const user = userInfo()
      const host = hostname()

      const userBasicInfo = {
        username: user.username,
        uid: user.uid,
        gid: user.gid,
        shell: user.shell,
        homedir: user.homedir,
        hostname: host,
      }

      if (format === 'json') {
        if (verbose) {
          return {
            success: true,
            output: JSON.stringify(
              {
                ...userBasicInfo,
                os: {
                  platform: platform(),
                  arch: arch(),
                  release: release(),
                },
                env: {
                  user: env.USER || env.USERNAME,
                  home: env.HOME,
                  shell: env.SHELL,
                  path: env.PATH?.split(':').slice(0, 3),
                },
              },
              null,
              2
            ),
          }
        }

        return {
          success: true,
          output: JSON.stringify(userBasicInfo, null, 2),
        }
      }

      let output = '👤 User Information\n'
      output += '='.repeat(40) + '\n\n'

      output += `Username:   ${user.username}\n`
      output += `UID:        ${user.uid}\n`
      output += `GID:        ${user.gid}\n`
      output += `Home Dir:   ${user.homedir}\n`
      output += `Shell:      ${user.shell || 'N/A'}\n`
      output += `Hostname:   ${host}\n`

      if (verbose) {
        output += '\n🖥️  System:\n'
        output += `  Platform:  ${platform()}\n`
        output += `  Arch:      ${arch()}\n`
        output += `  Release:   ${release()}\n\n`

        output += '🔧 Environment:\n'
        output += `  USER:      ${env.USER || env.USERNAME || 'N/A'}\n`
        output += `  HOME:      ${env.HOME || 'N/A'}\n`
        output += `  SHELL:     ${env.SHELL || 'N/A'}\n`
        output += `  PATH:      ${env.PATH?.split(':').slice(0, 3).join(':')}\n`
        output += `             (truncated, ${env.PATH?.split(':').length || 0} entries total)\n`
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
