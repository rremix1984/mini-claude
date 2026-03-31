import React from 'react'
import { Box, Text } from 'ink'
import type { DisplayMessage } from '../types.js'

interface MessageListProps {
  messages: DisplayMessage[]
  streamingText?: string
}

export function MessageList({ messages, streamingText }: MessageListProps) {
  return (
    <Box flexDirection="column" gap={1}>
      {messages.map(msg => (
        <MessageRow key={msg.id} message={msg} />
      ))}
      {streamingText !== undefined && streamingText.length > 0 && (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            ◆ assistant
          </Text>
          <Box marginLeft={2}>
            <Text>{streamingText}</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function MessageRow({ message }: { message: DisplayMessage }) {
  switch (message.role) {
    case 'user':
      return (
        <Box flexDirection="column">
          <Text color="green" bold>
            ▶ you
          </Text>
          <Box marginLeft={2}>
            <Text>{message.content}</Text>
          </Box>
        </Box>
      )

    case 'assistant':
      return (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            ◆ assistant
          </Text>
          <Box marginLeft={2}>
            <Text>{message.content}</Text>
          </Box>
        </Box>
      )

    case 'tool':
      return (
        <Box flexDirection="column">
          <Text color="magenta">
            ⚙ {message.toolName ?? 'tool'}{' '}
            <Text color={message.isError ? 'red' : 'gray'}>
              {message.isError ? '✗' : '✓'}
            </Text>
          </Text>
          {message.content.length > 0 && (
            <Box marginLeft={2}>
              <Text color={message.isError ? 'red' : 'gray'} dimColor>
                {truncate(message.content, 500)}
              </Text>
            </Box>
          )}
        </Box>
      )

    case 'system':
      return (
        <Box>
          <Text color={message.isError ? 'red' : 'yellow'}>{message.content}</Text>
        </Box>
      )

    default:
      return null
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + `\n… (${str.length - maxLen} more chars)`
}
