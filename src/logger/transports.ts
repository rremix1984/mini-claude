/**
 * Log transports for different output destinations
 */

import { existsSync, mkdirSync, appendFileSync, createWriteStream, statSync, unlinkSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'
import type { LogEntry, LogFormatter, LoggerTransport } from './types.js'
import { TextFormatter, JsonFormatter, PrettyFormatter } from './formatters.js'

// ─── Console Transport ─────────────────────────────────────────────────

export class ConsoleTransport implements LoggerTransport {
  private formatter: LogFormatter
  private colorize: boolean

  constructor(formatter?: LogFormatter, colorize = true) {
    this.colorize = colorize
    this.formatter = formatter ?? (colorize ? new PrettyFormatter() : new TextFormatter())
  }

  write(entry: LogEntry): void {
    const message = this.formatter.format(entry)

    // Choose the right console method based on level
    switch (entry.level) {
      case 'error':
        console.error(message)
        break
      case 'warn':
        console.warn(message)
        break
      case 'debug':
      case 'trace':
        console.debug(message)
        break
      default:
        console.log(message)
    }
  }

  flush(): void {
    // No buffering for console transport
  }

  close(): void {
    // Nothing to close for console
  }
}

// ─── File Transport ────────────────────────────────────────────────────

export class FileTransport implements LoggerTransport {
  private formatter: LogFormatter
  private filePath: string
  private stream: ReturnType<typeof createWriteStream> | null = null
  private initialized = false

  constructor(filePath: string, formatter?: LogFormatter) {
    this.filePath = filePath
    this.formatter = formatter ?? new TextFormatter()
  }

  private ensureFileExists(): void {
    if (this.initialized) return

    const dir = dirname(this.filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // Create append-only stream
    this.stream = createWriteStream(this.filePath, { flags: 'a', encoding: 'utf-8' })
    this.initialized = true
  }

  write(entry: LogEntry): void {
    this.ensureFileExists()

    if (!this.stream) return

    const message = this.formatter.format(entry) + '\n'
    this.stream.write(message)
  }

  flush(): void {
    // Stream is flushed automatically on write
    if (!this.stream) return
  }

  close(): void {
    if (!this.stream) return
    this.stream.end()
    this.stream = null
    this.initialized = false
  }
}

// ─── Rotating File Transport ───────────────────────────────────────────

export interface RotatingFileTransportOptions {
  filePath: string
  /** Maximum size in bytes before rotation */
  maxSize?: number
  /** Maximum number of backup files to keep */
  maxFiles?: number
  formatter?: LogFormatter
}

export class RotatingFileTransport implements LoggerTransport {
  private formatter: LogFormatter
  private filePath: string
  private maxSize: number
  private maxFiles: number
  private currentSize = 0
  private initialized = false

  constructor(options: RotatingFileTransportOptions) {
    this.filePath = options.filePath
    this.formatter = options.formatter ?? new TextFormatter()
    this.maxSize = options.maxSize ?? 10 * 1024 * 1024 // 10MB default
    this.maxFiles = options.maxFiles ?? 5
  }

  private ensureFileExists(): void {
    if (this.initialized) return

    const dir = dirname(this.filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // Get current file size if it exists
    if (existsSync(this.filePath)) {
      const stats = statSync(this.filePath)
      this.currentSize = stats.size
    }

    this.initialized = true
  }

  private rotate(): void {
    // Rotate: .1, .2, .3, ...
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = `${this.filePath}.${i}`
      const newFile = `${this.filePath}.${i + 1}`

      if (existsSync(oldFile) && i + 1 <= this.maxFiles) {
        // Move oldFile to newFile (or delete if exceeds maxFiles)
        if (i + 1 > this.maxFiles) {
          unlinkSync(oldFile)
        } else {
          renameSync(oldFile, newFile)
        }
      }
    }

    // Move current file to .1
    if (existsSync(this.filePath)) {
      renameSync(this.filePath, `${this.filePath}.1`)
    }

    this.currentSize = 0
  }

  write(entry: LogEntry): void {
    this.ensureFileExists()

    const message = this.formatter.format(entry) + '\n'
    const messageSize = Buffer.byteLength(message, 'utf-8')

    // Check if rotation is needed
    if (this.currentSize + messageSize > this.maxSize) {
      this.rotate()
    }

    appendFileSync(this.filePath, message, 'utf-8')
    this.currentSize += messageSize
  }

  flush(): void {
    // No buffering for file transport
  }

  close(): void {
    // Nothing to close for appendFileSync
    this.initialized = false
  }
}
