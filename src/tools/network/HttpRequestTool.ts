/**
 * HttpRequestTool - 自定义 HTTP 请求
 */

import type { ToolDefinition, ToolResult } from '../../types.js'

export const HttpRequestTool: ToolDefinition = {
  name: 'http_request',
  description: 'Make custom HTTP requests with full control over method, headers, body, and other options.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Request URL (required)',
      },
      method: {
        type: 'string',
        description: 'HTTP method',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      },
      headers: {
        type: 'object',
        description: 'Request headers',
      },
      body: {
        type: 'string',
        description: 'Request body (JSON string)',
      },
      form: {
        type: 'object',
        description: 'Form data (will be encoded as application/x-www-form-urlencoded)',
      },
      query: {
        type: 'object',
        description: 'Query parameters to append to URL',
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 30000)',
      },
      auth: {
        type: 'string',
        description: 'Basic auth in format "username:password"',
      },
      bearer: {
        type: 'string',
        description: 'Bearer token for Authorization header',
      },
      verbose: {
        type: 'boolean',
        description: 'Show detailed request/response information (default: false)',
      },
    },
  },
  requiresPermission: true,
  execute: async (input) => {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      form,
      query,
      timeout = 30000,
      auth,
      bearer,
      verbose = false,
    } = input as {
      url?: string
      method?: string
      headers?: Record<string, string>
      body?: string
      form?: Record<string, string>
      query?: Record<string, string>
      timeout?: number
      auth?: string
      bearer?: string
      verbose?: boolean
    }

    if (!url) {
      return {
        success: false,
        output: '',
        error: 'URL is required',
      }
    }

    try {
      // Build URL with query parameters
      let finalUrl = url
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query).toString()
        const separator = url.includes('?') ? '&' : '?'
        finalUrl = `${url}${separator}${params}`
      }

      // Build request headers
      const requestHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (compatible; MiniClaude/1.0)',
        ...headers,
      }

      // Handle authentication
      if (auth) {
        const encoded = Buffer.from(auth).toString('base64')
        requestHeaders['Authorization'] = `Basic ${encoded}`
      }

      if (bearer) {
        requestHeaders['Authorization'] = `Bearer ${bearer}`
      }

      // Handle body or form data
      let requestBody: string | undefined
      let contentType: string | undefined

      if (form && Object.keys(form).length > 0) {
        contentType = 'application/x-www-form-urlencoded'
        requestBody = new URLSearchParams(form).toString()
      } else if (body) {
        // Try to parse JSON for validation
        try {
          JSON.parse(body)
          contentType = 'application/json'
        } catch {
          // If not JSON, use text/plain
          contentType = 'text/plain'
        }
        requestBody = body
      }

      if (contentType && !requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = contentType
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const requestStart = Date.now()

      const response = await fetch(finalUrl, {
        method,
        headers: requestHeaders,
        body: ['GET', 'HEAD'].includes(method) ? undefined : requestBody,
        signal: controller.signal,
      })

      const requestDuration = Date.now() - requestStart
      clearTimeout(timeoutId)

      // Get response info
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const contentTypeHeader = responseHeaders['content-type'] || ''
      let responseBody = await response.text()

      // Try to format JSON responses
      if (contentTypeHeader.includes('application/json')) {
        try {
          const parsed = JSON.parse(responseBody)
          responseBody = JSON.stringify(parsed, null, 2)
        } catch {
          // Keep as text
        }
      }

      // Build output
      let output = ''
      if (verbose) {
        output += `Request Information:
Method: ${method}
URL: ${finalUrl}
Headers: ${JSON.stringify(requestHeaders, null, 2)}
${requestBody ? `Body: ${requestBody}\n` : ''}

`
      }

      output += `Response Information:
Status: ${response.status} ${response.statusText}
Duration: ${requestDuration}ms
Content-Type: ${contentTypeHeader}
Content-Length: ${responseHeaders['content-length'] || 'unknown'}
Date: ${responseHeaders['date'] || new Date().toISOString()}

Response Headers:
${JSON.stringify(responseHeaders, null, 2)}

Response Body:
${responseBody}`

      if (!response.ok) {
        return {
          success: false,
          output,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        output,
      }
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('AbortError')) {
        errorMessage = `Request timeout after ${timeout}ms`
      }

      if (errorMessage.includes('fetch failed')) {
        errorMessage = 'Failed to make request. The URL may be invalid or the server is unreachable.'
      }

      return {
        success: false,
        output: '',
        error: errorMessage,
      }
    }
  },
}
