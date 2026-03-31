/**
 * Commands Module
 * Slash command system for Mini-Claude
 */

export * from './types.js'
export { CommandRegistry, getCommandRegistry, resetCommandRegistry } from './CommandRegistry.js'

// Import core commands
export { configCommand } from './core/config.js'
export { historyCommand } from './core/history.js'
export { resumeCommand } from './core/resume.js'

// ─── Register Core Commands ───────────────────────────────────────────────

import { getCommandRegistry } from './CommandRegistry.js'
import { configCommand } from './core/config.js'
import { historyCommand } from './core/history.js'
import { resumeCommand } from './core/resume.js'

/**
 * Initialize and register all core commands
 */
export function registerCoreCommands(): void {
  const registry = getCommandRegistry()

  // Register core commands
  registry.register(configCommand)
  registry.register(historyCommand)
  registry.register(resumeCommand)
}

// Auto-register on import
registerCoreCommands()
