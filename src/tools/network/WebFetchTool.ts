/**
 * WebFetchTool - 抓取网页内容
 */

import type { ToolDefinition, ToolResult } from '../../types.js'

export const WebFetchTool: ToolDefinition = {
  name: 'web_fetch',
  description: 'Fetch and retrieve web page content. Supports custom headers, cookies, and various content types.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to fetch (required)',
      },
      method: {
        type: 'string',
        description: 'HTTP method (default: GET)',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      },
      headers: {
        type: 'object',
        description: 'Custom headers to send with the request',
      },
      body: {
        type: 'string',
        description: 'Request body (for POST, PUT, PATCH methods)',
      },
      timeout: {
        type: 'number',
        description: 'Request timeout in milliseconds (default: 10000)',
      },
      followRedirects: {
        type: 'boolean',
        description: 'Follow HTTP redirects (default: true)',
      },
      maxRedirects: {
        type: 'number',
        description: 'Maximum number of redirects to follow (default: 5)',
      },
      format: {
        type: 'string',
        description: 'Output format: text, html, json (default: auto-detect)',
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
      timeout = 10000,
      followRedirects = true,
      maxRedirects = 5,
      format,
    } = input as {
      url?: string
      method?: string
      headers?: Record<string, string>
      body?: string
      timeout?: number
      followRedirects?: boolean
      maxRedirects?: number
      format?: string
    }

    if (!url) {
      return {
        success: false,
        output: '',
        error: 'URL is required',
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MiniClaude/1.0)',
          ...headers,
        },
        body: body ? JSON.parse(body) : undefined,
        signal: controller.signal,
        redirect: followRedirects ? 'follow' : 'manual',
      })

      clearTimeout(timeoutId)

      // Get response headers
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // Get content type
      const contentType = responseHeaders['content-type'] || ''

      // Get response text
      let content = await response.text()

      // Format output based on content type or format parameter
      let formattedContent = content

      if (format === 'json' || contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(content)
          formattedContent = JSON.stringify(parsed, null, 2)
        } catch {
          // If not valid JSON, keep as text
        }
      }

      if (format === 'html' || contentType.includes('text/html')) {
        // Keep HTML as-is, could add pretty-printing in the future
      }

      const output = `Status: ${response.status} ${response.statusText}
URL: ${url}
Content-Type: ${contentType}
Content-Length: ${responseHeaders['content-length'] || 'unknown'}
Date: ${new Date().toISOString()}
---
${formattedContent}`

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
        errorMessage = 'Failed to fetch. The URL may be invalid or unreachable.'
      }

      return {
        success: false,
        output: '',
        error: errorMessage,
      }
    }
  },
}
