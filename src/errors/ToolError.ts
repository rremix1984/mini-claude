/**
 * Tool related errors
 */

import { MiniClaudeError, ErrorCode } from './types.js'

export class ToolNotFoundError extends MiniClaudeError {
  constructor(toolName: string, originalError?: Error) {
    super(
      ErrorCode.TOOL_NOT_FOUND,
      `Tool not found: ${toolName}`,
      originalError,
      { toolName },
    )
    this.name = 'ToolNotFoundError'
  }
}

export class ToolExecutionError extends MiniClaudeError {
  constructor(toolName: string, error: Error) {
    super(
      ErrorCode.TOOL_EXECUTION_ERROR,
      `Tool execution failed: ${toolName}`,
      error,
      { toolName },
    )
    this.name = 'ToolExecutionError'
  }
}

export class ToolTimeoutError extends MiniClaudeError {
  constructor(toolName: string, timeout: number) {
    super(
      ErrorCode.TOOL_TIMEOUT,
      `Tool execution timed out: ${toolName} (timeout: ${timeout}ms)`,
      undefined,
      { toolName, timeout },
    )
    this.name = 'ToolTimeoutError'
  }
}

export class ToolInvalidInputError extends MiniClaudeError {
  constructor(toolName: string, reason: string, input?: unknown) {
    super(
      ErrorCode.TOOL_INVALID_INPUT,
      `Invalid input for tool ${toolName}: ${reason}`,
      undefined,
      { toolName, reason, input },
    )
    this.name = 'ToolInvalidInputError'
  }
}

export class ToolPermissionDeniedError extends MiniClaudeError {
  constructor(toolName: string, reason?: string) {
    super(
      ErrorCode.TOOL_PERMISSION_DENIED,
      `Permission denied for tool: ${toolName}${reason ? ` - ${reason}` : ''}`,
      undefined,
      { toolName, reason },
    )
    this.name = 'ToolPermissionDeniedError'
  }
}

export class ToolResultParseError extends MiniClaudeError {
  constructor(toolName: string, originalError: Error) {
    super(
      ErrorCode.TOOL_RESULT_PARSE_ERROR,
      `Failed to parse tool result: ${toolName}`,
      originalError,
      { toolName },
    )
    this.name = 'ToolResultParseError'
  }
}
