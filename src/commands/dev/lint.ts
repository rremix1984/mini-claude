/**
 * Lint Command
 * Run code linting
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

export const lintCommand: Command = {
  name: 'lint',
  description: 'Run code linting',
  usage: '/lint [path] [--fix]',
  examples: [
    '/lint',
    '/lint src',
    '/lint --fix',
    '/lint src --fix',
  ],
  category: 'dev',
  options: [
    {
      name: '--fix',
      alias: 'f',
      description: 'Auto-fix issues',
      type: 'boolean',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const path = args._[0] || '.'
    const fix = args['fix'] === true || args['f'] === true

    try {
      // Detect linter
      let lintCommand = ''

      // Check package.json for lint script
      const packageJsonPath = resolve('package.json')
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        if (packageJson.scripts?.lint) {
          lintCommand = 'npm run lint'
        }
      }

      // Fall back to common linters
      if (!lintCommand) {
        if (existsSync('.eslintrc.js') || existsSync('.eslintrc.json') || existsSync('eslint.config.js')) {
          lintCommand = 'eslint'
        } else if (existsSync('.flake8') || existsSync('setup.cfg')) {
          lintCommand = 'flake8'
        } else if (existsSync('pyproject.toml')) {
          lintCommand = 'pylint'
        } else {
          return {
            success: false,
            error: 'No linter detected',
          }
        }
      }

      // Add path
      lintCommand += ` ${path}`

      // Add fix option
      if (fix) {
        lintCommand += ' --fix'
      }

      // Run linter
      const result = execSync(lintCommand, {
        encoding: 'utf-8',
        stdio: 'inherit',
      })

      return {
        success: true,
        message: '✅ Lint passed',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Linting failed',
      }
    }
  },
}
