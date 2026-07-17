import { useState, useCallback, useEffect } from 'react'

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
  typingUrl?: string
  typingPollInterval?: number
  onSendError?: (message: string) => void
}

interface UseMessagesResult {
  messages: Message[]
  loading: boolean
  error: string | null
  otherTyping: boolean
  sending: boolean
  fetchMessages: () => Promise<void>
  sendMessage: (text: string) => Promise<void>
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function useMessages({
  fetchUrl,
  sendUrl,
  typingUrl,
  typingPollInterval = 3000,
}: UseMessagesOptions): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otherTyping, setOtherTyping] = useState(false)

  useEffect(() => {
    if (!typingUrl) return
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(typingUrl!)
        if (!res.ok) return
        const data: { typing: boolean } = await res.json()
        if (!cancelled) setOtherTyping(data.typing)
      } catch {
        // typing status is best-effort; ignore transient failures
      }
    }

    poll()
    const timer = setInterval(poll, typingPollInterval)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [typingUrl, typingPollInterval])
  const [sending, setSending] = useState(false)

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
    setSending(true)

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
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      onSendError?.(message)
    } finally {
      setSending(false)
    }
  }, [sendUrl, onSendError])

  return { messages, loading, error, otherTyping, sending, fetchMessages, sendMessage }
}
