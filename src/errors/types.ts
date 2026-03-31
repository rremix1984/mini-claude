/**
 * Error types and codes for Mini-Claude
 */

// ─── Error Codes ─────────────────────────────────────────────────────────

export enum ErrorCode {
  // General Errors (1000-1999)
  UNKNOWN_ERROR = 1000,
  INTERNAL_ERROR = 1001,

  // Configuration Errors (2000-2999)
  CONFIG_NOT_FOUND = 2000,
  CONFIG_INVALID = 2001,
  CONFIG_READ_ERROR = 2002,
  CONFIG_WRITE_ERROR = 2003,
  CONFIG_VALIDATION_ERROR = 2004,

  // Storage Errors (3000-3999)
  STORAGE_NOT_FOUND = 3000,
  STORAGE_READ_ERROR = 3001,
  STORAGE_WRITE_ERROR = 3002,
  STORAGE_DELETE_ERROR = 3003,
  SESSION_NOT_FOUND = 3100,
  SESSION_LOAD_ERROR = 3101,
  SESSION_SAVE_ERROR = 3102,

  // Tool Errors (4000-4999)
  TOOL_NOT_FOUND = 4000,
  TOOL_EXECUTION_ERROR = 4001,
  TOOL_TIMEOUT = 4002,
  TOOL_INVALID_INPUT = 4003,
  TOOL_PERMISSION_DENIED = 4004,
  TOOL_RESULT_PARSE_ERROR = 4005,

  // Command Errors (5000-5999)
  COMMAND_NOT_FOUND = 5000,
  COMMAND_INVALID = 5001,
  COMMAND_EXECUTION_ERROR = 5002,
  COMMAND_PERMISSION_DENIED = 5003,

  // LLM Errors (6000-6999)
  LLM_CONNECTION_ERROR = 6000,
  LLM_API_ERROR = 6001,
  LLM_RATE_LIMIT_ERROR = 6002,
  LLM_QUOTA_EXCEEDED = 6003,
  LLM_TIMEOUT = 6004,
  LLM_INVALID_RESPONSE = 6005,

  // Network Errors (7000-7999)
  NETWORK_ERROR = 7000,
  NETWORK_TIMEOUT = 7001,
  NETWORK_CONNECTION_REFUSED = 7002,
  NETWORK_DNS_ERROR = 7003,

  // File System Errors (8000-8999)
  FILE_NOT_FOUND = 8000,
  FILE_READ_ERROR = 8001,
  FILE_WRITE_ERROR = 8002,
  FILE_DELETE_ERROR = 8003,
  FILE_PERMISSION_DENIED = 8004,
  DIRECTORY_NOT_FOUND = 8010,
  DIRECTORY_CREATE_ERROR = 8011,

  // Git Errors (9000-9999)
  GIT_NOT_FOUND = 9000,
  GIT_ERROR = 9001,
  GIT_NOT_INITIALIZED = 9002,
}

// ─── Error Recovery Suggestions ───────────────────────────────────────────

export interface RecoverySuggestion {
  /** Suggested action */
  action: string
  /** Detailed description */
  description: string
  /** Command to run (if applicable) */
  command?: string
}

export const ERROR_RECOVERY: Partial<Record<ErrorCode, RecoverySuggestion[]>> = {
  [ErrorCode.CONFIG_NOT_FOUND]: [
    {
      action: 'Create default configuration',
      description: 'The configuration file was not found. A default configuration will be created automatically.',
      command: '/config list',
    },
  ],

  [ErrorCode.CONFIG_INVALID]: [
    {
      action: 'Reset configuration',
      description: 'The configuration file is invalid. You can reset to defaults using the command below.',
      command: '/config reset',
    },
    {
      action: 'Validate configuration',
      description: 'Check your configuration file for syntax errors.',
    },
  ],

  [ErrorCode.SESSION_NOT_FOUND]: [
    {
      action: 'List available sessions',
      description: 'The requested session was not found. Use the command below to see available sessions.',
      command: '/history list',
    },
    {
      action: 'Resume latest session',
      description: 'You can resume your most recent session.',
      command: '/resume latest',
    },
  ],

  [ErrorCode.TOOL_NOT_FOUND]: [
    {
      action: 'Check available tools',
      description: 'The requested tool does not exist. Contact administrator if this is unexpected.',
    },
  ],

  [ErrorCode.TOOL_PERMISSION_DENIED]: [
    {
      action: 'Grant permission',
      description: 'This tool requires permission. Review the operation carefully before approving.',
    },
    {
      action: 'Check permission settings',
      description: 'You can configure permission mode in settings.',
      command: '/config get defaultPermissionMode',
    },
  ],

  [ErrorCode.LLM_CONNECTION_ERROR]: [
    {
      action: 'Check network connection',
      description: 'Failed to connect to the LLM API. Please check your internet connection.',
    },
    {
      action: 'Check API key',
      description: 'Verify that your API key is correctly configured.',
      command: '/config info',
    },
    {
      action: 'Retry the request',
      description: 'The connection may be temporarily unavailable. Please try again.',
    },
  ],

  [ErrorCode.LLM_RATE_LIMIT_ERROR]: [
    {
      action: 'Wait and retry',
      description: 'You have exceeded the rate limit. Please wait a moment before trying again.',
    },
    {
      action: 'Check API quota',
      description: 'Review your API usage and quota.',
    },
  ],

  [ErrorCode.LLM_QUOTA_EXCEEDED]: [
    {
      action: 'Upgrade your plan',
      description: 'You have exceeded your API quota. Please upgrade your plan or wait for renewal.',
    },
  ],

  [ErrorCode.FILE_NOT_FOUND]: [
    {
      action: 'Check file path',
      description: 'The specified file does not exist. Please verify the path.',
    },
  ],

  [ErrorCode.FILE_PERMISSION_DENIED]: [
    {
      action: 'Check file permissions',
      description: 'You do not have permission to access this file.',
    },
  ],

  [ErrorCode.GIT_NOT_INITIALIZED]: [
    {
      action: 'Initialize git repository',
      description: 'This directory is not a git repository. Initialize one using the command below.',
      command: 'git init',
    },
  ],

  [ErrorCode.NETWORK_TIMEOUT]: [
    {
      action: 'Check network connection',
      description: 'The request timed out. Please check your internet connection.',
    },
    {
      action: 'Try again',
      description: 'The timeout may be temporary. Please try the request again.',
    },
  ],
}

/**
 * Get recovery suggestions for an error code
 */
export function getRecoverySuggestions(errorCode: ErrorCode): RecoverySuggestion[] {
  return ERROR_RECOVERY[errorCode] || [
    {
      action: 'Review error details',
      description: 'Please review the error message and context for more information.',
    },
  ]
}

// ─── Base Error Class ─────────────────────────────────────────────────────

export class MiniClaudeError extends Error {
  public readonly code: ErrorCode
  public readonly originalError?: Error
  public readonly context?: Record<string, unknown>
  public readonly suggestions: RecoverySuggestion[]

  constructor(
    code: ErrorCode,
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'MiniClaudeError'
    this.code = code
    this.originalError = originalError
    this.context = context
    this.suggestions = getRecoverySuggestions(code)

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Get the full error message with suggestions
   */
  getFullMessage(): string {
    let output = `Error [${this.code}]: ${this.message}\n`

    if (this.context && Object.keys(this.context).length > 0) {
      output += `\nContext:\n${JSON.stringify(this.context, null, 2).split('\n').join('\n  ')}\n`
    }

    if (this.originalError) {
      output += `\nCaused by: ${this.originalError.name}: ${this.originalError.message}\n`
    }

    if (this.suggestions.length > 0) {
      output += `\nSuggestions:\n`
      for (let i = 0; i < this.suggestions.length; i++) {
        const suggestion = this.suggestions[i]
        output += `  ${i + 1}. ${suggestion.action}\n`
        output += `     ${suggestion.description}\n`
        if (suggestion.command) {
          output += `     Command: ${suggestion.command}\n`
        }
        output += '\n'
      }
    }

    return output.trim()
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      ...(this.originalError && {
        originalError: {
          name: this.originalError.name,
          message: this.originalError.message,
          stack: this.originalError.stack,
        },
      }),
      suggestions: this.suggestions,
      stack: this.stack,
    }
  }
}
