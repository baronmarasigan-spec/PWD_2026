
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Users, Activity, CloudOff, RefreshCw, Layers, Clock, ShieldCheck, AlertCircle, BarChart as BarChartIcon } from 'lucide-react';

const COLORS = ['#dc2626', '#1e419c', '#d97706', '#059669'];

export const AdminDashboard: React.FC = () => {
  const { applications, complaints, users, isLiveMode, syncApplications } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const approvedToday = applications.filter(a => a.status === 'Approved').length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const totalPWDs = users.filter(u => u.role === 'CITIZEN').length;

  const dataStatus = [
    { name: 'Pending', value: pendingApps },
    { name: 'Approved', value: approvedToday },
    { name: 'Issued', value: applications.filter(a => a.status === 'Issued').length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length },
  ];

  const appTypeData = [
    { name: 'Enrollment', count: applications.filter(a => a.type === 'Registration').length },
    { name: 'ID Lifecycle', count: applications.filter(a => a.type.includes('ID')).length },
  ];

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await syncApplications();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-fade-in-down">
          <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Pwd command center</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium text-lg">Disability Affairs Administration</p>
            <div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full`}>
                {isLiveMode ? <Activity size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}
                <span className={`text-[9px] font-medium uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isLiveMode ? 'CLOUD CONNECTED' : 'LOCAL CACHE MODE'}
                </span>
            </div>
          </div>
        </div>
        <button 
           onClick={handleManualSync}
           disabled={isRefreshing}
           className="px-6 py-3 bg-[#1e419c] text-white rounded-2xl font-semibold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Handshaking...' : 'Sync PWD Records'}
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered PWDs', value: totalPWDs, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+5% Registry Growth' },
          { label: 'Pending PWD Apps', value: pendingApps, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: 'Needs Verification' },
          { label: 'Verified Today', value: approvedToday, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Credentials Processed' },
          { label: 'Support Inquiries', value: openComplaints, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', trend: 'Active Concerns' },
        ].map((stat, i) => (
          <div 
             key={i} 
             className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 animate-fade-in-up transition-all hover:shadow-xl hover:shadow-slate-200/50 group"
             style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-between items-start">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon size={24} />
                </div>
                <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{stat.trend}</div>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 min-w-0 flex flex-col ring-1 ring-black/5">
          <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 uppercase tracking-tight">Status Lifecycle</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">PWD Application Flow</p>
              </div>
              <Layers size={20} className="text-slate-200" />
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 min-w-0 flex flex-col ring-1 ring-black/5">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 uppercase tracking-tight">Support Volume</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Service Classification</p>
              </div>
              <BarChartIcon size={20} className="text-slate-200" />
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'medium' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'medium' }} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[12, 12, 0, 0]} barSize={50}>
                   {appTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#dc2626' : '#1e419c'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
