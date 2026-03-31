/**
 * Configuration Manager for Mini-Claude
 * Handles reading, writing, and merging configuration from files and environment variables
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { z } from 'zod'
import type { MiniClaudeConfig, PartialConfig, ConfigManagerOptions } from './types.js'
import { DEFAULT_CONFIG, ENV_VAR_MAPPING } from './defaults.js'
import { ConfigSchema } from './schema.js'

// ─── Type Guard for Config Keys ─────────────────────────────────────────────

type ConfigKey = keyof MiniClaudeConfig

function isConfigKey(key: string): key is ConfigKey {
  return key in DEFAULT_CONFIG
}

// ─── Environment Variable Parsing ───────────────────────────────────────────

function parseEnvValue(key: ConfigKey): unknown {
  const envVar = ENV_VAR_MAPPING[key]
  if (!envVar) return undefined

  const envValue = process.env[envVar]
  if (envValue === undefined || envValue === '') return undefined

  // Parse based on the default value's type
  const defaultValue = DEFAULT_CONFIG[key]

  if (typeof defaultValue === 'boolean') {
    return envValue.toLowerCase() === 'true' || envValue === '1'
  }

  if (typeof defaultValue === 'number') {
    const parsed = Number.parseFloat(envValue)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  if (Array.isArray(defaultValue)) {
    return envValue.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }

  // String and other types
  return envValue
}

// ─── Merge Configurations ───────────────────────────────────────────────────

function mergeConfig(
  base: MiniClaudeConfig,
  overrides: PartialConfig,
): MiniClaudeConfig {
  return {
    ...base,
    ...overrides,
  }
}

// ─── Config Manager Class ─────────────────────────────────────────────────

export class ConfigManager {
  private config: MiniClaudeConfig
  private configPath: string
  private envPrefix: string

  constructor(options: ConfigManagerOptions = {}) {
    this.configPath = options.configPath ?? join(homedir(), '.miniclaude', 'config.json')
    this.envPrefix = options.envPrefix ?? 'MINICLAUDE'

    // Load configuration in the order: defaults -> file -> env
    this.config = this.loadConfig()
  }

  /**
   * Load configuration from all sources
   */
  private loadConfig(): MiniClaudeConfig {
    let config = { ...DEFAULT_CONFIG }

    // Load from file if exists
    if (existsSync(this.configPath)) {
      try {
        const fileContent = readFileSync(this.configPath, 'utf-8')
        const fileConfig = JSON.parse(fileContent) as PartialConfig
        config = mergeConfig(config, fileConfig)
      } catch (error) {
        // Invalid config file, use defaults
        console.warn(`Warning: Failed to load config file at ${this.configPath}`)
        console.warn('Using default configuration.')
      }
    }

    // Apply environment variable overrides
    const envOverrides: PartialConfig = {}
    for (const key of Object.keys(DEFAULT_CONFIG) as ConfigKey[]) {
      const envValue = parseEnvValue(key)
      if (envValue !== undefined) {
        envOverrides[key] = envValue as any
      }
    }

    config = mergeConfig(config, envOverrides)

    // Validate the final configuration
    try {
      return ConfigSchema.parse(config)
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Invalid configuration detected:')
        error.errors.forEach(err => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`)
        })
        console.error('Using default configuration.')
        return { ...DEFAULT_CONFIG }
      }
      throw error
    }
  }

  /**
   * Get the current configuration
   */
  public getConfig(): MiniClaudeConfig {
    return { ...this.config }
  }

  /**
   * Get a specific configuration value
   */
  public get<K extends ConfigKey>(key: K): MiniClaudeConfig[K] {
    return this.config[key]
  }

  /**
   * Set a specific configuration value (in-memory only)
   */
  public set<K extends ConfigKey>(key: K, value: MiniClaudeConfig[K]): void {
    this.config = { ...this.config, [key]: value }
  }

  /**
   * Update multiple configuration values (in-memory only)
   */
  public update(updates: PartialConfig): void {
    this.config = mergeConfig(this.config, updates)
  }

  /**
   * Reset configuration to defaults
   */
  public reset(): void {
    this.config = { ...DEFAULT_CONFIG }
  }

  /**
   * Save current configuration to file
   */
  public save(): void {
    try {
      // Ensure directory exists
      const dir = dirname(this.configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      // Write config file
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8')
    } catch (error) {
      console.error(`Failed to save configuration to ${this.configPath}:`, error)
      throw error
    }
  }

  /**
   * Reload configuration from file and environment
   */
  public reload(): void {
    this.config = this.loadConfig()
  }

  /**
   * Get the configuration file path
   */
  public getConfigPath(): string {
    return this.configPath
  }

  /**
   * Check if a configuration file exists
   */
  public hasConfigFile(): boolean {
    return existsSync(this.configPath)
  }

  /**
   * Get a list of all environment variables that can override configuration
   */
  public getEnvVars(): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {}
    for (const [key, envVar] of Object.entries(ENV_VAR_MAPPING)) {
      if (envVar) {
        result[envVar] = process.env[envVar]
      }
    }
    return result
  }

  /**
   * Display current configuration (useful for debugging)
   */
  public display(): void {
    console.log('Current Configuration:')
    console.log('=====================')
    console.log(`Config file: ${this.configPath}`)
    console.log(`Config file exists: ${this.hasConfigFile()}`)
    console.log()
    console.log('Values (in order of precedence: defaults -> file -> env):')
    console.log(JSON.stringify(this.config, null, 2))
    console.log()
    console.log('Environment Variables:')
    const envVars = this.getEnvVars()
    const activeEnvVars = Object.entries(envVars).filter(([_, v]) => v !== undefined)
    if (activeEnvVars.length > 0) {
      console.log(JSON.stringify(Object.fromEntries(activeEnvVars), null, 2))
    } else {
      console.log('  (none set)')
    }
  }
}

// ─── Singleton Instance ─────────────────────────────────────────────────────

let configManagerInstance: ConfigManager | null = null

/**
 * Get the global configuration manager instance
 */
export function getConfigManager(options?: ConfigManagerOptions): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager(options)
  }
  return configManagerInstance
}

/**
 * Reset the global configuration manager instance (useful for testing)
 */
export function resetConfigManager(): void {
  configManagerInstance = null
}
