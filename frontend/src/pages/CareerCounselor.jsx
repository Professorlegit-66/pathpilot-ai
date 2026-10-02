import { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CareerCounselor({ profile }) {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Hello **${profile.name || 'Student'}**! I am your AI Career Counselor. Ask me anything about career tracks in **${profile.preferred_field}**, required technical skills, or guidance for your path in ${profile.city}, ${profile.country}.` 
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userMsg = inputQuery;
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

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
          <Sparkles size={16} /> MULTI-AGENT ADVISORY SYSTEM
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>AI Career Counselor</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Interactive consultation with full markdown, list, and table rendering support.
        </p>
      </div>

      {/* Chat Container */}
      <div style={{ flex: 1, background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
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
                width: '100%'
              }}>
                {msg.sender === 'bot' ? (
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '1rem 0', fontSize: '0.85rem' }} {...props} />,
                        th: ({node, ...props}) => <th style={{ border: '1px solid #334155', background: '#0f172a', padding: '0.5rem', textAlign: 'left', color: '#34d399' }} {...props} />,
                        td: ({node, ...props}) => <td style={{ border: '1px solid #334155', padding: '0.5rem', color: '#e2e8f0' }} {...props} />,
                        h3: ({node, ...props}) => <h3 style={{ fontSize: '1.05rem', color: '#34d399', margin: '0.75rem 0 0.4rem 0' }} {...props} />,
                        ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }} {...props} />,
                        li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />
                      }}
                    >
                      {msg.text}
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

          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
              <div style={{ background: '#059669', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.9rem 1.15rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                Counselor is formulating advice...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.25rem', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about career tracks, required skills, or university choices..."
            style={{ flex: 1, background: '#090d16', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
          />
          <button 
            type="submit" 
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', padding: '0 1.25rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
          >
            <Send size={16} /> Send
          </button>
        </form>

      </div>
    </div>
  );
}