import { mkdir, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import type { ToolDefinition, ToolResult } from '../types.js'

export const WriteFileTool: ToolDefinition = {
  name: 'Write',
  description:
    'Create a new file or completely overwrite an existing file with the given content. Creates parent directories if needed.',
  requiresPermission: true,
  inputSchema: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'The absolute or relative path to the file to write',
      },
      content: {
        type: 'string',
        description: 'The content to write to the file',
      },
    },
    required: ['file_path', 'content'],
  },
  async execute(input): Promise<ToolResult> {
    const filePath = resolve(input['file_path'] as string)
    const content = input['content'] as string

    try {
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, content, 'utf8')
      return { success: true, output: `File written: ${filePath}` }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException
      return { success: false, output: '', error: `Cannot write file: ${e.message}` }
    }
  },
}
