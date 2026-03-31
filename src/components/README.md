# Components

## PermissionRequest

权限请求对话框组件，用于在工具执行前请求用户确认。

### 选项

- `[y]` 或 `Enter` - 允许执行
- `[n]` 或 `Esc` - 拒绝执行
- `[a]` - 始终允许（切换到 `bypassPermissions` 模式）

### Always 模式

当选择 `[a]lways` 后：
1. 当前的工具会被允许执行
2. 切换到 `bypassPermissions` 模式
3. 所有后续的工具调用都不会再请求确认
4. 界面顶部会显示 `[✓ Always Allow]` 状态

### 何时使用 Always 模式

- ✅ 在受信任的环境中运行
- ✅ 确认 AI 的操作是安全的
- ✅ 需要执行大量连续操作时

### 如何关闭 Always 模式

目前需要重启应用。未来版本可能添加 `/permissions` 命令来切换模式。
