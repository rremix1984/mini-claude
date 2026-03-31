/**
 * LintCodeTool - 运行代码检查
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

export const LintCodeTool: ToolDefinition = {
  name: 'lint_code',
  description: 'Run code linting using various linters (ESLint, Flake8, Pylint, etc.). Auto-detects linter.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to lint (default: current directory)',
      },
      linter: {
        type: 'string',
        description: 'Specific linter to use (default: auto-detect)',
      },
      fix: {
        type: 'boolean',
        description: 'Attempt to auto-fix issues (default: false)',
      },
      format: {
        type: 'string',
        description: 'Output format (default: text)',
      },
      args: {
        type: 'array',
        description: 'Additional arguments to pass to linter',
        items: { type: 'string' },
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      linter,
      fix = false,
      format = 'text',
      args = [],
    } = input as {
      path?: string
      linter?: string
      fix?: boolean
      format?: string
      args?: string[]
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

      // Detect or use specified linter
      const linterName = linter ? linter.toLowerCase() : null
      const linterConfig = linterName ? getLinterConfig(linterName) : detectLinter(projectPath)

      if (!linterConfig) {
        return {
          success: false,
          output: '',
          error: 'No linter detected. Please specify a linter.',
        }
      }

      // Build command
      const cmd = [...linterConfig.command]
      if (fix && linterConfig.fixFlag) {
        cmd.push(linterConfig.fixFlag)
      }
      cmd.push(...args)
      if (linterConfig.pathArg) {
        cmd.push(linterConfig.pathArg)
      }
      cmd.push(projectPath)

      // Run linter
      const result = execSync(cmd.join(' '), {
        cwd: projectPath,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      })

      return {
        success: true,
        output: `Running ${linterConfig.name}...\n\n${result}`,
      }
    } catch (error: any) {
      if (error.code === 127 || error.code === 'ENOENT') {
        return {
          success: false,
          output: '',
          error: `Linter "${linter}" is not installed or not in PATH.`,
        }
      }

      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}

// ─── Linter Detection ───────────────────────────────────────────

const LINTER_CONFIGS: LinterConfig[] = [
  // JavaScript/TypeScript
  {
    name: 'ESLint',
    detectionFiles: ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js'],
    command: ['npx', 'eslint'],
    fixFlag: '--fix',
    pathArg: undefined,
  },

  // Python
  {
    name: 'Flake8',
    detectionFiles: ['setup.cfg', '.flake8', 'tox.ini', 'pyproject.toml'],
    command: ['flake8'],
    fixFlag: undefined,
    pathArg: undefined,
  },
  {
    name: 'Pylint',
    detectionFiles: ['.pylintrc', 'pyproject.toml'],
    command: ['pylint'],
    fixFlag: undefined,
    pathArg: undefined,
  },
  {
    name: 'Black',
    detectionFiles: ['pyproject.toml', 'black.toml', '.black'],
    command: ['black'],
    fixFlag: undefined,
    pathArg: '--check',
  },

  // Go
  {
    name: 'gofmt',
    detectionFiles: ['go.mod', '.gofmt', '.gofmtrc.yaml'],
    command: ['gofmt'],
    fixFlag: '-w',
    pathArg: undefined,
  },
  {
    name: 'golint',
    detectionFiles: ['.golint'],
    command: ['golint'],
    fixFlag: undefined,
    pathArg: undefined,
  },

  // Rust
  {
    name: 'clippy',
    detectionFiles: ['Cargo.toml', '.clippy.toml'],
    command: ['cargo', 'clippy'],
    fixFlag: undefined,
    pathArg: undefined,
  },
  {
    name: 'rustfmt',
    detectionFiles: ['Cargo.toml', 'rustfmt.toml'],
    command: ['rustfmt'],
    fixFlag: undefined,
    pathArg: undefined,
  },

  // Ruby
  {
    name: 'RuboCop',
    detectionFiles: ['.rubocop.yml', '.rubocop.yml', 'config/.rubocop.yml'],
    command: ['rubocop'],
    fixFlag: '-a',
    pathArg: undefined,
  },

  // Java
  {
    name: 'Checkstyle',
    detectionFiles: ['checkstyle.xml', 'checkstyle-rules.xml'],
    command: ['java', '-jar', 'checkstyle'],
    fixFlag: undefined,
    pathArg: '-c',
  },

  // CSS/SCSS
  {
    name: 'Stylelint',
    detectionFiles: ['.stylelintrc', '.stylelintrc.json', 'stylelint.config.js'],
    command: ['npx', 'stylelint'],
    fixFlag: '--fix',
    pathArg: undefined,
  },
]

function detectLinter(projectPath: string): LinterConfig | null {
  for (const config of LINTER_CONFIGS) {
    for (const file of config.detectionFiles) {
      if (existsSync(resolve(projectPath, file))) {
        return config
      }
    }
  }

  return null
}

function getLinterConfig(name: string): LinterConfig | null {
  const lowerName = name.toLowerCase()
  return LINTER_CONFIGS.find(config => 
    config.name.toLowerCase() === lowerName
  ) || null
}

// ─── Type Definitions ─────────────────────────────────────────────

interface LinterConfig {
  name: string
  detectionFiles: string[]
  command: string[]
  fixFlag?: string
  pathArg?: string
}
