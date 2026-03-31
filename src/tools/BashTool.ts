import { exec } from 'child_process'
import { promisify } from 'util'
import type { ToolDefinition, ToolResult } from '../types.js'

const execAsync = promisify(exec)

export const BashTool: ToolDefinition = {
  name: 'Bash',
  description:
    'Execute a shell command in the current working directory. Use this for running scripts, installing packages, compiling code, running tests, etc.',
  requiresPermission: true,
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The shell command to execute',
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 30000)',
      },
    },
    required: ['command'],
  },
  async execute(input): Promise<ToolResult> {
    const command = input['command'] as string
    const timeout = (input['timeout'] as number | undefined) ?? 30000

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout,
        maxBuffer: 1024 * 1024 * 10, // 10MB
        shell: '/bin/zsh',
      })
      const output = [stdout, stderr].filter(Boolean).join('\n').trimEnd()
      return { success: true, output: output || '(no output)' }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }
      const out = [e.stdout, e.stderr].filter(Boolean).join('\n').trimEnd()
      return {
        success: false,
        output: out || '',
        error: e.message,
      }
    }
  },
}
