import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, ClipboardList, MessageSquare, TrendingUp, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, StatusBadge } from '../components/ui';
import api from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, appsRes, tasksRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications'),
          api.get('/tasks'),
        ]);
        setData({ jobs: jobsRes.data, applications: appsRes.data, tasks: tasksRes.data });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  const isEmployer = user?.role === 'employer';
  const stats = isEmployer
    ? [
        { label: 'Jobs Posted', value: data?.jobs?.length || 0, icon: Briefcase, color: 'from-blue-500 to-blue-600', link: '/jobs' },
        { label: 'Total Applications', value: data?.applications?.length || 0, icon: FileText, color: 'from-violet-500 to-violet-600', link: '/applications' },
        { label: 'Active Tasks', value: data?.tasks?.filter(t => t.status !== 'reviewed').length || 0, icon: ClipboardList, color: 'from-amber-500 to-amber-600', link: '/tasks' },
        { label: 'Accepted Interns', value: data?.applications?.filter(a => a.status === 'accepted').length || 0, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', link: '/applications' },
      ]
    : [
        { label: 'Jobs Available', value: data?.jobs?.length || 0, icon: Briefcase, color: 'from-blue-500 to-blue-600', link: '/jobs' },
        { label: 'My Applications', value: data?.applications?.length || 0, icon: FileText, color: 'from-violet-500 to-violet-600', link: '/applications' },
        { label: 'Assigned Tasks', value: data?.tasks?.filter(t => t.status === 'assigned').length || 0, icon: ClipboardList, color: 'from-amber-500 to-amber-600', link: '/tasks' },
        { label: 'Accepted', value: data?.applications?.filter(a => a.status === 'accepted').length || 0, icon: TrendingUp, color: 'from-emerald-500 to-emerald-600', link: '/applications' },
      ];

  const recentApps = data?.applications?.slice(0, 5) || [];
  const recentTasks = data?.tasks?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your {isEmployer ? 'hiring' : 'job search'}.</p>
        </div>
        {isEmployer ? (
          <Link to="/jobs" className="btn-primary flex items-center gap-2 hidden sm:flex">
            <Plus size={18} /> Post a Job
          </Link>
        ) : (
          <Link to="/jobs" className="btn-primary flex items-center gap-2 hidden sm:flex">
            <Briefcase size={18} /> Browse Jobs
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="card p-5 hover:shadow-md transition-all group">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="text-3xl font-display font-bold text-slate-900 mb-0.5">{value}</div>
            <div className="text-sm text-slate-500 flex items-center gap-1 group-hover:text-brand-600 transition-colors">
              {label} <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-slate-400" /> Recent Applications
            </h2>
            <Link to="/applications" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No applications yet</div>
          ) : (
            <div className="space-y-3">
              {recentApps.map(app => (
                <div key={app._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{app.job?.title}</p>
                    <p className="text-xs text-slate-500">{isEmployer ? app.candidate?.name : app.job?.company}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-400" /> Recent Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No tasks yet</div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{isEmployer ? task.candidate?.name : task.application?.job?.title}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isEmployer ? (
            <>
              <Link to="/jobs" className="btn-secondary text-sm flex items-center gap-2"><Plus size={16} /> Post Job</Link>
              <Link to="/applications" className="btn-secondary text-sm flex items-center gap-2"><FileText size={16} /> Review Applications</Link>
              <Link to="/tasks" className="btn-secondary text-sm flex items-center gap-2"><ClipboardList size={16} /> Manage Tasks</Link>
              <Link to="/chat" className="btn-secondary text-sm flex items-center gap-2"><MessageSquare size={16} /> Messages</Link>
            </>
          ) : (
            <>
              <Link to="/jobs" className="btn-secondary text-sm flex items-center gap-2"><Briefcase size={16} /> Browse Jobs</Link>
              <Link to="/applications" className="btn-secondary text-sm flex items-center gap-2"><FileText size={16} /> My Applications</Link>
              <Link to="/tasks" className="btn-secondary text-sm flex items-center gap-2"><ClipboardList size={16} /> My Tasks</Link>
              <Link to="/chat" className="btn-secondary text-sm flex items-center gap-2"><MessageSquare size={16} /> Messages</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
