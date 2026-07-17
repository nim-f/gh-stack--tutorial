import { useState, useCallback } from 'react'

export interface Message {
  id: string
  message: string
  sender: 'user' | 'other'
  name?: string
  avatar?: string
  timestamp: string
}

interface UseMessagesOptions {
  fetchUrl: string
  sendUrl: string
}

interface UseMessagesResult {
  messages: Message[]
  loading: boolean
  error: string | null
  fetchMessages: () => Promise<void>
  sendMessage: (text: string) => Promise<void>
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function useMessages({ fetchUrl, sendUrl }: UseMessagesOptions): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`)
      const data: Message[] = await res.json()
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [fetchUrl])

  const sendMessage = useCallback(async (text: string) => {
    const optimistic: Message = {
      id: crypto.randomUUID(),
      message: text,
      sender: 'user',
      timestamp: formatTimestamp(new Date()),
    }

    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error(`Failed to send message: ${res.status}`)
      const saved: Message = await res.json()
      setMessages(prev => prev.map(m => (m.id === optimistic.id ? saved : m)))
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [sendUrl])

  return { messages, loading, error, fetchMessages, sendMessage }
}
