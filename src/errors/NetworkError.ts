/**
 * Network related errors
 */

import { MiniClaudeError, ErrorCode } from './types.js'

export class NetworkError extends MiniClaudeError {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorCode.NETWORK_ERROR,
      `Network error: ${message}`,
      originalError,
      {},
    )
    this.name = 'NetworkError'
  }
}

export class NetworkTimeoutError extends MiniClaudeError {
  constructor(operation: string, timeout: number, originalError?: Error) {
    super(
      ErrorCode.NETWORK_TIMEOUT,
      `Network timeout during ${operation} (timeout: ${timeout}ms)`,
      originalError,
      { operation, timeout },
    )
    this.name = 'NetworkTimeoutError'
  }
}

export class NetworkConnectionRefusedError extends MiniClaudeError {
  constructor(host: string, port: number, originalError?: Error) {
    super(
      ErrorCode.NETWORK_CONNECTION_REFUSED,
      `Connection refused to ${host}:${port}`,
      originalError,
      { host, port },
    )
    this.name = 'NetworkConnectionRefusedError'
  }
}

export class NetworkDNSError extends MiniClaudeError {
  constructor(hostname: string, originalError?: Error) {
    super(
      ErrorCode.NETWORK_DNS_ERROR,
      `DNS resolution failed for ${hostname}`,
      originalError,
      { hostname },
    )
    this.name = 'NetworkDNSError'
  }
}
