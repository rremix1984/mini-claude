import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import type { ToolDefinition, ToolResult } from '../types.js'

export const EditFileTool: ToolDefinition = {
  name: 'Edit',
  description:
    'Edit an existing file by replacing an exact string with a new string. The old_string must match exactly once in the file.',
  requiresPermission: true,
  inputSchema: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'The absolute or relative path to the file to edit',
      },
      old_string: {
        type: 'string',
        description: 'The exact string to find and replace (must match exactly once)',
      },
      new_string: {
        type: 'string',
        description: 'The new string to replace the old_string with',
      },
    },
    required: ['file_path', 'old_string', 'new_string'],
  },
  async execute(input): Promise<ToolResult> {
    const filePath = resolve(input['file_path'] as string)
    const oldString = input['old_string'] as string
    const newString = input['new_string'] as string

    try {
      const content = await readFile(filePath, 'utf8')
      const occurrences = content.split(oldString).length - 1

      if (occurrences === 0) {
        return {
          success: false,
          output: '',
          error: `old_string not found in ${filePath}`,
        }
      }
      if (occurrences > 1) {
        return {
          success: false,
          output: '',
          error: `old_string found ${occurrences} times in ${filePath}. It must be unique.`,
        }
      }

      const updated = content.replace(oldString, newString)
      await writeFile(filePath, updated, 'utf8')
      return { success: true, output: `File updated: ${filePath}` }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException
      return { success: false, output: '', error: `Cannot edit file: ${e.message}` }
    }
  },
}
