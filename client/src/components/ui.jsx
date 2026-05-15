import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

// Toast / Alert
export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle size={16} className="text-red-600 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-600 flex-shrink-0" />,
  };
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up ${styles[type]}`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${s[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// Status badge
const statusConfig = {
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  reviewing: { label: 'Reviewing', cls: 'bg-amber-100 text-amber-700' },
  interview: { label: 'Interview', cls: 'bg-violet-100 text-violet-700' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
  assigned: { label: 'Assigned', cls: 'bg-slate-100 text-slate-700' },
  reviewed: { label: 'Reviewed', cls: 'bg-teal-100 text-teal-700' },
};

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, cls: 'bg-slate-100 text-slate-700' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

// Job type badge
const typeConfig = {
  'full-time': 'bg-blue-100 text-blue-700',
  'part-time': 'bg-amber-100 text-amber-700',
  internship: 'bg-violet-100 text-violet-700',
  contract: 'bg-teal-100 text-teal-700',
};
export function JobTypeBadge({ type }) {
  return <span className={`badge ${typeConfig[type] || 'bg-slate-100 text-slate-700'}`}>{type}</span>;
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-display font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

// Skill tag
export function SkillTag({ skill }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-lg border border-brand-100">
      {skill}
    </span>
  );
}
