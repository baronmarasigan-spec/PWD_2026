
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { Complaint } from '../../types';
import { Send, AlertTriangle, MessageSquare, ThumbsUp, X, Clock, CheckCircle, Ticket, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenComplaints: React.FC = () => {
  const { currentUser, addComplaint, complaints } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [submissionType, setSubmissionType] = useState<'Complaint' | 'Feedback'>('Complaint');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addComplaint({ userId: currentUser.id, userName: currentUser.name, subject: `[${submissionType}] ${subject}`, details });
    setSubmitted(true);
    setSubject('');
    setDetails('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const myComplaints = complaints.filter(c => c.userId === currentUser?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pt-6 relative">
      <button 
        onClick={() => navigate('/citizen/dashboard')}
        className="absolute top-8 right-0 p-2.5 bg-white hover:bg-slate-50 rounded-lg shadow-md border border-slate-200 transition-all group z-20"
      >
        <X size={20} className="text-slate-400 group-hover:text-red-600" />
      </button>

      <header className="pb-4 border-b border-slate-200">
        <h1 className="text-[32px] font-normal text-slate-900 tracking-tight uppercase">{t('concerns_header')}</h1>
        <p className="text-slate-600 font-normal">{t('concerns_subheader')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-5">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.2em]">New Submission</h2>
                    <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
                        <button type="button" onClick={() => setSubmissionType('Complaint')} className={`px-3 py-1.5 rounded-md text-[10px] font-normal uppercase tracking-wider transition-all ${submissionType === 'Complaint' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>Complaint</button>
                        <button type="button" onClick={() => setSubmissionType('Feedback')} className={`px-3 py-1.5 rounded-md text-[10px] font-normal uppercase tracking-wider transition-all ${submissionType === 'Feedback' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Feedback</button>
                    </div>
                </div>

                <div className="p-4 space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Subject of Concern</label>
                        <input 
                            type="text" 
                            required 
                            value={subject} 
                            onChange={e => setSubject(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-primary-500 outline-none transition-all font-normal"
                            placeholder={submissionType === 'Complaint' ? "e.g. Missing Pension Payment" : "e.g. System Improvement Idea"}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
                        <textarea 
                            required 
                            rows={5} 
                            value={details} 
                            onChange={e => setDetails(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-primary-500 outline-none transition-all resize-none leading-relaxed font-normal"
                            placeholder="Please provide specific details to help our administrators process your request faster."
                        />
                    </div>

                    <button 
                        type="submit"
                        className={`w-full py-4 rounded-lg font-normal text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                            submissionType === 'Complaint' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-[#1e419c] hover:opacity-90 shadow-[#1e419c]/20'
                        } text-white`}
                    >
                        <Send size={16} /> {submissionType === 'Complaint' ? 'Submit Ticket' : 'Send Feedback'}
                    </button>

                    {submitted && (
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center text-xs font-normal border border-emerald-100 flex items-center justify-center gap-2">
                            <CheckCircle size={14} /> Submission sent successfully
                        </div>
                    )}
                </div>
            </form>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-normal text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Ticket size={14} /> Ticket History
            </h3>
            
            <div className="space-y-3">
                {myComplaints.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                        <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm font-normal text-slate-400 uppercase tracking-widest">No previous tickets found</p>
                    </div>
                ) : (
                    myComplaints.map(c => {
                        const isFeedback = c.subject.includes('[Feedback]');
                        const displaySubject = c.subject.replace(/\[.*?\]\s*/, '');
                        return (
                            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-blue-300 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-normal uppercase tracking-wider ${isFeedback ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {isFeedback ? 'Feedback' : 'Complaint'}
                                        </span>
                                        <span className="text-[10px] font-normal text-slate-400 font-mono">TKT-{c.id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-normal uppercase tracking-widest ${c.status === 'Open' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                        {c.status === 'Open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                        {c.status}
                                    </div>
                                </div>
                                <h4 className="text-sm font-normal text-slate-800 tracking-tight">{displaySubject}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">{c.details}</p>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">{c.date}</span>
                                    <button className="text-[10px] font-normal text-blue-600 hover:underline uppercase tracking-widest">View Full Log</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 flex items-start gap-3 shadow-sm">
                <Info size={16} className="text-secondary-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-600 font-normal leading-relaxed">
                    Complaints are monitored by the PWD Affairs Grievance Committee. Standard response time is 3-5 working days. For urgent medical emergencies, please use the hotline numbers provided on the dashboard.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
