/**
 * Doctor Command
 * Diagnose environment issues
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { homedir } from 'node:os'
import { version } from 'node:process'

export const doctorCommand: Command = {
  name: 'doctor',
  description: 'Diagnose environment and configuration issues',
  usage: '/doctor',
  examples: ['/doctor'],
  category: 'advanced',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const issues: string[] = []
    const warnings: string[] = []
    const info: string[] = []

    try {
      // Check Node.js version
      const nodeVersion = version
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
      if (majorVersion < 18) {
        issues.push(`Node.js version ${nodeVersion} is outdated (requires >= 18)`)
      } else {
        info.push(`✓ Node.js ${nodeVersion}`)
      }

      // Check package.json
      const packageJsonPath = resolve('package.json')
      if (!existsSync(packageJsonPath)) {
        issues.push('package.json not found')
      } else {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        info.push(`✓ package.json found: ${packageJson.name} v${packageJson.version}`)
      }

      // Check TypeScript
      if (existsSync('tsconfig.json')) {
        info.push('✓ TypeScript config found')
        try {
          execSync('tsc --version', { stdio: 'pipe' })
          info.push('✓ TypeScript compiler available')
        } catch {
          warnings.push('TypeScript compiler not found')
        }
      }

      // Check dependencies
      const nodeModulesPath = resolve('node_modules')
      if (!existsSync(nodeModulesPath)) {
        warnings.push('node_modules not found. Run: npm install')
      } else {
        info.push('✓ node_modules found')
      }

      // Check .miniclaude config
      const miniclaudeConfigPath = join(homedir(), '.miniclaude', 'config.json')
      if (existsSync(miniclaudeConfigPath)) {
        info.push('✓ Mini-Claude config found')
      } else {
        warnings.push('Mini-Claude config not found. Will use defaults.')
      }

      // Check Git
      try {
        execSync('git --version', { stdio: 'pipe' })
        execSync('git rev-parse --git-dir', { stdio: 'pipe' })
        info.push('✓ Git repository detected')
      } catch {
        warnings.push('Not a Git repository')
      }

      // Check common dev tools
      const devTools = ['npm', 'git', 'node', 'tsc']
      devTools.forEach((tool) => {
        try {
          execSync(`${tool} --version`, { stdio: 'pipe' })
          info.push(`✓ ${tool} available`)
        } catch {
          warnings.push(`${tool} not available`)
        }
      })

      // Build output
      let output = '🏥 Mini-Claude Doctor\n\n'

      if (issues.length > 0) {
        output += '❌ Issues:\n'
        issues.forEach((issue) => {
          output += `  ${issue}\n`
        })
        output += '\n'
      }

      if (warnings.length > 0) {
        output += '⚠️  Warnings:\n'
        warnings.forEach((warning) => {
          output += `  ${warning}\n`
        })
        output += '\n'
      }

      output += '✓ Environment Status:\n'
      info.forEach((item) => {
        output += `  ${item}\n`
      })

      output += '\n'

      if (issues.length === 0) {
        output += '🎉 Your environment looks good!'
      } else {
        output += '🔧 Please fix the issues above.'
      }

      return {
        success: issues.length === 0,
        message: output,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
