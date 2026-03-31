/**
 * Error handling middleware and utilities
 */

import type { Logger } from '../logger/index.js'
import type { MiniClaudeError } from './types.js'

// ─── Error Handler Options ─────────────────────────────────────────────────

export interface ErrorHandlerOptions {
  logger?: Logger
  silent?: boolean
  logContext?: boolean
}

// ─── Error Handler Class ────────────────────────────────────────────────

export class ErrorHandler {
  private logger?: Logger
  private silent: boolean
  private logContext: boolean

  constructor(options: ErrorHandlerOptions = {}) {
    this.logger = options.logger
    this.silent = options.silent ?? false
    this.logContext = options.logContext ?? true
  }

  /**
   * Handle an error - log it and return formatted message
   */
  handle(error: Error | MiniClaudeError): string {
    // Check if it's a MiniClaudeError
    const isMiniClaudeError = 'code' in error && 'getFullMessage' in error

    // Log the error
    if (this.logger) {
      if (isMiniClaudeError) {
        this.logger.error(error.message, error.toJSON() as Record<string, unknown>)
      } else {
        this.logger.error(error.message, { stack: error.stack })
      }
    }

    // Format the error for display
    if (isMiniClaudeError) {
      return (error as MiniClaudeError).getFullMessage()
    }

    // Regular error
    return error.message
  }

  /**
   * Handle an error and throw it
   */
  handleAndThrow(error: Error | MiniClaudeError): never {
    this.handle(error)
    throw error
  }

  /**
   * Wrap a function with error handling
   */
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    errorMessage?: string,
  ): T {
    return ((...args: unknown[]) => {
      try {
        return fn(...args)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.handle(err)
        throw err
      }
    }) as T
  }

  /**
   * Wrap an async function with error handling
   */
  wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    errorMessage?: string,
  ): T {
    return (async (...args: unknown[]) => {
      try {
        return await fn(...args)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.handle(err)
        throw err
      }
    }) as T
  }
}

// ─── Retry Logic ────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Maximum number of retries */
  maxRetries?: number
  /** Initial delay in milliseconds */
  initialDelay?: number
  /** Maximum delay in milliseconds */
  maxDelay?: number
  /** Backoff multiplier */
  backoffMultiplier?: number
  /** Whether to retry on specific errors */
  shouldRetry?: (error: Error) => boolean
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options

  let delay = initialDelay
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve as any, Math.min(delay, maxDelay)))

      // Exponential backoff
      delay *= backoffMultiplier
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!
}

/**
 * Create a retryable function wrapper
 */
export function retryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: RetryOptions,
): T {
  return ((...args: unknown[]) => withRetry(() => fn(...args) as Promise<unknown>, options)) as T
}

// ─── Fallback Logic ───────────────────────────────────────────────────

export interface FallbackOptions<T> {
  /** Fallback value or function */
  fallback: T | (() => T)
  /** Whether to log the error */
  logError?: boolean
  /** Logger instance */
  logger?: Logger
}

/**
 * Execute a function with a fallback
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  options: FallbackOptions<T>,
): Promise<T> {
  const { fallback, logError = true, logger } = options

  try {
    return await fn()
  } catch (error) {
    if (logError && logger) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.warn(`Operation failed, using fallback: ${err.message}`, { error: err })
    }

    // Return fallback value
    if (typeof fallback === 'function') {
      return (fallback as () => T)()
    }
    return fallback
  }
}

// ─── Error Utilities ──────────────────────────────────────────────────

/**
 * Check if error is a specific type
 */
export function isMiniClaudeError(error: unknown): error is MiniClaudeError {
  return (
    error instanceof Error &&
    'code' in error &&
    'getFullMessage' in error
  )
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EPIPE',
    'EAI_AGAIN',
    'ENOTFOUND',
    'rate limit',
    'timeout',
  ]

  const message = error.message.toLowerCase()
  return retryableMessages.some(msg => message.includes(msg.toLowerCase()))
}

/**
 * Create a timeout error
 */
export function createTimeoutError(operation: string, timeout: number): Error {
  return new Error(`${operation} timed out after ${timeout}ms`)
}

// ─── Global Error Handlers ───────────────────────────────────────────

let globalErrorHandler: ErrorHandler | null = null

/**
 * Set global error handler
 */
export function setGlobalErrorHandler(handler: ErrorHandler): void {
  globalErrorHandler = handler
}

/**
 * Get global error handler
 */
export function getGlobalErrorHandler(): ErrorHandler | undefined {
  return globalErrorHandler || undefined
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(error: Error): void {
  if (globalErrorHandler) {
    globalErrorHandler.handle(error)
  } else {
    console.error('Uncaught Exception:', error)
  }

  // Exit with error code
  process.exit(1)
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(reason: unknown): void {
  const error = reason instanceof Error ? reason : new Error(String(reason))

  if (globalErrorHandler) {
    globalErrorHandler.handle(error)
  } else {
    console.error('Unhandled Rejection:', error)
  }
}

// ─── Setup Global Error Handlers ─────────────────────────────────────

/**
 * Setup global error handlers for process
 */
export function setupGlobalErrorHandlers(options?: ErrorHandlerOptions): void {
  const handler = new ErrorHandler(options)
  setGlobalErrorHandler(handler)

  // Setup uncaught exception handler
  process.on('uncaughtException', handleUncaughtException)

  // Setup unhandled rejection handler
  process.on('unhandledRejection', handleUnhandledRejection)
}
