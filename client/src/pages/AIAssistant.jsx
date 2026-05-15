import { useState } from 'react';
import { Sparkles, FileText, Bot, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AIResume from '../components/AIResume';
import AICareerAdvisor from '../components/AICareerAdvisor';
import AIAutoApply from '../components/AIAutoApply';

const tabs = [
  { id: 'advisor', label: 'Career Advisor', icon: Bot, color: 'text-emerald-600', desc: 'Get AI career advice' },
  { id: 'resume', label: 'Resume Builder', icon: FileText, color: 'text-brand-600', desc: 'Generate your resume' },
  { id: 'autoapply', label: 'Auto-Apply', icon: Zap, color: 'text-amber-600', desc: 'Find & apply to jobs' },
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('advisor');
  const isEmployer = user?.role === 'employer';

  const visibleTabs = isEmployer
    ? tabs.filter(t => t.id === 'advisor')
    : tabs;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl">AI Assistant</h1>
            <p className="text-brand-100 text-sm">Powered by Google Gemini</p>
          </div>
        </div>
        <p className="text-brand-100 text-sm leading-relaxed">
          {isEmployer
            ? 'Get AI-powered career insights and advice for your hiring process.'
            : 'Let AI help you build your resume, write cover letters, and find the perfect job automatically.'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
        {visibleTabs.map(({ id, label, icon: Icon, color, desc }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`card p-4 text-left transition-all ${activeTab === id ? 'ring-2 ring-brand-500 shadow-md' : 'hover:shadow-md'}`}>
            <Icon size={20} className={`${color} mb-2`} />
            <p className="font-semibold text-slate-900 text-sm">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'advisor' && <AICareerAdvisor />}
        {activeTab === 'resume' && !isEmployer && <AIResume />}
        {activeTab === 'autoapply' && !isEmployer && <AIAutoApply />}
      </div>
    </div>
  );
}
