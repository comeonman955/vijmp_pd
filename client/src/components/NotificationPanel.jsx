import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, MessageSquare, ClipboardList, FileText, Activity } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client';

const typeIcon = {
  message: MessageSquare,
  task: ClipboardList,
  application: FileText,
  status: Activity,
};
const typeColor = {
  message: 'bg-blue-100 text-blue-600',
  task: 'bg-violet-100 text-violet-600',
  application: 'bg-emerald-100 text-emerald-600',
  status: 'bg-amber-100 text-amber-600',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, clearNotifications } = useSocket();
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); clearNotifications(); } catch {}
  };

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-600" />
          <span className="font-semibold text-slate-800 text-sm">Notifications</span>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            <CheckCheck size={13} />Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No notifications yet</div>
        ) : notifications.slice(0, 20).map((n, i) => {
          const Icon = typeIcon[n.type] || Bell;
          const color = typeColor[n.type] || 'bg-slate-100 text-slate-500';
          return (
            <div key={n._id || i} className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-brand-50/30' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 truncate">{n.body}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'just now'}
                </p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
