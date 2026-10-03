import { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CareerCounselor({ profile }) {
  const userEmail = profile?.email || profile?.name || 'default_student';
  const STORAGE_KEY = `pathpilot_chat_${userEmail.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  const getGreeting = () => `Hi! I already have your profile, so I can help you explore careers and education options based on your information. You can ask me about matching careers, program eligibility, or financial aid.`;

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return [{ sender: 'bot', text: getGreeting() }];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, STORAGE_KEY]);

  const handleClearChat = () => {
    const defaultMsg = [{ sender: 'bot', text: getGreeting() }];
    setMessages(defaultMsg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMsg));
  };

  const handleSendMessage = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const userMsg = overrideText || inputQuery;
    if (!userMsg.trim() || loading) return;

    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/counselor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, query: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to the Career Counselor Agent. Make sure the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Advanced pre-processor to clean raw LLM brackets into structured readable text
  const cleanMarkdown = (text) => {
    if (!text) return '';
    let cleaned = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Transform raw bracket metadata into clean bolded bullet points
    cleaned = cleaned.replace(/\[\s*([A-Za-z\s]+)\s*\Vert{}\s*([^\]]+)\s*\]/g, '\n* **$1**: $2');
    cleaned = cleaned.replace(/\[\s*([^\]]+)\s*\]/g, '\n### $1\n');
    
    // Clean up excessive spacing and line breaks
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned;
  };

  const quickPrompts = [
    "What careers match my profile?",
    "Which programs fit my interests?",
    "Am I eligible for these programs?",
    "What financial-aid options are available?",
    "Explain my roadmap"
  ];

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 110px)', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Inline keyframe for reliable spinning loader animation */}
      <style>{`
        @keyframes customSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
            <Sparkles size={16} /> MULTI-AGENT ADVISORY SYSTEM
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>AI Career Counselor</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Interactive consultation grounded in your verified academic profile.
          </p>
        </div>

        <button 
          onClick={handleClearChat}
          title="Clear Conversation"
          style={{
            background: '#1e293b', border: '1px solid #334155', color: '#f87171',
            padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7f1d1d33'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e293b'}
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Chat Container (Locked width and fluid layout to prevent sidebar reflow jump) */}
      <div style={{ flex: 1, width: '100%', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', minHeight: 0, boxSizing: 'border-box' }}>
        
        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%', maxWidth: msg.sender === 'user' ? '75%' : '92%' }}>
              {msg.sender === 'bot' && (
                <div style={{ background: '#059669', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)' }}>
                  <Bot size={18} color="#fff" />
                </div>
              )}
              
              <div style={{ 
                background: msg.sender === 'user' ? '#059669' : '#1e293b', 
                color: '#f8fafc', 
                padding: '1rem 1.25rem', 
                borderRadius: '12px', 
                fontSize: '0.9rem', 
                lineHeight: '1.6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflowX: 'auto',
                width: '100%',
                boxSizing: 'border-box',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.sender === 'bot' ? (
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.6' }} {...props} />,
                        table: ({node, ...props}) => (
                          <div style={{ overflowX: 'auto', margin: '1rem 0', borderRadius: '8px', border: '1px solid #334155' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }} {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => <th style={{ borderBottom: '1px solid #334155', background: '#0f172a', padding: '0.75rem 1rem', textAlign: 'left', color: '#34d399', fontWeight: '600' }} {...props} />,
                        td: ({node, ...props}) => <td style={{ borderBottom: '1px solid #1e293b', padding: '0.75rem 1rem', color: '#e2e8f0', verticalAlign: 'top' }} {...props} />,
                        h3: ({node, ...props}) => <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', margin: '1rem 0 0.4rem 0', fontWeight: 'bold' }} {...props} />,
                        ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.25rem', margin: '0.4rem 0 0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }} {...props} />,
                        ol: ({node, ...props}) => <ol style={{ paddingLeft: '1.25rem', margin: '0.4rem 0 0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }} {...props} />,
                        li: ({node, ...props}) => <li style={{ lineHeight: '1.5' }} {...props} />,
                        strong: ({node, ...props}) => <strong style={{ color: '#fff', fontWeight: '600' }} {...props} />
                      }}
                    >
                      {cleanMarkdown(msg.text)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{ background: '#334155', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}>
                  <User size={18} color="#fff" />
                </div>
              )}
            </div>
          ))}

          {/* Working Spinning Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', alignItems: 'center' }}>
              <div style={{ background: '#059669', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.9rem 1.15rem', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #334155' }}>
                <Loader2 size={18} color="#34d399" style={{ animation: 'customSpin 1s linear infinite', flexShrink: 0, display: 'inline-block' }} />
                <span>Counselor is formulating advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && !loading && (
          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexWrap: 'nowrap', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
            {quickPrompts.map((prompt, i) => (
              <button 
                key={i}
                onClick={() => handleSendMessage(null, prompt)}
                style={{ 
                  background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', 
                  padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', 
                  whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
              >
                <MessageSquare size={14} /> {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.25rem', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
          <input 
            type="text" 
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about career tracks, required skills, or university choices..."
            style={{ flex: 1, background: '#090d16', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', padding: '0 1.25rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)', opacity: loading ? 0.7 : 1 }}
          >
            <Send size={16} /> Send
          </button>
        </form>

      </div>
    </div>
  );
}