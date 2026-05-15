import { Link } from 'react-router-dom';
import { Zap, Briefcase, MessageSquare, ClipboardList, ArrowRight, Star, Users, TrendingUp } from 'lucide-react';

const features = [
  { icon: Briefcase, title: 'Smart Job Matching', desc: 'AI-powered recommendations based on your skills and experience.', color: 'from-blue-500 to-blue-600' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Instantly connect with employers via our built-in messaging system.', color: 'from-violet-500 to-violet-600' },
  { icon: ClipboardList, title: 'Virtual Tasks', desc: 'Complete real internship tasks and build your portfolio.', color: 'from-emerald-500 to-emerald-600' },
  { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor application status from submission to acceptance.', color: 'from-amber-500 to-amber-600' },
];

const stats = [
  { value: '2,400+', label: 'Active Jobs' },
  { value: '18k+', label: 'Candidates' },
  { value: '94%', label: 'Match Rate' },
  { value: '350+', label: 'Companies' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900">InternHub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-brand-100">
          <Star size={14} fill="currentColor" />
          The #1 Virtual Internship Platform
        </div>
        <h1 className="font-display font-bold text-5xl lg:text-7xl text-slate-900 leading-tight mb-6 max-w-4xl mx-auto">
          Land your dream
          <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent"> internship </span>
          from anywhere
        </h1>
        <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect with top companies, complete real projects, and launch your career — all from your laptop.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register?role=candidate" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
            Find internships <ArrowRight size={18} />
          </Link>
          <Link to="/register?role=employer" className="btn-secondary text-base px-8 py-3 flex items-center gap-2">
            <Users size={18} />
            Hire interns
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-bold text-3xl text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl text-slate-900 mb-3">Everything you need to succeed</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">One platform for the entire internship journey — from discovery to completion.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-brand-500 to-violet-600 rounded-3xl p-12 text-white">
            <h2 className="font-display font-bold text-4xl mb-4">Ready to start your journey?</h2>
            <p className="text-brand-100 mb-8 text-lg">Join thousands of students and employers on InternHub today.</p>
            <Link to="/register" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors inline-flex items-center gap-2">
              Create free account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} InternHub. All rights reserved.
      </footer>
    </div>
  );
}
