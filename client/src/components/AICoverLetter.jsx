import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { Alert, Spinner } from './ui';
import api from '../api/client';

export default function AICoverLetter({ job, onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/cover-letter', {
        jobTitle: job?.title,
        company: job?.company || job?.employer?.company,
        jobDescription: job?.description,
      });
      setResult(data.coverLetter);
      if (onGenerated) onGenerated(data.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onGenerated) onGenerated(result);
  };

  return (
    <div className="space-y-3">
      {error && <Alert type="error" message={error} />}

      <button onClick={generate} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-brand-300 text-brand-600 hover:bg-brand-50 transition-all text-sm font-semibold">
        {loading
          ? <><Spinner size="sm" />Writing with AI...</>
          : <><Sparkles size={15} />Write Cover Letter with AI</>
        }
      </button>

      {result && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-brand-700 flex items-center gap-1">
              <CheckCircle2 size={12} />AI Generated
            </span>
            <button onClick={copy}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              {copied ? '✓ Copied!' : <><Copy size={11} />Copy & Use</>}
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{result}</p>
        </div>
      )}
    </div>
  );
}
