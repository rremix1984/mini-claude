import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { ToolDefinition, ToolResult } from '../types.js'

export const ReadFileTool: ToolDefinition = {
  name: 'Read',
  description: 'Read the contents of a file. Returns the file content as text.',
  requiresPermission: false,
  inputSchema: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'The absolute or relative path to the file to read',
      },
      start_line: {
        type: 'number',
        description: 'Optional: 1-indexed line number to start reading from',
      },
      end_line: {
        type: 'number',
        description: 'Optional: 1-indexed line number to stop reading at (inclusive)',
      },
    },
    required: ['file_path'],
  },
  async execute(input): Promise<ToolResult> {
    const filePath = resolve(input['file_path'] as string)
    const startLine = input['start_line'] as number | undefined
    const endLine = input['end_line'] as number | undefined

    try {
      const content = await readFile(filePath, 'utf8')

      if (startLine !== undefined || endLine !== undefined) {
        const lines = content.split('\n')
        const start = (startLine ?? 1) - 1
        const end = endLine !== undefined ? endLine : lines.length
        const sliced = lines.slice(start, end).join('\n')
        return { success: true, output: sliced }
      }

      return { success: true, output: content }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException
      return { success: false, output: '', error: `Cannot read file: ${e.message}` }
    }
  },
}
