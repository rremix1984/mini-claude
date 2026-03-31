import { readdir } from 'fs/promises'
import { join, resolve } from 'path'
import type { ToolDefinition, ToolResult } from '../types.js'

/** Simple recursive glob — supports * and ** wildcards */
async function glob(pattern: string, baseDir: string): Promise<string[]> {
  const results: string[] = []

  async function walk(dir: string): Promise<void> {
    let entries: string[]
    try {
      entries = await readdir(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.startsWith('.')) continue // skip hidden
      const fullPath = join(dir, entry)
      const relative = fullPath.slice(baseDir.length + 1)
      if (matchGlob(pattern, relative)) {
        results.push(fullPath)
      }
      try {
        const { stat } = await import('fs/promises')
        const s = await stat(fullPath)
        if (s.isDirectory()) await walk(fullPath)
      } catch {
        // skip unreadable
      }
    }
  }

  await walk(baseDir)
  return results
}

/** Minimal glob match: supports * (non-slash) and ** (any segment) */
function matchGlob(pattern: string, str: string): boolean {
  const regexStr = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape regex chars except * and ?
    .replace(/\*\*/g, '__DSTAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DSTAR__/g, '.*')
    .replace(/\?/g, '[^/]')
  return new RegExp(`^${regexStr}$`).test(str)
}

export const GlobTool: ToolDefinition = {
  name: 'Glob',
  description:
    'Find files matching a glob pattern (e.g. "**/*.ts", "src/*.json"). Returns a list of matching file paths.',
  requiresPermission: false,
  inputSchema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'The glob pattern to match files against (e.g. "**/*.ts")',
      },
      base_dir: {
        type: 'string',
        description: 'The base directory to search in (default: current working directory)',
      },
    },
    required: ['pattern'],
  },
  async execute(input): Promise<ToolResult> {
    const pattern = input['pattern'] as string
    const baseDir = resolve((input['base_dir'] as string | undefined) ?? process.cwd())

    try {
      const matches = await glob(pattern, baseDir)
      if (matches.length === 0) {
        return { success: true, output: '(no matches found)' }
      }
      return { success: true, output: matches.join('\n') }
    } catch (err: unknown) {
      const e = err as Error
      return { success: false, output: '', error: e.message }
    }
  },
}
