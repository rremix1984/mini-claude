/**
 * /logs command
 * View and manage logs
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../../commands/types.js'
import type { LogLevel } from '../../logger/types.js'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'

// ─── Helper Functions ─────────────────────────────────────────────────────

function formatLogLevel(level: LogLevel): string {
  return level.toUpperCase().padEnd(5)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

async function getLogFilePath(): Promise<string> {
  const config = (await import('../../config/index.js')).getConfigManager()
  return config.get('logFile')
}

// ─── Subcommands ─────────────────────────────────────────────────────────

/**
 * View recent logs
 */
async function handleView(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const countArg = args._[0]
  const count = countArg ? Number.parseInt(countArg, 10) : 50

  if (Number.isNaN(count) || count < 1) {
    return {
      success: false,
      error: 'Usage: /logs view [count]',
    }
  }

  const logFilePath = await getLogFilePath()

  if (!existsSync(logFilePath)) {
    return {
      success: false,
      error: `Log file not found: ${logFilePath}`,
    }
  }

  try {
    const content = readFileSync(logFilePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim().length > 0)

    // Get the last N lines
    const recentLines = lines.slice(-count)

    const output = [
      `Recent ${Math.min(recentLines.length, count)} log entries:`,
      '='.repeat(50),
      '',
      ...recentLines,
      '',
      `Showing ${recentLines.length} of ${lines.length} total entries`,
      `Use /logs view <count> to show more or fewer lines`,
    ].join('\n')

    return { success: true, message: output }
  } catch (error) {
    return {
      success: false,
      error: `Failed to read log file: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Filter logs by level
 */
async function handleFilter(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const level = args._[0] as LogLevel

  if (!level || !['error', 'warn', 'info', 'debug', 'trace'].includes(level)) {
    return {
      success: false,
      error: 'Usage: /logs filter <level>\n       Valid levels: error, warn, info, debug, trace',
    }
  }

  const logFilePath = await getLogFilePath()

  if (!existsSync(logFilePath)) {
    return {
      success: false,
      error: `Log file not found: ${logFilePath}`,
    }
  }

  try {
    const content = readFileSync(logFilePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim().length > 0)

    // Filter by level (case-insensitive)
    const filteredLines = lines.filter(line =>
      line.toUpperCase().includes(`[${level.toUpperCase()}]`),
    )

    const output = [
      `Logs with level "${level}":`,
      '='.repeat(50),
      '',
      ...filteredLines.slice(-50), // Show last 50 matches
      '',
      `Found ${filteredLines.length} entries with level "${level}"`,
      `Showing last 50 of them`,
    ].join('\n')

    return { success: true, message: output }
  } catch (error) {
    return {
      success: false,
      error: `Failed to read log file: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Search logs for a pattern
 */
async function handleSearch(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const pattern = args._[0]

  if (!pattern) {
    return {
      success: false,
      error: 'Usage: /logs search <pattern>',
    }
  }

  const logFilePath = await getLogFilePath()

  if (!existsSync(logFilePath)) {
    return {
      success: false,
      error: `Log file not found: ${logFilePath}`,
    }
  }

  try {
    const content = readFileSync(logFilePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim().length > 0)

    // Search for pattern (case-insensitive)
    const searchLower = pattern.toLowerCase()
    const matchedLines = lines.filter(line =>
      line.toLowerCase().includes(searchLower),
    )

    const output = [
      `Logs matching "${pattern}":`,
      '='.repeat(50),
      '',
      ...matchedLines.slice(-50), // Show last 50 matches
      '',
      `Found ${matchedLines.length} entries matching "${pattern}"`,
      `Showing last 50 of them`,
    ].join('\n')

    return { success: true, message: output }
  } catch (error) {
    return {
      success: false,
      error: `Failed to read log file: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Show log file info
 */
async function handleInfo(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const logFilePath = await getLogFilePath()
  const config = (await import('../../config/index.js')).getConfigManager()

  const output = [
    'Log Configuration:',
    '===================',
    '',
    `Log level: ${config.get('logLevel')}`,
    `Log file: ${logFilePath}`,
    `Log file exists: ${existsSync(logFilePath) ? 'Yes' : 'No'}`,
    `Log to console: ${config.get('logToConsole')}`,
    `Log to file: ${config.get('logToFile')}`,
    '',
  ]

  if (existsSync(logFilePath)) {
    const stats = statSync(logFilePath)
    const content = readFileSync(logFilePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim().length > 0)

    output.push('Log File Statistics:')
    output.push('---------------------')
    output.push(`File size: ${formatBytes(stats.size)}`)
    output.push(`Created: ${stats.birthtime.toISOString()}`)
    output.push(`Modified: ${stats.mtime.toISOString()}`)
    output.push(`Total entries: ${lines.length}`)
  }

  return { success: true, message: output.join('\n') }
}

/**
 * Clear log file
 */
async function handleClear(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const { writeFileSync, unlinkSync } = await import('node:fs')

  const logFilePath = await getLogFilePath()

  if (!existsSync(logFilePath)) {
    return {
      success: false,
      error: `Log file not found: ${logFilePath}`,
    }
  }

  try {
    // Create empty file
    writeFileSync(logFilePath, '', 'utf-8')

    return {
      success: true,
      message: `Log file cleared: ${logFilePath}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to clear log file: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Delete log file
 */
async function handleDelete(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const { unlinkSync } = await import('node:fs')

  const logFilePath = await getLogFilePath()

  if (!existsSync(logFilePath)) {
    return {
      success: false,
      error: `Log file not found: ${logFilePath}`,
    }
  }

  try {
    unlinkSync(logFilePath)

    return {
      success: true,
      message: `Log file deleted: ${logFilePath}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete log file: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * List rotated log files
 */
async function handleList(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const logFilePath = await getLogFilePath()
  const logDir = dirname(logFilePath)
  const baseName = logFilePath.split('/').pop() || 'miniclaude.log'

  if (!existsSync(logDir)) {
    return {
      success: false,
      error: `Log directory not found: ${logDir}`,
    }
  }

  try {
    const files = readdirSync(logDir)
    const logFiles = files
      .filter(f => f.startsWith(baseName) || f === baseName)
      .sort()

    if (logFiles.length === 0) {
      return {
        success: true,
        message: `No log files found in ${logDir}`,
      }
    }

    const output = [
      'Log files:',
      '==========',
      '',
    ]

    for (const file of logFiles) {
      const filePath = join(logDir, file)
      const stats = statSync(filePath)
      const size = formatBytes(stats.size)
      const modified = stats.mtime.toISOString().split('T')[0]

      let marker = ''
      if (file === baseName) marker = ' (current)'

      output.push(`  ${file}${marker}`)
      output.push(`    Size: ${size}, Modified: ${modified}`)
      output.push('')
    }

    return { success: true, message: output.join('\n') }
  } catch (error) {
    return {
      success: false,
      error: `Failed to list log files: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// ─── Main Command ─────────────────────────────────────────────────────────

export const logsCommand: Command = {
  name: 'logs',
  aliases: ['log'],
  description: 'View and manage logs',
  usage: '/logs <subcommand> [options]',
  examples: [
    '/logs view [count]            - View recent log entries',
    '/logs filter <level>         - Filter logs by level',
    '/logs search <pattern>       - Search logs for pattern',
    '/logs info                   - Show log file info',
    '/logs clear                  - Clear log file',
    '/logs delete                 - Delete log file',
    '/logs list                   - List rotated log files',
  ],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const subcommand = args._[0] || 'view'

    const subcommands: Record<string, (args: CommandArgs, ctx: CommandContext) => Promise<CommandResult>> = {
      view: handleView,
      cat: handleView,
      tail: handleView,
      filter: handleFilter,
      grep: handleFilter,
      search: handleSearch,
      find: handleSearch,
      info: handleInfo,
      status: handleInfo,
      stat: handleInfo,
      clear: handleClear,
      clean: handleClear,
      delete: handleDelete,
      remove: handleDelete,
      rm: handleDelete,
      list: handleList,
      ls: handleList,
    }

    const handler = subcommands[subcommand]

    if (!handler) {
      return {
        success: false,
        error: `Unknown subcommand: ${subcommand}\n\nAvailable subcommands: ${Object.keys(subcommands).join(', ')}`,
      }
    }

    return handler(args, context)
  },
}
