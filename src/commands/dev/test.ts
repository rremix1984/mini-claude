/**
 * Test Command
 * Run project tests
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

export const testCommand: Command = {
  name: 'test',
  description: 'Run project tests',
  usage: '/test [pattern] [--watch] [--coverage]',
  examples: [
    '/test',
    '/test auth',
    '/test --coverage',
    '/test -w',
  ],
  category: 'dev',
  options: [
    {
      name: '--watch',
      alias: 'w',
      description: 'Watch mode',
      type: 'boolean',
    },
    {
      name: '--coverage',
      alias: 'c',
      description: 'Generate coverage report',
      type: 'boolean',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const pattern = args._[0] || ''
    const watch = args['watch'] === true || args['w'] === true
    const coverage = args['coverage'] === true || args['c'] === true

    try {
      // Detect test framework
      let testCommand = ''

      // Check package.json for test script
      const packageJsonPath = resolve('package.json')
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        if (packageJson.scripts?.test) {
          testCommand = 'npm test'
        } else if (packageJson.scripts?.['test:unit']) {
          testCommand = 'npm run test:unit'
        } else if (packageJson.scripts?.['test:watch']) {
          testCommand = 'npm run test:watch'
        }
      }

      // Fall back to common frameworks
      if (!testCommand) {
        if (existsSync('jest.config.js') || existsSync('jest.config.ts')) {
          testCommand = 'jest'
        } else if (existsSync('vitest.config.ts')) {
          testCommand = 'vitest'
        } else if (existsSync('test')) {
          testCommand = 'npm test'
        } else {
          return {
            success: false,
            error: 'No test framework detected',
          }
        }
      }

      // Add options
      if (pattern) {
        testCommand += ` ${pattern}`
      }

      if (watch) {
        testCommand += ' --watch'
      }

      if (coverage) {
        testCommand += ' --coverage'
      }

      // Run tests
      const result = execSync(testCommand, {
        encoding: 'utf-8',
        stdio: 'inherit',
      })

      return {
        success: true,
        message: '✅ Tests passed',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Tests failed',
      }
    }
  },
}
