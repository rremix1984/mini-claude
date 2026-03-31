# 每日新闻提醒服务

每天早上 8:00 自动获取当日新闻并发送通知。

## 功能特点

- ⏰ **定时提醒**: 每天上午 8:00（北京时间）自动执行
- 📰 **新闻摘要**: 获取当日热点新闻
- 🔔 **系统通知**: macOS 用户会收到桌面通知
- 📂 **日志保存**: 每日新闻自动保存到 `./daily-news-logs/` 目录

## 使用方法

### 启动服务

```bash
npm run news
```

服务将持续运行，每天上午 8:00 自动发送新闻。

### 测试运行（立即执行一次）

```bash
npm run news -- --test
```

### 停止服务

按 `Ctrl+C` 停止服务

## 目录结构

```
src/daily-news/
├── index.ts          # 服务入口
├── news-fetcher.ts   # 新闻获取模块
├── scheduler.ts      # 定时任务调度
└── README.md         # 说明文档
```

## 配置选项

### 时区

默认使用 `Asia/Shanghai`（北京时间）。如需修改时区，编辑 `src/daily-news/scheduler.ts`:

```typescript
const task = cron.schedule('0 8 * * *', dailyNewsTask, {
  timezone: 'Asia/Shanghai', // 修改为你需要的时区
})
```

### Cron 表达式

- `0 8 * * *` = 每天早上 8:00
- `0 9 * * *` = 每天早上 9:00
- `0 */6 * * *` = 每6小时执行一次

更多 Cron 表达式请参考: https://crontab.guru/

## 日志文件

每日新闻自动保存到 `./daily-news-logs/` 目录，文件名格式: `news-YYYY-MM-DD.txt`

## 后台运行（可选）

### 使用 nohup

```bash
nohup npm run news > news-service.log 2>&1 &
```

### 使用 PM2（推荐）

```bash
npm install -g pm2
pm2 start "npm run news" --name daily-news
pm2 logs daily-news
pm2 stop daily-news
```

## 故障排除

### 问题：获取不到新闻

新闻服务使用 Brave Search API，如果没有配置 API Key，会返回回退数据。如需获取实时新闻：

1. 访问 [Brave Search API](https://brave.com/search/api/) 获取 API Key
2. 设置环境变量（暂未实现，可自行修改 `news-fetcher.ts` 添加）

### 问题：macOS 通知不显示

确保终端有发送通知的权限：
- 系统设置 -> 隐私与安全性 -> 通知 -> 终端

## License

MIT
