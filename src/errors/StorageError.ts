/**
 * Storage related errors
 */

import { MiniClaudeError, ErrorCode } from './types.js'

export class StorageNotFoundError extends MiniClaudeError {
  constructor(key: string, originalError?: Error) {
    super(
      ErrorCode.STORAGE_NOT_FOUND,
      `Storage entry not found: ${key}`,
      originalError,
      { key },
    )
    this.name = 'StorageNotFoundError'
  }
}

export class StorageReadError extends MiniClaudeError {
  constructor(key: string, originalError?: Error) {
    super(
      ErrorCode.STORAGE_READ_ERROR,
      `Failed to read from storage: ${key}`,
      originalError,
      { key },
    )
    this.name = 'StorageReadError'
  }
}

export class StorageWriteError extends MiniClaudeError {
  constructor(key: string, originalError?: Error) {
    super(
      ErrorCode.STORAGE_WRITE_ERROR,
      `Failed to write to storage: ${key}`,
      originalError,
      { key },
    )
    this.name = 'StorageWriteError'
  }
}

export class SessionNotFoundError extends MiniClaudeError {
  constructor(sessionId: string, originalError?: Error) {
    super(
      ErrorCode.SESSION_NOT_FOUND,
      `Session not found: ${sessionId}`,
      originalError,
      { sessionId },
    )
    this.name = 'SessionNotFoundError'
  }
}

export class SessionLoadError extends MiniClaudeError {
  constructor(sessionId: string, originalError?: Error) {
    super(
      ErrorCode.SESSION_LOAD_ERROR,
      `Failed to load session: ${sessionId}`,
      originalError,
      { sessionId },
    )
    this.name = 'SessionLoadError'
  }
}

export class SessionSaveError extends MiniClaudeError {
  constructor(sessionId: string, originalError?: Error) {
    super(
      ErrorCode.SESSION_SAVE_ERROR,
      `Failed to save session: ${sessionId}`,
      originalError,
      { sessionId },
    )
    this.name = 'SessionSaveError'
  }
}
