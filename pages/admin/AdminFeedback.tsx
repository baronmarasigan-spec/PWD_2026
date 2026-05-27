
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Search, Filter, Clock, CheckCircle, User, Calendar, Tag, ChevronRight, MessageCircle, X, Send } from 'lucide-react';
import { Complaint } from '../../types';

export const AdminFeedback: React.FC = () => {
  const { complaints, updateComplaintStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Complaint' | 'Feedback'>('All');
  const [selectedItem, setSelectedItem] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  // Filter complaints/feedback
  const filteredItems = complaints.filter(item => {
    const isFeedback = item.subject.includes('[Feedback]');
    const type = isFeedback ? 'Feedback' : 'Complaint';
    
    const matchesSearch = 
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesType = typeFilter === 'All' || type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAction = (item: Complaint) => {
    setSelectedItem(item);
    setAdminResponse(item.adminResponse || '');
  };

  const handleUpdateStatus = (status: 'Open' | 'Resolved') => {
    if (selectedItem) {
      updateComplaintStatus(selectedItem.id, status, adminResponse);
      setSelectedItem(null);
      setAdminResponse('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Client Feedback</h1>
          <p className="text-slate-500 font-medium text-lg">Monitor and respond to citizen feedback and complaints.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={14} />
            {complaints.filter(c => c.status === 'Resolved').length} Resolved
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={14} />
            {complaints.filter(c => c.status === 'Open').length} Pending
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name, subject, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-sm focus:outline-none font-medium text-slate-600"
            >
              <option value="All">All Types</option>
              <option value="Complaint">Complaints</option>
              <option value="Feedback">Feedback</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Tag size={16} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-sm focus:outline-none font-medium text-slate-600"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold">No feedback found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isFeedback = item.subject.includes('[Feedback]');
            const displaySubject = item.subject.replace(/\[.*?\]\s*/, '');
            
            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFeedback ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {isFeedback ? <MessageCircle size={20} /> : <MessageSquare size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isFeedback ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {isFeedback ? 'Feedback' : 'Complaint'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {item.id.split('_')[1]}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">{displaySubject}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-800">{item.userName}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Submitted By</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                        item.status === 'Open' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {item.status === 'Open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {item.status}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{item.details}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        Citizen User
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAction(item)}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                    >
                      Take Action <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedItem.subject.includes('[Feedback]') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {selectedItem.subject.includes('[Feedback]') ? <MessageCircle size={20} /> : <MessageSquare size={20} />}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Review {selectedItem.subject.includes('[Feedback]') ? 'Feedback' : 'Complaint'}</h2>
                  <p className="text-xs text-slate-500">ID: {selectedItem.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
                <p className="text-slate-800 font-medium">{selectedItem.subject.replace(/\[.*?\]\s*/, '')}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Submitted By</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {selectedItem.userName.charAt(0)}
                  </div>
                  <p className="text-sm text-slate-700">{selectedItem.userName}</p>
                  <span className="text-[10px] text-slate-400">•</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedItem.date}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Details</label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedItem.details}"</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Admin Response</label>
                <textarea 
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your response or notes here..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button 
                onClick={() => handleUpdateStatus('Open')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedItem.status === 'Open' ? 'bg-white text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
                disabled={selectedItem.status === 'Open'}
              >
                Mark as Pending
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Send size={14} />
                  Resolve & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
