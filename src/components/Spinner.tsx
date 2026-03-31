import React, { useEffect, useState } from 'react'
import { Text } from 'ink'

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

interface SpinnerProps {
  label?: string
}

export function Spinner({ label = 'Thinking…' }: SpinnerProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES.length)
    }, 80)
    return () => clearInterval(timer)
  }, [])

  return (
    <Text color="yellow">
      {FRAMES[frame]} {label}
    </Text>
  )
}
