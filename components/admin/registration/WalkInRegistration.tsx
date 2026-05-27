
import React from 'react';
import { Search, UserPlus, Archive, Eye, User as UserIcon } from 'lucide-react';
import { Application } from '../../../types';
import { useNavigate } from 'react-router-dom';

interface WalkInRegistrationProps {
  filteredApps: Application[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  barangayFilter: string;
  setBarangayFilter: (brgy: string) => void;
  ALL_BARANGAYS: string[];
  onView: (app: Application) => void;
}

export const WalkInRegistration: React.FC<WalkInRegistrationProps> = ({
  filteredApps,
  searchTerm,
  setSearchTerm,
  barangayFilter,
  setBarangayFilter,
  ALL_BARANGAYS,
  onView
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Walk-in Registration</h1>
          <p className="text-slate-500 mt-1">Manage manual PWD enrollments and walk-in applicants.</p>
        </div>
        <button 
          onClick={() => navigate('/register?isWalkIn=true')}
          className="flex items-center gap-2 px-6 py-3 bg-pdao_red text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
        >
          <UserPlus size={16} />
          Register here
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search walk-in entries..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 ring-slate-200 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 ring-slate-200 transition-all min-w-[200px]"
            >
              <option value="all">All Barangays</option>
              {ALL_BARANGAYS.map(brgy => (
                <option key={brgy} value={brgy}>{brgy}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barangay</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Added</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Archive size={48} />
                      <p className="text-sm font-medium">No walk-in records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => onView(app)}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-white transition-all">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{app.userName}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">ID: {app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-600">{app.formData?.barangay || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-600">{new Date(app.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
