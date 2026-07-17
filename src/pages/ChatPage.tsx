import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MessageBubble } from '../components/MessageBubble'
import { useMessages } from '../hooks/useMessages'
import './ChatPage.css'

export function ChatPage() {
  const { messages, loading, error, fetchMessages, sendMessage } = useMessages({
    fetchUrl: '/api/messages',
    sendUrl: '/api/messages',
  })
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    await sendMessage(text)
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header-avatar">
          <span>A</span>
        </div>
        <div className="chat-header-info">
          <h2>Alice</h2>
          <span className="chat-status">Online</span>
        </div>
      </header>

      <div className="chat-messages">
        {loading && messages.length === 0 && (
          <div className="chat-empty">Loading messages…</div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="chat-empty">No messages yet. Say hi!</div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} {...msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          className="chat-send"
          type="submit"
          disabled={!input.trim()}
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  )
}
