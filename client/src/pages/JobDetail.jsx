import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, ArrowLeft, Building2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, JobTypeBadge, SkillTag, Alert, Modal } from '../components/ui';
import AICoverLetter from '../components/AICoverLetter';
import api from '../api/client';

function ApplyModal({ open, onClose, job, onApplied }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post(`/applications/${job._id}`, { coverLetter });
      onApplied();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Apply to ${job?.title}`}>
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      <p className="text-sm text-slate-500 mb-4">
        Applying to <strong className="text-slate-700">{job?.title}</strong> at <strong className="text-slate-700">{job?.company || job?.employer?.company}</strong>.
      </p>

      {/* AI Cover Letter */}
      <div className="mb-3">
        <AICoverLetter job={job} onGenerated={(text) => setCoverLetter(text)} />
      </div>

      <div>
        <label className="label">Cover Letter</label>
        <textarea
          className="input h-36 resize-none"
          placeholder="Write your cover letter or use AI to generate one above..."
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
        />
        <p className="text-xs text-slate-400 mt-1">{coverLetter.length} characters</p>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleApply} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? <><Spinner size="sm" />Applying...</> : 'Submit Application'}
        </button>
      </div>
    </Modal>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          user?.role === 'candidate' ? api.get('/applications') : Promise.resolve({ data: [] }),
        ]);
        setJob(jobRes.data);
        if (user?.role === 'candidate') {
          setApplied(appsRes.data.some(a => a.job?._id === id || a.job === id));
        }
      } catch { navigate('/jobs'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!job) return null;

  const isEmployer = user?.role === 'employer';
  const isOwner = isEmployer && job.employer?._id === user?._id;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium">
        <ArrowLeft size={16} /> Back to jobs
      </button>

      <div className="card p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-brand-700 text-xl">{(job.company || job.employer?.company || '?').charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="font-bold text-2xl text-slate-900">{job.title}</h1>
              <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                <Building2 size={14} /> {job.company || job.employer?.company}
              </p>
            </div>
          </div>
          <JobTypeBadge type={job.type} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
          <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
          {job.salary && <span className="flex items-center gap-1.5"><Clock size={14} />{job.salary}</span>}
          <span className="flex items-center gap-1.5"><Briefcase size={14} />Posted by {job.employer?.name}</span>
        </div>

        {job.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-2.5">Required Skills</h3>
            <div className="flex flex-wrap gap-2">{job.skills.map(s => <SkillTag key={s} skill={s} />)}</div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-2.5">About the Role</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {job.requirements && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-2.5">Requirements</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </div>
        )}

        {!isEmployer && (
          <div className="pt-4 border-t border-slate-100">
            {applied ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <CheckCircle2 size={20} />
                Application submitted! <Link to="/applications" className="text-brand-600 underline text-sm ml-1">View status</Link>
              </div>
            ) : (
              <button onClick={() => setShowApply(true)} className="btn-primary text-base px-8 py-3">
                Apply Now
              </button>
            )}
          </div>
        )}

        {isOwner && (
          <div className="pt-4 border-t border-slate-100">
            <Link to="/applications" className="btn-secondary flex items-center gap-2 w-fit">View Applications</Link>
          </div>
        )}
      </div>

      {job.employer && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-3">About the Employer</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
              <span className="font-bold text-violet-700">{job.employer.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{job.employer.name}</p>
              {job.employer.company && <p className="text-sm text-slate-500">{job.employer.company}</p>}
            </div>
          </div>
          {job.employer.bio && <p className="text-sm text-slate-500 mt-3 leading-relaxed">{job.employer.bio}</p>}
          {job.employer.portfolioLink && (
            <a href={job.employer.portfolioLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 mt-3">
              <ExternalLink size={14} /> Visit website
            </a>
          )}
        </div>
      )}

      <ApplyModal open={showApply} onClose={() => setShowApply(false)} job={job} onApplied={() => setApplied(true)} />
    </div>
  );
}
