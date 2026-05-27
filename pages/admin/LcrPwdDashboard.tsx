import React, { useState, useMemo } from 'react';
import { Search, Database, Eye, X, Calendar, User, Heart, ShieldAlert, BadgeInfo, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface LcrRegistryRecord {
  id: string;
  fullName: string;
  birthday: string;
  status: 'Deceased' | 'Active';
  birthPlace: string;
  gender: string;
  civilStatus: string;
  motherName: string;
  fatherName: string;
  dateDeceased?: string;
}

const LCR_DUMMY_RECORDS: LcrRegistryRecord[] = [
  { id: "LCR-1990-1284", fullName: "Maria Leonora Teresa Santos", birthday: "June 12, 1990", status: "Active", birthPlace: "Mandaluyong City", gender: "Female", civilStatus: "Single", motherName: "Consuelo Santos", fatherName: "Eduardo Santos" },
  { id: "LCR-1985-0451", fullName: "Juan Dela Cruz", birthday: "January 25, 1985", status: "Deceased", birthPlace: "Manila City", dateDeceased: "March 15, 2021", gender: "Male", civilStatus: "Married", motherName: "Juana Dela Cruz", fatherName: "Pedro Dela Cruz" },
  { id: "LCR-1861-0001", fullName: "Jose Rizal Mercado", birthday: "June 19, 1861", status: "Deceased", birthPlace: "Calamba, Laguna", dateDeceased: "December 30, 1896", gender: "Male", civilStatus: "Single", motherName: "Teodora Alonso Realonda", fatherName: "Francisco Mercado" },
  { id: "LCR-1933-4029", fullName: "Corazon Cojuangco Aquino", birthday: "January 25, 1933", status: "Deceased", birthPlace: "Paniqui, Tarlac", dateDeceased: "August 1, 2009", gender: "Female", civilStatus: "Widowed", motherName: "Demetria Sumulong", fatherName: "Jose Cojuangco" },
  { id: "LCR-1863-1130", fullName: "Andres Castro Bonifacio", birthday: "November 30, 1863", status: "Deceased", birthPlace: "Tondo, Manila", dateDeceased: "May 10, 1897", gender: "Male", civilStatus: "Married", motherName: "Catalina de Castro", fatherName: "Santiago Bonifacio" },
  { id: "LCR-1960-5021", fullName: "Benigno Simeon Aquino III", birthday: "February 8, 1960", status: "Deceased", birthPlace: "Manila City", dateDeceased: "June 24, 2021", gender: "Male", civilStatus: "Single", motherName: "Corazon Aquino", fatherName: "Benigno Aquino Jr." },
  { id: "LCR-1947-0405", fullName: "Gloria Macapagal Arroyo", birthday: "April 5, 1947", status: "Active", birthPlace: "San Juan, Rizal", gender: "Female", civilStatus: "Married", motherName: "Evangelina Macapagal", fatherName: "Diosdado Macapagal" },
  { id: "LCR-1907-0831", fullName: "Ramon Del Fierro Magsaysay", birthday: "August 31, 1907", status: "Deceased", birthPlace: "Iba, Zambales", dateDeceased: "March 17, 1957", gender: "Male", civilStatus: "Married", motherName: "Perfecta del Fierro", fatherName: "Exequiel Magsaysay" },
  { id: "LCR-1869-0322", fullName: "Emilio Famy Aguinaldo", birthday: "March 22, 1869", status: "Deceased", birthPlace: "Cavite el Viejo", dateDeceased: "February 6, 1964", gender: "Male", civilStatus: "Widowed", motherName: "Trinidad Famy", fatherName: "Carlos Aguinaldo" },
  { id: "LCR-1878-0819", fullName: "Manuel Luis Quezon", birthday: "August 19, 1878", status: "Deceased", birthPlace: "Baler, El Principe", dateDeceased: "August 1, 1944", gender: "Male", civilStatus: "Married", motherName: "Maria Dolores Molina", fatherName: "Lucio Quezon" },
  { id: "LCR-1945-0615", fullName: "Miriam Defensor Santiago", birthday: "June 15, 1945", status: "Deceased", birthPlace: "Iloilo City", dateDeceased: "September 29, 2016", gender: "Female", civilStatus: "Married", motherName: "Digna Defensor", fatherName: "Benjamin Defensor" },
  { id: "LCR-1971-0222", fullName: "Lea Salonga Chien", birthday: "February 22, 1971", status: "Active", birthPlace: "Ermita, Manila", gender: "Female", civilStatus: "Married", motherName: "Ligaya Salonga", fatherName: "Feliciano Salonga" },
  { id: "LCR-1978-1217", fullName: "Manny Pacquiao", birthday: "December 17, 1978", status: "Active", birthPlace: "Kibawe, Bukidnon", gender: "Male", civilStatus: "Married", motherName: "Dionesia Pacquiao", fatherName: "Rosalio Pacquiao" },
  { id: "LCR-1994-0106", fullName: "Catriona Elisa Magnayon Gray", birthday: "January 6, 1994", status: "Active", birthPlace: "Cairns, Queensland", gender: "Female", civilStatus: "Single", motherName: "Normita Gray", fatherName: "Ian Gray" },
  { id: "LCR-1989-0924", fullName: "Pia Alonzo Wurtzbach", birthday: "September 24, 1989", status: "Active", birthPlace: "Stuttgart, Germany", gender: "Female", civilStatus: "Married", motherName: "Cheryl Alonzo", fatherName: "Uwe Wurtzbach" },
  { id: "LCR-2000-0216", fullName: "Carlos Edriel Yulo", birthday: "February 16, 2000", status: "Active", birthPlace: "Malate, Manila", gender: "Male", civilStatus: "Single", motherName: "Angelica Yulo", fatherName: "Mark Andrew Yulo" },
  { id: "LCR-1991-0220", fullName: "Hidilyn Diaz Naranjo", birthday: "February 20, 1991", status: "Active", birthPlace: "Zamboanga City", gender: "Female", civilStatus: "Married", motherName: "Emelita Diaz", fatherName: "Eduardo Diaz" },
  { id: "LCR-1917-0911", fullName: "Ferdinand Emmanuel Marcos", birthday: "September 11, 1917", status: "Deceased", birthPlace: "Sarrat, Ilocos Norte", dateDeceased: "September 28, 1989", gender: "Male", civilStatus: "Married", motherName: "Josefa Edralon", fatherName: "Mariano Marcos" }
];

export const LcrPwdDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Deceased'>('All');
  const [selectedRecord, setSelectedRecord] = useState<LcrRegistryRecord | null>(null);

  // Filter application list
  const filteredRecords = useMemo(() => {
    return LCR_DUMMY_RECORDS.filter(record => {
      const matchesSearch = record.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Derived statistics metrics
  const stats = useMemo(() => {
    return {
      total: LCR_DUMMY_RECORDS.length,
      active: LCR_DUMMY_RECORDS.filter(r => r.status === 'Active').length,
      deceased: LCR_DUMMY_RECORDS.filter(r => r.status === 'Deceased').length
    };
  }, []);

  const ViewRecordModal = ({ record, onClose }: { record: LcrRegistryRecord, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up border border-slate-100">
          <div className="bg-slate-900 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${record.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                <Database size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white leading-none">Civil Registry Verification</h2>
                <p className="text-slate-400 text-[11px] mt-1 font-mono font-medium">Record ID: {record.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar max-h-[70vh] space-y-6">
            <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-slate-100">
              <div className="flex-1 space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Identity Profile
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Full Name</label>
                    <p className="font-bold text-slate-800 text-lg uppercase tracking-tight">{record.fullName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Gender</label>
                      <p className="font-medium text-slate-700">{record.gender}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Civil Status</label>
                      <p className="font-medium text-slate-700">{record.civilStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 shrink-0">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vital Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${record.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    <p className={`text-sm font-bold ${record.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {record.status}
                    </p>
                  </div>
                </div>

                {record.status === 'Deceased' && record.dateDeceased && (
                  <div className="space-y-1 pt-3 border-t border-slate-200">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date Reported Deceased</p>
                    <p className="text-xs font-semibold text-slate-700">{record.dateDeceased}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Calendar size={14} /> Birth Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Birth Date</label>
                    <p className="font-semibold text-slate-800">{record.birthday}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Place of Birth</label>
                    <p className="font-medium text-slate-700">{record.birthPlace}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText size={14} /> Parental Lineage
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Mother's Maiden Name</label>
                    <p className="font-medium text-slate-800 uppercase">{record.motherName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Father's Full Name</label>
                    <p className="font-medium text-slate-800 uppercase">{record.fatherName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-slate-800 transition-colors">
              Verify Record Matches
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {selectedRecord && <ViewRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800">LCR Registry</h1>
          <p className="text-slate-500 font-medium text-base">Local Civil Registry reference ledger for validation of active citizen birth registries and deceased indicators.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <button 
            onClick={() => setStatusFilter('All')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All ({stats.total})
          </button>
          <button 
            onClick={() => setStatusFilter('Active')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === 'Active' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Active ({stats.active})
          </button>
          <button 
            onClick={() => setStatusFilter('Deceased')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === 'Deceased' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Deceased ({stats.deceased})
          </button>
        </div>
      </header>

      {/* Analytics widgets and overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Civic Registries</p>
            <p className="text-3xl font-bold text-slate-800 mt-2 font-mono">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Database size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Electors</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2 font-mono">{stats.active}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Deceased Registries</p>
            <p className="text-3xl font-bold text-rose-600 mt-2 font-mono">{stats.deceased}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search registry list by fullname..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-sm uppercase tracking-tight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Heart size={12} className="text-[#1e419c]" /> Matching Records: {filteredRecords.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-medium uppercase tracking-[0.2em]">
                <th className="p-6">Fullname</th>
                <th className="p-6">Birthday</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-[#1e419c]/10 group-hover:text-[#1e419c] transition-colors shrink-0">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 uppercase tracking-tight text-sm leading-none">{record.fullName}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">Registry ID: {record.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400 shrink-0" /> {record.birthday}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      record.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedRecord(record)}
                      className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                    >
                      Review Record
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-32 text-center text-slate-300 font-medium uppercase tracking-[0.3em] text-[10px]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={32} className="opacity-20 text-slate-400" />
                    </div>
                    No records found matching "{searchTerm}" under "{statusFilter}" filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
