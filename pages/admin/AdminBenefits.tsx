
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Application } from '../../types';
import { 
  CheckCircle, XCircle, HeartHandshake, Archive, Search, Banknote, 
  Clock, HelpCircle, X, UserMinus, Eye, Download, FileText, 
  ZoomIn, ZoomOut, Printer, ShieldCheck, AlertCircle, File, RefreshCw,
  MapPin, Globe
} from 'lucide-react';

export const AdminBenefits: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const { 
    applications, 
    updateApplicationStatus, 
    users,
    cashGrants,
    generateCashGrantList,
    updateCashGrantStatus
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States for Modals
  const [confirmingApp, setConfirmingApp] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const isBenefitType = (type: ApplicationType) => {
      return type === ApplicationType.BENEFIT_CASH;
  };

  const handleApprove = () => {
    if (confirmingApp) {
      updateApplicationStatus(confirmingApp.id, ApplicationStatus.APPROVED);
      setConfirmingApp(null);
      setViewingApp(null);
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingApp) {
      updateApplicationStatus(rejectingApp.id, ApplicationStatus.REJECTED, rejectionRemarks);
      setRejectingApp(null);
      setRejectionRemarks('');
      setViewingApp(null);
    }
  };

  const handleDownloadFile = (fileName: string) => {
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    let blob: Blob;
    
    if (isPdf) {
        // Minimal valid PDF
        const pdfContent = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 21 >>
stream
BT /F1 12 Tf ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000178 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
249
%%EOF`;
        blob = new Blob([pdfContent], { type: 'application/pdf' });
    } else {
        blob = new Blob([`Mock data for ${fileName}`], { type: 'text/plain' });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const DocumentViewer = () => {
    if (!activeFile) return null;
    const isImage = activeFile.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPdf = activeFile.toLowerCase().endsWith('.pdf');
    
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setActiveFile(null)} />
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up">
                <div className="bg-[#1e419c] p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={20} />
                        <span className="font-medium uppercase tracking-widest text-xs">{activeFile}</span>
                    </div>
                    <button onClick={() => setActiveFile(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 bg-slate-100 flex items-center justify-center p-10 overflow-auto">
                    {isImage ? (
                        <img 
                            src={`https://picsum.photos/seed/${activeFile}/1200/800`} 
                            alt={activeFile} 
                            className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                            referrerPolicy="no-referrer"
                        />
                    ) : isPdf ? (
                        <div className="w-full h-full bg-white rounded-3xl shadow-inner border border-slate-200 flex flex-col items-center justify-center text-slate-400 font-medium uppercase tracking-widest">
                            <FileText size={64} className="mb-4 text-[#1e419c] opacity-20" />
                            <p>PDF Preview Active</p>
                            <p className="text-[10px] mt-2 opacity-60">Secure Document Node Connection Established</p>
                            <button 
                                onClick={() => handleDownloadFile(activeFile)}
                                className="mt-6 px-6 py-2 bg-[#1e419c] text-white rounded-lg text-[10px] tracking-widest"
                            >
                                Open in New Tab to View
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white rounded-3xl shadow-inner border border-slate-200 flex items-center justify-center text-slate-400 font-medium uppercase tracking-widest">
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                Document Preview Mode
                                <p className="text-[10px] mt-2 opacity-60">Secure PDF/Doc Viewer Active</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500"/> Verified Document Source
                    </p>
                    <button 
                        onClick={() => handleDownloadFile(activeFile)}
                        className="px-10 py-3 bg-[#1e419c] text-white rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
                    >
                        <Download size={14} /> Download Copy
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const ApplicationDetailsModal = ({ app, onClose }: { app: Application, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up">
           <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-600">
                      <Banknote size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-semibold uppercase tracking-widest">Benefit Review</h2>
                      <p className="text-[10px] text-white/60 font-medium uppercase tracking-tighter mt-1">Cash Grant Application</p>
                  </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
              </button>
           </div>

           <div className="p-8 space-y-8 bg-slate-50 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block mb-1">Applicant Name</label>
                   <p className="font-semibold text-slate-800 text-lg uppercase tracking-tight">{app.userName}</p>
                </div>
                <div>
                   <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block mb-1">Date Submitted</label>
                   <p className="font-medium text-slate-800">{app.date}</p>
                </div>
                <div className="col-span-2">
                   <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block mb-1">Benefit Details</label>
                   <div className="bg-white p-4 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 leading-relaxed">
                      {app.description}
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">Attachments & Proofs</label>
                 <div className="grid grid-cols-1 gap-3">
                    {app.documents?.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-primary-300 transition-all shadow-sm">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <File size={18} className="text-primary-500 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 truncate">{doc}</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => setActiveFile(doc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="View Document"><Eye size={16}/></button>
                            <button onClick={() => handleDownloadFile(doc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Download Document"><Download size={16}/></button>
                         </div>
                      </div>
                    ))}
                    {(!app.documents || app.documents.length === 0) && (
                      <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium uppercase">No digital requirements attached</div>
                    )}
                 </div>
              </div>
           </div>

           <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
               {app.status === ApplicationStatus.PENDING ? (
                 <>
                   <button 
                      onClick={() => setRejectingApp(app)}
                      className="px-6 py-3 border-2 border-slate-100 text-slate-500 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                   >
                      Reject Claim
                   </button>
                   <button 
                      onClick={() => setConfirmingApp(app)}
                      className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                   >
                      Approve Assistance
                   </button>
                 </>
               ) : (
                 <button onClick={onClose} className="px-10 py-3 bg-[#1e419c] text-white rounded-xl font-medium text-[10px] uppercase tracking-widest">Close Record</button>
               )}
           </div>
        </div>
      </div>
    );
  };

  const ApprovalModal = () => {
    if (!confirmingApp) return null;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmingApp(null)} />
        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
           <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600">
                 <HelpCircle size={28} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Approve Benefit</h3>
                 <p className="text-slate-500 text-sm leading-relaxed font-medium">
                   Are you sure you want to approve this benefit application for <strong>{confirmingApp.userName}</strong>?
                 </p>
              </div>
           </div>
           <div className="p-4 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setConfirmingApp(null)} 
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove} 
                className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 shadow-emerald-600/20 transition-all text-xs uppercase tracking-widest"
              >
                Approve Now
              </button>
           </div>
        </div>
      </div>
    );
  };

  const RejectionModal = () => {
    if (!rejectingApp) return null;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRejectingApp(null)} />
        <form onSubmit={handleReject} className="bg-white w-full max-md rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
           <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                 <UserMinus size={18} />
              </div>
              <h3 className="font-semibold text-red-800 uppercase tracking-widest">Reject Application</h3>
              <button type="button" onClick={() => setRejectingApp(null)} className="ml-auto p-1 hover:bg-red-200 rounded-full transition-colors">
                <X size={20} className="text-red-500" />
              </button>
           </div>
           <div className="p-8 space-y-4">
              <p className="text-sm text-slate-600 font-medium">Provide remarks for rejecting <strong>{rejectingApp.userName}</strong>'s request:</p>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none font-medium"
                rows={4}
                placeholder="e.g. Applicant does not meet specific ordinance requirements..."
                value={rejectionRemarks}
                required
                onChange={(e) => setRejectionRemarks(e.target.value)}
              />
           </div>
           <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setRejectingApp(null)} 
                className="px-6 py-2 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2 bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all uppercase tracking-widest text-xs"
              >
                Confirm Reject
              </button>
           </div>
        </form>
      </div>
    );
  };

  if (tab === 'approval') {
    const pending = applications.filter(a => isBenefitType(a.type) && a.status === ApplicationStatus.PENDING);

    return (
      <div className="space-y-6 animate-fade-in">
        <ApprovalModal />
        <RejectionModal />
        {viewingApp && <ApplicationDetailsModal app={viewingApp} onClose={() => setViewingApp(null)} />}
        {activeFile && <DocumentViewer />}
        
        <header>
          <h1 className="text-[32px] font-normal text-slate-800 tracking-tight">Benefit approvals</h1>
          <p className="text-slate-500 font-medium">Review pending benefit claims and assistance requests.</p>
        </header>

        {pending.length === 0 ? (
           <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
             <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <HeartHandshake size={32} />
             </div>
             <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">No pending benefit applications</p>
           </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary-200 transition-all">
                <div className="flex items-start gap-4 flex-1 overflow-hidden">
                  <div className="p-4 rounded-2xl shrink-0 transition-colors bg-emerald-50 text-emerald-600">
                    <Banknote size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-slate-800 text-lg uppercase tracking-tight truncate">
                        {app.userName} 
                        <span className="text-[10px] text-slate-400 font-mono ml-2">ID: {users.find(u => u.id === app.userId)?.pwdIdNumber || app.formData?.controlNo || app.id}</span>
                    </h3>
                    <p className="text-slate-500 font-medium text-[10px] uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                       <Clock size={10} /> Applied: {app.date}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-widest shrink-0 bg-emerald-100 text-emerald-700">
                            Cash Grant
                        </span>
                        <p className="text-xs text-slate-600 font-medium truncate">{app.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingApp(app)}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Eye size={14} /> View Requirements
                  </button>
                  <button
                    onClick={() => setConfirmingApp(app)}
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                    title="Quick Approve"
                  >
                    <CheckCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === 'approved') {
    const approved = applications.filter(a => isBenefitType(a.type) && (a.status === ApplicationStatus.APPROVED || a.status === ApplicationStatus.ISSUED));

    return (
      <div className="space-y-6 animate-fade-in">
        {viewingApp && <ApplicationDetailsModal app={viewingApp} onClose={() => setViewingApp(null)} />}
        {activeFile && <DocumentViewer />}

        <header>
          <h1 className="text-[32px] font-normal text-slate-800 tracking-tight">Approved benefits</h1>
          <p className="text-slate-500 font-medium">Registry of granted financial and medical assistance.</p>
        </header>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
             <div className="relative max-w-md">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search beneficiaries..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1e419c] text-white text-[10px] font-medium uppercase tracking-[0.2em]">
                  <th className="p-6">Applied Date</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Applicant Name</th>
                  <th className="p-6">Mode</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approved.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">No approved records</td>
                  </tr>
                ) : (
                  approved.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <span className="text-xs text-slate-500 font-medium">{app.date}</span>
                      </td>
                      <td className="p-6">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-semibold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          <CheckCircle size={10} /> {app.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold text-slate-800 text-sm uppercase tracking-tight">{app.userName}</p>
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">ID: {users.find(u => u.id === app.userId)?.pwdIdNumber || app.formData?.controlNo || app.id}</span>
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
                      <td className="p-6 text-right">
                         <button onClick={() => setViewingApp(app)} className="text-[10px] font-medium uppercase text-primary-600 hover:underline">View Claim</button>
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
  }

  if (tab === 'disapproved') {
    const rejected = applications.filter(a => isBenefitType(a.type) && a.status === ApplicationStatus.REJECTED);

    return (
      <div className="space-y-6 animate-fade-in">
        {viewingApp && <ApplicationDetailsModal app={viewingApp} onClose={() => setViewingApp(null)} />}
        {activeFile && <DocumentViewer />}

        <header>
          <h1 className="text-[32px] font-normal text-slate-800 tracking-tight">Disapproved benefits</h1>
          <p className="text-slate-500 font-medium">History of rejected benefit claims.</p>
        </header>

         {rejected.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Archive size={32} />
                </div>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">No records available</p>
            </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1e419c] text-white text-[10px] font-medium uppercase tracking-[0.2em]">
                    <th className="p-6">Applied Date</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Applicant Name</th>
                    <th className="p-6">Mode</th>
                    <th className="p-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rejected.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-medium text-xs text-slate-500">{app.date}</td>
                      <td className="p-6">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-[9px] font-semibold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          <XCircle size={10} /> {app.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold text-slate-800 text-sm uppercase tracking-tight">{app.userName}</p>
                        <div className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex items-start gap-2 max-w-sm mt-1">
                            <p className="text-[10px] text-red-700 font-medium italic leading-relaxed truncate">
                                {app.rejectionReason || 'Requirements incomplete'}
                            </p>
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
                      <td className="p-6 text-right">
                         <button onClick={() => setViewingApp(app)} className="text-[10px] font-medium uppercase text-primary-600 hover:underline">Review Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'cash-grant') {
    const currentYear = new Date().getFullYear();
    const grantsForYear = cashGrants.filter(cg => cg.year === currentYear);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Eligible': return 'bg-blue-100 text-blue-700';
        case 'Reviewed': return 'bg-purple-100 text-purple-700';
        case 'Distributing': return 'bg-amber-100 text-amber-700';
        case 'Claimed': return 'bg-emerald-100 text-emerald-700';
        case 'Unclaimed': return 'bg-red-100 text-red-700';
        case 'For follow up': return 'bg-slate-100 text-slate-700';
        default: return 'bg-slate-100 text-slate-700';
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-[32px] font-normal text-slate-800 tracking-tight">Cash Grant Flow (3,000)</h1>
            <p className="text-slate-500 font-medium text-lg">Year-End Financial Assistance Management</p>
          </div>
          <button 
            onClick={() => generateCashGrantList(currentYear)}
            className="px-8 py-4 bg-[#1e419c] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={14} /> Generate Eligibility List {currentYear}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Eligibility Filters</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <CheckCircle size={14} className="text-emerald-500" /> Registered for 6 months or more
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <CheckCircle size={14} className="text-emerald-500" /> Not senior citizen
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <CheckCircle size={14} className="text-emerald-500" /> Not deceased
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <CheckCircle size={14} className="text-emerald-500" /> Born 1962 and below
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Eligible</p>
            <p className="text-4xl font-bold text-slate-800">{grantsForYear.length}</p>
            <p className="text-slate-500 text-xs font-medium mt-2">Beneficiaries identified for {currentYear}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Amount</p>
            <p className="text-4xl font-bold text-emerald-600">₱{(grantsForYear.length * 3000).toLocaleString()}</p>
            <p className="text-slate-500 text-xs font-medium mt-2">Budget Allocation Required</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search beneficiary..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => grantsForYear.filter(g => g.status === 'Eligible').forEach(g => updateCashGrantStatus(g.id, 'Reviewed' as any))}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-purple-100 hover:bg-purple-100 transition-all"
              >
                Review All Eligible
              </button>
              <button 
                onClick={() => grantsForYear.filter(g => g.status === 'Reviewed').forEach(g => updateCashGrantStatus(g.id, 'Distributing' as any))}
                className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all"
              >
                Start Distribution
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1e419c] text-white text-[10px] font-medium uppercase tracking-[0.2em]">
                  <th className="p-6">Date Generated</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Beneficiary</th>
                  <th className="p-6">Amount</th>
                  <th className="p-6 text-center">Mode</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grantsForYear.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">No records generated for {currentYear}</td>
                  </tr>
                ) : (
                  grantsForYear
                    .filter(g => g.userName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(grant => (
                    <tr key={grant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <span className="text-xs text-slate-500 font-medium">{new Date(grant.dateGenerated).toLocaleDateString()}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusColor(grant.status)}`}>
                          {grant.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold text-slate-800 text-sm uppercase tracking-tight">{grant.userName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">ID: {grant.userId}</p>
                      </td>
                      <td className="p-6">
                        <span className="font-bold text-slate-700">₱{grant.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-8 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                            grant.isWalkIn 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                            {grant.isWalkIn ? (
                                <><MapPin size={14} /> Walk-in</>
                            ) : (
                                <><Globe size={14} /> Online</>
                            )}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          {grant.status === 'Eligible' && (
                            <button 
                              onClick={() => updateCashGrantStatus(grant.id, 'Reviewed' as any)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="Mark as Reviewed"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {grant.status === 'Reviewed' && (
                            <button 
                              onClick={() => updateCashGrantStatus(grant.id, 'Distributing' as any)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Move to Distribution"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                          {grant.status === 'Distributing' && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => updateCashGrantStatus(grant.id, 'Claimed' as any)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[8px] font-bold uppercase tracking-tighter border border-emerald-100"
                              >
                                Claimed
                              </button>
                              <button 
                                onClick={() => updateCashGrantStatus(grant.id, 'Unclaimed' as any)}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded text-[8px] font-bold uppercase tracking-tighter border border-red-100"
                              >
                                Unclaimed
                              </button>
                              <button 
                                onClick={() => updateCashGrantStatus(grant.id, 'For follow up' as any)}
                                className="px-2 py-1 bg-slate-50 text-slate-700 rounded text-[8px] font-bold uppercase tracking-tighter border border-slate-100"
                              >
                                Follow up
                              </button>
                            </div>
                          )}
                          {(grant.status === 'Claimed' || grant.status === 'Unclaimed' || grant.status === 'For follow up') && (
                             <button 
                               onClick={() => updateCashGrantStatus(grant.id, 'Distributing' as any)}
                               className="text-[9px] font-bold text-slate-400 uppercase hover:text-primary-600"
                             >
                               Reset Status
                             </button>
                          )}
                        </div>
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
  }

  return <div>Select a sub-menu</div>;
};
