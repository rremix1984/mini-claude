/**
 * Configuration Module
 * Manages Mini-Claude configuration with support for files and environment variables
 */

export * from './types.js'
export * from './defaults.js'
export * from './schema.js'
export { ConfigManager, getConfigManager, resetConfigManager } from './ConfigManager.js'
