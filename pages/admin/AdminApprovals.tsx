
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus } from '../../types';
import { CheckCircle, XCircle, Clock, Archive, Bell } from 'lucide-react';

export const AdminApprovals: React.FC = () => {
  const { applications, updateApplicationStatus } = useApp();
  const [filter, setFilter] = useState<'pending' | 'rejected'>('pending');
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  
  const filteredApps = applications.filter(a => 
      filter === 'pending' 
      ? a.status === ApplicationStatus.PENDING 
      : a.status === ApplicationStatus.REJECTED
  );

  const handleAction = (id: string, status: ApplicationStatus, reason?: string) => {
      setNotifyingId(id);
      updateApplicationStatus(id, status, reason);
      // Simulate visual feedback for notification sending
      setTimeout(() => setNotifyingId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Application Approvals</h1>
        <p className="text-slate-500">Manage citizen requests and process applications</p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-4">
          <button 
             onClick={() => setFilter('pending')}
             className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                 filter === 'pending' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
             }`}
          >
              Pending Reviews
          </button>
          <button 
             onClick={() => setFilter('rejected')}
             className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                 filter === 'rejected' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
             }`}
          >
              Disapproved List
          </button>
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
           <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
             {filter === 'pending' ? <CheckCircle size={32} /> : <Archive size={32} />}
           </div>
           <h3 className="text-lg font-bold text-slate-800">
               {filter === 'pending' ? 'All caught up!' : 'No records found'}
           </h3>
           <p className="text-slate-500">
               {filter === 'pending' ? 'No pending applications to review.' : 'No rejected applications in history.'}
           </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApps.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl ${filter === 'pending' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                  {filter === 'pending' ? <Clock size={24} /> : <XCircle size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">{app.type}</h3>
                  <p className="text-slate-600">{app.userName}</p>
                  <p className="text-sm text-slate-400 mt-1">{app.description}</p>
                  
                  {app.rejectionReason && (
                      <p className="text-sm text-red-500 mt-2 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                          Reason: {app.rejectionReason}
                      </p>
                  )}

                  {app.documents && app.documents.length > 0 && (
                      <div className="flex gap-2 mt-2">
                          {app.documents.map((doc, i) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                  {doc}
                              </span>
                          ))}
                      </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">Submitted: {app.date}</p>
                </div>
              </div>
              
              {filter === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3">
                        <button
                        onClick={() => handleAction(app.id, ApplicationStatus.REJECTED, "Document mismatch or incomplete requirements.")}
                        className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                        <XCircle size={16} />
                        Reject
                        </button>
                        <button
                        onClick={() => handleAction(app.id, ApplicationStatus.APPROVED)}
                        className="flex-1 md:flex-none px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2"
                        >
                        <CheckCircle size={16} />
                        Approve
                        </button>
                    </div>
                    {notifyingId === app.id && (
                        <div className="text-[10px] font-bold text-blue-500 flex items-center justify-center gap-1 animate-pulse">
                            <Bell size={10} /> Sending SMS/Email Notification...
                        </div>
                    )}
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
