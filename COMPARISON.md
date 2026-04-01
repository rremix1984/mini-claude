# Mini-Claude vs Claude Code - 阶段1&2 实现对比

> 分析时间: 2026-04-01
> 对比版本: mini-claude (阶段1-2) vs claude-code-main (leaked source)

---

## 📊 总体规模对比

| 维度 | Claude Code 原版 | Mini-Claude (我们的实现) | 对比 |
|------|-----------------|------------------------|------|
| **文件数** | ~1,900 | 79 | 24:1 |
| **代码行数** | 512,000 | ~10,500 | 49:1 |
| **工具数量** | ~43 | 32 | 1.3:1 |
| **命令数量** | ~50 | 4 | 12.5:1 |
| **组件数量** | ~140 | 0 | N/A (未实现) |
| **运行时** | Bun | Node.js | 不同 |
| **UI 框架** | Ink (React for CLI) | 无 (纯 CLI) | 原版更强大 |

---

## 🔍 模块对比

### 1. 配置系统

#### Claude Code 原版
**位置**: `src/utils/config.ts` (~200+ 行配置类型)

**特点**:
- ✅ 使用 Bun 特性 (`bun:bundle`)
- ✅ 文件监听实时更新配置 (`watchFile`)
- ✅ 全局配置 + 项目级配置
- ✅ 复杂的配置类型 (BillingType, MCP, OAuth, Telemetry)
- ✅ 与隐私级别集成
- ✅ 与 Team 功能集成
- ✅ 与 Bridge 功能集成

**配置项包括**:
```typescript
type GlobalConfig = {
  apiKeyHelper?: string
  projects?: Record<string, ProjectConfig>
  numStartups: number
  autoUpdates?: boolean
  theme: ThemeSetting
  userID?: string
  // ... 更多 (20+ 项)
}

type ProjectConfig = {
  allowedTools: string[]
  mcpContextUris: string[]
  mcpServers?: Record<string, McpServerConfig>
  hasTrustDialogAccepted?: boolean
  // ... 更多 (25+ 项)
}
```

#### Mini-Claude 我们的版本
**位置**: `src/config/ConfigManager.ts` (~250 行)

**特点**:
- ✅ 标准 Node.js fs 模块
- ✅ 环境变量覆盖 (`MINICLAUDE_` 前缀)
- ✅ Zod schema 验证
- ✅ 简洁的配置项 (~10 项)
- ❌ 无文件监听
- ❌ 无项目级配置
- ❌ 无高级功能 (MCP, OAuth, Telemetry)

**配置项包括**:
```typescript
type MiniClaudeConfig = {
  model: string
  temperature: number
  maxTokens: number
  defaultPermissionMode: 'default' | 'bypassPermissions' | 'autoApproveSafe'
  theme: 'light' | 'dark' | 'auto'
  historyLimit: number
  autoSave: boolean
  workspacePath?: string
}
```

**差异总结**:
- 🎯 我们完成了核心功能，配置简洁易用
- 📉 缺少文件监听、项目级配置等高级功能
- 💡 建议: 后续可添加文件监听功能

---

### 2. 会话持久化

#### Claude Code 原版
**位置**: `src/utils/session*.ts` (多个文件)

**文件列表**:
- `history.ts` (~300 行) - 主历史管理
- `assistant/sessionHistory.ts` (~150 行)
- `sessionStorage.ts` (~200 行)
- `sessionActivity.ts`
- `sessionUrl.ts`
- `sessionState.ts`
- `sessionTitle.ts`
- `sessionFileAccessHooks.ts`
- `hooks/sessionHooks.ts`
- `sessionRestore.ts`
- `sessionStart.ts`
- ... (共 15+ 文件)

**特点**:
- ✅ 复杂的会话历史管理
- ✅ 会话压缩和迁移
- ✅ 文件访问 hooks
- ✅ 会话状态追踪
- ✅ 自动标题生成
- ✅ 会话 URL 管理
- ✅ 与 Doctor 功能集成
- ✅ 支持 Lite Logs (会话摘要)

**会话数据包括**:
```typescript
type Session = {
  sessionId: string
  messages: Message[]
  summary?: string
  customTitle?: string
  agentName?: string
  // ... 更多元数据
}
```

#### Mini-Claude 我们的版本
**位置**: `src/storage/SessionManager.ts` (~350 行)

**特点**:
- ✅ 基础的保存/加载/删除
- ✅ 会话元数据 (标题、标签、状态)
- ✅ 最新会话快捷恢复
- ✅ 会话归档、置顶
- ✅ 会话统计和清理
- ✅ 会话导入导出
- ❌ 无会话压缩
- ❌ 无文件访问 hooks
- ❌ 无复杂的会话状态追踪

**会话数据包括**:
```typescript
type Session = {
  id: string
  title: string
  messages: Message[]
  metadata: {
    createdAt: number
    updatedAt: number
    tags: string[]
    isArchived: boolean
    isPinned: boolean
  }
}
```

**差异总结**:
- 🎯 我们实现了核心功能，满足基本需求
- 📉 缺少会话压缩、高级 hooks、与 Doctor 集成
- 💡 建议: 保持简洁，后续按需添加

---

### 3. 日志系统

#### Claude Code 原版
**位置**: `src/utils/log.ts`, `diagLogs.ts`, `errorLogSink.ts`

**特点**:
- ✅ 与 Telemetry 集成
- ✅ 隐私级别控制 (`isEssentialTrafficOnly`)
- ✅ 复杂的日志排序和过滤
- ✅ 诊断日志 (diagLogs)
- ✅ 错误日志 sink (errorLogSink)
- ✅ 与 Sentry 集成
- ✅ 支持 Lite Logs (会话摘要日志)

**日志功能**:
```typescript
// 会话日志
type LogOption = {
  sessionId: string
  firstPrompt?: string
  messages: SerializedMessage[]
  agentName?: string
  customTitle?: string
  summary?: string
  // ... 更多
}

// 诊断日志
function logForDiagnosticsNoPII(...)
function logForDiagnostics(...)
```

#### Mini-Claude 我们的版本
**位置**: `src/logger/Logger.ts` (~400 行)

**特点**:
- ✅ 多级别日志 (error, warn, info, debug, trace)
- ✅ 多种格式 (text, json, pretty)
- ✅ 多种传输 (console, file, rotating file)
- ✅ 请求 ID 追踪
- ✅ 子日志支持
- ✅ 日志轮转
- ❌ 无 Telemetry 集成
- ❌ 无隐私级别控制
- ❌ 无 Sentry 集成

**日志功能**:
```typescript
// 基础日志
logger.error('Error occurred', { error })
logger.info('Operation completed', { duration: 100 })

// 子日志
const child = logger.child({ sessionId: '123' })
child.info('Child message')
```

**差异总结**:
- 🎯 我们实现了完整的日志功能，格式多样
- 📉 缺少 Telemetry 和隐私控制
- 💡 建议: 保持简洁，Telemetry 可选功能

---

### 4. 错误处理

#### Claude Code 原版
**位置**: `src/utils/errors.ts`, `errorLogSink.ts`, `toolErrors.ts`, `allErrors.ts`

**特点**:
- ✅ 集中式错误管理
- ✅ 详细的错误类型和代码 (`errorIds.ts`)
- ✅ 错误追踪和分析
- ✅ 与权限系统集成
- ✅ 错误恢复建议
- ✅ 工具错误统计
- ✅ 与 UI 集成 (ErrorOverview, ValidationErrorsList)

**错误类型**:
```typescript
// 错误代码 (constants/errorIds.ts)
enum ErrorIds {
  // 100+ 错误代码
}

// 错误管理
function logError(error: Error, context?: any)
function getErrorMessage(error: Error): string
```

#### Mini-Claude 我们的版本
**位置**: `src/errors/types.ts`, `ErrorHandler.ts` (~500 行)

**特点**:
- ✅ 统一错误基类 (MiniClaudeError)
- ✅ 完整错误码体系 (1000-9999)
- ✅ 错误恢复建议
- ✅ 自动重试机制
- ✅ 降级处理
- ✅ 错误序列化
- ❌ 无错误追踪分析
- ❌ 无 UI 集成

**错误类型**:
```typescript
// 错误基类
class MiniClaudeError extends Error {
  code: number
  recoverable: boolean
  suggestions: string[]
  originalError?: Error
}

// 错误码 (1000-9999)
enum ErrorCodes {
  CONFIG_ERROR = 1000,
  STORAGE_ERROR = 2000,
  TOOL_ERROR = 3000,
  NETWORK_ERROR = 4000,
  LLM_ERROR = 5000,
}
```

**差异总结**:
- 🎯 我们实现了完整的错误处理体系
- 📉 缺少错误追踪和 UI 集成
- 💡 建议: 核心功能已足够，后续按需添加追踪

---

### 5. 工具系统对比

#### 工具数量对比

| 类别 | Claude Code 原版 | Mini-Claude | 差异 |
|------|-----------------|-------------|------|
| 核心工具 | 7 | 7 | ✅ 一致 |
| 文件系统 | 3 | 6 | 📈 我们更多 |
| 代码搜索 | 2 | 4 | 📈 我们更多 |
| Git | 0 | 6 | 📈 我们实现 |
| 项目分析 | 0 | 3 | 📈 我们实现 |
| 网络 | 2 | 3 | 📈 我们更多 |
| 系统信息 | 0 | 4 | 📈 我们实现 |
| LSP | 1 | 0 | 📉 缺少 |
| MCP | 3 | 0 | 📉 缺少 |
| Agent | 1 | 0 | 📉 缺少 |
| Task | 6 | 0 | 📉 缺少 |
| 其他高级功能 | 20+ | 0 | 📉 缺少 |
| **总计** | **~43** | **32** | - |

#### 具体工具对比

##### BashTool

**Claude Code 原版**: `src/tools/BashTool/BashTool.tsx` (1,143 行)

**特点**:
- ✅ 复杂的安全检查
- ✅ 权限验证
- ✅ 沙箱模式
- ✅ 命令语义分析
- ✅ 只读模式
- ✅ 模式验证
- ✅ sed 编辑器支持
- ✅ 路径验证
- ✅ 破坏性命令警告
- ✅ UI 进度显示
- ✅ 注释标签支持

**Mini-Claude**: `src/tools/BashTool.ts` (~80 行)

**特点**:
- ✅ 基础命令执行
- ✅ 简单权限检查
- ❌ 无沙箱
- ❌ 无命令语义分析
- ❌ 无高级安全功能

**代码量对比**: 1,143 行 vs 80 行 (14:1)

##### WebFetchTool

**Claude Code 原版**: `src/tools/WebFetchTool/WebFetchTool.ts` (318 行)

**特点**:
- ✅ 预审核域名列表
- ✅ 权限系统集成
- ✅ Prompt 驱动的内容提取
- ✅ Markdown 格式化
- ✅ UI 进度显示
- ✅ 错误处理

**Mini-Claude**: `src/tools/network/WebFetchTool.ts` (~180 行)

**特点**:
- ✅ 完整的 HTTP 功能
- ✅ 自定义头、超时
- ✅ 支持多种方法 (GET, POST, etc.)
- ✅ 重定向控制
- ✅ JSON 格式化
- ❌ 无预审核域名
- ❌ 无权限集成

**代码量对比**: 318 行 vs 180 行 (1.8:1)

##### Git 工具

**Claude Code 原版**: ❌ 无独立 Git 工具 (使用 BashTool)

**Mini-Claude**: ✅ 6 个专用 Git 工具 (~600 行)

- GitStatusTool
- GitDiffTool
- GitLogTool
- GitCommitTool
- GitBranchTool
- GitStashTool

**差异**: 我们实现了专用的 Git 工具，提供更好的用户体验

---

## 🎯 核心差异总结

### 我们的优点

1. **简洁性** ✅
   - 代码量少 49 倍
   - 功能聚焦核心需求
   - 易于理解和维护

2. **工具完整性** ✅
   - Git 工具 6 个 (原版 0)
   - 系统信息工具 4 个 (原版 0)
   - 项目分析工具 3 个 (原版 0)

3. **模块化设计** ✅
   - 清晰的目录结构
   - 独立的模块导出
   - 易于扩展

4. **标准化** ✅
   - 使用标准 Node.js 模块
   - 无特定运行时依赖 (Bun)
   - 更好的兼容性

### 我们的缺点

1. **高级功能缺失** ❌
   - 无 MCP 支持
   - 无 LSP 集成
   - 无 Agent 系统
   - 无任务管理

2. **UI 体验差** ❌
   - 无交互式 UI (Ink/React)
   - 无进度显示
   - 无颜色支持
   - 无文件预览

3. **安全功能不足** ❌
   - 无沙箱模式
   - 无命令语义分析
   - 无高级权限检查

4. **可观测性弱** ❌
   - 无 Telemetry
   - 无错误追踪
   - 无性能监控

5. **集成度低** ❌
   - 无 Doctor 功能
   - 无 IDE 集成
   - 无插件系统

---

## 📈 进度对比

| 阶段 | Claude Code 原版 | Mini-Claude | 完成度 |
|------|-----------------|-------------|--------|
| 阶段 1: 基础增强 | ✅ | ✅ | 100% |
| 阶段 2: 工具扩展 | ✅ | ✅ | 100% |
| 阶段 3: 命令系统 | ✅ | ❌ | 0% |
| 阶段 4: 技能系统 | ✅ | ❌ | 0% |
| 阶段 5: 多代理系统 | ✅ | ❌ | 0% |
| 阶段 6: IDE 集成 | ✅ | ❌ | 0% |
| 阶段 7: 高级功能 | ✅ | ❌ | 0% |
| 阶段 8: 质量与优化 | ✅ | ❌ | 0% |

**总进度**: Claude Code 原版 100% vs Mini-Claude 25% (阶段 1-2)

---

## 🎯 建议和下一步

### 短期建议 (保持当前方向)

1. **继续阶段 3: 命令系统** ✅
   - 实现基础命令 (/help, /clear, /exit)
   - 实现开发命令 (/commit, /diff, /test)
   - 实现高级命令 (/context, /cost, /doctor)

2. **优化现有工具** ✅
   - 增强 BashTool 的安全性
   - 优化错误提示
   - 添加进度显示

3. **保持简洁** ✅
   - 避免过度设计
   - 聚焦核心功能
   - 保持代码可读性

### 中期建议 (选择性实现)

1. **UI 增强** (可选)
   - 添加颜色输出
   - 添加进度条
   - 添加交互式菜单

2. **安全增强** (可选)
   - 添加沙箱模式
   - 增强权限检查
   - 添加命令验证

3. **可观测性** (可选)
   - 添加简单的日志追踪
   - 添加性能监控
   - 添加错误统计

### 长期建议 (高级功能)

1. **MCP 支持** (可选)
   - MCP 客户端实现
   - MCP 服务器管理
   - MCP 资源调用

2. **LSP 集成** (可选)
   - LSP 客户端
   - 代码补全
   - 跳转定义

3. **IDE 集成** (可选)
   - VS Code 扩展
   - JetBrains 插件
   - WebSocket 服务器

---

## 📝 结论

Mini-Claude 在阶段 1 和阶段 2 的实现上，成功完成了核心功能，并在某些方面（如 Git 工具、系统信息工具）甚至超越了原版。

**核心优势**:
- 代码简洁，易于理解和维护
- 功能完整，满足基本需求
- 模块化设计，易于扩展
- 标准化实现，兼容性好

**主要差距**:
- 高级功能缺失 (MCP, LSP, Agent)
- UI 体验较差
- 安全功能不足
- 可观测性弱

**总体评价**: 🟢 **良好**
- 适合作为学习项目和轻量级工具
- 保持了 Claude Code 的核心思想
- 在简洁性和功能之间取得了良好平衡

**下一步**: 继续实现阶段 3: 命令系统，提升用户体验和可用性。

---

*分析完成时间: 2026-04-01*
*对比版本: mini-claude v0.1.0 vs claude-code-main (leaked)*
