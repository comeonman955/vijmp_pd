import { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { Spinner } from './ui';
import api from '../api/client';

const suggestions = [
  'What skills should I learn to become a frontend developer?',
  'How can I improve my chances of getting hired?',
  'What should I put in my portfolio?',
  'How do I prepare for a technical interview?',
];

export default function AICareerAdvisor() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const text = q || question;
    if (!text.trim()) return;
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/career-advice', { question: text });
      setMessages(prev => [...prev, { role: 'ai', text: data.advice }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I could not get advice right now. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Bot size={17} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">AI Career Advisor</h3>
            <p className="text-xs text-slate-500">Ask anything about your career</p>
          </div>
        </div>

        {/* Quick suggestions */}
        {messages.length === 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-xs font-semibold text-slate-600">Quick questions:</p>
            {suggestions.map(s => (
              <button key={s} onClick={() => ask(s)}
                className="w-full text-left text-xs px-3 py-2 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 text-slate-600 hover:text-slate-900 transition-all">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'ai'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-brand-500 to-brand-600'
              }`}>
                {msg.role === 'ai'
                  ? <Bot size={13} className="text-white" />
                  : <User size={13} className="text-white" />
                }
              </div>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'ai'
                  ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                  : 'bg-brand-600 text-white rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm py-2"
          placeholder="Ask about your career..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && ask()}
          disabled={loading}
        />
        <button onClick={() => ask()} disabled={!question.trim() || loading}
          className="btn-primary px-3 flex-shrink-0">
          {loading ? <Spinner size="sm" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}
