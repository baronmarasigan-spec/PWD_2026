
import React, { useState, useMemo } from 'react';
import { Application, ApplicationStatus, RegistryRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle, XCircle, UserCheck, X, Edit2, Save, 
  ShieldAlert, ShieldCheck, User as UserIcon, MapPin, 
  FileText, File, Eye, Download, RefreshCw, Phone, Briefcase, Heart, Fingerprint, CreditCard
} from 'lucide-react';

interface ApplicationReviewModalProps {
  app: Application;
  onClose: () => void;
  setViewingApp: React.Dispatch<React.SetStateAction<Application | null>>;
  setRejectingApp: React.Dispatch<React.SetStateAction<Application | null>>;
  setConfirmingApproveApp: React.Dispatch<React.SetStateAction<Application | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  rejectionRemarks: string;
  setRejectionRemarks: React.Dispatch<React.SetStateAction<string>>;
  initialEditMode?: boolean;
}

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
};

export const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({ 
  app, 
  onClose, 
  setViewingApp,
  setRejectingApp,
  setConfirmingApproveApp,
  setSuccessMessage,
  rejectionRemarks,
  setRejectionRemarks,
  initialEditMode = false
}) => {
    const { applications, updateApplicationStatus, updateApplicationData, actionError, registryRecords, users } = useApp();
    const [isEditMode, setIsEditMode] = useState(initialEditMode);
    const [editData, setEditData] = useState({
        firstName: app.formData?.firstName || '',
        lastName: app.formData?.lastName || '',
        middleName: app.formData?.middleName || '',
        suffix: app.formData?.suffix || '',
        birthDate: app.formData?.birthDate || '',
        gender: app.formData?.gender || app.formData?.sex || '',
        civilStatus: app.formData?.civilStatus || '',
        citizenship: app.formData?.citizenship || 'Filipino',
        typeOfDisability: app.formData?.typeOfDisability || app.formData?.disabilityType || '',
        causeOfDisability: app.formData?.causeOfDisability || '',
        streetAddress: app.formData?.streetAddress || app.formData?.address || '',
        barangay: app.formData?.barangay || '',
        cityMunicipality: app.formData?.cityMunicipality || '',
        province: app.formData?.province || '',
        region: app.formData?.region || '',
        mobileNumber: app.formData?.mobileNumber || app.formData?.contactNumber || '',
        landline: app.formData?.landline || '',
        emailAddress: app.formData?.emailAddress || app.formData?.email || '',
        emergencyContactPerson: app.formData?.emergencyContactPerson || '',
        emergencyContactNumber: app.formData?.emergencyContactNumber || '',
        relationship: app.formData?.relationship || '',
        highestEducation: app.formData?.highestEducation || '',
        employmentStatus: app.formData?.employmentStatus || '',
        employmentType: app.formData?.employmentType || '',
        employmentCategory: app.formData?.employmentCategory || '',
        occupation: app.formData?.occupation || '',
        physicianName: app.formData?.physicianName || '',
        physicianLicense: app.formData?.physicianLicense || '',
        accomplishedBy: app.formData?.accomplishedBy || 'APPLICANT',
        accomplishedByLastName: app.formData?.accomplishedByLastName || '',
        accomplishedByFirstName: app.formData?.accomplishedByFirstName || '',
        accomplishedByMiddleName: app.formData?.accomplishedByMiddleName || '',
        orgName: app.formData?.orgName || '',
        orgContactPerson: app.formData?.orgContactPerson || '',
        orgAddress: app.formData?.orgAddress || '',
        orgContactNo: app.formData?.orgContactNo || '',
        sssNumber: app.formData?.sssNumber || '',
        gsisNumber: app.formData?.gsisNumber || '',
        pagIbigNumber: app.formData?.pagIbigNumber || '',
        psnNumber: app.formData?.psnNumber || '',
        philHealthNumber: app.formData?.philHealthNumber || '',
        fatherName: (() => {
            const f = app.formData?.fatherFirstName;
            const m = app.formData?.fatherMiddleName;
            const l = app.formData?.fatherLastName;
            if (f || m || l) return `${f || ''} ${m || ''} ${l || ''}`.replace(/\s+/g, ' ').trim();
            return app.formData?.fatherName || '';
        })(),
        motherName: (() => {
            const f = app.formData?.motherFirstName;
            const m = app.formData?.motherMiddleName;
            const l = app.formData?.motherLastName;
            if (f || m || l) return `${f || ''} ${m || ''} ${l || ''}`.replace(/\s+/g, ' ').trim();
            return app.formData?.motherName || '';
        })(),
        guardianName: (() => {
            const f = app.formData?.guardianFirstName;
            const m = app.formData?.guardianMiddleName;
            const l = app.formData?.guardianLastName;
            if (f || m || l) return `${f || ''} ${m || ''} ${l || ''}`.replace(/\s+/g, ' ').trim();
            return app.formData?.guardianName || '';
        })(),
        dateApplied: app.formData?.dateApplied || '',
        processingOfficer: app.formData?.processingOfficer || '',
        approvingOfficer: app.formData?.approvingOfficer || ''
    });

    const applicantUser = useMemo(() => users.find(u => u.id === app.userId), [users, app.userId]);
    const [isSaving, setIsSaving] = useState(false);
    const [isClarifying, setIsClarifying] = useState(false);
    const [activeFile, setActiveFile] = useState<string | null>(null);

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

    const verificationResults = useMemo(() => {
        if (!app.formData) return null;
        const record = registryRecords.find(r => 
            r.firstName.toLowerCase() === app.formData?.firstName.toLowerCase() && 
            r.lastName.toLowerCase() === app.formData?.lastName.toLowerCase()
        );
        
        const birthYear = app.formData.birthDate ? new Date(app.formData.birthDate).getFullYear() : null;
        const isBornBefore1962 = birthYear !== null && birthYear < 1962;
        
        return {
            record,
            isDeceased: record?.isDeceased,
            isSenior: record?.isSenior,
            isBornBefore1962,
            isDuplicate: applications.some(a => a.id !== app.id && a.userName === app.userName && a.status === ApplicationStatus.APPROVED)
        };
    }, [app, registryRecords, applications]);

    const handleSaveEdit = async () => {
        setIsSaving(true);
        const res = await updateApplicationData(app.id, editData);
        if (res.ok) {
            setIsEditMode(false);
            setViewingApp(prev => prev ? { 
                ...prev, 
                userName: `${editData.firstName} ${editData.lastName}`,
                formData: prev.formData ? { 
                    ...prev.formData, 
                    ...editData
                } : undefined
            } : null);
        }
        setIsSaving(false);
    };

    const isConflict = actionError?.includes('exists for this email') || actionError?.includes('Duplicate entry');
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
           <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                      <UserCheck size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-normal uppercase tracking-widest">Enrollment Record Review</h2>
                      <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest mt-1">Application ID: {app.id}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-50 text-[#1e419c]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isEditMode ? <X size={14} /> : <Edit2 size={14} />}
                    {isEditMode ? 'Cancel Edit' : 'Edit Info'}
                  </button>
                  <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 bg-slate-50">
              <DocumentViewer />
              {actionError && (
                  <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-start gap-4 animate-shake">
                    <ShieldAlert className="text-red-600 shrink-0" size={24} />
                    <div className="space-y-1 flex-1">
                        <p className="text-xs font-medium text-red-900 uppercase tracking-widest">Database Sync Error</p>
                        <p className="text-sm text-red-700 font-medium leading-relaxed">{actionError}</p>
                        {isConflict && !isEditMode && (
                            <button 
                                onClick={() => setIsEditMode(true)}
                                className="mt-3 px-4 py-2 bg-red-600 text-white text-[10px] font-medium uppercase rounded-lg shadow-lg hover:bg-red-700 transition-all"
                            >
                                Edit Information to Resolve Conflict
                            </button>
                        )}
                    </div>
                  </div>
              )}

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> System Verification
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className={`p-4 rounded-2xl border ${verificationResults?.record ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <p className="text-[9px] font-semibold uppercase tracking-widest mb-1">Registry Match</p>
                        <p className={`text-sm font-bold ${verificationResults?.record ? 'text-emerald-700' : 'text-red-700'}`}>
                            {verificationResults?.record ? `MATCH FOUND (${verificationResults.record.type})` : 'NO RECORD FOUND'}
                        </p>
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <UserIcon size={14} className="text-[#1e419c]" /> Personal Information
                    </h4>
                    {isEditMode && (
                        <button 
                            disabled={isSaving}
                            onClick={handleSaveEdit}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-medium uppercase rounded-lg hover:bg-emerald-700 transition-all"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={12}/> : <Save size={12}/>}
                            Save Changes
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Date Applied</label>
                            {isEditMode ? (
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none" value={editData.dateApplied} onChange={(e) => setEditData({...editData, dateApplied: e.target.value})} />
                            ) : (
                                <p className="font-medium text-slate-900">{app.formData?.dateApplied || '---'}</p>
                            )}
                        </div>
                        <div className="lg:col-span-2">
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Full Legal Name</label>
                            {isEditMode ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    <input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.firstName} onChange={(e) => setEditData({...editData, firstName: e.target.value})} placeholder="First Name" title="First Name" />
                                    <input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.middleName} onChange={(e) => setEditData({...editData, middleName: e.target.value})} placeholder="Middle Name" title="Middle Name" />
                                    <input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.lastName} onChange={(e) => setEditData({...editData, lastName: e.target.value})} placeholder="Last Name" title="Last Name" />
                                    <input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.suffix} onChange={(e) => setEditData({...editData, suffix: e.target.value})} placeholder="Suffix" title="Suffix (e.g. Jr, Sr)" />
                                </div>
                            ) : (
                                <p className="font-medium text-slate-900 text-lg uppercase leading-tight">{app.userName}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Birthdate</label>
                            {isEditMode ? (
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none" value={editData.birthDate} onChange={(e) => setEditData({...editData, birthDate: e.target.value})} />
                            ) : (
                                <p className="font-medium text-slate-900">{app.formData?.birthDate || '---'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Gender</label>
                            {isEditMode ? (
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.gender} onChange={(e) => setEditData({...editData, gender: e.target.value})}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            ) : (
                                <p className="font-medium text-slate-900 uppercase">{app.formData?.gender || '---'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Civil Status</label>
                            {isEditMode ? (
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.civilStatus} onChange={(e) => setEditData({...editData, civilStatus: e.target.value})}>
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                            ) : (
                                <p className="font-medium text-slate-900 uppercase">{app.formData?.civilStatus || '---'}</p>
                            )}
                        </div>
                        <div className="lg:col-span-3">
                            <div className="h-px bg-slate-100 w-full my-4"></div>
                            <label className="text-[10px] text-[#1e419c] font-bold uppercase tracking-widest block mb-4">Accomplished By</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Relationship</label>
                                    {isEditMode ? (
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.accomplishedBy} onChange={(e) => setEditData({...editData, accomplishedBy: e.target.value})}>
                                            <option value="APPLICANT">APPLICANT</option>
                                            <option value="GUARDIAN">GUARDIAN</option>
                                            <option value="REPRESENTATIVE">REPRESENTATIVE</option>
                                        </select>
                                    ) : (
                                        <p className="font-medium text-slate-900 uppercase">{app.formData?.accomplishedBy || 'APPLICANT'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Last Name</label>
                                    {isEditMode ? (
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.accomplishedByLastName} onChange={(e) => setEditData({...editData, accomplishedByLastName: e.target.value})} placeholder="LAST NAME" />
                                    ) : (
                                        <p className="font-medium text-slate-900 uppercase">{app.formData?.accomplishedByLastName || '---'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">First Name</label>
                                    {isEditMode ? (
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.accomplishedByFirstName} onChange={(e) => setEditData({...editData, accomplishedByFirstName: e.target.value})} placeholder="FIRST NAME" />
                                    ) : (
                                        <p className="font-medium text-slate-900 uppercase">{app.formData?.accomplishedByFirstName || '---'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Middle Name</label>
                                    {isEditMode ? (
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.accomplishedByMiddleName} onChange={(e) => setEditData({...editData, accomplishedByMiddleName: e.target.value})} placeholder="MIDDLE NAME" />
                                    ) : (
                                        <p className="font-medium text-slate-900 uppercase">{app.formData?.accomplishedByMiddleName || '---'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {app.documents && app.documents.length > 0 && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 animate-fade-in">
                    <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" /> Submitted Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {app.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <File size={18} className="text-slate-400" />
                                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{doc}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setActiveFile(doc)}
                                    className="p-2 text-slate-400 hover:text-primary-600 transition-all"
                                  >
                                    <Eye size={16}/>
                                  </button>
                                  <button 
                                    onClick={() => handleDownloadFile(doc)}
                                    className="p-2 text-slate-400 hover:text-primary-600 transition-all"
                                  >
                                    <Download size={16}/>
                                  </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-500" /> Disability Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Type of Disability</label>
                        {isEditMode ? (
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.typeOfDisability} onChange={(e) => setEditData({...editData, typeOfDisability: e.target.value})}>
                                <option value="">Select Disability</option>
                                <option value="Visual">Visual</option>
                                <option value="Hearing">Hearing</option>
                                <option value="Speech">Speech</option>
                                <option value="Physical">Physical</option>
                                <option value="Mental">Mental</option>
                                <option value="Intellectual">Intellectual</option>
                                <option value="Psychosocial">Psychosocial</option>
                            </select>
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.typeOfDisability || app.formData?.disabilityType || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Cause of Disability</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.causeOfDisability} onChange={(e) => setEditData({...editData, causeOfDisability: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.causeOfDisability || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <MapPin size={14} className="text-[#1e419c]" /> Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Street Address</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.streetAddress} onChange={(e) => setEditData({...editData, streetAddress: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 text-sm uppercase leading-relaxed">{app.formData?.streetAddress || app.formData?.address || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Barangay</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.barangay} onChange={(e) => setEditData({...editData, barangay: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.barangay || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">City / Municipality</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.cityMunicipality} onChange={(e) => setEditData({...editData, cityMunicipality: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.cityMunicipality || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Province</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.province} onChange={(e) => setEditData({...editData, province: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.province || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Region</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.region} onChange={(e) => setEditData({...editData, region: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.region || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <Phone size={14} className="text-emerald-500" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Landline</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none" value={editData.landline} onChange={(e) => setEditData({...editData, landline: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900">{app.formData?.landline || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Mobile Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#1e419c] font-bold outline-none" value={editData.mobileNumber} onChange={(e) => setEditData({...editData, mobileNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-[#1e419c] text-lg font-mono tracking-wider">{app.formData?.mobileNumber || app.formData?.contactNumber || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Email Address</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none" value={editData.emailAddress} onChange={(e) => setEditData({...editData, emailAddress: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 lowercase">{app.formData?.emailAddress || app.formData?.email || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-red-500" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Contact Person</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.emergencyContactPerson} onChange={(e) => setEditData({...editData, emergencyContactPerson: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.emergencyContactPerson || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Contact Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none" value={editData.emergencyContactNumber} onChange={(e) => setEditData({...editData, emergencyContactNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900">{app.formData?.emergencyContactNumber || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Relationship</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.relationship} onChange={(e) => setEditData({...editData, relationship: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.relationship || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <Briefcase size={14} className="text-indigo-500" /> Education and Employment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Educational Attainment</label>
                        {isEditMode ? (
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.highestEducation} onChange={(e) => setEditData({...editData, highestEducation: e.target.value})}>
                                <option value="">Select Education</option>
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="College">College</option>
                                <option value="Post Graduate">Post Graduate</option>
                                <option value="None">None</option>
                            </select>
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.highestEducation || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Employment Status</label>
                        {isEditMode ? (
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.employmentStatus} onChange={(e) => setEditData({...editData, employmentStatus: e.target.value})}>
                                <option value="">Select Status</option>
                                <option value="Employed">Employed</option>
                                <option value="Unemployed">Unemployed</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Student">Student</option>
                            </select>
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.employmentStatus || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Employment Type</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.employmentType} onChange={(e) => setEditData({...editData, employmentType: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.employmentType || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Employment Category</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.employmentCategory} onChange={(e) => setEditData({...editData, employmentCategory: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.employmentCategory || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Occupation</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.occupation} onChange={(e) => setEditData({...editData, occupation: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.occupation || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Certifying Physician
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Name of Certifying Physician</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.physicianName} onChange={(e) => setEditData({...editData, physicianName: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.physicianName || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">License No.</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.physicianLicense} onChange={(e) => setEditData({...editData, physicianLicense: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.physicianLicense || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <UserIcon size={14} className="text-orange-500" /> Organization Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Organization Affiliated</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.orgName} onChange={(e) => setEditData({...editData, orgName: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.orgName || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Contact Person</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.orgContactPerson} onChange={(e) => setEditData({...editData, orgContactPerson: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.orgContactPerson || '---'}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Organization Address</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.orgAddress} onChange={(e) => setEditData({...editData, orgAddress: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">{app.formData?.orgAddress || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Contact No. / Tel. No.</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none" value={editData.orgContactNo} onChange={(e) => setEditData({...editData, orgContactNo: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900">{app.formData?.orgContactNo || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <FileText size={14} className="text-slate-600" /> Government IDs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">SSS Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none" value={editData.sssNumber} onChange={(e) => setEditData({...editData, sssNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 font-mono">{app.formData?.sssNumber || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">GSIS Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none" value={editData.gsisNumber} onChange={(e) => setEditData({...editData, gsisNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 font-mono">{app.formData?.gsisNumber || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Pag-IBIG Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none" value={editData.pagIbigNumber} onChange={(e) => setEditData({...editData, pagIbigNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 font-mono">{app.formData?.pagIbigNumber || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">PSN Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none" value={editData.psnNumber} onChange={(e) => setEditData({...editData, psnNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 font-mono">{app.formData?.psnNumber || '---'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">PhilHealth Number</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none" value={editData.philHealthNumber} onChange={(e) => setEditData({...editData, philHealthNumber: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 font-mono">{app.formData?.philHealthNumber || '---'}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                    <UserIcon size={14} className="text-pink-500" /> Family Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Father’s Name</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.fatherName} onChange={(e) => setEditData({...editData, fatherName: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">
                                {(() => {
                                    const f = app.formData?.fatherFirstName;
                                    const m = app.formData?.fatherMiddleName;
                                    const l = app.formData?.fatherLastName;
                                    if (f || m || l) return `${f || ''} ${m || ''} ${l || ''}`.replace(/\s+/g, ' ').trim() || '---';
                                    return app.formData?.fatherName || '---';
                                })()}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Mother’s Name</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.motherName} onChange={(e) => setEditData({...editData, motherName: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">
                                {(() => {
                                    const f = app.formData?.motherFirstName;
                                    const m = app.formData?.motherMiddleName;
                                    const l = app.formData?.motherLastName;
                                    if (f || m || l) return `${f || ''} ${m || ''} ${l || ''}`.replace(/\s+/g, ' ').trim() || '---';
                                    return app.formData?.motherName || '---';
                                })()}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Guardian’s Name</label>
                        {isEditMode ? (
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.guardianName} onChange={(e) => setEditData({...editData, guardianName: e.target.value})} />
                        ) : (
                            <p className="font-medium text-slate-900 uppercase">
                                {(() => {
                                    const f = app.formData?.guardianFirstName;
                                    const m = app.formData?.guardianMiddleName;
                                    const l = app.formData?.guardianLastName;
                                    if (f || m || l) return `${f || ''} ${m || ''} ${l || ''}`.replace(/\s+/g, ' ').trim() || '---';
                                    return app.formData?.guardianName || '---';
                                })()}
                            </p>
                        )}
                    </div>
                </div>
              </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                    <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                        <UserCheck size={14} className="text-blue-500" /> Processing and Approval
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Processing Officer</label>
                            {isEditMode ? (
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium uppercase outline-none" value={editData.processingOfficer} onChange={(e) => setEditData({...editData, processingOfficer: e.target.value})} />
                            ) : (
                                <p className="font-medium text-slate-900 uppercase">{editData.processingOfficer || '---'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Approving Officer</label>
                            <p className="font-medium text-slate-900 uppercase">{editData.approvingOfficer || '---'}</p>
                        </div>
                    </div>
                </div>
              </div>

           <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
               {app.status === ApplicationStatus.PENDING ? (
                   <>
                       <button onClick={() => setRejectingApp(app)} className="px-8 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Reject Record</button>
                       <button 
                           disabled={isEditMode || isSaving} 
                           onClick={() => setConfirmingApproveApp(app)} 
                           className="px-12 py-3 bg-emerald-600 text-white rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                       >
                           Approve & Register
                       </button>
                   </>
               ) : (
                   <button onClick={onClose} className="px-12 py-3 bg-[#1e419c] text-white rounded-xl font-medium uppercase tracking-widest">Close Record</button>
               )}
           </div>
        </div>
      </div>
    );
};
