# Mini-Claude 進化路线图

> 对标 claude-code 的系统性改进计划

---

## 📌 上次工作进度

**最后更新时间**: 2026-04-01

### ✅ 已完成
- **阶段 1.1: 配置系统** (100%)
  - 实现了完整的配置管理器 (ConfigManager)
  - 支持 JSON 格式配置文件
  - 支持环境变量覆盖 (前缀 `MINICLAUDE_`)
  - 使用 Zod 进行配置验证
  - 实现了 `/config` 斜杠命令系统

- **阶段 1.2: 会话持久化** (100%)
  - 实现了会话管理器 (SessionManager)
  - 支持会话创建、保存、加载、删除
  - 支持会话归档、置顶、标签管理
  - 支持最新会话快速恢复
  - 实现了 `/history` 和 `/resume` 斜杠命令

- **阶段 1.3: 日志系统** (100%)
  - 实现了完整的日志系统 (Logger)
  - 支持 5 个日志级别 (error, warn, info, debug, trace)
  - 支持 3 种日志格式 (text, json, pretty)
  - 支持控制台、文件、轮转文件 3 种输出方式
  - 实现了 `/logs` 斜杠命令

- **阶段 1.4: 错误处理** (100%)
  - 实现了完整的错误处理系统
  - 定义了错误码体系 (1000-9999)
  - 实现了错误恢复建议机制
  - 支持自动重试和降级处理
  - 实现了全局错误处理器

- **阶段 2.1: 文件系统工具** (100%)
  - 实现了 6 个文件系统工具
  - ListDirectoryTool - 列出目录内容（支持递归、过滤）
  - GetFileInfoTool - 获取文件元数据
  - CopyFileTool - 复制文件
  - MoveFileTool - 移动/重命名文件
  - DeleteFileTool - 删除文件/目录
  - CreateDirectoryTool - 创建目录

- **阶段 2.2: 代码搜索工具** (100%)
  - 实现了 4 个代码搜索工具
  - CodeSearchTool - 代码搜索（ripgrep 集成）
  - FindReferencesTool - 查找符号引用
  - FindDefinitionsTool - 查找符号定义
  - GetFileStatsTool - 代码统计

- **阶段 2.3: 项目分析工具** (100%)
  - 实现了 3 个项目分析工具
  - AnalyzeProjectTool - 分析项目结构
  - RunTestsTool - 运行测试
  - LintCodeTool - 代码检查

- **阶段 2.4: Git 集成工具** (100%)
  - 实现了 6 个 Git 工具
  - GitStatusTool - 查看 Git 状态
  - GitDiffTool - 查看 Git 变更
  - GitLogTool - 查看提交历史
  - GitCommitTool - 创建提交
  - GitBranchTool - 分支操作
  - GitStashTool - 暂存操作

- **阶段 2.5: 网络工具增强** (100%)
  - 实现了 3 个网络工具
  - WebFetchTool - 抓取网页内容（支持自定义头、超时）
  - HttpRequestTool - 自定义 HTTP 请求（支持完整控制）
  - ApiDocsTool - 查询 API 文档（集成流行 API）

- **阶段 2.6: 系统信息工具** (100%)
  - 实现了 4 个系统工具
  - GetSystemInfoTool - 获取系统信息（OS、CPU、内存）
  - GetProcessInfoTool - 获取进程信息
  - GetEnvVarTool - 获取环境变量
  - WhoamiTool - 获取当前用户信息

### 🔄 下一步计划
- **阶段 3: 命令系统** (下一阶段)
  - 实现命令框架
  - 实现基础命令 (/help, /clear, /exit)
  - 实现开发命令 (/commit, /diff, /test)
  - 实现高级命令 (/context, /cost, /doctor)

---

## 📊 当前状态

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| 文件数 | 79 | ~200 (渐进式) |
| 代码行数 | ~10,500 | ~15,000 |
| 工具数 | 32 | 30+ ✅ |
| 命令数 | 4 | 20+ |
| 错误类型 | 15+ | - |

---

## 🎯 改进原则

1. **渐进式增强** - 每个阶段都可独立运行和验证
2. **保持可读性** - 控制代码复杂度，必要时拆分模块
3. **实用性优先** - 优先实现高频使用的功能
4. **兼容性** - 逐步从智谱 AI 支持扩展到其他 LLM

---

## 🚀 阶段计划

### 📝 任务跟踪

| 阶段 | 状态 | 开始日期 | 完成日期 | 备注 |
|------|------|----------|----------|------|
| 阶段 1.1: 配置系统 | ✅ 已完成 | 2026-03-31 | 2026-03-31 | ConfigManager + /config 命令 |
| 阶段 1.2: 会话持久化 | ✅ 已完成 | 2026-03-31 | 2026-03-31 | SessionManager + /history + /resume |
| 阶段 1.3: 日志系统 | ✅ 已完成 | 2026-03-31 | 2026-03-31 | Logger + /logs 命令 |
| 阶段 1.4: 错误处理 | ✅ 已完成 | 2026-03-31 | 2026-03-31 | 错误类型体系 + 处理中间件 |
| 阶段 2.1: 文件系统工具 | ✅ 已完成 | 2026-03-31 | 2026-03-31 | 6 个新工具 (12 个总数) |
| 阶段 2.2: 代码搜索工具 | ✅ 已完成 | 2026-03-31 | 2026-04-01 | 4 个新工具 (16 个总数) |
| 阶段 2.3: 项目分析工具 | ✅ 已完成 | 2026-04-01 | 2026-04-01 | 3 个新工具 (19 个总数) |
| 阶段 2.4: Git 集成工具 | ✅ 已完成 | 2026-04-01 | 2026-04-01 | 6 个新工具 (25 个总数) |
| 阶段 2.5: 网络工具增强 | ✅ 已完成 | 2026-04-01 | 2026-04-01 | 3 个新工具 (28 个总数) |
| 阶段 2.6: 系统信息工具 | ✅ 已完成 | 2026-04-01 | 2026-04-01 | 4 个新工具 (32 个总数) |

---

### 阶段 1: 基础增强 (Week 1-2)

#### 1.1 配置系统 ✅ 已完成
**目标**: 实现可配置的项目设置，支持持久化

**任务**:
- [x] 创建 `config/` 目录结构
- [x] 实现 ConfigManager 类
  - [x] 配置文件格式 (JSON)
  - [x] 配置读取/写入
  - [x] 环境变量覆盖
  - [x] 默认值与验证 (使用 Zod)
- [x] 配置项设计:
  ```typescript
  interface MiniClaudeConfig {
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
- [x] 创建 `/config` 斜杠命令

**验收**: 用户可以通过配置文件和命令修改设置，重启后保持

**已完成文件**:
- `src/config/types.ts` - 配置类型定义
- `src/config/defaults.ts` - 默认配置值和环境变量映射
- `src/config/schema.ts` - Zod 验证 schema
- `src/config/ConfigManager.ts` - 配置管理器实现
- `src/config/index.ts` - 模块导出
- `src/commands/types.ts` - 命令系统类型
- `src/commands/CommandRegistry.ts` - 命令注册表
- `src/commands/core/config.ts` - /config 命令实现
- `src/commands/index.ts` - 命令模块导出

---

#### 1.2 会话持久化 ✅ 已完成
**目标**: 支持保存和恢复对话历史

**任务**:
- [x] 创建 `storage/` 目录
- [x] 实现 SessionManager 类
  - [x] 会话数据结构
  - [x] 序列化/反序列化
  - [x] 按日期/标签组织
  - [x] 搜索与过滤
- [x] 数据存储位置:
  - [x] `~/.miniclaude/sessions/{timestamp}.json`
  - [x] `~/.miniclaude/sessions/latest.json`
- [x] 创建 `/history` 命令
- [x] 创建 `/resume <id>` 命令

**验收**: 用户可以保存当前会话，列出历史会话，恢复指定会话

**已完成文件**:
- `src/storage/types.ts` - 会话类型定义
- `src/storage/SessionManager.ts` - 会话管理器实现
- `src/storage/index.ts` - 模块导出
- `src/commands/core/history.ts` - /history 命令实现
- `src/commands/core/resume.ts` - /resume 命令实现
- `src/commands/core/index.ts` - 核心命令导出

**功能特性**:
✅ 会话创建、保存、加载、删除
✅ 会话元数据管理（标题、标签、状态）
✅ 会话归档、置顶功能
✅ 最新会话快速恢复（latest.json）
✅ 会话统计和清理
✅ 会话导入导出
✅ `/history` 命令：list, show, delete, archive, unarchive, pin, unpin, stats, cleanup
✅ `/resume` 命令：恢复指定会话或最新会话

---

#### 1.3 日志系统 ✅ 已完成
**目标**: 实现结构化日志，便于调试和分析

**任务**:
- [x] 创建 `logger/` 目录
- [x] 实现 Logger 类
  - [x] 多级别日志 (error, warn, info, debug, trace)
  - [x] 控制台和文件双输出
  - [x] 结构化格式 (JSON)
  - [x] 请求追踪 ID
- [x] 集成到所有工具
- [x] 日志轮转策略
- [x] 创建 `/logs` 命令查看日志

**验收**: 所有操作都有日志记录，支持按级别过滤和时间范围查询

**已完成文件**:
- `src/logger/types.ts` - 日志类型定义
- `src/logger/formatters.ts` - 日志格式化器 (Text, JSON, Pretty)
- `src/logger/transports.ts` - 日志传输 (Console, File, RotatingFile)
- `src/logger/Logger.ts` - Logger 核心实现
- `src/logger/index.ts` - 模块导出
- `src/commands/core/logs.ts` - /logs 命令实现

**功能特性**:
✅ 5 个日志级别 (error, warn, info, debug, trace)
✅ 3 种日志格式 (text, json, pretty)
✅ 3 种日志传输 (console, file, rotating file)
✅ 请求 ID 追踪
✅ 子日志支持 (child logger)
✅ 日志级别过滤
✅ 日志上下文支持
✅ 错误对象自动捕获
✅ 彩色控制台输出
✅ 文件日志轮转
✅ `/logs` 命令：view, filter, search, info, clear, delete, list

---

#### 1.4 错误处理增强 ✅ 已完成
**目标**: 统一错误处理，提供友好的错误提示

**任务**:
- [x] 创建 `errors/` 目录
- [x] 定义错误类型:
  - [x] `MiniClaudeError` 基类
  - [x] `ToolExecutionError`
  - [x] `ConfigError`
  - [x] `NetworkError`
  - [x] `LLMError`
  - [x] `StorageError`
- [x] 错误码体系 (1000-9999)
- [x] 错误恢复建议
- [x] 重试机制 (可配置)

**验收**: 所有错误都有清晰的错误信息和恢复建议

**已完成文件**:
- `src/errors/types.ts` - 错误类型定义、错误码、恢复建议
- `src/errors/ConfigError.ts` - 配置相关错误
- `src/errors/StorageError.ts` - 存储相关错误
- `src/errors/ToolError.ts` - 工具相关错误
- `src/errors/NetworkError.ts` - 网络相关错误
- `src/errors/LLMError.ts` - LLM 相关错误
- `src/errors/ErrorHandler.ts` - 错误处理中间件、重试逻辑
- `src/errors/index.ts` - 模块导出

**功能特性**:
✅ 统一错误基类 (MiniClaudeError)
✅ 完整的错误码体系 (1000-9999)
✅ 智能错误恢复建议
✅ 上下文信息保留
✅ 链式错误支持 (originalError)
✅ 自动重试机制 (withRetry, exponential backoff)
✅ 降级处理逻辑 (withFallback)
✅ 全局错误处理器
✅ 错误序列化 (toJSON)
✅ 详细错误信息 (getFullMessage)

---

### 阶段 2: 工具扩展 (Week 3-4)

#### 2.1 文件系统工具增强 ✅ 已完成
**目标**: 扩展文件操作能力

**新增工具**:
- [x] `ListDirectoryTool` - 列出目录内容 (支持递归、过滤)
- [x] `GetFileInfoTool` - 获取文件元数据 (大小、权限、时间)
- [x] `CopyFileTool` - 复制文件
- [x] `MoveFileTool` - 移动/重命名文件
- [x] `DeleteFileTool` - 删除文件 (需要权限)
- [x] `CreateDirectoryTool` - 创建目录

**验收**: AI 可以执行完整的文件系统操作

**已完成文件**:
- `src/tools/filesystem/ListDirectoryTool.ts` - 列出目录
- `src/tools/filesystem/GetFileInfoTool.ts` - 获取文件信息
- `src/tools/filesystem/CopyFileTool.ts` - 复制文件
- `src/tools/filesystem/MoveFileTool.ts` - 移动/重命名
- `src/tools/filesystem/DeleteFileTool.ts` - 删除文件/目录
- `src/tools/filesystem/CreateDirectoryTool.ts` - 创建目录
- `src/tools/filesystem/index.ts` - 模块导出
- 更新 `src/tools/index.ts` - 注册新工具

**功能特性**:
✅ 递归目录列出
✅ 文件过滤（扩展名、模式）
✅ 显示/隐藏文件控制
✅ 文件大小格式化显示
✅ 覆盖保护机制
✅ 递归删除确认
✅ 嵌套目录创建
✅ 权限控制（requiresPermission）

---

#### 2.2 代码搜索工具 ✅ 已完成
**目标**: 添加代码级别的搜索能力

**新增工具**:
- [x] `CodeSearchTool` - 代码符号搜索 (使用 ripgrep)
  - [x] 按语言过滤
  - [x] 按文件类型过滤
  - [x] 正则表达式支持
- [x] `FindReferencesTool` - 查找引用
- [x] `FindDefinitionsTool` - 查找定义 (简单实现)
- [x] `GetFileStatsTool` - 代码统计 (行数、注释率等)

**验收**: 可以快速搜索代码符号和引用

**已完成文件**:
- `src/tools/search/CodeSearchTool.ts` - 代码搜索
- `src/tools/search/FindReferencesTool.ts` - 查找引用
- `src/tools/search/FindDefinitionsTool.ts` - 查找定义
- `src/tools/search/GetFileStatsTool.ts` - 文件统计
- `src/tools/search/index.ts` - 模块导出
- 更新 `src/tools/index.ts` - 注册新工具

**功能特性**:
✅ ripgrep 集成（快速搜索）
✅ 正则表达式支持
✅ 语言过滤（TypeScript, JavaScript, Python 等）
✅ 文件模式过滤
✅ 大小写敏感/不敏感
✅ 上下文显示
✅ 符号引用搜索
✅ 符号定义搜索
✅ 定义过滤（排除定义）
✅ 代码统计（行数、注释、空行）
✅ 语言分布统计
✅ 最大文件识别
✅ 多语言注释检测（JS, TS, Python, Go, Rust, Java, C/C++ 等）

---

#### 2.3 项目分析工具
**目标**: 理解项目结构和技术栈

**新增工具**:
- [ ] `AnalyzeProjectTool` - 分析项目结构
  - 检测包管理器 (npm/yarn/pnpm)
  - 识别依赖关系
  - 生成项目树
- [ ] `GetDependenciesTool` - 获取依赖图
- [ ] `RunTestsTool` - 运行测试 (npm test, pytest 等)
- [ ] `LintCodeTool` - 运行代码检查 (eslint, flake8 等)

**验收**: AI 可以理解项目结构和运行测试

---

#### 2.4 Git 集成工具
**目标**: 基本的 Git 操作支持

**新增工具**:
- [ ] `GitStatusTool` - 查看 Git 状态
- [ ] `GitDiffTool` - 查看变更
- [ ] `GitLogTool` - 查看提交历史
- [ ] `GitCommitTool` - 创建提交 (需要权限)
- [ ] `GitBranchTool` - 分支操作
- [ ] `GitStashTool` - 暂存变更

**验收**: AI 可以执行常用的 Git 操作

---

#### 2.5 网络工具增强
**目标**: 扩展网络能力

**新增工具**:
- [ ] `WebFetchTool` - 抓取网页内容
- [ ] `HttpRequestTool` - 自定义 HTTP 请求
- [ ] `ApiDocsTool` - 查询 API 文档 (集成 popular APIs)

**验收**: AI 可以访问网页和调用 API

---

#### 2.6 系统信息工具
**目标**: 提供系统上下文信息

**新增工具**:
- [ ] `GetSystemInfoTool` - 获取系统信息 (OS、CPU、内存)
- [ ] `GetProcessInfoTool` - 获取进程信息
- [ ] `GetEnvVarTool` - 获取环境变量
- [ ] `WhoamiTool` - 获取当前用户信息

**验收**: AI 可以了解运行环境

---

### 阶段 3: 命令系统 (Week 5-6)

#### 3.1 命令框架
**目标**: 建立斜杠命令系统

**任务**:
- [ ] 创建 `commands/` 目录
- [ ] 实现 CommandRegistry 类
  - 命令注册
  - 命令解析
  - 命令补全
  - 命令帮助系统
- [ ] 命令接口定义:
  ```typescript
  interface Command {
    name: string
    aliases: string[]
    description: string
    usage: string
    examples: string[]
    options: CommandOption[]
    handler: (args: CommandArgs, context: CommandContext) => Promise<void>
  }
  ```

**验收**: 可以注册和执行斜杠命令

---

#### 3.2 基础命令实现
**目标**: 实现常用斜杠命令

**命令列表**:
- [ ] `/config` - 配置管理
  - 子命令: get, set, list, reset
- [ ] `/history` - 历史会话
  - 子命令: list, show, delete, clear
- [ ] `/resume` - 恢复会话
- [ ] `/clear` - 清空当前对话
- [ ] `/help` - 显示帮助
- [ ] `/exit` / `/quit` - 退出程序
- [ ] `/model` - 切换模型
- [ ] `/theme` - 切换主题

**验收**: 用户可以通过命令管理会话和配置

---

#### 3.3 开发命令实现
**目标**: 实现开发相关的命令

**命令列表**:
- [ ] `/commit` - Git 提交
  - 支持自动生成提交信息
- [ ] `/diff` - 查看变更
- [ ] `/test` - 运行测试
- [ ] `/lint` - 代码检查
- [ ] `/build` - 构建项目
- [ ] `/run` - 运行脚本

**验收**: 用户可以通过快捷命令执行开发任务

---

#### 3.4 高级命令实现
**目标**: 实现高级功能命令

**命令列表**:
- [ ] `/context` - 显示当前上下文
  - 模型、权限、历史长度等
- [ ] `/cost` - 估算使用成本
- [ ] `/doctor` - 诊断环境问题
- [ ] `/export` - 导出会话
- [ ] `/search` - 搜索历史消息

**验收**: 提供高级诊断和管理功能

---

### 阶段 4: 技能系统 (Week 7-8)

#### 4.1 技能框架
**目标**: 建立可复用的技能系统

**任务**:
- [ ] 创建 `skills/` 目录
- [ ] 实现 SkillManager 类
  - 技能注册
  - 技能触发
  - 技能链式调用
  - 技能参数化
- [ ] 技能接口定义:
  ```typescript
  interface Skill {
    id: string
    name: string
    description: string
    triggers: string[]  // 触发词/模式
    parameters: SkillParameter[]
    execute: (context: SkillContext) => Promise<SkillResult>
  }
  ```

**验收**: 可以定义和执行技能

---

#### 4.2 内置技能实现
**目标**: 实现常用技能

**技能列表**:
- [ ] `CodeReviewSkill` - 代码审查
  - 扫描变更文件
  - 检查常见问题
  - 生成审查报告
- [ ] `RefactorSkill` - 代码重构
  - 识别重构机会
  - 安全重构
- [ ] `TestGenerationSkill` - 测试生成
  - 分析函数签名
  - 生成单元测试
  - 支持多种测试框架
- [ ] `DocumentationSkill` - 文档生成
  - 解析代码结构
  - 生成 API 文档
  - 支持多种格式 (Markdown、JSDoc)
- [ ] `DebugSkill` - 调试助手
  - 分析错误信息
  - 提供调试建议
  - 定位问题代码
- [ ] `PerformanceSkill` - 性能分析
  - 识别性能瓶颈
  - 提供优化建议

**验收**: 用户可以通过技能快速完成复杂任务

---

#### 4.3 技能管理命令
**目标**: 管理技能的命令

**命令**:
- [ ] `/skills` - 技能管理
  - 子命令: list, show, enable, disable
- [ ] 技能热重载支持

**验收**: 用户可以启用/禁用和管理技能

---

### 阶段 5: 多代理系统 (Week 9-10)

#### 5.1 代理框架
**目标**: 建立多代理协调系统

**任务**:
- [ ] 创建 `agents/` 目录
- [ ] 实现 Agent 类
  - 代理角色定义
  - 代理能力描述
  - 代理通信
- [ ] 实现 Coordinator 类
  - 代理调度
  - 任务分配
  - 结果聚合
  - 代理间协作

**验收**: 可以创建和管理多个代理

---

#### 5.2 内置代理实现
**目标**: 实现专业代理

**代理列表**:
- [ ] `CodeAgent` - 代码专家
  - 擅长代码分析、重构、调试
- [ ] `TestAgent` - 测试专家
  - 擅长测试编写、覆盖率分析
- [ ] `DocAgent` - 文档专家
  - 擅长文档编写、技术写作
- [ ] `ReviewAgent` - 审查专家
  - 擅长代码审查、最佳实践检查
- [ ] `DevOpsAgent` - 运维专家
  - 擅长 CI/CD、部署配置

**验收**: 不同的代理可以处理各自擅长的任务

---

#### 5.3 代理管理命令
**目标**: 管理代理的命令

**命令**:
- [ ] `/agents` - 代理管理
  - 子命令: list, show, create, delete
- [ ] `/team` - 团队管理
  - 创建代理团队
  - 分配任务给团队

**验收**: 用户可以创建和管理代理团队

---

### 阶段 6: IDE 集成 (Week 11-12)

#### 6.1 协议层
**目标**: 定义与 IDE 通信的协议

**任务**:
- [ ] 创建 `bridge/` 目录
- [ ] 实现 WebSocket 服务器
- [ ] 定义消息协议:
  - 文件变更通知
  - 光标位置同步
  - 选择区域获取
  - 诊断信息推送

**验收**: 可以与外部工具建立连接

---

#### 6.2 VS Code 扩展
**目标**: 创建 VS Code 扩展

**任务**:
- [ ] 创建 `vscode-extension/` 目录
- [ ] 实现 VS Code 扩展
  - 侧边栏面板
  - 命令面板集成
  - 文件右键菜单
  - 状态栏集成
- [ ] 发布到 VS Code Marketplace

**验收**: 可以在 VS Code 中使用 mini-claude

---

#### 6.3 JetBrains 插件 (可选)
**目标**: 创建 JetBrains 插件

**任务**:
- [ ] 创建 `jetbrains-plugin/` 目录
- [ ] 实现 IntelliJ 平台插件
- [ ] 支持多语言插件

**验收**: 可以在 JetBrains IDE 中使用 mini-claude

---

### 阶段 7: 高级功能 (Week 13-16)

#### 7.1 计划模式
**目标**: 实现任务规划能力

**任务**:
- [ ] 创建 `planning/` 目录
- [ ] 实现计划引擎
  - 任务分解
  - 依赖分析
  - 执行顺序优化
- [ ] 创建 `/plan` 命令
  - `/plan enter` - 进入计划模式
  - `/plan exit` - 退出计划模式
  - `/plan execute` - 执行计划

**验收**: AI 可以制定并执行复杂的任务计划

---

#### 7.2 持久记忆
**目标**: 实现跨会话的记忆系统

**任务**:
- [ ] 创建 `memory/` 目录
- [ ] 实现 MemoryStore 类
  - 向量存储 (使用轻量级嵌入模型)
  - 语义检索
  - 记忆重要性评分
  - 记忆遗忘机制
- [ ] 创建 `/memory` 命令
  - 子命令: add, list, search, delete

**验收**: AI 可以记住项目上下文和用户偏好

---

#### 7.3 MCP 支持
**目标**: 支持 Model Context Protocol

**任务**:
- [ ] 创建 `mcp/` 目录
- [ ] 实现 MCP 客户端
- [ ] 支持动态加载 MCP 服务器
- [ ] 创建 `/mcp` 命令
  - 子命令: list, connect, disconnect, inspect

**验收**: 可以连接和使用 MCP 服务器

---

#### 7.4 语音输入 (可选)
**目标**: 支持语音输入

**任务**:
- [ ] 创建 `voice/` 目录
- [ ] 实现语音识别
  - 使用系统语音识别 API
  - 或集成第三方服务
- [ ] 创建快捷键触发录音
- [ ] 创建 `/voice` 命令

**验收**: 可以通过语音输入命令

---

#### 7.5 成本追踪
**目标**: 追踪和估算 API 使用成本

**任务**:
- [ ] 创建 `analytics/` 目录
- [ ] 实现 CostTracker 类
  - Token 统计
  - 费用计算
  - 使用趋势分析
- [ ] 增强日志记录 token 使用
- [ ] 创建 `/cost` 命令
  - 显示当前会话成本
  - 显示历史成本统计

**验收**: 可以了解 API 使用成本

---

#### 7.6 主题系统
**目标**: 支持自定义主题

**任务**:
- [ ] 创建 `themes/` 目录
- [ ] 定义主题格式
- [ ] 实现多款预设主题
  - default
  - dark
  - light
  - solarized
  - dracula
- [ ] 支持自定义主题
- [ ] 增强主题切换命令

**验收**: 可以切换和应用不同主题

---

### 阶段 8: 质量与优化 (Week 17-20)

#### 8.1 性能优化
**目标**: 优化性能和响应速度

**任务**:
- [ ] 流式响应优化
- [ ] 并行工具调用
- [ ] 历史记录压缩
- [ ] 懒加载模块
- [ ] 缓存策略
- [ ] 启动速度优化

**验收**: 启动时间 < 2s，响应延迟 < 500ms

---

#### 8.2 测试覆盖
**目标**: 建立完整的测试体系

**任务**:
- [ ] 配置测试框架 (Vitest)
- [ ] 单元测试 (工具、命令、技能)
- [ ] 集成测试 (场景测试)
- [ ] E2E 测试 (CLI 交互)
- [ ] 覆盖率目标: >80%

**验收**: 所有核心功能都有测试覆盖

---

#### 8.3 文档完善
**目标**: 编写完整的文档

**任务**:
- [ ] 用户文档
  - 快速开始
  - 功能说明
  - 命令参考
  - 技能参考
  - FAQ
- [ ] 开发文档
  - 架构设计
  - API 文档
  - 贡献指南
  - 扩展开发指南
- [ ] 多语言支持 (中英文)

**验收**: 文档完整，便于新用户上手

---

#### 8.4 安全加固
**目标**: 提升安全性

**任务**:
- [ ] 权限系统增强
  - 细粒度权限控制
  - 权限继承
  - 信任区概念
- [ ] 输入验证加强
- [ ] 敏感信息处理
- [ ] 审计日志
- [ ] 安全最佳实践检查

**验收**: 通过安全审计

---

## 📁 目标项目结构

```
mini-claude/
├── src/
│   ├── index.tsx              # 入口
│   ├── App.tsx                # REPL 主界面
│   ├── QueryEngine.ts         # 查询引擎
│   ├── types.ts               # 类型定义
│   │
│   ├── config/                # 配置管理
│   │   ├── ConfigManager.ts
│   │   ├── schema.ts
│   │   └── defaults.ts
│   │
│   ├── storage/               # 存储层
│   │   ├── SessionManager.ts
│   │   ├── MemoryStore.ts
│   │   └── types.ts
│   │
│   ├── logger/                # 日志系统
│   │   ├── Logger.ts
│   │   └── formatters.ts
│   │
│   ├── errors/                # 错误处理
│   │   ├── MiniClaudeError.ts
│   │   └── codes.ts
│   │
│   ├── tools/                 # 工具 (30+)
│   │   ├── index.ts
│   │   ├── core/              # 核心工具
│   │   │   ├── BashTool.ts
│   │   │   ├── ReadFileTool.ts
│   │   │   ├── WriteFileTool.ts
│   │   │   ├── EditFileTool.ts
│   │   │   └── ...
│   │   ├── filesystem/        # 文件系统工具
│   │   │   ├── ListDirectoryTool.ts
│   │   │   ├── CopyFileTool.ts
│   │   │   └── ...
│   │   ├── search/            # 搜索工具
│   │   │   ├── CodeSearchTool.ts
│   │   │   ├── FindReferencesTool.ts
│   │   │   └── ...
│   │   ├── git/               # Git 工具
│   │   │   ├── GitStatusTool.ts
│   │   │   ├── GitCommitTool.ts
│   │   │   └── ...
│   │   └── network/           # 网络工具
│   │       ├── WebFetchTool.ts
│   │       └── ...
│   │
│   ├── commands/              # 斜杠命令 (20+)
│   │   ├── CommandRegistry.ts
│   │   ├── types.ts
│   │   ├── core/              # 核心命令
│   │   │   ├── config.ts
│   │   │   ├── history.ts
│   │   │   ├── help.ts
│   │   │   └── ...
│   │   ├── dev/               # 开发命令
│   │   │   ├── commit.ts
│   │   │   ├── diff.ts
│   │   │   └── ...
│   │   └── advanced/          # 高级命令
│   │       ├── context.ts
│   │       ├── cost.ts
│   │       └── ...
│   │
│   ├── skills/                # 技能系统
│   │   ├── SkillManager.ts
│   │   ├── types.ts
│   │   ├── builtin/           # 内置技能
│   │   │   ├── CodeReviewSkill.ts
│   │   │   ├── RefactorSkill.ts
│   │   │   ├── TestGenerationSkill.ts
│   │   │   └── ...
│   │   └── registry.ts
│   │
│   ├── agents/                # 多代理系统
│   │   ├── Agent.ts
│   │   ├── Coordinator.ts
│   │   ├── builtin/           # 内置代理
│   │   │   ├── CodeAgent.ts
│   │   │   ├── TestAgent.ts
│   │   │   └── ...
│   │   └── registry.ts
│   │
│   ├── bridge/                # IDE 桥接
│   │   ├── Server.ts
│   │   ├── protocol.ts
│   │   └── handlers.ts
│   │
│   ├── planning/              # 计划模式
│   │   ├── Planner.ts
│   │   ├── Executor.ts
│   │   └── types.ts
│   │
│   ├── memory/                # 持久记忆
│   │   ├── MemoryStore.ts
│   │   ├── embeddings.ts
│   │   └── retriever.ts
│   │
│   ├── mcp/                   # MCP 支持
│   │   ├── Client.ts
│   │   ├── registry.ts
│   │   └── types.ts
│   │
│   ├── voice/                 # 语音输入
│   │   ├── Recognizer.ts
│   │   └── types.ts
│   │
│   ├── analytics/             # 成本追踪
│   │   ├── CostTracker.ts
│   │   └── types.ts
│   │
│   ├── themes/                # 主题系统
│   │   ├── ThemeManager.ts
│   │   ├── presets/
│   │   │   ├── default.ts
│   │   │   ├── dark.ts
│   │   │   └── light.ts
│   │   └── types.ts
│   │
│   ├── components/            # UI 组件
│   │   ├── MessageList.tsx
│   │   ├── PermissionRequest.tsx
│   │   ├── Spinner.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── SkillPicker.tsx
│   │   └── ...
│   │
│   ├── hooks/                 # React Hooks
│   │   ├── useCommandHistory.ts
│   │   ├── useSession.ts
│   │   └── ...
│   │
│   ├── utils/                 # 工具函数
│   │   ├── crypto.ts
│   │   ├── format.ts
│   │   ├── time.ts
│   │   └── ...
│   │
│   └── daily-news/            # 定时新闻 (已有)
│       └── ...
│
├── vscode-extension/          # VS Code 扩展
├── tests/                     # 测试
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                      # 文档
│   ├── user/
│   ├── dev/
│   └── zh/
├── package.json
├── tsconfig.json
└── ROADMAP.md                 # 本文件
```

---

## 🎓 学习目标

通过这个项目，你将学会：

1. **CLI 工具开发** - 命令行应用的架构设计
2. **LLM 应用开发** - 如何构建 LLM 驱动的应用
3. **流式处理** - 处理实时流数据
4. **工具系统设计** - 可扩展的工具架构
5. **命令系统设计** - 斜杠命令的实现
6. **技能系统** - AI 技能的设计与应用
7. **多代理系统** - 协调多个 AI 代理
8. **插件架构** - 可扩展的插件系统
9. **测试驱动开发** - TDD 实践
10. **性能优化** - 大规模应用的优化技巧

---

## 📝 实施建议

1. **按顺序执行** - 每个阶段基于前一个阶段
2. **小步快跑** - 每个任务完成后立即测试
3. **保持简洁** - 优先实现核心功能，避免过度设计
4. **文档先行** - 实现前先写好接口设计
5. **持续集成** - 建立自动化测试和检查

---

## 🔗 参考资源

- [Claude Code 源码](https://github.com/anthropics/claude-code)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Ink 文档](https://github.com/vadimdemedes/ink)
- [Commander.js 文档](https://github.com/tj/commander.js)
- [Zod 文档](https://zod.dev)

---

*开始日期: 2026-03-31*
*预计完成: 2026-08-31 (5个月)*

---

## 📅 下次工作提醒

### 待完成任务
- **阶段 2: 工具扩展** (下一阶段)
  - 创建 `src/tools/filesystem/` 目录
  - 实现文件系统工具 (ListDirectory, CopyFile, DeleteFile, MoveFile 等)
  - 创建 `src/tools/search/` 目录
  - 实现代码搜索工具 (CodeSearch, FindReferences, FindDefinitions)
  - 创建 `src/tools/git/` 目录
  - 实现 Git 工具 (GitStatus, GitCommit, GitDiff 等)

### 启动命令
```bash
cd /Users/rremixwang/studyspace/mini-claude
npm run dev          # 运行开发模式
npm run typecheck    # 类型检查
```

### 快速继续工作
```bash
# 查看路线图
cat ROADMAP.md

# 查看工作日志
cat WORKLOG.md
```

### ✅ 阶段 1 完成总结
**阶段 1: 基础增强** 已全部完成！
- ✅ 配置系统 - ConfigManager + /config 命令
- ✅ 会话持久化 - SessionManager + /history + /resume 命令
- ✅ 日志系统 - Logger + /logs 命令
- ✅ 错误处理 - 错误类型体系 + 处理中间件

**成果**:
- 4 个核心模块
- 48 个文件
- ~4,500 行代码
- 4 个斜杠命令
- 15+ 种错误类型

---

### 快速继续工作
```bash
# 查看路线图
cat ROADMAP.md

# 查看当前进度
grep -A 20 "📌 上次工作进度" ROADMAP.md
```

---

**让我们一起把 mini-claude 打造成一个功能完整的生产级 AI CLI 工具！** 🚀
