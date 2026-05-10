import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BOT_AVATAR = (
  <div style={{
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6a5182 0%, #3d2a5a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 0 0 2px rgba(106,81,130,0.3)',
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e2d9f3" strokeWidth="2.2">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  </div>
);

const SERVER_URL = 'http://localhost:5000';

function formatMessage(text: string) {
  // Simple inline code and code block rendering
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3).replace(/^\w+\n/, '');
      return (
        <pre key={i} style={{
          background: 'rgba(0,0,0,0.35)', borderRadius: 6, padding: '8px 10px',
          fontSize: 11.5, overflowX: 'auto', margin: '6px 0',
          border: '1px solid rgba(106,81,130,0.3)', color: '#c4b5fd',
          fontFamily: 'monospace', lineHeight: 1.5,
        }}><code>{code.trim()}</code></pre>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: 3,
          padding: '1px 5px', fontSize: 11.5, color: '#c4b5fd', fontFamily: 'monospace',
        }}>{part.slice(1, -1)}</code>
      );
    }
    // Bold **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {boldParts.map((bp, j) =>
          bp.startsWith('**') && bp.endsWith('**')
            ? <strong key={j} style={{ color: '#e2d9f3' }}>{bp.slice(2, -2)}</strong>
            : <span key={j}>{bp}</span>
        )}
      </span>
    );
  });
}

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "**YOGIFY BOT ONLINE** ⚡\n\nYour Academy AI assistant is ready. Ask me anything about assignments, courses, students, or system navigation.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, messages]);

  // Pulse the button when closed and a new message arrives
  useEffect(() => {
    if (!open && messages.length > 1) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [messages.length]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const updatedMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${SERVER_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: "**YOGIFY BOT ONLINE** ⚡\n\nYour Academy AI assistant is ready. Ask me anything about assignments, courses, students, or system navigation.",
    }]);
    setError(null);
  }

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        id="ai-chatbot-toggle"
        onClick={() => setOpen(o => !o)}
        title="Yogify Bot AI Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6a5182 0%, #3d2a5a 100%)',
          boxShadow: open
            ? '0 0 0 3px rgba(106,81,130,0.5), 0 8px 32px rgba(61,42,90,0.6)'
            : pulse
              ? '0 0 0 6px rgba(106,81,130,0.3), 0 8px 24px rgba(61,42,90,0.5)'
              : '0 4px 20px rgba(61,42,90,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          transform: open ? 'rotate(45deg) scale(1.05)' : 'scale(1)',
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="1" fill="#fff"/><circle cx="12" cy="10" r="1" fill="#fff"/><circle cx="15" cy="10" r="1" fill="#fff"/>
          </svg>
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        id="ai-chatbot-panel"
        style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
          width: 'min(380px, calc(100vw - 32px))',
          height: 'min(540px, calc(100vh - 120px))',
          background: 'linear-gradient(160deg, #1a1028 0%, #120d1e 60%, #0d0a17 100%)',
          border: '1px solid rgba(106,81,130,0.35)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(106,81,130,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(106,81,130,0.25)',
          background: 'linear-gradient(90deg, rgba(106,81,130,0.2) 0%, rgba(61,42,90,0.1) 100%)',
          flexShrink: 0,
        }}>
          {BOT_AVATAR}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2d9f3', letterSpacing: '0.05em' }}>
              YOGIFY BOT
            </div>
            <div style={{ fontSize: 10.5, color: '#7c6b9e', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }}/>
              ONLINE · ACADEMY AI
            </div>
          </div>
          <button
            onClick={clearChat}
            title="Clear chat"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#7c6b9e', padding: 4, borderRadius: 6,
              transition: 'color 0.2s',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e2d9f3')}
            onMouseLeave={e => (e.currentTarget.style.color = '#7c6b9e')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          id="ai-chatbot-messages"
          style={{
            flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
            display: 'flex', flexDirection: 'column', gap: 12,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(106,81,130,0.3) transparent',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex', gap: 8,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
              }}
            >
              {msg.role === 'assistant' && BOT_AVATAR}
              <div style={{
                maxWidth: '80%',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #6a5182 0%, #4e3a70 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user'
                  ? 'none'
                  : '1px solid rgba(106,81,130,0.2)',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '9px 13px',
                fontSize: 13,
                color: msg.role === 'user' ? '#f0ebff' : '#c4b5d4',
                lineHeight: 1.55,
                wordBreak: 'break-word',
                boxShadow: msg.role === 'user'
                  ? '0 2px 12px rgba(106,81,130,0.25)'
                  : 'none',
              }}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {BOT_AVATAR}
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(106,81,130,0.2)',
                borderRadius: '14px 14px 14px 4px', padding: '10px 14px',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 150, 300].map(delay => (
                  <div key={delay} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#6a5182',
                    animation: 'botTyping 1.2s ease-in-out infinite',
                    animationDelay: `${delay}ms`,
                  }}/>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fca5a5',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div ref={messagesEndRef}/>
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px', borderTop: '1px solid rgba(106,81,130,0.2)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: 'rgba(0,0,0,0.2)', flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            id="ai-chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Yogify Bot..."
            rows={1}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(106,81,130,0.3)',
              borderRadius: 10, padding: '9px 12px', fontSize: 13,
              color: '#e2d9f3', outline: 'none', resize: 'none',
              fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
              maxHeight: 100, overflowY: 'auto',
              transition: 'border-color 0.2s',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(106,81,130,0.3) transparent',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(106,81,130,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(106,81,130,0.3)')}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 100) + 'px';
            }}
            disabled={loading}
          />
          <button
            id="ai-chatbot-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              width: 38, height: 38, borderRadius: 10, border: 'none',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #6a5182 0%, #4e3a70 100%)'
                : 'rgba(106,81,130,0.2)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
              boxShadow: input.trim() && !loading ? '0 2px 10px rgba(106,81,130,0.35)' : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)'}
              strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes botTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        #ai-chatbot-messages::-webkit-scrollbar { width: 4px; }
        #ai-chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        #ai-chatbot-messages::-webkit-scrollbar-thumb { background: rgba(106,81,130,0.3); border-radius: 10px; }
        #ai-chatbot-input::placeholder { color: rgba(140,120,170,0.6); }
      `}</style>
    </>
  );
}
