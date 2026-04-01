/**
 * Build Command
 * Build the project
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

export const buildCommand: Command = {
  name: 'build',
  description: 'Build the project',
  usage: '/build [--watch]',
  examples: [
    '/build',
    '/build --watch',
    '/build -w',
  ],
  category: 'dev',
  options: [
    {
      name: '--watch',
      alias: 'w',
      description: 'Watch mode',
      type: 'boolean',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const watch = args['watch'] === true || args['w'] === true

    try {
      // Detect build system
      let buildCommand = ''

      // Check package.json for build script
      const packageJsonPath = resolve('package.json')
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        if (packageJson.scripts?.build) {
          buildCommand = 'npm run build'
        } else if (packageJson.scripts?.['build:watch']) {
          buildCommand = 'npm run build:watch'
        }
      }

      // Fall back to common build tools
      if (!buildCommand) {
        if (existsSync('tsconfig.json')) {
          buildCommand = 'tsc'
        } else if (existsSync('webpack.config.js')) {
          buildCommand = 'webpack'
        } else if (existsSync('vite.config.ts')) {
          buildCommand = 'vite build'
        } else if (existsSync('next.config.js')) {
          buildCommand = 'next build'
        } else if (existsSync('Cargo.toml')) {
          buildCommand = 'cargo build'
        } else if (existsSync('pom.xml')) {
          buildCommand = 'mvn compile'
        } else {
          return {
            success: false,
            error: 'No build system detected',
          }
        }
      }

      // Add watch option
      if (watch) {
        buildCommand += ' --watch'
      }

      // Run build
      const result = execSync(buildCommand, {
        encoding: 'utf-8',
        stdio: 'inherit',
      })

      return {
        success: true,
        message: '✅ Build succeeded',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Build failed',
      }
    }
  },
}
