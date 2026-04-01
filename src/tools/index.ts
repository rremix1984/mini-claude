/**
 * Tools module - All available tools
 */

import type { ToolDefinition } from '../types.js'

// Core tools
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

// Git tools
import { GitStatusTool } from './git/GitStatusTool.js'
import { GitDiffTool } from './git/GitDiffTool.js'
import { GitLogTool } from './git/GitLogTool.js'
import { GitCommitTool } from './git/GitCommitTool.js'
import { GitBranchTool } from './git/GitBranchTool.js'
import { GitStashTool } from './git/GitStashTool.js'

// Network tools
import { WebFetchTool } from './network/WebFetchTool.js'
import { HttpRequestTool } from './network/HttpRequestTool.js'
import { ApiDocsTool } from './network/ApiDocsTool.js'

// System tools
import { GetSystemInfoTool } from './system/GetSystemInfoTool.js'
import { GetProcessInfoTool } from './system/GetProcessInfoTool.js'
import { GetEnvVarTool } from './system/GetEnvVarTool.js'
import { WhoamiTool } from './system/WhoamiTool.js'

export const ALL_TOOLS: ToolDefinition[] = [
  // Core tools (7)
  BashTool,
  ReadFileTool,
  WriteFileTool,
  EditFileTool,
  GlobTool,
  GrepTool,
  WebSearchTool,

  // Filesystem tools (6)
  ListDirectoryTool,
  GetFileInfoTool,
  CopyFileTool,
  MoveFileTool,
  DeleteFileTool,
  CreateDirectoryTool,

  // Search tools (4)
  CodeSearchTool,
  FindReferencesTool,
  FindDefinitionsTool,
  GetFileStatsTool,

  // Project tools (3)
  AnalyzeProjectTool,
  RunTestsTool,
  LintCodeTool,

  // Git tools (6)
  GitStatusTool,
  GitDiffTool,
  GitLogTool,
  GitCommitTool,
  GitBranchTool,
  GitStashTool,

  // Network tools (3)
  WebFetchTool,
  HttpRequestTool,
  ApiDocsTool,

  // System tools (4)
  GetSystemInfoTool,
  GetProcessInfoTool,
  GetEnvVarTool,
  WhoamiTool,
]

/**
 * Look up a tool by name
 */
export function getTool(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find(t => t.name === name)
}

// Re-export all tools for convenience
export {
  // Core
  BashTool,
  ReadFileTool,
  WriteFileTool,
  EditFileTool,
  GlobTool,
  GrepTool,
  WebSearchTool,

  // Filesystem
  ListDirectoryTool,
  GetFileInfoTool,
  CopyFileTool,
  MoveFileTool,
  DeleteFileTool,
  CreateDirectoryTool,

  // Search
  CodeSearchTool,
  FindReferencesTool,
  FindDefinitionsTool,
  GetFileStatsTool,

  // Project
  AnalyzeProjectTool,
  RunTestsTool,
  LintCodeTool,

  // Git
  GitStatusTool,
  GitDiffTool,
  GitLogTool,
  GitCommitTool,
  GitBranchTool,
  GitStashTool,

  // Network
  WebFetchTool,
  HttpRequestTool,
  ApiDocsTool,

  // System
  GetSystemInfoTool,
  GetProcessInfoTool,
  GetEnvVarTool,
  WhoamiTool,
}
