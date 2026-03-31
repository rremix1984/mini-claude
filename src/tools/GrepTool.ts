import { exec } from 'child_process'
import { promisify } from 'util'
import { resolve } from 'path'
import type { ToolDefinition, ToolResult } from '../types.js'

const execAsync = promisify(exec)

export const GrepTool: ToolDefinition = {
  name: 'Grep',
  description:
    'Search for a pattern in files. Returns matching lines with file names and line numbers.',
  requiresPermission: false,
  inputSchema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'The regex pattern to search for',
      },
      path: {
        type: 'string',
        description: 'File or directory to search in (default: current directory)',
      },
      include: {
        type: 'string',
        description: 'Glob pattern to filter files (e.g. "*.ts")',
      },
      case_insensitive: {
        type: 'boolean',
        description: 'Whether to search case-insensitively (default: false)',
      },
    },
    required: ['pattern'],
  },
  async execute(input): Promise<ToolResult> {
    const pattern = input['pattern'] as string
    const searchPath = resolve((input['path'] as string | undefined) ?? process.cwd())
    const include = input['include'] as string | undefined
    const caseFlag = (input['case_insensitive'] as boolean | undefined) ? '-i' : ''

    const includeFlag = include ? `--include="${include}"` : ''
    const cmd = `grep -rn ${caseFlag} ${includeFlag} --color=never -E ${JSON.stringify(pattern)} ${JSON.stringify(searchPath)} 2>/dev/null`

    try {
      const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 5 })
      const trimmed = stdout.trimEnd()
      return { success: true, output: trimmed || '(no matches found)' }
    } catch (err: unknown) {
      // grep exits with code 1 when no matches — that's okay
      const e = err as NodeJS.ErrnoException & { code?: number }
      if (e.code === 1) {
        return { success: true, output: '(no matches found)' }
      }
      return { success: false, output: '', error: (e as Error).message }
    }
  },
}
