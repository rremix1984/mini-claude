/**
 * Logger class - Main logging interface
 */

import type { LogLevel, LogEntry, LoggerOptions, LoggerTransport } from './types.js'
import { LOG_LEVEL_ORDER } from './types.js'
import { ConsoleTransport, FileTransport, RotatingFileTransport } from './transports.js'
import { TextFormatter, JsonFormatter, PrettyFormatter } from './formatters.js'

// ─── Global Logger Instance ───────────────────────────────────────────────

let globalLogger: Logger | null = null

// ─── Logger Class ─────────────────────────────────────────────────────────

export class Logger {
  private name: string
  private level: LogLevel
  private transports: LoggerTransport[] = []
  private requestId: string | undefined

  constructor(name: string, options: LoggerOptions = {}) {
    this.name = name
    this.level = options.level ?? 'info'
    this.requestId = options.requestId

    // Initialize transports based on options
    this.initializeTransports(options)
  }

  private initializeTransports(options: LoggerOptions): void {
    const { format, colorize, console: enableConsole, file: enableFile, filePath } = options

    // Create formatter based on format option
    let formatter: typeof TextFormatter | typeof JsonFormatter | typeof PrettyFormatter

    switch (format) {
      case 'json':
        formatter = JsonFormatter
        break
      case 'pretty':
        formatter = PrettyFormatter
        break
      default:
        formatter = TextFormatter
    }

    // Add console transport if enabled
    if (enableConsole !== false) {
      this.transports.push(new ConsoleTransport(new formatter(), colorize !== false))
    }

    // Add file transport if enabled
    if (enableFile && filePath) {
      this.transports.push(new FileTransport(filePath, new formatter()))
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_ORDER[level] <= LOG_LEVEL_ORDER[this.level]
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      loggerName: this.name,
      requestId: this.requestId,
    }

    if (context && Object.keys(context).length > 0) {
      entry.context = context
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    // Write to all transports
    for (const transport of this.transports) {
      try {
        transport.write(entry)
      } catch (err) {
        // Avoid infinite loop by using console directly
        console.error('Failed to write to transport:', err)
      }
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log('error', message, context, error)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  /**
   * Log a trace message
   */
  trace(message: string, context?: Record<string, unknown>): void {
    this.log('trace', message, context)
  }

  /**
   * Create a child logger with additional context
   */
  child(name: string, additionalContext?: Record<string, unknown>): Logger {
    const child = new Logger(name, {
      level: this.level,
      requestId: this.requestId,
    })

    // Copy transports
    child.transports = [...this.transports]

    // Add context to all logs
    const originalLog = child.log.bind(child)
    child.log = (level, message, context, error) => {
      const mergedContext = {
        ...additionalContext,
        ...context,
      }
      originalLog(level, message, mergedContext, error)
    }

    return child
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level
  }

  /**
   * Set the request ID for tracing
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId
  }

  /**
   * Get the current request ID
   */
  getRequestId(): string | undefined {
    return this.requestId
  }

  /**
   * Add a custom transport
   */
  addTransport(transport: LoggerTransport): void {
    this.transports.push(transport)
  }

  /**
   * Remove a transport
   */
  removeTransport(transport: LoggerTransport): void {
    this.transports = this.transports.filter(t => t !== transport)
  }

  /**
   * Flush all transports
   */
  flush(): void {
    for (const transport of this.transports) {
      transport.flush?.()
    }
  }

  /**
   * Close all transports
   */
  close(): void {
    for (const transport of this.transports) {
      transport.close?.()
    }
    this.transports = []
  }
}

// ─── Helper Functions ───────────────────────────────────────────────────

/**
 * Get or create the global logger instance
 */
export function getLogger(name = 'default', options?: LoggerOptions): Logger {
  if (!globalLogger || options !== undefined) {
    globalLogger = new Logger(name, options)
  }
  return globalLogger
}

/**
 * Reset the global logger instance
 */
export function resetGlobalLogger(): void {
  if (globalLogger) {
    globalLogger.close()
  }
  globalLogger = null
}

/**
 * Create a new logger instance
 */
export function createLogger(name: string, options?: LoggerOptions): Logger {
  return new Logger(name, options)
}
