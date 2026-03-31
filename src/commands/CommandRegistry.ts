/**
 * Command Registry
 * Manages registration and execution of slash commands
 */

import type { Command, CommandArgs, CommandContext, CommandResult, CommandRegistry as ICommandRegistry } from './types.js'

// ─── Command Registry Implementation ────────────────────────────────────────

export class CommandRegistry implements ICommandRegistry {
  private commands = new Map<string, Command>()
  private aliasMap = new Map<string, string>() // Maps alias to canonical name

  /**
   * Register a new command
   */
  public register(command: Command): void {
    // Store the main command
    this.commands.set(command.name, command)

    // Store aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliasMap.set(alias, command.name)
      }
    }
  }

  /**
   * Get a command by name or alias
   */
  public get(name: string): Command | undefined {
    // Check if it's an alias
    const canonicalName = this.aliasMap.get(name)
    const lookupName = canonicalName ?? name

    return this.commands.get(lookupName)
  }

  /**
   * Get all registered commands
   */
  public getAll(): Command[] {
    return Array.from(this.commands.values())
  }

  /**
   * Get all visible (non-hidden) commands
   */
  public getVisible(): Command[] {
    return this.getAll().filter(cmd => !cmd.hidden)
  }

  /**
   * Get commands by category
   */
  public getByCategory(category: string): Command[] {
    return this.getAll().filter(cmd => cmd.category === category)
  }

  /**
   * Parse command input into name and args
   */
  public parse(input: string): { name: string; args: CommandArgs } {
    // Remove leading slash and trim
    const trimmed = input.replace(/^\/+/, '').trim()

    if (!trimmed) {
      return { name: '', args: { _: [] } }
    }

    // Simple parsing: split by spaces
    // First token is command name, rest are positional args
    const tokens = trimmed.split(/\s+/)
    const name = tokens[0] || ''
    const positionalArgs = tokens.slice(1)

    // Parse options (simple implementation)
    // Format: --option value or -o value or --flag
    const args: CommandArgs = { _: [] }
    let i = 0

    while (i < positionalArgs.length) {
      const token = positionalArgs[i]

      if (token.startsWith('--')) {
        // Long option
        const optionName = token.slice(2)
        const nextToken = positionalArgs[i + 1]

        // Check if next token is a value (doesn't start with -)
        if (nextToken !== undefined && !nextToken.startsWith('-')) {
          args[optionName] = nextToken
          i += 2
        } else {
          args[optionName] = true
          i += 1
        }
      } else if (token.startsWith('-') && token.length === 2) {
        // Short option
        const optionName = token.slice(1)
        const nextToken = positionalArgs[i + 1]

        if (nextToken !== undefined && !nextToken.startsWith('-')) {
          args[optionName] = nextToken
          i += 2
        } else {
          args[optionName] = true
          i += 1
        }
      } else {
        // Positional argument
        args._.push(token)
        i += 1
      }
    }

    return { name, args }
  }

  /**
   * Execute a command
   */
  public async execute(input: string, context: CommandContext): Promise<CommandResult> {
    const { name, args } = this.parse(input)

    if (!name) {
      return {
        success: false,
        error: 'No command specified. Use /help for available commands.',
      }
    }

    const command = this.get(name)

    if (!command) {
      return {
        success: false,
        error: `Unknown command: ${name}. Use /help for available commands.`,
      }
    }

    try {
      return await command.handler(args, context)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Get command completion suggestions
   */
  public complete(input: string): string[] {
    const trimmed = input.replace(/^\/+/, '').trim()
    const partial = trimmed.toLowerCase()

    const allNames = Array.from(new Set([
      ...Array.from(this.commands.keys()),
      ...Array.from(this.aliasMap.keys()),
    ]))

    if (!partial) {
      return allNames
    }

    return allNames.filter(name => name.toLowerCase().startsWith(partial))
  }
}

// ─── Singleton Instance ─────────────────────────────────────────────────────

let registryInstance: CommandRegistry | null = null

/**
 * Get the global command registry instance
 */
export function getCommandRegistry(): CommandRegistry {
  if (!registryInstance) {
    registryInstance = new CommandRegistry()
  }
  return registryInstance
}

/**
 * Reset the global command registry instance (useful for testing)
 */
export function resetCommandRegistry(): void {
  registryInstance = null
}
