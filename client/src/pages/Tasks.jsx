import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Upload, Star, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState, StatusBadge, Alert, Modal } from '../components/ui';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../api/client';

function CreateTaskModal({ open, onClose, onCreated }) {
  const [acceptedApps, setAcceptedApps] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', applicationId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api.get('/applications').then(({ data }) => {
        setAcceptedApps(data.filter(a => a.status === 'accepted'));
      }).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.applicationId) return setError('Please select an intern');
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', form);
      onCreated(data);
      onClose();
      setForm({ title: '', description: '', dueDate: '', applicationId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign New Task">
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      {acceptedApps.length === 0 ? (
        <div className="text-center py-6 text-slate-500">
          <p className="font-medium">No accepted interns yet</p>
          <p className="text-sm mt-1">Accept an application first to assign tasks.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Select Intern *</label>
            <select className="input" value={form.applicationId} onChange={e => setForm(p => ({ ...p, applicationId: e.target.value }))} required>
              <option value="">Choose an intern...</option>
              {acceptedApps.map(a => (
                <option key={a._id} value={a._id}>
                  {a.candidate?.name} — {a.job?.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Task Title *</label>
            <input className="input" placeholder="e.g. Build a landing page" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input h-28 resize-none" placeholder="Describe the task requirements..." value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" />Assigning...</> : 'Assign Task'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function SubmitModal({ open, onClose, task, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      fd.append('note', note);
      const { data } = await api.post(`/tasks/${task._id}/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSubmitted(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Task">
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Submission Note</label>
          <textarea className="input h-24 resize-none" placeholder="Describe what you did..." value={note}
            onChange={e => setNote(e.target.value)} />
        </div>
        <div>
          <label className="label">Attach File (optional)</label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => document.getElementById('task-file').click()}>
            <input id="task-file" type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            <Upload size={24} className={`mx-auto mb-2 ${file ? 'text-brand-500' : 'text-slate-400'}`} />
            {file ? (
              <p className="text-sm font-medium text-brand-700">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-700">Click to upload</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, ZIP, PNG up to 10MB</p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" />Submitting...</> : 'Submit Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReviewModal({ open, onClose, task, onReviewed }) {
  const [form, setForm] = useState({ reviewNote: '', grade: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.patch(`/tasks/${task._id}/review`, form);
      onReviewed(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Review Submission">
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      {task?.submissionFile && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700 mb-1">Submitted File:</p>
          <a href={task.submissionFile} target="_blank" rel="noreferrer"
            className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
            <FileText size={14} /> Download / View Submission
          </a>
        </div>
      )}
      {task?.submissionNote && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700 mb-1">Candidate's Note:</p>
          <p className="text-sm text-slate-600">{task.submissionNote}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Grade</label>
          <select className="input" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}>
            <option value="">No grade</option>
            {['A+','A','A-','B+','B','B-','C+','C','Pass','Fail'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Review Notes</label>
          <textarea className="input h-24 resize-none" placeholder="Provide feedback to the intern..." value={form.reviewNote}
            onChange={e => setForm(p => ({ ...p, reviewNote: e.target.value }))} />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" />Reviewing...</> : <><Star size={15} />Submit Review</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TaskCard({ task, isEmployer, onUpdate }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{task.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEmployer ? `Assigned to: ${task.candidate?.name}` : `From: ${task.employer?.name || task.employer?.company}`}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        {task.dueDate && (
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <Calendar size={11} />Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </span>
        )}
        <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
      </div>

      {task.status === 'reviewed' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Reviewed</span>
            {task.grade && <span className="ml-auto badge bg-emerald-100 text-emerald-700">Grade: {task.grade}</span>}
          </div>
          {task.reviewNote && <p className="text-xs text-emerald-600">{task.reviewNote}</p>}
        </div>
      )}

      {task.status === 'submitted' && task.submissionNote && !isEmployer && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs font-medium text-blue-700 mb-1">Your submission note:</p>
          <p className="text-xs text-blue-600">{task.submissionNote}</p>
          {task.submissionFile && (
            <a href={task.submissionFile} target="_blank" rel="noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-1">
              <FileText size={11} /> View submitted file
            </a>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-50">
        {!isEmployer && task.status === 'assigned' && (
          <button onClick={() => setShowSubmit(true)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Upload size={13} /> Submit Work
          </button>
        )}
        {isEmployer && task.status === 'submitted' && (
          <button onClick={() => setShowReview(true)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Star size={13} /> Review
          </button>
        )}
        {isEmployer && task.submissionFile && (
          <a href={task.submissionFile} target="_blank" rel="noreferrer"
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <FileText size={13} /> View File
          </a>
        )}
      </div>

      <SubmitModal open={showSubmit} onClose={() => setShowSubmit(false)} task={task}
        onSubmitted={(updated) => { onUpdate(updated); setShowSubmit(false); }} />
      <ReviewModal open={showReview} onClose={() => setShowReview(false)} task={task}
        onReviewed={(updated) => { onUpdate(updated); setShowReview(false); }} />
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated) => {
    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
  };

  const displayed = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">{isEmployer ? 'Task Management' : 'My Tasks'}</h1>
          <p className="text-slate-500 text-sm">{isEmployer ? 'Assign and review intern tasks' : 'Complete your assigned tasks'}</p>
        </div>
        {isEmployer && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Assign Task
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'assigned', 'submitted', 'reviewed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
            {s === 'all' ? `All (${tasks.length})` : `${s} (${tasks.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks yet"
          description={isEmployer ? 'Accept applications and assign tasks to your interns.' : 'Tasks will appear here once your employer assigns them.'}
          action={isEmployer ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Assign Task
            </button>
          ) : null}
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(task => (
            <TaskCard key={task._id} task={task} isEmployer={isEmployer} onUpdate={handleUpdate} />
          ))}
        </div>
      )}

      <CreateTaskModal open={showCreate} onClose={() => setShowCreate(false)}
        onCreated={task => setTasks(p => [task, ...p])} />
    </div>
  );
}
