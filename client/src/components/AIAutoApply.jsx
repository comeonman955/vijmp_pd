import { useState } from 'react';
import { Sparkles, Zap, CheckCircle2, MapPin } from 'lucide-react';
import { Alert, Spinner, SkillTag, JobTypeBadge } from './ui';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function AIAutoApply() {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applied, setApplied] = useState([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const findMatches = async () => {
    setError('');
    setLoading(true);
    setDone(false);
    setMatches([]);
    try {
      const { data } = await api.post('/ai/auto-apply');
      setMatches(data.matches || []);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (match) => {
    setApplying(match.job._id);
    try {
      await api.post(`/applications/${match.job._id}`, {
        coverLetter: `I am excited to apply for the ${match.job.title} position. ${match.reason}. My skills in ${match.job.skills?.slice(0, 3).join(', ')} align well with your requirements.`
      });
      setApplied(prev => [...prev, match.job._id]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply';
      if (msg.includes('already applied')) {
        setApplied(prev => [...prev, match.job._id]);
      } else {
        alert(msg);
      }
    } finally {
      setApplying(null);
    }
  };

  const applyAll = async () => {
    for (const match of matches) {
      if (!applied.includes(match.job._id)) {
        await applyToJob(match);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">AI Auto-Apply</h3>
            <p className="text-xs text-slate-500">Find and apply to best matching jobs instantly</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          AI analyzes your profile and finds the top 3 jobs that match your skills, then applies with a personalized message.
        </p>

        {error && <div className="mb-3"><Alert type="error" message={error} /></div>}

        <button onClick={findMatches} disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2">
          {loading
            ? <><Spinner size="sm" />Finding best matches...</>
            : <><Sparkles size={15} />Find My Best Job Matches</>
          }
        </button>
      </div>

      {/* Matches */}
      {done && matches.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm">
          No new jobs to apply to — you've applied to everything!
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              🎯 {matches.length} matches found
            </p>
            <button onClick={applyAll}
              disabled={matches.every(m => applied.includes(m.job._id))}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Zap size={12} />Apply to All
            </button>
          </div>

          {matches.map((match) => {
            const isApplied = applied.includes(match.job._id);
            const isApplying = applying === match.job._id;
            return (
              <div key={match.job._id} className={`card p-4 transition-all ${isApplied ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{match.job.title}</h4>
                    <p className="text-xs text-slate-500">{match.job.company || match.job.employer?.company}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="badge bg-emerald-100 text-emerald-700 text-xs font-bold">
                      {match.match}% match
                    </span>
                    <JobTypeBadge type={match.job.type} />
                  </div>
                </div>

                {match.job.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin size={10} />{match.job.location}
                  </p>
                )}

                <p className="text-xs text-brand-600 bg-brand-50 rounded-lg px-2.5 py-1.5 mb-3">
                  💡 {match.reason}
                </p>

                {match.job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {match.job.skills.slice(0, 4).map(s => <SkillTag key={s} skill={s} />)}
                  </div>
                )}

                <div className="flex gap-2">
                  {isApplied ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                      <CheckCircle2 size={14} />Applied successfully!
                    </div>
                  ) : (
                    <button onClick={() => applyToJob(match)} disabled={isApplying}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                      {isApplying ? <><Spinner size="sm" />Applying...</> : <><Zap size={12} />Quick Apply</>}
                    </button>
                  )}
                  <button onClick={() => navigate(`/jobs/${match.job._id}`)}
                    className="btn-secondary text-xs py-1.5 px-3">
                    View Job
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
