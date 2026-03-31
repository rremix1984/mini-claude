/**
 * Configuration related errors
 */

import { MiniClaudeError, ErrorCode } from './types.js'

export class ConfigNotFoundError extends MiniClaudeError {
  constructor(configPath: string, originalError?: Error) {
    super(
      ErrorCode.CONFIG_NOT_FOUND,
      `Configuration file not found: ${configPath}`,
      originalError,
      { configPath },
    )
    this.name = 'ConfigNotFoundError'
  }
}

export class ConfigInvalidError extends MiniClaudeError {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorCode.CONFIG_INVALID,
      `Invalid configuration: ${message}`,
      originalError,
      {},
    )
    this.name = 'ConfigInvalidError'
  }
}

export class ConfigReadError extends MiniClaudeError {
  constructor(configPath: string, originalError?: Error) {
    super(
      ErrorCode.CONFIG_READ_ERROR,
      `Failed to read configuration from: ${configPath}`,
      originalError,
      { configPath },
    )
    this.name = 'ConfigReadError'
  }
}

export class ConfigWriteError extends MiniClaudeError {
  constructor(configPath: string, originalError?: Error) {
    super(
      ErrorCode.CONFIG_WRITE_ERROR,
      `Failed to write configuration to: ${configPath}`,
      originalError,
      { configPath },
    )
    this.name = 'ConfigWriteError'
  }
}

export class ConfigValidationError extends MiniClaudeError {
  constructor(validationErrors: string[], originalError?: Error) {
    super(
      ErrorCode.CONFIG_VALIDATION_ERROR,
      `Configuration validation failed: ${validationErrors.join(', ')}`,
      originalError,
      { validationErrors },
    )
    this.name = 'ConfigValidationError'
  }
}
