import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Clock, Briefcase, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState, JobTypeBadge, SkillTag, Modal, Alert } from '../components/ui';
import api from '../api/client';

function JobCard({ job, isEmployer }) {
  return (
    <Link to={`/jobs/${job._id}`} className="card p-5 hover:shadow-md transition-all group block">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-brand-700 text-sm">{(job.company || job.employer?.company || '?').charAt(0).toUpperCase()}</span>
        </div>
        <JobTypeBadge type={job.type} />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-brand-700 transition-colors">{job.title}</h3>
      <p className="text-sm text-slate-500 mb-3">{job.company || job.employer?.company}</p>
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
        {job.salary && <span className="flex items-center gap-1"><Clock size={12} />{job.salary}</span>}
      </div>
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map(s => <SkillTag key={s} skill={s} />)}
          {job.skills.length > 3 && <span className="text-xs text-slate-400">+{job.skills.length - 3}</span>}
        </div>
      )}
    </Link>
  );
}

function CreateJobModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: 'Remote', type: 'internship', skills: '', salary: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/jobs', form);
      onCreated(data);
      onClose();
      setForm({ title: '', description: '', requirements: '', location: 'Remote', type: 'internship', skills: '', salary: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a New Job" maxWidth="max-w-2xl">
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Job Title *</label>
            <input className="input" placeholder="e.g. Frontend Developer Intern" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Type *</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="Remote / City, Country" value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div>
            <label className="label">Salary / Stipend</label>
            <input className="input" placeholder="e.g. $1,500/mo" value={form.salary}
              onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Description *</label>
          <textarea className="input h-28 resize-none" placeholder="Describe the role and responsibilities..." value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Requirements</label>
          <textarea className="input h-20 resize-none" placeholder="List qualifications and requirements..." value={form.requirements}
            onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} />
        </div>
        <div>
          <label className="label">Required Skills (comma-separated)</label>
          <input className="input" placeholder="React, Node.js, MongoDB" value={form.skills}
            onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><Spinner size="sm" />Posting...</> : 'Post Job'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const [jobs, setJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tab, setTab] = useState('all');

  const fetchJobs = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get('/jobs', { params });
      setJobs(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchJobs();
      if (!isEmployer) {
        try {
          const { data } = await api.get('/jobs/recommended');
          setRecommended(data);
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 400);
    return () => clearTimeout(t);
  }, [search, typeFilter]);

  const displayed = tab === 'recommended' ? recommended : jobs;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">{isEmployer ? 'My Job Postings' : 'Browse Jobs'}</h1>
          <p className="text-slate-500 text-sm">{isEmployer ? 'Manage your open positions' : 'Discover opportunities that match your skills'}</p>
        </div>
        {isEmployer && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Post Job
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search jobs, companies, skills..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400 flex-shrink-0" />
          <select className="input w-40" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
          {(search || typeFilter) && (
            <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs for candidates */}
      {!isEmployer && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {['all', 'recommended'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'recommended' ? '⭐ Recommended' : 'All Jobs'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={isEmployer ? 'No jobs posted yet' : 'No jobs found'}
          description={isEmployer ? 'Create your first job posting to start finding interns.' : 'Try adjusting your search filters.'}
          action={isEmployer ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Post a Job
            </button>
          ) : null}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map(job => <JobCard key={job._id} job={job} isEmployer={isEmployer} />)}
        </div>
      )}

      <CreateJobModal open={showCreate} onClose={() => setShowCreate(false)}
        onCreated={job => setJobs(p => [job, ...p])} />
    </div>
  );
}
