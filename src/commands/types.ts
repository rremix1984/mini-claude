/**
 * Command system types for slash commands
 */

// ─── Command Option Types ───────────────────────────────────────────────────

export interface CommandOption {
  /** Option name (e.g., '--verbose', '-v') */
  name: string
  /** Short alias (e.g., 'v' for '--verbose') */
  alias?: string
  /** Description of the option */
  description: string
  /** Whether this option is required */
  required?: boolean
  /** Option type */
  type?: 'boolean' | 'string' | 'number' | 'array'
  /** Default value */
  default?: unknown
  /** Allowed values */
  choices?: string[]
}

// ─── Command Arguments ─────────────────────────────────────────────────────

export interface CommandArgs {
  /** Positional arguments */
  _: string[]
  /** Named options */
  [key: string]: unknown
}

// ─── Command Context ────────────────────────────────────────────────────────

export interface CommandContext {
  /** Command name that was invoked */
  commandName: string
  /** Raw input string */
  rawInput: string
  /** Configuration manager */
  config: import('../config/index.js').ConfigManager
  /** Session state (if available) */
  session?: any
  /** Additional context data */
  extra?: Record<string, unknown>
}

// ─── Command Handler Result ───────────────────────────────────────────────

export interface CommandResult {
  /** Whether the command executed successfully */
  success: boolean
  /** Output message to display */
  message?: string
  /** Error message (if failed) */
  error?: string
  /** Additional data */
  data?: unknown
}

// ─── Command Handler Function ───────────────────────────────────────────────

export type CommandHandler = (
  args: CommandArgs,
  context: CommandContext,
) => Promise<CommandResult> | CommandResult

// ─── Command Definition ─────────────────────────────────────────────────────

export interface Command {
  /** Command name (without slash) */
  name: string
  /** Alternative names for the command */
  aliases?: string[]
  /** Brief description of the command */
  description: string
  /** Detailed usage information */
  usage?: string
  /** Example commands */
  examples?: string[]
  /** Command options */
  options?: CommandOption[]
  /** Whether this command is hidden from help */
  hidden?: boolean
  /** Category for grouping in help */
  category?: string
  /** Handler function */
  handler: CommandHandler
}

// ─── Command Registry ──────────────────────────────────────────────────────

export interface CommandRegistry {
  /** Register a new command */
  register(command: Command): void
  /** Get a command by name */
  get(name: string): Command | undefined
  /** Get all registered commands */
  getAll(): Command[]
  /** Get all visible commands */
  getVisible(): Command[]
  /** Get commands by category */
  getByCategory(category: string): Command[]
  /** Execute a command */
  execute(input: string, context: CommandContext): Promise<CommandResult>
  /** Parse command input into name and args */
  parse(input: string): { name: string; args: CommandArgs }
  /** Get command completion suggestions */
  complete(input: string): string[]
}
