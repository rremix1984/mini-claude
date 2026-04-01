/**
 * ApiDocsTool - 查询 API 文档
 */

import type { ToolDefinition, ToolResult } from '../../types.js'

// Popular API documentation endpoints
const API_DOCS: Record<string, { url: string; name: string; format: string }> = {
  // GitHub
  github: {
    url: 'https://docs.github.com/rest',
    name: 'GitHub REST API',
    format: 'html',
  },
  // npm
  npm: {
    url: 'https://docs.npmjs.com/',
    name: 'npm Documentation',
    format: 'html',
  },
  // MDN Web Docs
  mdn: {
    url: 'https://developer.mozilla.org/en-US/docs/Web/API',
    name: 'MDN Web API Docs',
    format: 'html',
  },
  // Node.js
  nodejs: {
    url: 'https://nodejs.org/docs/latest/api/',
    name: 'Node.js API Docs',
    format: 'html',
  },
  // OpenAI
  openai: {
    url: 'https://platform.openai.com/docs/api-reference',
    name: 'OpenAI API Reference',
    format: 'html',
  },
  // Stripe
  stripe: {
    url: 'https://stripe.com/docs/api',
    name: 'Stripe API',
    format: 'html',
  },
  // Twilio
  twilio: {
    url: 'https://www.twilio.com/docs/usage/api',
    name: 'Twilio API',
    format: 'html',
  },
  // AWS
  aws: {
    url: 'https://docs.aws.amazon.com/',
    name: 'AWS Documentation',
    format: 'html',
  },
  // Google Cloud
  gcp: {
    url: 'https://cloud.google.com/docs',
    name: 'Google Cloud Documentation',
    format: 'html',
  },
  // TypeScript
  typescript: {
    url: 'https://www.typescriptlang.org/docs/handbook/',
    name: 'TypeScript Handbook',
    format: 'html',
  },
  // React
  react: {
    url: 'https://react.dev/reference/react',
    name: 'React API Reference',
    format: 'html',
  },
  // Vue
  vue: {
    url: 'https://vuejs.org/api/',
    name: 'Vue API',
    format: 'html',
  },
}

export const ApiDocsTool: ToolDefinition = {
  name: 'api_docs',
  description: 'Query API documentation from popular services like GitHub, OpenAI, npm, Node.js, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description: 'API provider name (e.g., github, openai, npm, nodejs)',
      },
      query: {
        type: 'string',
        description: 'Search query within the docs (optional)',
      },
      endpoint: {
        type: 'string',
        description: 'Specific endpoint or API path to document',
      },
      language: {
        type: 'string',
        description: 'Programming language for code examples',
      },
      list: {
        type: 'boolean',
        description: 'List all available API documentation sources',
      },
      customUrl: {
        type: 'string',
        description: 'Custom API documentation URL',
      },
    },
  },
  requiresPermission: true,
  execute: async (input) => {
    const { provider, query, endpoint, language, list, customUrl } = input as {
      provider?: string
      query?: string
      endpoint?: string
      language?: string
      list?: boolean
      customUrl?: string
    }

    // List all available APIs
    if (list) {
      const providers = Object.entries(API_DOCS)
        .map(([key, value]) => `  - ${key.padEnd(12)} : ${value.name}`)
        .join('\n')

      return {
        success: true,
        output: `Available API Documentation Sources:\n${providers}\n\nUsage: /api_docs <provider> [--query <search_term>] [--endpoint <api_path>]`,
      }
    }

    // Use custom URL if provided
    let docsUrl = customUrl

    // Otherwise use provider
    if (!docsUrl && provider) {
      const providerLower = provider.toLowerCase()
      const docs = Object.entries(API_DOCS).find(([key]) => key === providerLower)

      if (!docs) {
        return {
          success: false,
          output: '',
          error: `Unknown API provider: ${provider}\n\nUse --list to see available providers.`,
        }
      }

      docsUrl = docs[1].url

      // Add endpoint if specified
      if (endpoint) {
        docsUrl = `${docsUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
      }
    }

    if (!docsUrl) {
      return {
        success: false,
        output: '',
        error: 'Either provider or customUrl is required\n\nUse --list to see available providers.',
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(docsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MiniClaude/1.0)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return {
          success: false,
          output: '',
          error: `Failed to fetch docs: HTTP ${response.status} ${response.statusText}`,
        }
      }

      const content = await response.text()

      // Extract meaningful content (simple implementation)
      // In a real implementation, you'd use a proper HTML parser
      const titleMatch = content.match(/<title>(.*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1] : docsUrl

      // Remove script and style tags
      let cleanContent = content
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gim, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Get first 2000 characters as preview
      const preview = cleanContent.slice(0, 2000)

      let output = `📚 API Documentation: ${title}\n`
      output += `🔗 Source: ${docsUrl}\n\n`

      if (query) {
        output += `🔍 Search Query: ${query}\n\n`
        // Simple search - would be better with proper text search
        const searchResults = cleanContent
          .toLowerCase()
          .split(query.toLowerCase())
          .slice(0, 3)
          .map((s) => '...' + s.trim().slice(0, 150) + '...')
          .join('\n\n')
        output += `Search Results:\n${searchResults}\n\n`
      }

      output += `Content Preview:\n${preview}...\n\n`
      output += `💡 Tip: Visit ${docsUrl} for the full documentation.`

      return {
        success: true,
        output,
      }
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('AbortError')) {
        errorMessage = 'Request timeout after 15s'
      }

      if (errorMessage.includes('fetch failed')) {
        errorMessage = 'Failed to fetch documentation. The URL may be invalid or unreachable.'
      }

      return {
        success: false,
        output: '',
        error: errorMessage,
      }
    }
  },
}
