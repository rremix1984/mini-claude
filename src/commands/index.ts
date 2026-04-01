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
export { logsCommand } from './core/logs.js'
export { helpCommand } from './core/help.js'
export { clearCommand } from './core/clear.js'
export { exitCommand } from './core/exit.js'

// Import dev commands
export { commitCommand } from './dev/commit.js'
export { diffCommand } from './dev/diff.js'
export { testCommand } from './dev/test.js'
export { lintCommand } from './dev/lint.js'
export { buildCommand } from './dev/build.js'
export { runCommand } from './dev/run.js'

// Import advanced commands
export { contextCommand } from './advanced/context.js'
export { costCommand } from './advanced/cost.js'
export { doctorCommand } from './advanced/doctor.js'
export { exportCommand } from './advanced/export.js'
export { searchCommand } from './advanced/search.js'

// ─── Register All Commands ─────────────────────────────────────────────

import { getCommandRegistry } from './CommandRegistry.js'

// Core commands
import { configCommand as cfgCmd } from './core/config.js'
import { historyCommand as histCmd } from './core/history.js'
import { resumeCommand as resumeCmd } from './core/resume.js'
import { logsCommand as logsCmd } from './core/logs.js'
import { helpCommand as helpCmd } from './core/help.js'
import { clearCommand as clearCmd } from './core/clear.js'
import { exitCommand as exitCmd } from './core/exit.js'

// Dev commands
import { commitCommand as commitCmd } from './dev/commit.js'
import { diffCommand as diffCmd } from './dev/diff.js'
import { testCommand as testCmd } from './dev/test.js'
import { lintCommand as lintCmd } from './dev/lint.js'
import { buildCommand as buildCmd } from './dev/build.js'
import { runCommand as runCmd } from './dev/run.js'

// Advanced commands
import { contextCommand as ctxCmd } from './advanced/context.js'
import { costCommand as costCmd } from './advanced/cost.js'
import { doctorCommand as docCmd } from './advanced/doctor.js'
import { exportCommand as exportCmd } from './advanced/export.js'
import { searchCommand as searchCmd } from './advanced/search.js'

/**
 * Initialize and register all commands
 */
export function registerAllCommands(): void {
  const registry = getCommandRegistry()

  // Core commands
  registry.register(helpCmd)
  registry.register(clearCmd)
  registry.register(exitCmd)
  registry.register(cfgCmd)
  registry.register(histCmd)
  registry.register(resumeCmd)
  registry.register(logsCmd)

  // Dev commands
  registry.register(commitCmd)
  registry.register(diffCmd)
  registry.register(testCmd)
  registry.register(lintCmd)
  registry.register(buildCmd)
  registry.register(runCmd)

  // Advanced commands
  registry.register(ctxCmd)
  registry.register(costCmd)
  registry.register(docCmd)
  registry.register(exportCmd)
  registry.register(searchCmd)
}

// Auto-register on import
registerAllCommands()
