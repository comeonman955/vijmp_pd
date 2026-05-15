import { useState } from 'react';
import { User, Briefcase, GraduationCap, Link2, Tags, Mail, Save, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner, SkillTag } from '../components/ui';
import api from '../api/client';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    education: user?.education || '',
    skills: user?.skills?.join(', ') || '',
    portfolioLink: user?.portfolioLink || '',
    company: user?.company || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      await api.put('/users/me', form);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="page-header">My Profile</h1>
        <p className="text-slate-500 text-sm">Manage your personal information and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">{user?.name}</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`badge ${user?.role === 'employer' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {user?.role}
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1"><Mail size={13} />{user?.email}</span>
          </div>
          {user?.company && (
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Building2 size={13} />{user.company}
            </p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Edit Information</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5"><User size={14} />Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          {user?.role === 'employer' && (
            <div>
              <label className="label flex items-center gap-1.5"><Building2 size={14} />Company Name</label>
              <input className="input" placeholder="Your company" value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
            </div>
          )}
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><User size={14} />Bio</label>
          <textarea className="input h-24 resize-none" placeholder="Tell employers about yourself..." value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
        </div>

        {user?.role === 'candidate' && (
          <div>
            <label className="label flex items-center gap-1.5"><GraduationCap size={14} />Education</label>
            <input className="input" placeholder="e.g. B.Sc Computer Science, MIT, 2024" value={form.education}
              onChange={e => setForm(p => ({ ...p, education: e.target.value }))} />
          </div>
        )}

        <div>
          <label className="label flex items-center gap-1.5"><Tags size={14} />Skills (comma-separated)</label>
          <input className="input" placeholder="React, Node.js, Python, Design..." value={form.skills}
            onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
          {skillsArray.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {skillsArray.map(s => <SkillTag key={s} skill={s} />)}
            </div>
          )}
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Link2 size={14} />Portfolio / Website Link</label>
          <input className="input" placeholder="https://yourportfolio.com" value={form.portfolioLink}
            onChange={e => setForm(p => ({ ...p, portfolioLink: e.target.value }))} />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><Spinner size="sm" />Saving...</> : <><Save size={16} />Save Changes</>}
          </button>
        </div>
      </form>

      {/* Skills preview */}
      {user?.skills?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Tags size={16} className="text-slate-400" />Current Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map(s => <SkillTag key={s} skill={s} />)}
          </div>
        </div>
      )}

      {/* Portfolio link */}
      {user?.portfolioLink && (
        <div className="card p-5">
          <a href={user.portfolioLink} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
            <Link2 size={16} /> {user.portfolioLink}
          </a>
        </div>
      )}
    </div>
  );
}
