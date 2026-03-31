import type { ToolDefinition, ToolResult } from '../types.js'

const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search'

interface BraveWebResult {
  title: string
  url: string
  description?: string
  age?: string
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[]
  }
  query?: {
    original?: string
  }
}

export const WebSearchTool: ToolDefinition = {
  name: 'WebSearch',
  description:
    'Search the web using Brave Search. Returns recent, real-time results including news, articles, and web pages. Use this when you need current information, recent events, or anything beyond your training data.',
  requiresPermission: false,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query',
      },
      count: {
        type: 'number',
        description: 'Number of results to return (default: 8, max: 20)',
      },
    },
    required: ['query'],
  },
  async execute(input): Promise<ToolResult> {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY
    if (!apiKey) {
      return {
        success: false,
        output: '',
        error:
          'BRAVE_SEARCH_API_KEY is not set.\n' +
          'Get a free key at: https://brave.com/search/api/\n' +
          'Then: export BRAVE_SEARCH_API_KEY=your-key',
      }
    }

    const query = input['query'] as string
    const count = Math.min((input['count'] as number | undefined) ?? 8, 20)

    const url = new URL(BRAVE_API_URL)
    url.searchParams.set('q', query)
    url.searchParams.set('count', String(count))
    url.searchParams.set('search_lang', 'zh-hans')

    try {
      const res = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) {
        return {
          success: false,
          output: '',
          error: `Brave Search API error: ${res.status} ${res.statusText}`,
        }
      }

      const data = (await res.json()) as BraveSearchResponse
      const results = data.web?.results ?? []

      if (results.length === 0) {
        return { success: true, output: `No results found for: "${query}"` }
      }

      const formatted = results
        .map((r, i) => {
          const age = r.age ? ` [${r.age}]` : ''
          const desc = r.description ? `\n   ${r.description}` : ''
          return `${i + 1}. **${r.title}**${age}\n   ${r.url}${desc}`
        })
        .join('\n\n')

      return {
        success: true,
        output: `Search results for "${query}":\n\n${formatted}`,
      }
    } catch (err: unknown) {
      const e = err as Error
      return { success: false, output: '', error: `Search failed: ${e.message}` }
    }
  },
}
