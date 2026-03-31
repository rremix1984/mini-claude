/**
 * AnalyzeProjectTool - 分析项目结构和技术栈
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const AnalyzeProjectTool: ToolDefinition = {
  name: 'analyze_project',
  description: 'Analyze project structure, detect package manager, dependencies, and generate project tree.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Project directory path (default: current directory)',
      },
      includeFiles: {
        type: 'boolean',
        description: 'Include files in tree (default: false)',
      },
      maxDepth: {
        type: 'number',
        description: 'Maximum depth for tree (default: 5)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      includeFiles = false,
      maxDepth = 5,
    } = input as {
      path?: string
      includeFiles?: boolean
      maxDepth?: number
    }

    try {
      const projectPath = resolve(path)

      if (!existsSync(projectPath)) {
        return {
          success: false,
          output: '',
          error: `Project path not found: ${projectPath}`,
        }
      }

      const analysis = await analyzeProject(projectPath, {
        includeFiles,
        maxDepth,
      })

      return {
        success: true,
        output: formatAnalysis(analysis),
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

// ─── Analysis Functions ─────────────────────────────────────────

async function analyzeProject(
  projectPath: string,
  options: {
    includeFiles: boolean
    maxDepth: number
  },
): Promise<ProjectAnalysis> {
  const analysis: ProjectAnalysis = {
    path: projectPath,
    packageManager: detectPackageManager(projectPath),
    languages: detectLanguages(projectPath),
    structure: generateTree(projectPath, options),
    configFiles: detectConfigFiles(projectPath),
    dependencies: getDependencies(projectPath),
  }

  return analysis
}

function detectPackageManager(projectPath: string): PackageManager {
  const managers = [
    { name: 'pnpm', file: 'pnpm-lock.yaml' },
    { name: 'yarn', file: 'yarn.lock' },
    { name: 'npm', file: 'package-lock.json' },
  ]

  for (const { name, file } of managers) {
    if (existsSync(join(projectPath, file))) {
      return name as PackageManager
    }
  }

  if (existsSync(join(projectPath, 'package.json'))) {
    return 'npm'
  }

  return 'unknown'
}

function detectLanguages(projectPath: string): LanguageDetection {
  const languages: LanguageDetection = {}

  const languageFiles: Record<string, string[]> = {
    'TypeScript': ['ts', 'tsx'],
    'JavaScript': ['js', 'jsx'],
    'Python': ['py'],
    'Java': ['java'],
    'Go': ['go'],
    'Rust': ['rs'],
    'Ruby': ['rb'],
    'C#': ['cs'],
    'C++': ['cpp', 'cc', 'h'],
    'C': ['c'],
    'HTML': ['html', 'htm'],
    'CSS': ['css', 'scss', 'sass'],
    'PHP': ['php'],
    'Swift': ['swift'],
    'Kotlin': ['kt'],
    'Shell': ['sh', 'bash'],
  }

  const extName = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    return ext || ''
  }

  const countFiles = (dir: string, depth = 0): void => {
    if (depth > 5) return

    try {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stats = statSync(fullPath)

        if (stats.isDirectory()) {
          countFiles(fullPath, depth + 1)
        } else if (stats.isFile()) {
          const ext = extName(entry)
          for (const [lang, extensions] of Object.entries(languageFiles)) {
            if (extensions.includes(ext)) {
              languages[lang] = (languages[lang] || 0) + 1
              break
            }
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  countFiles(projectPath)

  return languages
}

function generateTree(projectPath: string, options: { includeFiles: boolean, maxDepth: number }): string {
  const lines: string[] = []
  const rootName = projectPath.split('/').pop() || projectPath

  function buildTree(dirPath: string, prefix: string, depth: number): void {
    if (depth > options.maxDepth) return

    const entries = readdirSync(dirPath)
    const entriesCount = entries.length

    entries.forEach((entry, index) => {
      const fullPath = join(dirPath, entry)
      const isLast = index === entriesCount - 1
      const stats = statSync(fullPath)

      const connector = isLast ? '└── ' : '├── '
      const prefixForChildren = prefix + (isLast ? '    ' : '│   ')

      if (stats.isDirectory() && !entry.startsWith('.')) {
        lines.push(`${prefix}${connector}${entry}/`)
        buildTree(fullPath, prefixForChildren, depth + 1)
      } else if (options.includeFiles && stats.isFile() && !entry.startsWith('.')) {
        lines.push(`${prefix}${connector}${entry}`)
      }
    })
  }

  lines.push(rootName)
  buildTree(projectPath, '', 0)

  return lines.join('\n')
}

function detectConfigFiles(projectPath: string): string[] {
  const configFiles: string[] = []

  const configPatterns = [
    'package.json',
    'tsconfig.json',
    'jsconfig.json',
    'vite.config.ts',
    'webpack.config.js',
    '.eslintrc',
    '.eslintrc.json',
    '.prettierrc',
    '.prettierrc.json',
    '.gitignore',
    '.env',
    'Dockerfile',
    'docker-compose.yml',
    'requirements.txt',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
  ]

  for (const pattern of configPatterns) {
    if (existsSync(join(projectPath, pattern))) {
      configFiles.push(pattern)
    }
  }

  return configFiles
}

function getDependencies(projectPath: string): DependencyInfo {
  const info: DependencyInfo = {
    packageManager: 'unknown',
    dependencies: {},
    devDependencies: {},
    total: 0,
  }

  const packageJsonPath = join(projectPath, 'package.json')

  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      info.packageManager = 'npm'
      info.dependencies = packageJson.dependencies || {}
      info.devDependencies = packageJson.devDependencies || {}
      info.total = Object.keys(info.dependencies).length + Object.keys(info.devDependencies).length
    } catch {
      // Invalid package.json
    }
  }

  return info
}

function formatAnalysis(analysis: ProjectAnalysis): string {
  const lines: string[] = []

  lines.push('Project Analysis')
  lines.push('==================')
  lines.push('')
  lines.push(`Project Path: ${analysis.path}`)
  lines.push(`Package Manager: ${analysis.packageManager}`)
  lines.push('')

  // Languages
  if (Object.keys(analysis.languages).length > 0) {
    lines.push('Languages:')
    lines.push('----------')
    const sortedLanguages = Object.entries(analysis.languages)
      .sort(([, a], [, b]) => b - a)

    for (const [lang, count] of sortedLanguages) {
      lines.push(`  ${lang}: ${count} files`)
    }
    lines.push('')
  }

  // Dependencies
  if (analysis.dependencies.total > 0) {
    lines.push('Dependencies:')
    lines.push('-------------')
    lines.push(`  Package Manager: ${analysis.dependencies.packageManager}`)
    lines.push(`  Production: ${Object.keys(analysis.dependencies.dependencies).length}`)
    lines.push(`  Development: ${Object.keys(analysis.dependencies.devDependencies).length}`)
    lines.push(`  Total: ${analysis.dependencies.total}`)
    lines.push('')

    // Top dependencies
    const allDeps = Object.keys({ ...analysis.dependencies.dependencies, ...analysis.dependencies.devDependencies })
    const topDeps = allDeps.slice(0, 5)
    if (topDeps.length > 0) {
      lines.push('  Top Dependencies:')
      for (const dep of topDeps) {
        lines.push(`    - ${dep}`)
      }
    }
    lines.push('')
  }

  // Config files
  if (analysis.configFiles.length > 0) {
    lines.push('Configuration Files:')
    lines.push('--------------------')
    for (const file of analysis.configFiles) {
      lines.push(`  - ${file}`)
    }
    lines.push('')
  }

  // Project structure
  lines.push('Project Structure:')
  lines.push('------------------')
  lines.push(analysis.structure)

  return lines.join('\n')
}

// ─── Type Definitions ─────────────────────────────────────────────

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'unknown'

type LanguageDetection = Record<string, number>

interface ProjectAnalysis {
  path: string
  packageManager: PackageManager
  languages: LanguageDetection
  structure: string
  configFiles: string[]
  dependencies: DependencyInfo
}

interface DependencyInfo {
  packageManager: PackageManager | 'unknown'
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  total: number
}
