import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, ChevronDown, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState, StatusBadge, Alert, SkillTag } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client';

const STATUSES = ['submitted', 'reviewing', 'interview', 'accepted', 'rejected'];

function StatusDropdown({ appId, current, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = async (status) => {
    setLoading(true);
    setOpen(false);
    try {
      const { data } = await api.patch(`/applications/${appId}/status`, { status });
      onUpdate(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
      >
        {loading ? <Spinner size="sm" /> : <><StatusBadge status={current} /><ChevronDown size={14} /></>}
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 w-40 animate-slide-up">
          {STATUSES.map(s => (
            <button key={s} onClick={() => update(s)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${s === current ? 'font-semibold text-brand-700' : 'text-slate-700'}`}>
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AppCard({ app, isEmployer, onUpdate }) {
  const [showCover, setShowCover] = useState(false);

  const startChat = async () => {
    try {
      const otherId = isEmployer ? app.candidate._id : app.employer._id;
      await api.post(`/chat/conversations/with/${otherId}`);
      window.location.href = '/chat';
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot start chat');
    }
  };

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-brand-700 text-sm">
              {isEmployer ? app.candidate?.name?.charAt(0) : app.job?.title?.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{app.job?.title}</h3>
            <p className="text-sm text-slate-500">
              {isEmployer ? `by ${app.candidate?.name}` : app.job?.company}
            </p>
          </div>
        </div>
        {isEmployer
          ? <StatusDropdown appId={app._id} current={app.status} onUpdate={onUpdate} />
          : <StatusBadge status={app.status} />
        }
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
        {app.job?.location && <span className="flex items-center gap-1"><MapPin size={11} />{app.job.location}</span>}
        <span className="flex items-center gap-1">
          <Calendar size={11} />{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
        </span>
      </div>

      {isEmployer && app.candidate?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {app.candidate.skills.slice(0, 4).map(s => <SkillTag key={s} skill={s} />)}
        </div>
      )}

      {app.coverLetter && (
        <div className="mb-3">
          <button onClick={() => setShowCover(!showCover)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            <FileText size={12} />{showCover ? 'Hide' : 'View'} cover letter
          </button>
          {showCover && (
            <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{app.coverLetter}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-slate-50">
        <Link to={`/jobs/${app.job?._id}`} className="btn-secondary text-xs py-1.5 px-3">View Job</Link>
        <button onClick={startChat} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
          <MessageSquare size={13} /> Chat
        </button>
      </div>
    </div>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/applications');
        setApps(data);
      } catch {
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdate = (updated) => {
    setApps(prev => prev.map(a => a._id === updated._id ? { ...a, ...updated } : a));
  };

  const displayed = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">{isEmployer ? 'Received Applications' : 'My Applications'}</h1>
        <p className="text-slate-500 text-sm">{isEmployer ? 'Review and manage candidate applications' : 'Track the status of your job applications'}</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
            {s === 'all' ? `All (${apps.length})` : `${s} (${apps.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          description={!isEmployer && filter === 'all' ? 'Start applying to jobs to see your applications here.' : ''}
          action={!isEmployer && filter === 'all' ? <Link to="/jobs" className="btn-primary">Browse Jobs</Link> : null}
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(app => (
            <AppCard key={app._id} app={app} isEmployer={isEmployer} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
