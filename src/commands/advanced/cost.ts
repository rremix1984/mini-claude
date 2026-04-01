/**
 * Cost Command
 * Estimate API usage cost
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'

// Simple cost estimation (in USD per 1K tokens)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
}

export const costCommand: Command = {
  name: 'cost',
  description: 'Estimate API usage cost based on model',
  usage: '/cost [--model <name>] [--input <tokens>] [--output <tokens>]',
  examples: [
    '/cost',
    '/cost --model claude-3-sonnet --input 1000 --output 2000',
    '/cost -m claude-3-opus -i 5000 -o 10000',
  ],
  category: 'advanced',
  options: [
    {
      name: '--model',
      alias: 'm',
      description: 'Model name',
      type: 'string',
    },
    {
      name: '--input',
      alias: 'i',
      description: 'Input tokens (1K units)',
      type: 'number',
    },
    {
      name: '--output',
      alias: 'o',
      description: 'Output tokens (1K units)',
      type: 'number',
    },
  ],
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    try {
      const model = (args.model as string) || context.config.get('model')
      const inputTokens = (args.input as number) || 0
      const outputTokens = (args.output as number) || 0

      // Get model costs
      const costs = MODEL_COSTS[model]
      if (!costs) {
        return {
          success: false,
          error: `Unknown model: ${model}\nAvailable models: ${Object.keys(MODEL_COSTS).join(', ')}`,
        }
      }

      // Calculate cost
      const inputCost = (inputTokens / 1000) * costs.input
      const outputCost = (outputTokens / 1000) * costs.output
      const totalCost = inputCost + outputCost

      let output = '💰 Cost Estimation\n\n'
      output += `Model: ${model}\n`
      output += `Input:  ${inputTokens.toLocaleString()} tokens ($${inputCost.toFixed(4)} / 1K tokens)\n`
      output += `Output: ${outputTokens.toLocaleString()} tokens ($${outputCost.toFixed(4)} / 1K tokens)\n`
      output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      output += `Total:  $${totalCost.toFixed(4)}\n\n`

      // Show all model costs
      output += 'Available Models (per 1K tokens):\n'
      Object.entries(MODEL_COSTS).forEach(([name, cost]) => {
        output += `  ${name.padEnd(20)} In: $${cost.input.toFixed(4)} | Out: $${cost.output.toFixed(4)}\n`
      })

      return {
        success: true,
        message: output,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
