/**
 * LLM related errors
 */

import { MiniClaudeError, ErrorCode } from './types.js'

export class LLMConnectionError extends MiniClaudeError {
  constructor(provider: string, originalError?: Error) {
    super(
      ErrorCode.LLM_CONNECTION_ERROR,
      `Failed to connect to LLM provider: ${provider}`,
      originalError,
      { provider },
    )
    this.name = 'LLMConnectionError'
  }
}

export class LLMAPIError extends MiniClaudeError {
  constructor(provider: string, message: string, originalError?: Error) {
    super(
      ErrorCode.LLM_API_ERROR,
      `LLM API error from ${provider}: ${message}`,
      originalError,
      { provider, apiMessage: message },
    )
    this.name = 'LLMAPIError'
  }
}

export class LLMRateLimitError extends MiniClaudeError {
  constructor(provider: string, retryAfter?: number) {
    super(
      ErrorCode.LLM_RATE_LIMIT_ERROR,
      `Rate limit exceeded for ${provider}${retryAfter ? ` - retry after ${retryAfter}s` : ''}`,
      undefined,
      { provider, retryAfter },
    )
    this.name = 'LLMRateLimitError'
  }
}

export class LLMQuotaExceededError extends MiniClaudeError {
  constructor(provider: string, quotaInfo?: Record<string, unknown>) {
    super(
      ErrorCode.LLM_QUOTA_EXCEEDED,
      `API quota exceeded for ${provider}`,
      undefined,
      { provider, quotaInfo },
    )
    this.name = 'LLMQuotaExceededError'
  }
}

export class LLMTimeoutError extends MiniClaudeError {
  constructor(provider: string, timeout: number) {
    super(
      ErrorCode.LLM_TIMEOUT,
      `LLM request timed out for ${provider} (timeout: ${timeout}ms)`,
      undefined,
      { provider, timeout },
    )
    this.name = 'LLMTimeoutError'
  }
}

export class LLMInvalidResponseError extends MiniClaudeError {
  constructor(provider: string, reason: string, originalError?: Error) {
    super(
      ErrorCode.LLM_INVALID_RESPONSE,
      `Invalid response from ${provider}: ${reason}`,
      originalError,
      { provider, reason },
    )
    this.name = 'LLMInvalidResponseError'
  }
}
