import axios from 'axios'

export interface NewsItem {
  title: string
  url: string
  date: string
  source?: string
  snippet?: string
}

/**
 * 获取今日新闻摘要
 * 使用 Brave Search API 搜索当天热点新闻
 */
export async function fetchDailyNews(): Promise<NewsItem[]> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const apiKey = process.env.BRAVE_SEARCH_API_KEY

  if (!apiKey) {
    console.warn('⚠️  未设置 BRAVE_SEARCH_API_KEY 环境变量，使用回退数据')
    return getFallbackNews(dateStr)
  }

  try {
    // 使用 Brave Search 搜索当天新闻
    const response = await axios.get('https://api.search.brave.com/res/v1/news/search', {
      params: {
        q: '今日新闻 最新',
        count: 10,
        freshness: 'day',
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      timeout: 10000,
    })

    if (response.data?.results) {
      return response.data.results.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        date: item.published_at || dateStr,
        source: item.meta?.url?.name || '',
        snippet: item.description || '',
      }))
    }

    // 如果 API 调用失败，返回模拟数据作为回退
    return getFallbackNews(dateStr)
  } catch (error) {
    console.error('获取新闻失败，使用回退数据:', error)
    return getFallbackNews(dateStr)
  }
}

/**
 * 回退新闻数据（当 API 不可用时使用）
 */
function getFallbackNews(dateStr: string): NewsItem[] {
  return [
    {
      title: '🌍 每日新闻服务已启动',
      url: 'https://www.example.com',
      date: dateStr,
      source: '系统通知',
      snippet: '每日新闻提醒服务正在运行中。请配置新闻 API 以获取实时新闻。',
    },
    {
      title: '💡 提示：配置 Brave Search API 获取实时新闻',
      url: 'https://brave.com/search/api/',
      date: dateStr,
      source: '帮助文档',
      snippet: '访问 Brave Search API 文档获取 API Key，并在环境变量中设置 BRAVE_API_KEY。',
    },
  ]
}

/**
 * 格式化新闻为可读的文本
 */
export function formatNews(news: NewsItem[]): string {
  const date = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  let output = `📰 ${date} 每日新闻摘要\n`
  output += `${'='.repeat(40)}\n\n`

  news.forEach((item, index) => {
    output += `${index + 1}. ${item.title}\n`
    if (item.source) output += `   📌 ${item.source}\n`
    if (item.snippet) output += `   ${item.snippet.substring(0, 80)}...\n`
    output += `   🔗 ${item.url}\n\n`
  })

  return output
}
