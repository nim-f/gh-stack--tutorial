import './TypingIndicator.css'

interface TypingIndicatorProps {
  name?: string
  avatar?: string
}

export function TypingIndicator({ name, avatar }: TypingIndicatorProps) {
  return (
    <div className="message-bubble-row other" aria-label={`${name ?? 'Someone'} is typing`}>
      <div className="message-avatar">
        {avatar ? (
          <img src={avatar} alt={name ?? 'User'} />
        ) : (
          <span>{name?.[0]?.toUpperCase() ?? '?'}</span>
        )}
      </div>
      <div className="message-bubble other typing-indicator">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
