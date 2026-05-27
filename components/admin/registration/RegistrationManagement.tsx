
import React, { useState, useMemo } from 'react';
import { Search, MapPin, ChevronDown, Layers, Clock, Calendar, CheckCircle, XCircle, MoreHorizontal, Eye, Edit2, Trash2, Info, RefreshCw, Database, ClipboardList, Globe } from 'lucide-react';
import { ApplicationStatus, Application, Role } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface RegistrationManagementProps {
  filteredApps: Application[];
  counts: {
    all: number;
    pending: number;
    scheduled: number;
    approved: number;
    rejected: number;
  };
  statusFilter: 'all' | ApplicationStatus;
  setStatusFilter: (status: 'all' | ApplicationStatus) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  barangayFilter: string;
  setBarangayFilter: (brgy: string) => void;
  ALL_BARANGAYS: string[];
  isSyncing: boolean;
  onView: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onSchedule: (app: Application) => void;
  onApprove: (app: Application) => void;
  onReject: (app: Application) => void;
  onRestore: (app: Application) => void;
}

export const RegistrationManagement: React.FC<RegistrationManagementProps> = ({
  filteredApps,
  counts,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  barangayFilter,
  setBarangayFilter,
  ALL_BARANGAYS,
  isSyncing,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onApprove,
  onReject,
  onRestore
}) => {
  const { users } = useApp();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
      <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#1e419c]" size={20} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Search queue..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-[#1e419c]/10 outline-none transition-all text-sm text-slate-900 font-medium uppercase tracking-tight" 
              />
            </div>
            <div className="relative w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select 
                value={barangayFilter} 
                onChange={e => setBarangayFilter(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-[#1e419c]/10 outline-none transition-all text-sm text-slate-900 font-medium uppercase appearance-none"
              >
                <option value="all">All Barangays</option>
                {ALL_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            <ClipboardList size={12} className="text-[#1e419c]" /> Persistent Records: {filteredApps.length}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/50">
          {[
            { id: 'all', label: 'All Records', icon: Layers, count: counts.all },
            { id: ApplicationStatus.PENDING, label: 'Pending', icon: Clock, count: counts.pending },
            { id: ApplicationStatus.SCHEDULED, label: 'Scheduled', icon: Calendar, count: counts.scheduled },
            { id: ApplicationStatus.APPROVED, label: 'Approved', icon: CheckCircle, count: counts.approved },
            { id: ApplicationStatus.REJECTED, label: 'Rejected', icon: XCircle, count: counts.rejected }
          ].map(tabOpt => (
            <button 
              key={tabOpt.id} 
              onClick={() => setStatusFilter(tabOpt.id as any)} 
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-[10px] uppercase tracking-widest transition-all ${
                statusFilter === tabOpt.id ? 'bg-[#1e419c] text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <tabOpt.icon size={14} />
              {tabOpt.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium ${
                statusFilter === tabOpt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
              }`}>{tabOpt.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="p-32 text-center text-slate-300">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">{isSyncing ? <RefreshCw size={60} className="animate-spin opacity-20 text-[#1e419c]" /> : <Database size={60} className="opacity-10" />}</div>
          <p className="font-medium uppercase tracking-[0.3em] text-xs text-slate-400">{isSyncing ? 'Handshaking...' : 'No records match filter.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1e419c] text-white text-[10px] font-normal uppercase tracking-[0.2em]">
              <tr>
                <th className="p-8">Applicant Name</th>
                <th className="p-8">Barangay</th>
                <th className="p-8">Registration Date</th>
                <th className="p-8">Status</th>
                <th className="p-8">Type of registration</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        <img 
                          src={app.formData?.capturedImage || users.find(u => u.id === app.userId)?.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
                          alt={app.userName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 uppercase tracking-tight text-sm leading-tight">{app.userName}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">ID: {users.find(u => u.id === app.userId)?.pwdIdNumber || app.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-xs font-medium text-slate-600">
                      {app.formData?.barangay || 'N/A'}
                    </span>
                  </td>
                  <td className="p-8">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-300" /> {app.date}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest border ${
                        app.status === ApplicationStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        app.status === ApplicationStatus.SCHEDULED ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        app.status === ApplicationStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>{app.status}</span>
                      
                      {app.status === ApplicationStatus.SCHEDULED && (
                        <div className="flex flex-col text-[10px] text-slate-500 font-medium space-y-0.5">
                          <span className="flex items-center gap-1"><Calendar size={10} /> Appt: {app.appointmentDate || 'N/A'}</span>
                          <span className="flex items-center gap-1"><CheckCircle size={10} /> Reviewed: {app.reviewedDate || app.date}</span>
                        </div>
                      )}
                      
                      {(app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.REJECTED) && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <CheckCircle size={10} /> Reviewed: {app.reviewedDate || app.date}
                          </span>
                          {app.status === ApplicationStatus.REJECTED && app.rejectionReason && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onView(app); }}
                              className="text-left text-[10px] font-bold text-red-600 uppercase tracking-tight hover:underline flex items-center gap-1"
                            >
                              <Info size={10} /> Reason: {app.rejectionReason.length > 15 ? `${app.rejectionReason.substring(0, 15)}...` : app.rejectionReason}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                      app.formData?.isWalkIn 
                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                        : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {app.formData?.isWalkIn ? (
                        <><MapPin size={14} /> Walk-in</>
                      ) : (
                        <><Globe size={14} /> Online</>
                      )}
                    </span>
                  </td>
                  <td className="p-8 text-right relative">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === app.id ? null : app.id)}
                          className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        
                        {openDropdownId === app.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                            <div className={`absolute right-8 ${filteredApps.indexOf(app) >= filteredApps.length - 2 && filteredApps.length > 2 ? 'bottom-full origin-bottom mb-2' : 'top-16 origin-top'} w-64 bg-white rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 z-20 py-4 flex flex-col items-start overflow-hidden animate-scale-up`}>
                              <button 
                                onClick={() => { onView(app); setOpenDropdownId(null); }}
                                className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-slate-50 transition-colors text-slate-600 group"
                              >
                                <Eye size={18} className="text-slate-400" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">View Profile</span>
                              </button>
                              
                              <div className="w-full h-[1px] bg-slate-50 my-1" />

                              {app.status === ApplicationStatus.PENDING && (
                                <button 
                                  onClick={() => { onSchedule(app); setOpenDropdownId(null); }}
                                  className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-blue-50 transition-colors text-blue-600 group"
                                >
                                  <Calendar size={18} className="text-blue-500" />
                                  <span className="text-[11px] font-bold uppercase tracking-widest">Schedule Appointment</span>
                                </button>
                              )}

                              {app.status === ApplicationStatus.SCHEDULED && (
                                <>
                                  <button 
                                    onClick={() => { onApprove(app); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-emerald-50 transition-colors text-emerald-600 group"
                                  >
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Approve</span>
                                  </button>
                                  
                                  <button 
                                    onClick={() => { onReject(app); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-red-50 transition-colors text-red-600 group"
                                  >
                                    <XCircle size={18} className="text-red-500" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Disapprove</span>
                                  </button>
                                </>
                              )}

                              {(app.status === ApplicationStatus.PENDING || app.status === ApplicationStatus.SCHEDULED) && (
                                <>
                                  <div className="w-full h-[1px] bg-slate-50 my-1" />
                                  <button 
                                    onClick={() => { onEdit(app); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-slate-50 transition-colors text-slate-600 group"
                                  >
                                    <Edit2 size={18} className="text-slate-300" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Edit Profile</span>
                                  </button>
                                  
                                  <button 
                                    onClick={() => { onDelete(app); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-red-50 transition-colors text-red-600 group"
                                  >
                                    <Trash2 size={18} className="text-red-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Delete Record</span>
                                  </button>
                                </>
                              )}

                              {app.status === ApplicationStatus.REJECTED && (
                                <>
                                  <div className="w-full h-[1px] bg-slate-50 my-1" />
                                  <button 
                                    onClick={() => { onRestore(app); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-blue-50 transition-colors text-blue-600 group"
                                  >
                                    <RefreshCw size={18} className="text-blue-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Move to Pending</span>
                                  </button>

                                  <button 
                                    onClick={() => { onDelete(app); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-red-50 transition-colors text-red-600 group"
                                  >
                                    <Trash2 size={18} className="text-red-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Delete Record</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
