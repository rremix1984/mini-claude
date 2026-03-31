import cron from 'node-cron'
import { spawn } from 'child_process'
import { fetchDailyNews, formatNews } from './news-fetcher.js'

/**
 * 发送系统通知
 */
function sendNotification(title: string, message: string): void {
  console.log('\n' + '='.repeat(60))
  console.log(`🔔 ${title}`)
  console.log('='.repeat(60))
  console.log(message)
  console.log('='.repeat(60) + '\n')

  // 尝试使用系统通知（macOS）
  if (process.platform === 'darwin') {
    spawn('osascript', [
      '-e',
      `display notification "${message.substring(0, 50)}..." with title "${title}"`,
    ]).on('error', () => {
      // 忽略通知失败
    })
  }
}

/**
 * 每日新闻任务
 */
async function dailyNewsTask(): Promise<void> {
  try {
    console.log(`[${new Date().toLocaleString('zh-CN')}] 开始获取每日新闻...`)

    const news = await fetchDailyNews()
    const formattedNews = formatNews(news)

    // 保存到文件
    const fs = await import('fs/promises')
    const today = new Date().toISOString().split('T')[0]
    const newsDir = './daily-news-logs'

    try {
      await fs.mkdir(newsDir, { recursive: true })
      await fs.writeFile(`${newsDir}/news-${today}.txt`, formattedNews)
      console.log(`✅ 新闻已保存到 ${newsDir}/news-${today}.txt`)
    } catch (err) {
      console.error('保存新闻文件失败:', err)
    }

    // 发送通知
    sendNotification(
      '📰 每日新闻提醒',
      `今天已为您准备 ${news.length} 条新闻，请查看终端或日志文件。`
    )

    console.log('\n' + formattedNews)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('每日新闻任务执行失败:', errorMessage)
    // 错误时只发送系统通知，不再打印完整通知到控制台
    if (process.platform === 'darwin') {
      spawn('osascript', [
        '-e',
        `display notification "❌ 新闻获取失败: ${errorMessage.substring(0, 30)}..." with title "每日新闻提醒"`,
      ]).on('error', () => {})
    }
  }
}

/**
 * 启动每日新闻提醒服务
 */
export function startDailyNewsScheduler(): any {
  // 每天早上 8:00 执行
  const task = cron.schedule('0 8 * * *', dailyNewsTask, {
    timezone: 'Asia/Shanghai',
  })

  console.log('✅ 每日新闻提醒服务已启动')
  console.log('⏰ 每天上午 8:00 将自动发送新闻摘要')
  console.log(`📍 时区: Asia/Shanghai (北京时间)`)
  console.log(`📂 日志保存位置: ./daily-news-logs/`)
  console.log(`🔔 系统通知: ${process.platform === 'darwin' ? '已启用' : '仅 macOS 支持'}\n`)

  // 如果设置了立即运行，可以测试一下
  if (process.argv.includes('--test')) {
    console.log('🧪 测试模式：立即执行一次新闻获取...')
    dailyNewsTask()
  }

  return task
}
