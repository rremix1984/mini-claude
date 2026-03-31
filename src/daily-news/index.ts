#!/usr/bin/env node

/**
 * 每日新闻提醒服务
 *
 * 使用方法：
 *   npm run news          # 启动服务
 *   npm run news -- --test # 测试运行（立即执行一次）
 */

import { startDailyNewsScheduler } from './scheduler.js'

console.log('╔════════════════════════════════════════════════════╗')
console.log('║         📰 每日新闻提醒服务 v1.0.0                ║')
console.log('╚════════════════════════════════════════════════════╝\n')

// 启动定时任务
const task = startDailyNewsScheduler()

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 正在停止每日新闻服务...')
  task.stop()
  console.log('✅ 服务已停止')
  process.exit(0)
})

process.on('SIGTERM', () => {
  task.stop()
  process.exit(0)
})

console.log('💡 按 Ctrl+C 停止服务\n')
