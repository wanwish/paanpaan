import { useState } from 'react'

const N8N_WEBHOOK_URL = 'https://aungpyae2070.app.n8n.cloud/webhook/paanpaan-chat'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! Ask me about sales, best sellers, or flavor totals.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage = { role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId: 'dashboard-user-1',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`n8n error ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      const reply =
        data.reply ||
        data.output ||
        data.message ||
        'Sorry, I could not get a valid response.'

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply },
      ])
    } catch (error) {
      console.error('Chatbot error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'The chatbot is unavailable right now.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <div className="chat-title">PaanPaan AI</div>
              <div className="chat-subtitle">Sales assistant</div>
            </div>

            <button
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${
                  msg.role === 'user' ? 'user' : 'assistant'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble assistant">Thinking...</div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask about sales..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="floating-chat"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        💬
      </button>
    </>
  )
}

export default ChatWidget