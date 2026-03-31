/**
 * Log formatters for different output formats
 */

import type { LogEntry, LogFormatter } from './types.js'

// ─── Utility Functions ───────────────────────────────────────────────────

function formatTimestamp(date: Date): string {
  const iso = date.toISOString()
  return iso.replace('T', ' ').replace('Z', '')
}

function formatMessage(entry: LogEntry): string {
  let output = ''

  if (entry.timestamp) {
    output += `[${formatTimestamp(entry.timestamp)}] `
  }

  if (entry.level) {
    output += `[${entry.level.toUpperCase()}] `
  }

  if (entry.loggerName) {
    output += `[${entry.loggerName}] `
  }

  if (entry.requestId) {
    output += `[${entry.requestId}] `
  }

  output += entry.message

  if (entry.error) {
    output += `\n  Error: ${entry.error.name}: ${entry.error.message}`
    if (entry.error.stack) {
      output += `\n  Stack: ${entry.error.stack.split('\n').join('\n    ')}`
    }
  }

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
  }

  return output
}

// ─── Text Formatter ─────────────────────────────────────────────────────

export class TextFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return formatMessage(entry)
  }
}

// ─── JSON Formatter ──────────────────────────────────────────────────────

export class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const data = {
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp.toISOString(),
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.loggerName && { logger: entry.loggerName }),
      ...(entry.context && Object.keys(entry.context).length > 0 && { context: entry.context }),
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          ...(entry.error.stack && { stack: entry.error.stack }),
        },
      }),
    }

    return JSON.stringify(data)
  }
}

// ─── Pretty Formatter (with colors) ─────────────────────────────────────

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

const LEVEL_COLORS: Record<string, string> = {
  error: COLORS.red,
  warn: COLORS.yellow,
  info: COLORS.green,
  debug: COLORS.blue,
  trace: COLORS.cyan,
}

export class PrettyFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const levelColor = LEVEL_COLORS[entry.level] || COLORS.reset
    const timestamp = COLORS.gray + formatTimestamp(entry.timestamp) + COLORS.reset
    const level = levelColor + COLORS.bold + entry.level.toUpperCase().padEnd(5) + COLORS.reset

    let output = `${timestamp} ${level}`

    if (entry.loggerName) {
      output += ` ${COLORS.cyan}[${entry.loggerName}]${COLORS.reset}`
    }

    if (entry.requestId) {
      output += ` ${COLORS.gray}<${entry.requestId}>${COLORS.reset}`
    }

    output += ` ${COLORS.reset}${entry.message}`

    if (entry.error) {
      output += `\n${COLORS.red}  Error: ${entry.error.name}: ${entry.error.message}${COLORS.reset}`
      if (entry.error.stack) {
        output += `\n${COLORS.gray}  ${entry.error.stack.split('\n').join('\n  ')}${COLORS.reset}`
      }
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n${COLORS.gray}  ${JSON.stringify(entry.context, null, 2).split('\n').join('\n  ')}${COLORS.reset}`
    }

    return output
  }
}
