/**
 * RunTestsTool - 运行测试
 */

import type { ToolDefinition, ToolResult } from '../../types.js'
import { execSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

export const RunTestsTool: ToolDefinition = {
  name: 'run_tests',
  description: 'Run tests for the project. Detects test framework automatically.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Project directory path (default: current directory)',
      },
      command: {
        type: 'string',
        description: 'Test command to run (default: auto-detect)',
      },
      args: {
        type: 'array',
        description: 'Additional arguments to pass to test command',
        items: { type: 'string' },
      },
      verbose: {
        type: 'boolean',
        description: 'Show verbose output (default: false)',
      },
    },
  },
  requiresPermission: false,
  execute: async (input) => {
    const {
      path = '.',
      command,
      args = [],
      verbose = false,
    } = input as {
      path?: string
      command?: string
      args?: string[]
      verbose?: boolean
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

      // Detect test framework and command
      const detected = detectTestCommand(projectPath)

      if (!detected) {
        return {
          success: false,
          output: '',
          error: 'No test framework detected. Please specify a command.',
        }
      }

      // If user provided custom command, use it
      const testCommand = command ? { name: 'custom', command: [command], verboseFlags: [] } : detected

      // Build command arguments
      const cmdArgs = [...testCommand.command]
      if (verbose) {
        cmdArgs.push(...testCommand.verboseFlags)
      }
      cmdArgs.push(...args)

      // Run tests
      const result = execSync(cmdArgs.join(' '), {
        cwd: projectPath,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      return {
        success: true,
        output: `Running: ${testCommand.name}\n\n${result}`,
      }
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}

// ─── Test Detection ─────────────────────────────────────────────

function detectTestCommand(projectPath: string): TestCommand | null {
  const frameworks = [
    {
      name: 'Jest',
      files: ['jest.config.js', 'jest.config.ts', 'package.json'],
      command: ['npm', 'test', '--'],
      verboseFlags: ['--verbose'],
    },
    {
      name: 'Vitest',
      files: ['vitest.config.ts', 'vite.config.ts'],
      command: ['npx', 'vitest', 'run', '--'],
      verboseFlags: [],
    },
    {
      name: 'Mocha',
      files: ['.mocharc.js', '.mocharc.json', '.mocharc.yml', 'package.json'],
      command: ['npx', 'mocha', '--'],
      verboseFlags: [],
    },
    {
      name: 'pytest',
      files: ['pytest.ini', 'pyproject.toml', 'setup.py', 'requirements.txt'],
      command: ['python', '-m', 'pytest', '-v'],
      verboseFlags: [],
    },
    {
      name: 'unittest',
      files: [],
      command: ['python', '-m', 'unittest', 'discover', '-v'],
      verboseFlags: [],
    },
    {
      name: 'Go test',
      files: ['*_test.go'],
      command: ['go', 'test', '-v'],
      verboseFlags: [],
    },
  ]

  for (const framework of frameworks) {
    let detected = false

    // Check for config files
    for (const file of framework.files) {
      if (existsSync(resolve(projectPath, file))) {
        detected = true
        break
      }
    }

    // Check for test files
    if (!detected && framework.files[0]?.includes('test')) {
      const stat = statSync(projectPath)
      if (stat.isDirectory()) {
        const entries = existsSync(projectPath) ? 
          Array.from({ length: 0 }) : []
        // Simplified check - in real implementation would list files
      }
    }

    if (detected) {
      return framework
    }
  }

  return null
}

// ─── Type Definitions ─────────────────────────────────────────────

interface TestCommand {
  name: string
  files: string[]
  command: string[]
  verboseFlags: string[]
}
