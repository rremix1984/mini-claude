# mini-claude

A minimal AI coding assistant for your terminal, inspired by Claude Code.

## Features

- **Interactive REPL** — persistent conversation with full message history
- **Tool calling** — AI can run shell commands, read/write/edit files, search with glob & grep
- **Permission system** — prompts before executing dangerous tools (Bash, Write, Edit)
- **Streaming** — responses appear in real-time as the model generates them
- **Non-interactive mode** — pipe-friendly `-p` flag for scripting

## Setup

```bash
cd mini-claude
npm install
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

### Interactive REPL
```bash
npm run dev
```

### Start with an initial prompt
```bash
npm run dev -- "explain what files are in this directory"
```

### Non-interactive (pipe-friendly)
```bash
npm run dev -- -p "write a hello world in Python"
```

### Skip permission prompts (trusted environments only)
```bash
npm run dev -- --dangerously-skip-permissions
```

### Use a different model
```bash
npm run dev -- -m claude-opus-4-5
```

## Available Tools

| Tool   | Description                              | Requires Permission |
|--------|------------------------------------------|---------------------|
| Bash   | Execute shell commands                   | ✅ Yes               |
| Read   | Read file contents (with line ranges)    | ❌ No                |
| Write  | Create or overwrite files                | ✅ Yes               |
| Edit   | Replace exact string in a file           | ✅ Yes               |
| Glob   | Find files by pattern (`**/*.ts`)        | ❌ No                |
| Grep   | Search file contents with regex          | ❌ No                |

## Permission System

When a tool requires permission, you'll see a dialog with three options:

| Option | Key | Description |
|--------|-----|-------------|
| Yes | `y` / `Enter` | Allow this tool execution |
| No | `n` / `Esc` | Deny this tool execution |
| Always | `a` | Allow all future tools (skip confirmations) |

When you select **Always**, the permission mode changes to `bypassPermissions` and no more confirmations will appear. The header will show `[✓ Always Allow]` to indicate this mode is active.

## Project Structure

```
src/
├── index.tsx          # CLI entry point (Commander.js)
├── App.tsx            # Main interactive REPL (React/Ink)
├── QueryEngine.ts     # Anthropic API + tool-call loop
├── types.ts           # Global TypeScript types
├── tools/
│   ├── index.ts       # Tool registry
│   ├── BashTool.ts
│   ├── ReadFileTool.ts
│   ├── WriteFileTool.ts
│   ├── EditFileTool.ts
│   ├── GlobTool.ts
│   └── GrepTool.ts
└── components/
    ├── MessageList.tsx      # Conversation history display
    ├── PermissionRequest.tsx # Tool confirmation dialog
    └── Spinner.tsx          # Loading animation
```

## Architecture

Inspired by [Claude Code](https://github.com/anthropics/claude-code):

- **Tool layer** — each tool is self-contained with a name, JSON Schema, permission flag, and `execute()` method
- **QueryEngine** — implements the tool-call loop: send message → receive `tool_use` blocks → execute tools → feed `tool_result` back → repeat until `end_turn`
- **Permission system** — tools marked `requiresPermission: true` pause execution and ask the user via a TUI dialog before running
- **React/Ink UI** — the entire TUI is a React component tree rendered to the terminal
