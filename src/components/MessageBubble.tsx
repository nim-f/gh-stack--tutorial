import './MessageBubble.css'

interface MessageBubbleProps {
  message: string
  sender: 'user' | 'other'
  timestamp?: string
  avatar?: string
  name?: string
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const initials = parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
  return initials || '?'
}

export function MessageBubble({ message, sender, timestamp, avatar, name }: MessageBubbleProps) {
  const isUser = sender === 'user'

  return (
    <div className={`message-bubble-row ${isUser ? 'user' : 'other'}`}>
      {!isUser && (
        <div className="message-avatar">
          {avatar ? (
            <img src={avatar} alt={name ?? 'User'} />
          ) : (
            <span>{getInitials(name)}</span>
          )}
        </div>
      )}
      <div className="message-bubble-content">
        {!isUser && name && <span className="message-name">{name}</span>}
        <div className={`message-bubble ${isUser ? 'user' : 'other'}`}>
          <p>{message}</p>
        </div>
        {timestamp && <span className="message-timestamp">{timestamp}</span>}
      </div>
    </div>
  )
}
