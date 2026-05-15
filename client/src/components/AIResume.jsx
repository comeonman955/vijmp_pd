import { useState } from 'react';
import { Sparkles, Download, RefreshCw, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from './ui';
import api from '../api/client';

export default function AIResume() {
  const { user } = useAuth();
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const generate = async () => {
    setError('');
    setLoading(true);
    setDone(false);
    try {
      const { data } = await api.post('/ai/resume');
      setResume(data.resume);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user?.name?.replace(' ', '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const missingFields = [];
  if (!user?.bio) missingFields.push('Bio');
  if (!user?.education) missingFields.push('Education');
  if (!user?.skills?.length) missingFields.push('Skills');

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-violet-50 to-brand-50 border border-brand-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">AI Resume Generator</h3>
            <p className="text-sm text-slate-500">Powered by Google Gemini</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          AI will create a professional resume based on your profile information.
        </p>

        {missingFields.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Complete your profile for a better resume:</p>
            <p className="text-xs text-amber-600">Missing: {missingFields.join(', ')}</p>
          </div>
        )}

        {/* Profile preview */}
        <div className="bg-white rounded-xl p-3 mb-4 space-y-1.5">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><User size={12} />Your profile data:</p>
          <p className="text-xs text-slate-500"><span className="font-medium">Name:</span> {user?.name}</p>
          <p className="text-xs text-slate-500"><span className="font-medium">Skills:</span> {user?.skills?.join(', ') || '—'}</p>
          <p className="text-xs text-slate-500"><span className="font-medium">Education:</span> {user?.education || '—'}</p>
          <p className="text-xs text-slate-500"><span className="font-medium">Bio:</span> {user?.bio?.slice(0, 60) || '—'}{user?.bio?.length > 60 ? '...' : ''}</p>
        </div>

        {error && <div className="mb-3"><Alert type="error" message={error} /></div>}

        <button onClick={generate} disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {loading
            ? <><Spinner size="sm" />Generating with AI...</>
            : done
            ? <><RefreshCw size={16} />Regenerate Resume</>
            : <><Sparkles size={16} />Generate My Resume</>
          }
        </button>
      </div>

      {/* Result */}
      {resume && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="font-semibold text-slate-800 text-sm">Resume Generated!</span>
            </div>
            <button onClick={download} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Download size={13} />Download .txt
            </button>
          </div>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4 max-h-80 overflow-y-auto font-mono">
            {resume}
          </pre>
        </div>
      )}
    </div>
  );
}
