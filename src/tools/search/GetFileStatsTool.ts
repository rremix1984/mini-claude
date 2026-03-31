/**
 * GetFileStatsTool - 获取文件统计信息
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

export const GetFileStatsTool: ToolDefinition = {
  name: 'get_file_stats',
  description: 'Get code statistics for files or directory including line counts, comment ratios, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to file or directory',
      },
      includeDirs: {
        type: 'boolean',
        description: 'Include directories in stats (default: false)',
      },
      recursive: {
        type: 'boolean',
        description: 'Recursively analyze directory (default: true)',
      },
    },
    required: ['path'],
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path,
      includeDirs = false,
      recursive = true,
    } = input as {
      path: string
      includeDirs?: boolean
      recursive?: boolean
    }

    try {
      const stats = await analyzePath(path, {
        includeDirs,
        recursive,
      })

      return {
        success: true,
        output: formatStats(stats),
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}

// ─── Analysis Functions ─────────────────────────────────────────────

async function analyzePath(
  path: string,
  options: {
    includeDirs: boolean
    recursive: boolean
  },
): Promise<FileStats> {
  const stats = statSync(path)

  if (stats.isDirectory()) {
    return analyzeDirectory(path, options)
  }

  return await analyzeFile(path)
}

async function analyzeFile(filePath: string): Promise<FileStats> {
  const content = readFileSync(filePath, 'utf-8')
  const ext = extname(filePath).toLowerCase()

  // Count lines
  const lines = content.split('\n')
  const lineCount = lines.length

  // Count characters (without newlines)
  const charCount = content.replace(/\n/g, '').length

  // Detect comments based on extension
  const commentStats = detectComments(content, ext)

  // Count non-empty, non-comment lines (code lines)
  const codeLines = lines.filter(line => {
    const trimmed = line.trim()
    if (!trimmed) return false
    if (commentStats.singleLineComments.some(c => trimmed.startsWith(c))) return false
    return true
  }).length

  return {
    files: 1,
    totalLines: lineCount,
    codeLines,
    commentLines: commentStats.commentLines,
    blankLines: lines.filter(l => !l.trim()).length,
    charCount,
    languages: getLanguage(ext),
    largestFile: {
      path: filePath,
      lines: lineCount,
    },
  }
}

async function analyzeDirectory(
  dirPath: string,
  options: {
    includeDirs: boolean
    recursive: boolean
  },
): Promise<FileStats> {
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const stats: FileStats = {
    files: 0,
    totalLines: 0,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    charCount: 0,
    languages: {} as Record<string, number>,
    largestFile: null as any,
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const fullPath = join(dirPath, entry.name)

    if (entry.isDirectory() && options.recursive) {
      const subStats = await analyzeDirectory(fullPath, options)
      stats.files += subStats.files
      stats.totalLines += subStats.totalLines
      stats.codeLines += subStats.codeLines
      stats.commentLines += subStats.commentLines
      stats.blankLines += subStats.blankLines
      stats.charCount += subStats.charCount

      // Merge language stats
      for (const [lang, count] of Object.entries(subStats.languages)) {
        stats.languages[lang] = (stats.languages[lang] || 0) + count
      }

      // Update largest file
      if (!stats.largestFile || (subStats.largestFile && subStats.largestFile.lines > stats.largestFile.lines)) {
        stats.largestFile = subStats.largestFile
      }

      if (options.includeDirs) {
        stats.files++
      }
    } else if (entry.isFile()) {
      const fileStats = await analyzeFile(fullPath)
      stats.files++
      stats.totalLines += fileStats.totalLines
      stats.codeLines += fileStats.codeLines
      stats.commentLines += fileStats.commentLines
      stats.blankLines += fileStats.blankLines
      stats.charCount += fileStats.charCount

      // Merge language stats
      for (const [lang, count] of Object.entries(fileStats.languages)) {
        stats.languages[lang] = (stats.languages[lang] || 0) + count
      }

      // Update largest file
      if (!stats.largestFile || fileStats.totalLines > stats.largestFile.lines) {
        stats.largestFile = fileStats.largestFile
      }
    }
  }

  return stats
}

function detectComments(content: string, ext: string): CommentStats {
  const commentStats: CommentStats = {
    singleLineComments: [],
    multiLineCommentStart: null,
    multiLineCommentEnd: null,
    commentLines: 0,
  }

  // Language-specific comment patterns
  const commentPatterns: Record<string, CommentPatterns> = {
    '.js': { single: ['//'], start: '/*', end: '*/' },
    '.ts': { single: ['//'], start: '/*', end: '*/' },
    '.tsx': { single: ['//'], start: '/*', end: '*/' },
    '.jsx': { single: ['//'], start: '/*', end: '*/' },
    '.py': { single: ['#'], start: null, end: null },
    '.rb': { single: ['#'], start: null, end: null },
    '.go': { single: ['//'], start: '/*', end: '*/' },
    '.rs': { single: ['//'], start: '/*', end: '*/' },
    '.java': { single: ['//'], start: '/*', end: '*/' },
    '.c': { single: ['//'], start: '/*', end: '*/' },
    '.cpp': { single: ['//'], start: '/*', end: '*/' },
    '.h': { single: ['//'], start: '/*', end: '*/' },
    '.css': { single: [], start: '/*', end: '*/' },
    '.scss': { single: ['//'], start: '/*', end: '*/' },
    '.html': { single: [], start: '<!--', end: '-->' },
    '.xml': { single: [], start: '<!--', end: '-->' },
    '.md': { single: [], start: null, end: null },
  }

  const patterns = commentPatterns[ext] || commentPatterns['.js']
  commentStats.singleLineComments = patterns.single
  commentStats.multiLineCommentStart = patterns.start
  commentStats.multiLineCommentEnd = patterns.end

  // Count comment lines
  const lines = content.split('\n')
  let inMultiLineComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      commentStats.commentLines++
      continue
    }

    // Check multi-line comments
    if (commentStats.multiLineCommentStart && commentStats.multiLineCommentEnd) {
      if (inMultiLineComment) {
        if (trimmed.includes(commentStats.multiLineCommentEnd)) {
          inMultiLineComment = false
        }
        commentStats.commentLines++
        continue
      } else if (trimmed.includes(commentStats.multiLineCommentStart)) {
        inMultiLineComment = true
        commentStats.commentLines++
        continue
      }
    }

    // Check single-line comments
    if (commentStats.singleLineComments.length > 0) {
      const isComment = commentStats.singleLineComments.some(comment =>
        trimmed.startsWith(comment),
      )

      if (isComment) {
        commentStats.commentLines++
        continue
      }
    }
  }

  return commentStats
}

function getLanguage(ext: string): Record<string, number> {
  const languageMap: Record<string, string> = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (JSX)',
    '.jsx': 'JavaScript (JSX)',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.css': 'CSS',
    '.scss': 'Sass/SCSS',
    '.html': 'HTML',
    '.xml': 'XML',
    '.md': 'Markdown',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
  }

  const language = languageMap[ext] || 'Other'

  return {
    [language]: 1,
  }
}

function formatStats(stats: FileStats): string {
  const lines: string[] = []

  lines.push('Code Statistics:')
  lines.push('==================')
  lines.push('')
  lines.push(`Files analyzed: ${stats.files}`)
  lines.push(`Total lines: ${stats.totalLines}`)
  lines.push(`Code lines: ${stats.codeLines}`)
  lines.push(`Comment lines: ${stats.commentLines}`)
  lines.push(`Blank lines: ${stats.blankLines}`)
  lines.push(`Total characters: ${stats.charCount}`)
  lines.push('')

  // Calculate ratios
  if (stats.totalLines > 0) {
    const commentRatio = ((stats.commentLines / stats.totalLines) * 100).toFixed(1)
    const codeRatio = ((stats.codeLines / stats.totalLines) * 100).toFixed(1)
    const blankRatio = ((stats.blankLines / stats.totalLines) * 100).toFixed(1)

    lines.push(`Comment ratio: ${commentRatio}%`)
    lines.push(`Code ratio: ${codeRatio}%`)
    lines.push(`Blank ratio: ${blankRatio}%`)
    lines.push('')
  }

  // Language breakdown
  if (Object.keys(stats.languages).length > 0) {
    lines.push('Languages:')
    lines.push('-----------')
    const sortedLanguages = Object.entries(stats.languages)
      .sort(([, a], [, b]) => b - a)

    for (const [lang, count] of sortedLanguages) {
      const percentage = ((count / stats.totalLines) * 100).toFixed(1)
      lines.push(`  ${lang}: ${count} lines (${percentage}%)`)
    }
    lines.push('')
  }

  // Largest file
  if (stats.largestFile) {
    lines.push('Largest file:')
    lines.push('--------------')
    lines.push(`  Path: ${stats.largestFile.path}`)
    lines.push(`  Lines: ${stats.largestFile.lines}`)
  }

  return lines.join('\n')
}

// ─── Type Definitions ─────────────────────────────────────────────

interface CommentPatterns {
  single: string[]
  start: string | null
  end: string | null
}

interface CommentStats {
  singleLineComments: string[]
  multiLineCommentStart: string | null
  multiLineCommentEnd: string | null
  commentLines: number
}

interface FileStats {
  files: number
  totalLines: number
  codeLines: number
  commentLines: number
  blankLines: number
  charCount: number
  languages: Record<string, number>
  largestFile: {
    path: string
    lines: number
  } | null
}
