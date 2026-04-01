/**
 * Clear Command
 * Clear the current conversation
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls', 'reset'],
  description: 'Clear the current conversation history',
  usage: '/clear',
  examples: ['/clear', '/cls'],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    // Note: This command will need to integrate with the session/message management
    // For now, return a success message
    return {
      success: true,
      message: '✅ Conversation cleared. Starting fresh.',
    }
  },
}
