import React, { useEffect, useState } from 'react'
import { Box, Text, useInput } from 'ink'

interface PermissionRequestProps {
  toolName: string
  input: Record<string, unknown>
  onDecision: (allowed: boolean) => void
  onAlways?: () => void
}

export function PermissionRequest({ toolName, input, onDecision, onAlways }: PermissionRequestProps) {
  const [answered, setAnswered] = useState(false)

  useInput((inputChar, key) => {
    if (answered) return
    const ch = inputChar.toLowerCase()
    if (ch === 'y' || key.return) {
      setAnswered(true)
      onDecision(true)
    } else if (ch === 'n' || key.escape) {
      setAnswered(true)
      onDecision(false)
    } else if (ch === 'a' && onAlways) {
      setAnswered(true)
      onAlways()
      onDecision(true)
    }
  })

  // Format the input for display (show most important field first)
  const preview = formatInput(toolName, input)

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1} marginY={1}>
      <Text color="yellow" bold>
        ⚠ Permission Required
      </Text>
      <Box marginTop={1}>
        <Text>
          Tool: <Text color="magenta">{toolName}</Text>
        </Text>
      </Box>
      <Box>
        <Text dimColor>{preview}</Text>
      </Box>
      <Box marginTop={1}>
        <Text>
          Allow? <Text color="green">[y]</Text>es / <Text color="red">[n]</Text>o / <Text color="blue">[a]</Text>lways
        </Text>
      </Box>
    </Box>
  )
}

function formatInput(toolName: string, input: Record<string, unknown>): string {
  // Show the most relevant field for each tool
  if (toolName === 'Bash' && typeof input['command'] === 'string') {
    return `$ ${input['command']}`
  }
  if ((toolName === 'Write' || toolName === 'Edit') && typeof input['file_path'] === 'string') {
    return `→ ${input['file_path']}`
  }
  // Fallback: JSON with truncation
  try {
    const str = JSON.stringify(input, null, 2)
    return str.length > 300 ? str.slice(0, 300) + '…' : str
  } catch {
    return String(input)
  }
}
