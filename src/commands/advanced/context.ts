/**
 * Context Command
 * Display current context information
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { cpus, totalmem, freemem, platform, arch, release } from 'node:os'
import { version } from 'node:process'

export const contextCommand: Command = {
  name: 'context',
  description: 'Display current context and environment information',
  usage: '/context',
  examples: ['/context'],
  category: 'advanced',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    try {
      const totalMemory = totalmem()
      const freeMemory = freemem()
      const usedMemory = totalMemory - freeMemory
      const memoryUsage = (usedMemory / totalMemory) * 100

      let output = '📊 Current Context\n\n'

      output += '🖥️  System:\n'
      output += `  Platform:    ${platform()}\n`
      output += `  Architecture: ${arch()}\n`
      output += `  OS Version:  ${release()}\n`
      output += `  CPU Cores:   ${cpus().length}\n`
      output += `  CPU Model:   ${cpus()[0]?.model || 'Unknown'}\n\n`

      output += '💾 Memory:\n'
      output += `  Total:   ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n`
      output += `  Used:    ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB (${memoryUsage.toFixed(1)}%)\n`
      output += `  Free:    ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n\n`

      output += '🟢 Node.js:\n'
      output += `  Version:     ${version}\n`
      output += `  Architecture: ${process.arch}\n`
      output += `  Platform:    ${process.platform}\n`
      output += `  PID:         ${process.pid}\n`
      output += `  Uptime:      ${Math.floor(process.uptime())}s\n\n`

      output += '⚙️  Configuration:\n'
      const config = context.config
      output += `  Model:           ${config.get('model')}\n`
      output += `  Temperature:      ${config.get('temperature')}\n`
      output += `  Max Tokens:      ${config.get('maxTokens')}\n`
      output += `  Permission Mode:  ${config.get('defaultPermissionMode')}\n`
      output += `  Theme:           ${config.get('theme')}\n`
      output += `  History Limit:    ${config.get('historyLimit')}\n`
      output += `  Auto Save:       ${config.get('autoSave')}\n`

      return {
        success: true,
        message: output,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
