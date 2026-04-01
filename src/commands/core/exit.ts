/**
 * Exit Command
 * Exit the program
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'

export const exitCommand: Command = {
  name: 'exit',
  aliases: ['quit', 'q'],
  description: 'Exit the program',
  usage: '/exit',
  examples: ['/exit', '/quit', '/q'],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    return {
      success: true,
      message: '👋 Goodbye!',
      data: { exit: true },
    }
  },
}
