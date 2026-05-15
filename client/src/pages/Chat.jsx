import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Search, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Spinner, EmptyState } from '../components/ui';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import api from '../api/client';

function formatMsgTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function ConversationItem({ convo, active, currentUserId, onlineUsers, onClick }) {
  const other = convo.participants?.find(p => p._id !== currentUserId);
  const isOnline = onlineUsers.includes(other?._id);
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${active ? 'bg-brand-50 border-r-2 border-brand-500' : ''}`}>
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
          {other?.name?.charAt(0) || '?'}
        </div>
        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800 truncate">{other?.name || 'Unknown'}</p>
          {convo.lastMessageAt && (
            <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatMsgTime(convo.lastMessageAt)}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">
          {other?.role === 'employer' ? other?.company || 'Employer' : 'Candidate'}
        </p>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {msg.sender?.name?.charAt(0)}
        </div>
      )}
      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isMe
          ? 'bg-brand-600 text-white rounded-br-sm'
          : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm'
      }`}>
        {msg.content}
        <div className={`text-[10px] mt-1 ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
          {format(new Date(msg.createdAt), 'h:mm a')}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef();
  const inputRef = useRef();

  // Load conversations
  useEffect(() => {
    api.get('/chat/conversations')
      .then(({ data }) => {
        setConversations(data);
        if (conversationId) {
          const found = data.find(c => c._id === conversationId);
          if (found) setActiveConvo(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load messages when active convo changes
  useEffect(() => {
    if (!activeConvo) return;
    setMsgLoading(true);
    navigate(`/chat/${activeConvo._id}`, { replace: true });
    api.get(`/chat/conversations/${activeConvo._id}/messages`)
      .then(({ data }) => setMessages(data))
      .catch(() => {})
      .finally(() => setMsgLoading(false));

    socket?.emit('join_conversation', activeConvo._id);
    return () => socket?.emit('leave_conversation', activeConvo._id);
  }, [activeConvo?._id]);

  // Socket: new messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.conversation === activeConvo?._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Update conversations list
      setConversations(prev => prev.map(c =>
        c._id === msg.conversation ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt } : c
      ));
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, activeConvo?._id]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConvo || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      await api.post(`/chat/conversations/${activeConvo._id}/messages`, { content });
    } catch (err) {
      setInput(content);
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const filteredConvos = conversations.filter(c => {
    const other = c.participants?.find(p => p._id !== user?._id);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const otherUser = activeConvo?.participants?.find(p => p._id !== user?._id);

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="page-header">Messages</h1>
        <p className="text-slate-500 text-sm">Chat with employers and candidates</p>
      </div>

      <div className="card overflow-hidden flex" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input text-sm pl-8 py-2" placeholder="Search conversations..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : filteredConvos.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-400">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet.<br />Apply to jobs to start chatting.</p>
              </div>
            ) : (
              filteredConvos.map(c => (
                <ConversationItem key={c._id} convo={c} active={activeConvo?._id === c._id}
                  currentUserId={user?._id} onlineUsers={onlineUsers}
                  onClick={() => setActiveConvo(c)} />
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConvo ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose someone from the left to start chatting" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="h-14 border-b border-slate-100 flex items-center px-5 gap-3 flex-shrink-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                    {otherUser?.name?.charAt(0)}
                  </div>
                  {onlineUsers.includes(otherUser?._id) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{otherUser?.name}</p>
                  <p className="text-xs text-slate-500">
                    {onlineUsers.includes(otherUser?._id) ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Circle size={8} fill="currentColor" />Online</span>
                    ) : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                {msgLoading ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 text-sm">Start the conversation! 👋</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <MessageBubble key={msg._id} msg={msg} isMe={msg.sender?._id === user?._id || msg.sender === user?._id} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  className="input flex-1 py-2.5"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                />
                <button type="submit" disabled={!input.trim() || sending}
                  className="btn-primary px-4 flex items-center gap-2 flex-shrink-0">
                  {sending ? <Spinner size="sm" /> : <Send size={16} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
