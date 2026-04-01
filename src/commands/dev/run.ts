/**
 * Run Command
 * Run a script or executable
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

export const runCommand: Command = {
  name: 'run',
  description: 'Run a script from package.json or a command',
  usage: '/run <script|command>',
  examples: [
    '/run dev',
    '/run test',
    '/run build',
    '/run "node server.js"',
  ],
  category: 'dev',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const scriptOrCommand = args._[0] || ''

    if (!scriptOrCommand) {
      return {
        success: false,
        error: 'Usage: /run <script|command>',
      }
    }

    try {
      // Check package.json for scripts
      const packageJsonPath = resolve('package.json')
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        if (packageJson.scripts?.[scriptOrCommand]) {
          // Run script from package.json
          const command = `npm run ${scriptOrCommand}`
          execSync(command, {
            encoding: 'utf-8',
            stdio: 'inherit',
          })

          return {
            success: true,
            message: `✅ Script '${scriptOrCommand}' completed`,
          }
        }
      }

      // Run as direct command
      execSync(scriptOrCommand, {
        encoding: 'utf-8',
        stdio: 'inherit',
        shell: true,
      } as any)

      return {
        success: true,
        message: `✅ Command completed`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
