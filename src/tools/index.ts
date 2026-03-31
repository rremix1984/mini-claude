import type { ToolDefinition } from '../types.js'
import { BashTool } from './BashTool.js'
import { EditFileTool } from './EditFileTool.js'
import { GlobTool } from './GlobTool.js'
import { GrepTool } from './GrepTool.js'
import { ReadFileTool } from './ReadFileTool.js'
import { WebSearchTool } from './WebSearchTool.js'
import { WriteFileTool } from './WriteFileTool.js'

export const ALL_TOOLS: ToolDefinition[] = [
  BashTool,
  ReadFileTool,
  WriteFileTool,
  EditFileTool,
  GlobTool,
  GrepTool,
  WebSearchTool,
]

/** Look up a tool by name */
export function getTool(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find(t => t.name === name)
}

export { BashTool, ReadFileTool, WriteFileTool, EditFileTool, GlobTool, GrepTool, WebSearchTool }
