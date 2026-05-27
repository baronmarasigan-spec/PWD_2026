
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationType } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { generateExecutiveSummary } from '../../services/gemini';
import { Sparkles, Users, FileText, AlertCircle } from 'lucide-react';

// Updated colors: Red, Blue, Amber, Emerald
const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

export const AdminReports: React.FC = () => {
  const { applications, complaints, users } = useApp();
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Stats
  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const totalPWDs = users.filter(u => u.role === 'CITIZEN').length;

  const dataStatus = [
    { name: 'Pending', value: pendingApps },
    { name: 'Approved', value: approvedApps },
    { name: 'Issued', value: applications.filter(a => a.status === 'Issued').length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length },
  ];

  const appTypeData = [
    { name: 'Registration', count: applications.filter(a => a.type === ApplicationType.REGISTRATION).length },
    { name: 'ID Renewal', count: applications.filter(a => a.type === ApplicationType.ID_RENEWAL).length },
    { name: 'Benefits', count: applications.filter(a => a.type.includes('Benefit')).length },
  ];

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const summary = await generateExecutiveSummary(applications, complaints);
    setAiSummary(summary);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500">System overview and executive summaries</p>
      </header>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-xl shadow-primary-200">
        <div className="flex items-start justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
               <Sparkles className="text-yellow-300" />
               <h3 className="font-bold text-lg">AI Executive Insight</h3>
            </div>
            {aiSummary ? (
               <p className="text-white/90 leading-relaxed animate-fade-in">{aiSummary}</p>
            ) : (
               <p className="text-white/70">Generate an AI-powered summary of current bottlenecks and system health.</p>
            )}
          </div>
          <button 
            onClick={handleGenerateInsight}
            disabled={loadingAi}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm disabled:opacity-50"
          >
            {loadingAi ? 'Analyzing...' : 'Generate Insight'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total PWDs', value: totalPWDs, icon: Users, color: 'text-secondary-600', bg: 'bg-secondary-50' },
          { label: 'Pending Apps', value: pendingApps, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved Today', value: approvedApps, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Open Complaints', value: openComplaints, icon: AlertCircle, color: 'text-primary-600', bg: 'bg-primary-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-w-0">
          <h3 className="font-bold text-slate-800 mb-6">Application Status Distribution</h3>
          <div className="h-[300px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {dataStatus.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-slate-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-w-0">
          <h3 className="font-bold text-slate-800 mb-6">Applications by Type</h3>
          <div className="h-[300px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
