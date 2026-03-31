import type { ToolDefinition } from '../types.js'
import { BashTool } from './BashTool.js'
import { EditFileTool } from './EditFileTool.js'
import { GlobTool } from './GlobTool.js'
import { GrepTool } from './GrepTool.js'
import { ReadFileTool } from './ReadFileTool.js'
import { WebSearchTool } from './WebSearchTool.js'
import { WriteFileTool } from './WriteFileTool.js'

// Filesystem tools
import { ListDirectoryTool } from './filesystem/ListDirectoryTool.js'
import { GetFileInfoTool } from './filesystem/GetFileInfoTool.js'
import { CopyFileTool } from './filesystem/CopyFileTool.js'
import { MoveFileTool } from './filesystem/MoveFileTool.js'
import { DeleteFileTool } from './filesystem/DeleteFileTool.js'
import { CreateDirectoryTool } from './filesystem/CreateDirectoryTool.js'

// Search tools
import { CodeSearchTool } from './search/CodeSearchTool.js'
import { FindReferencesTool } from './search/FindReferencesTool.js'
import { FindDefinitionsTool } from './search/FindDefinitionsTool.js'
import { GetFileStatsTool } from './search/GetFileStatsTool.js'

// Project tools
import { AnalyzeProjectTool } from './project/AnalyzeProjectTool.js'
import { RunTestsTool } from './project/RunTestsTool.js'
import { LintCodeTool } from './project/LintCodeTool.js'

export const ALL_TOOLS: ToolDefinition[] = [
  // Core tools
  BashTool,
  ReadFileTool,
  WriteFileTool,
  EditFileTool,
  GlobTool,
  GrepTool,
  WebSearchTool,

  // Filesystem tools
  ListDirectoryTool,
  GetFileInfoTool,
  CopyFileTool,
  MoveFileTool,
  DeleteFileTool,
  CreateDirectoryTool,

  // Search tools
  CodeSearchTool,
  FindReferencesTool,
  FindDefinitionsTool,
  GetFileStatsTool,

  // Project tools
  AnalyzeProjectTool,
  RunTestsTool,
  LintCodeTool,
]

/** Look up a tool by name */
export function getTool(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find(t => t.name === name)
}

export { BashTool, ReadFileTool, WriteFileTool, EditFileTool, GlobTool, GrepTool, WebSearchTool }
export { ListDirectoryTool, GetFileInfoTool, CopyFileTool, MoveFileTool, DeleteFileTool, CreateDirectoryTool }
export { CodeSearchTool, FindReferencesTool, FindDefinitionsTool, GetFileStatsTool }
export { AnalyzeProjectTool, RunTestsTool, LintCodeTool }
