import OpenAI from 'openai'
import type { QueryCallbacks, SessionState, ToolResult } from './types.js'
import { ALL_TOOLS, getTool } from './tools/index.js'

// ZhipuAI OpenAI-compatible endpoint
const ZHIPU_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/'

// Maximum tool-call rounds per user turn to prevent infinite loops
const MAX_TOOL_ROUNDS = 20

/** Convert our ToolDefinition list into OpenAI function-calling format */
function buildTools(): OpenAI.ChatCompletionTool[] {
  return ALL_TOOLS.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }))
}

/**
 * Run one user turn through the model, handling tool calls in a loop.
 * Returns the full assistant text response.
 */
export async function runTurn(
  userText: string,
  state: SessionState,
  callbacks: QueryCallbacks = {},
): Promise<string> {
  const apiKey = process.env.ZHIPUAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'ZHIPUAI_API_KEY environment variable is not set.\n' +
        'Export it before running: export ZHIPUAI_API_KEY=your-key\n' +
        'Get your key at: https://open.bigmodel.cn',
    )
  }

  const client = new OpenAI({
    apiKey,
    baseURL: ZHIPU_BASE_URL,
  })

  // Append user message to history
  state.history.push({ role: 'user', content: userText })

  let assistantText = ''
  let round = 0

  while (round < MAX_TOOL_ROUNDS) {
    round++

    // ── Stream the model response ───────────────────────────────────────────────────
    const stream = await client.chat.completions.create({
      model: state.model,
      messages: [
        { role: 'system', content: buildSystemPrompt(state.cwd) },
        ...state.history as OpenAI.ChatCompletionMessageParam[],
      ],
      tools: buildTools(),
      tool_choice: 'auto',
      stream: true,
    })

    let currentText = ''
    const toolCallMap = new Map<number, {
      id: string
      name: string
      argumentsRaw: string
    }>()

    // Consume the stream
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue

      // Text content
      if (delta.content) {
        currentText += delta.content
        callbacks.onText?.(delta.content)
      }

      // Tool call deltas (arguments arrive in chunks)
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index
          if (!toolCallMap.has(idx)) {
            toolCallMap.set(idx, { id: tc.id ?? '', name: tc.function?.name ?? '', argumentsRaw: '' })
          }
          const entry = toolCallMap.get(idx)!
          if (tc.id) entry.id = tc.id
          if (tc.function?.name) entry.name = tc.function.name
          if (tc.function?.arguments) entry.argumentsRaw += tc.function.arguments
        }
      }
    }

    const toolCalls = Array.from(toolCallMap.values())

    // Build assistant message for history
    if (toolCalls.length > 0) {
      state.history.push({
        role: 'assistant',
        content: currentText || null,
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: tc.argumentsRaw },
        })),
      })
    } else {
      state.history.push({ role: 'assistant', content: currentText })
    }

    if (currentText) {
      assistantText = currentText
      callbacks.onAssistantMessage?.(currentText)
    }

    // ── Stop if no tool calls ───────────────────────────────────────────────────
    if (toolCalls.length === 0) break

    // ── Execute tool calls ────────────────────────────────────────────────────────
    for (const tc of toolCalls) {
      const tool = getTool(tc.name)
      let input: Record<string, unknown> = {}
      try {
        input = JSON.parse(tc.argumentsRaw) as Record<string, unknown>
      } catch {
        // malformed JSON from model
      }

      if (!tool) {
        state.history.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: `Unknown tool: ${tc.name}`,
        })
        continue
      }

      // Permission check for dangerous tools
      if (tool.requiresPermission && state.permissionMode !== 'bypassPermissions') {
        const allowed = callbacks.onPermissionRequest
          ? await callbacks.onPermissionRequest(tool.name, input)
          : false

        if (!allowed) {
          state.history.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: 'User denied permission to execute this tool.',
          })
          continue
        }
      }

      // Execute the tool
      let result: ToolResult
      try {
        result = await tool.execute(input)
      } catch (err: unknown) {
        result = {
          success: false,
          output: '',
          error: err instanceof Error ? err.message : String(err),
        }
      }

      callbacks.onToolResult?.(tool.name, result)

      state.history.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: result.error
          ? `${result.output}\nError: ${result.error}`.trim()
          : result.output,
      })
    }
  }

  return assistantText
}

function buildSystemPrompt(cwd: string): string {
  return `You are a helpful AI assistant running in the terminal. You have access to tools to help the user with software engineering tasks. Please respond in the same language as the user.

Current working directory: ${cwd}
Platform: ${process.platform}
Date: ${new Date().toISOString().split('T')[0]}

Guidelines:
- Be concise and direct in your responses.
- Use tools proactively when they help answer the user's request.
- When executing Bash commands, prefer non-destructive operations unless the user explicitly asks.
- When reading files, always check they exist first.
- After making file changes, briefly summarize what you changed.`
}
