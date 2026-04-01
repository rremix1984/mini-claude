/**
 * Help Command
 * Display help information for commands
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import { getCommandRegistry } from '../CommandRegistry.js'

export const helpCommand: Command = {
  name: 'help',
  aliases: ['?', 'h'],
  description: 'Display help information for commands',
  usage: '/help [command]',
  examples: [
    '/help',
    '/help config',
    '/help history',
  ],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const registry = getCommandRegistry()
    const targetCommand = args._[0]

    // Show help for specific command
    if (targetCommand) {
      const command = registry.get(targetCommand)

      if (!command) {
        return {
          success: false,
          error: `Unknown command: ${targetCommand}`,
        }
      }

      let output = `📖 ${command.name}\n\n`
      output += `Description: ${command.description}\n`

      if (command.usage) {
        output += `\nUsage:\n  ${command.usage}\n`
      }

      if (command.aliases && command.aliases.length > 0) {
        output += `\nAliases: ${command.aliases.join(', ')}\n`
      }

      if (command.options && command.options.length > 0) {
        output += `\nOptions:\n`
        command.options.forEach((opt) => {
          const flags = [opt.name]
          if (opt.alias) {
            flags.push(`-${opt.alias}`)
          }
          output += `  ${flags.join(', ')}: ${opt.description}`
          if (opt.choices) {
            output += ` [${opt.choices.join('|')}]`
          }
          if (opt.default !== undefined) {
            output += ` (default: ${opt.default})`
          }
          output += '\n'
        })
      }

      if (command.examples && command.examples.length > 0) {
        output += `\nExamples:\n`
        command.examples.forEach((example) => {
          output += `  ${example}\n`
        })
      }

      return {
        success: true,
        message: output,
      }
    }

    // Show all commands
    const commands = registry.getVisible()
    const categorized = new Map<string, Command[]>()

    commands.forEach((cmd) => {
      const category = cmd.category || 'other'
      if (!categorized.has(category)) {
        categorized.set(category, [])
      }
      categorized.get(category)!.push(cmd)
    })

    let output = '📚 Available Commands\n\n'

    // Display commands by category
    const categoryOrder = ['core', 'dev', 'advanced', 'other']

    categoryOrder.forEach((category) => {
      if (categorized.has(category)) {
        const cmds = categorized.get(category)!
        output += `${category.charAt(0).toUpperCase() + category.slice(1)}:\n`
        cmds.forEach((cmd) => {
          const aliases = cmd.aliases ? ` (${cmd.aliases[0]})` : ''
          output += `  /${cmd.name}${aliases} - ${cmd.description}\n`
        })
        output += '\n'
      }
    })

    // Display uncategorized commands
    categorized.forEach((cmds, category) => {
      if (!categoryOrder.includes(category)) {
        output += `${category.charAt(0).toUpperCase() + category.slice(1)}:\n`
        cmds.forEach((cmd) => {
          const aliases = cmd.aliases ? ` (${cmd.aliases[0]})` : ''
          output += `  /${cmd.name}${aliases} - ${cmd.description}\n`
        })
        output += '\n'
      }
    })

    output += `Use /help <command> for more information about a specific command.\n`
    output += `Total: ${commands.length} commands available.`

    return {
      success: true,
      message: output,
    }
  },
}
