#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import { Command } from 'commander'
import { App } from './App.js'
import { runTurn } from './QueryEngine.js'
import type { PermissionMode, SessionState } from './types.js'

const DEFAULT_MODEL = 'glm-4.7'

async function main() {
  const program = new Command()

  program
    .name('mini-claude')
    .description('A minimal AI coding assistant in your terminal')
    .argument('[prompt]', 'Initial prompt (opens REPL if omitted)')
    .option('-p, --print', 'Non-interactive mode: print response and exit')
    .option('-m, --model <model>', 'Model to use', DEFAULT_MODEL)
    .option(
      '--dangerously-skip-permissions',
      'Skip all permission prompts (use only in trusted environments)',
    )
    .helpOption('-h, --help', 'Show help')
    .parse(process.argv)

  const opts = program.opts<{
    print?: boolean
    model: string
    dangerouslySkipPermissions?: boolean
  }>()

  const prompt = program.args[0]
  const permissionMode: PermissionMode = opts.dangerouslySkipPermissions
    ? 'bypassPermissions'
    : 'default'
  const model = opts.model
  const cwd = process.cwd()

  // ── Non-interactive mode (-p / --print) ────────────────────────────────────
  if (opts.print || (prompt && process.env.CI)) {
    if (!prompt) {
      process.stderr.write('Error: --print requires a prompt argument.\n')
      process.exit(1)
    }

    const apiKey = process.env.ZHIPUAI_API_KEY
    if (!apiKey) {
      process.stderr.write(
        'Error: ZHIPUAI_API_KEY environment variable is not set.\n' +
          'Export it before running: export ZHIPUAI_API_KEY=your-key\n',
      )
      process.exit(1)
    }

    const state: SessionState = {
      model,
      permissionMode,
      history: [],
      cwd,
    }

    try {
      let buffer = ''
      await runTurn(prompt, state, {
        onText: delta => {
          process.stdout.write(delta)
          buffer += delta
        },
        onAssistantMessage: () => {
          // Text was already streamed to stdout
        },
        onPermissionRequest: async (toolName, input) => {
          if (permissionMode === 'bypassPermissions') return true
          // In non-interactive mode, deny risky tools unless skip-permissions
          process.stderr.write(
            `\n[Permission denied in non-interactive mode: ${toolName}]\n`,
          )
          return false
        },
        onToolResult: (toolName, result) => {
          process.stderr.write(
            `\n[Tool: ${toolName} ${result.success ? '✓' : '✗'}]\n`,
          )
        },
        onError: err => {
          process.stderr.write(`\nError: ${err.message}\n`)
        },
      })
      if (!buffer.endsWith('\n')) process.stdout.write('\n')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      process.stderr.write(`Error: ${msg}\n`)
      process.exit(1)
    }
    return
  }

  // ── Interactive REPL mode ──────────────────────────────────────────────────

  // Check API key early to give a clear error message
  if (!process.env.ZHIPUAI_API_KEY) {
    process.stderr.write(
      '\n  ⚠  ZHIPUAI_API_KEY is not set.\n' +
        '     Export it before running:\n\n' +
        '       export ZHIPUAI_API_KEY=your-key\n\n' +
        '     Get your key at: https://open.bigmodel.cn\n\n',
    )
    process.exit(1)
  }

  render(
    <App
      model={model}
      permissionMode={permissionMode}
      cwd={cwd}
      initialPrompt={prompt}
    />,
    { exitOnCtrlC: true },
  )
}

main().catch(err => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})
