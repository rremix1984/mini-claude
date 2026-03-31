/**
 * Logger types for structured logging
 */

// ─── Log Levels ─────────────────────────────────────────────────────────

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

export const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
}

export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
  debug: 'DEBUG',
  trace: 'TRACE',
}

// ─── Log Entry ────────────────────────────────────────────────────────────

export interface LogEntry {
  /** Log level */
  level: LogLevel
  /** Log message */
  message: string
  /** Timestamp */
  timestamp: Date
  /** Request ID for tracing */
  requestId?: string
  /** Logger name (source) */
  loggerName?: string
  /** Additional context data */
  context?: Record<string, unknown>
  /** Error object if applicable */
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// ─── Log Formats ─────────────────────────────────────────────────────────

export type LogFormat = 'text' | 'json' | 'pretty'

// ─── Logger Options ───────────────────────────────────────────────────────

export interface LoggerOptions {
  /** Minimum log level to output */
  level?: LogLevel
  /** Log format */
  format?: LogFormat
  /** Enable console output */
  console?: boolean
  /** Enable file output */
  file?: boolean
  /** File path for log output */
  filePath?: string
  /** Logger name (for identification) */
  name?: string
  /** Request ID for tracing */
  requestId?: string
  /** Enable color output for console */
  colorize?: boolean
  /** Include timestamps in output */
  includeTimestamp?: boolean
  /** Include level in output */
  includeLevel?: boolean
}

// ─── Logger Transport ─────────────────────────────────────────────────────

export interface LoggerTransport {
  /** Write a log entry */
  write(entry: LogEntry): void | Promise<void>
  /** Flush any buffered logs */
  flush?(): void | Promise<void>
  /** Close the transport */
  close?(): void | Promise<void>
}

// ─── Formatters ───────────────────────────────────────────────────────────

export interface LogFormatter {
  /** Format a log entry into a string */
  format(entry: LogEntry): string
}
