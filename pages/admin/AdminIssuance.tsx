import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Role, User, Application } from '../../types';
import { IDCard } from '../../components/IDCard';
import { 
  Printer, CheckCircle, Search, CreditCard, XCircle, Clock, Archive, 
  UserPlus, Info, Calendar, User as UserIcon, X, ShieldCheck, Heart, 
  Eye, Download, FileText, AlertCircle, Trash2, MapPin, Phone, 
  ShieldAlert, Globe, Fingerprint, Camera, Upload, ArrowRight, ArrowLeft,
  AlertTriangle, ZoomIn, ZoomOut, File, Tag, HelpCircle, RefreshCw, Activity, CloudOff, Database, ClipboardList, Layers, MapPinned, MoreHorizontal, Check, Edit3, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

// Date Formatter Helper
const formatReadableDate = (dateStr: any) => {
  if (!dateStr) return "-";
  try {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return dateStr;
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

// Safe Attachment URL Parser
const safeParseAttachment = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        } else if (typeof parsed === 'object') {
          return parsed.url || parsed.path || Object.values(parsed)[0] || null;
        }
        return parsed;
      } catch (e) {
        return val;
      }
    }
    return val;
  }
  if (typeof val === 'object') {
    return val.url || val.path || null;
  }
  return null;
};

// Attachment helper component
const AttachmentItem = ({ label, value }: { label: string, value: any }) => {
  const parsedPath = safeParseAttachment(value);
  
  if (!parsedPath) {
    return (
      <div className="flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-2xl">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
        <span className="text-xs text-slate-400 italic font-semibold mt-1">No attachment uploaded</span>
      </div>
    );
  }

  // Handle case-insensitive image file extensions and data urls
  const isImage = typeof parsedPath === 'string' && (!!parsedPath.match(/\.(jpg|jpeg|png|gif|webp)/i) || parsedPath.startsWith('data:image/'));
  
  return (
    <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#1e419c]/40 transition-all">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</span>
      {isImage ? (
        <div className="relative group w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-2">
          <img 
            src={parsedPath} 
            alt={label} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }} 
          />
        </div>
      ) : (
        <div className="w-full h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-2">
          <FileText size={20} className="text-[#1e419c]" />
        </div>
      )}
      <a 
        href={parsedPath} 
        download 
        target="_blank" 
        rel="noopener noreferrer" 
        className="mt-auto px-4 py-2 bg-[#1e419c] text-white hover:bg-opacity-90 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-1.5"
      >
        <Download size={12} /> Download
      </a>
    </div>
  );
};

export const AdminIssuance: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { users, addApplication, getNextPwdIdNumber } = useApp();

  // Dynamic ID Issuance States
  const [issuanceRecords, setIssuanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRequestType, setFilterRequestType] = useState('all');
  const [filterModality, setFilterModality] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Modals & Operations
  const [viewingRecord, setViewingRecord] = useState<any | null>(null);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [confirmingReleaseRecord, setConfirmingReleaseRecord] = useState<any | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<any | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  
  // Custom states for streamlined table ellipsis actions
  const [openMenuRowId, setOpenMenuRowId] = useState<string | number | null>(null);
  const [previewingIdRecord, setPreviewingIdRecord] = useState<any | null>(null);
  const [idCardSide, setIdCardSide] = useState<'front' | 'back'>('front');

  // Walk-in Registration states (integrated)
  const [isApplying, setIsApplying] = useState<User | null>(null);
  const [walkInStep, setWalkInStep] = useState(1);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  const [idFormData, setIdFormData] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '', birthDate: '', birthPlace: '', sex: '', citizenship: 'Filipino', civilStatus: '',
    address: '', contactNumber: '', emergencyContactPerson: '', emergencyContactNumber: '', joinFederation: false, disabilityType: '', capturedImage: undefined as string | undefined,
    controlNo: ''
  });

  // Edit fields states
  const [editFormData, setEditFormData] = useState<any>(null);

  // Fetch ID Issuance records dynamically
  const fetchIssuanceRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('pdao_auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('https://api-dbpwd.drchiocms.com/api/id-issuance', {
        method: 'GET',
        headers
      });
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      const resData = await response.json();
      const list = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      setIssuanceRecords(list);
    } catch (err: any) {
      console.error("Error fetching ID issuance:", err);
      setErrorMsg(err.message || "Failed to retrieve ID issuance records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync data automatically on mount
  useEffect(() => {
    if (tab !== 'walk-in') {
      fetchIssuanceRecords();
    }
  }, [tab, fetchIssuanceRecords]);

  // Handle Edit Input changes in modal
  const handleEditInputChange = (section: string, field: string, value: any) => {
    setEditFormData((prev: any) => {
      const copy = { ...prev };
      if (!copy[section]) {
        copy[section] = {};
      }
      copy[section][field] = value;
      return copy;
    });
  };

  // PUT - update record
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('pdao_auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://api-dbpwd.drchiocms.com/api/id-issuance/${editingRecord.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setSuccessMessage('Record updated successfully.');
      setEditingRecord(null);
      fetchIssuanceRecords();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save changes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // PUT - release record
  const handleReleaseSubmit = async () => {
    if (!confirmingReleaseRecord) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('pdao_auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const today = new Date().toISOString().split('T')[0];
      const payload = {
        ...confirmingReleaseRecord,
        application_status: {
          ...(confirmingReleaseRecord.application_status || {}),
          status: 'released'
        },
        issuance_details: {
          ...(confirmingReleaseRecord.issuance_details || {}),
          released_date: today
        }
      };

      const response = await fetch(`https://api-dbpwd.drchiocms.com/api/id-issuance/${confirmingReleaseRecord.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setSuccessMessage('ID card successfully released.');
      setConfirmingReleaseRecord(null);
      fetchIssuanceRecords();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to release: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // PUT - reject record
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRecord) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('pdao_auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        ...rejectingRecord,
        application_status: {
          ...(rejectingRecord.application_status || {}),
          status: 'rejected'
        },
        issuance_details: {
          ...(rejectingRecord.issuance_details || {}),
          rejection_remarks: rejectionRemarks
        }
      };

      const response = await fetch(`https://api-dbpwd.drchiocms.com/api/id-issuance/${rejectingRecord.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setSuccessMessage('Application rejected successfully.');
      setRejectingRecord(null);
      setRejectionRemarks('');
      fetchIssuanceRecords();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to reject app: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper and handler for modular status change
  const handleUpdateStatus = async (record: any, newStatus: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('pdao_auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Format custom rejection or release details if transition is released or disapproved
      const today = new Date().toISOString().split('T')[0];
      const normalizedStatus = newStatus === 'disapproved' ? 'rejected' : newStatus; // map to 'rejected' in API database if disapproved

      const payload = {
        ...record,
        application_status: {
          ...(record.application_status || {}),
          status: normalizedStatus
        },
        issuance_details: {
          ...(record.issuance_details || {}),
          released_date: normalizedStatus.toLowerCase() === 'released' ? today : (record.issuance_details?.released_date || '')
        }
      };

      const response = await fetch(`https://api-dbpwd.drchiocms.com/api/id-issuance/${record.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setSuccessMessage(`ID status successfully updated to ${newStatus}.`);
      fetchIssuanceRecords();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort: latest records first (by created_at or id descending)
  const sortedRecords = useMemo(() => {
    return [...issuanceRecords].sort((a, b) => {
      const timeA = a.metadata?.created_at ? new Date(a.metadata.created_at).getTime() : 0;
      const timeB = b.metadata?.created_at ? new Date(b.metadata.created_at).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return (b.id || 0) - (a.id || 0);
    });
  }, [issuanceRecords]);

  // Searches on: PWD Number, Full Name, Barangay, Status
  const searchedAndFiltered = useMemo(() => {
    let result = sortedRecords;

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(r => {
        const pwdNum = (r.personal_information?.pwd_number || '').toLowerCase();
        const fullName = (r.personal_information?.full_name || '').toLowerCase();
        const barangay = (r.address?.barangay || '').toLowerCase();
        const status = (r.application_status?.status || '').toLowerCase();
        return pwdNum.includes(query) || fullName.includes(query) || barangay.includes(query) || status.includes(query);
      });
    }

    if (filterStatus !== 'all') {
      result = result.filter(r => (r.application_status?.status || '').toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterRequestType !== 'all') {
      result = result.filter(r => (r.application_status?.request_type || '').toLowerCase() === filterRequestType.toLowerCase());
    }

    if (filterModality !== 'all') {
      result = result.filter(r => (r.application_status?.modality || '').toLowerCase() === filterModality.toLowerCase());
    }

    return result;
  }, [sortedRecords, searchTerm, filterStatus, filterRequestType, filterModality]);

  // Unique lists for filters
  const statusOptions = useMemo(() => {
    const list = issuanceRecords.map(r => r.application_status?.status).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [issuanceRecords]);

  const requestTypeOptions = useMemo(() => {
    const list = issuanceRecords.map(r => r.application_status?.request_type).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [issuanceRecords]);

  const modalityOptions = useMemo(() => {
    const list = issuanceRecords.map(r => r.application_status?.modality).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [issuanceRecords]);

  // Pagination Handler
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterRequestType, filterModality]);

  const paginatedResponse = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedAndFiltered.slice(start, start + itemsPerPage);
  }, [searchedAndFiltered, currentPage]);

  const totalPages = Math.ceil(searchedAndFiltered.length / itemsPerPage) || 1;

  // Render Badge
  const renderStatusBadge = (status: string) => {
    if (!status) return <span>-</span>;
    const s = status.toLowerCase();
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
    if (s === 'pending') {
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (s === 'approved') {
      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (s === 'rejected' || s === 'disapproved') {
      badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (s === 'released') {
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
    }
    return (
      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${badgeClass}`}>
        {status}
      </span>
    );
  };

  // Initialise edit state
  const startEditing = (record: any) => {
    setEditingRecord(record);
    setEditFormData({
      personal_information: {
        pwd_number: record.personal_information?.pwd_number || '',
        full_name: record.personal_information?.full_name || '',
        first_name: record.personal_information?.first_name || '',
        middle_name: record.personal_information?.middle_name || '',
        last_name: record.personal_information?.last_name || '',
        suffix: record.personal_information?.suffix || '',
        gender: record.personal_information?.gender || '',
        date_of_birth: record.personal_information?.date_of_birth || '',
        civil_status: record.personal_information?.civil_status || '',
        mobile_no: record.personal_information?.mobile_no || ''
      },
      address: {
        house_street: record.address?.house_street || '',
        barangay: record.address?.barangay || '',
        municipality: record.address?.municipality || '',
        province: record.address?.province || '',
        region: record.address?.region || ''
      },
      emergency_contact: {
        name: record.emergency_contact?.name || '',
        number: record.emergency_contact?.number || ''
      },
      application_status: {
        status: record.application_status?.status || '',
        request_type: record.application_status?.request_type || '',
        modality: record.application_status?.modality || '',
        application_date: record.application_status?.application_date || ''
      },
      issuance_details: {
        date_reviewed: record.issuance_details?.date_reviewed || '',
        released_date: record.issuance_details?.released_date || '',
        expiration_date: record.issuance_details?.expiration_date || '',
        rejection_remarks: record.issuance_details?.rejection_remarks || ''
      }
    });
  };

  // Walk-in requirements helper functions
  const validateWalkInStep1 = () => {
    const newErrors: string[] = [];
    if (!idFormData.firstName.trim()) newErrors.push('firstName');
    if (!idFormData.lastName.trim()) newErrors.push('lastName');
    if (!idFormData.birthDate.trim()) newErrors.push('birthDate');
    if (!idFormData.disabilityType.trim()) newErrors.push('disabilityType');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setIdFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (errors.includes(name)) {
      setErrors(prev => prev.filter(err => err !== name));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      const x = (videoRef.current.videoWidth - size) / 2;
      const y = (videoRef.current.videoHeight - size) / 2;
      canvasRef.current.width = 600;
      canvasRef.current.height = 600;
      ctx?.drawImage(videoRef.current, x, y, size, size, 0, 0, 600, 600);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      setIdFormData(prev => ({ ...prev, capturedImage: dataUrl }));
      setFiles(prev => [...prev.filter(f => !f.includes('Bio_Photo')), `WalkIn_Biometric_Photo_${Date.now()}.jpg`]);
      setErrors(prev => prev.filter(err => err !== 'capturedImage'));
      setIsCameraOpen(false);
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const handleConfirmApplication = async () => {
    if (!capturedImage) {
      setErrors(['capturedImage']);
      return;
    }
    if (!isApplying) return;
    const res = await addApplication({
        userId: isApplying.id,
        userName: `${idFormData.firstName} ${idFormData.lastName}`,
        type: ApplicationType.ID_NEW,
        description: `Walk-in ID Application Form Submitted by Admin.`,
        documents: files,
        formData: { ...idFormData, isWalkIn: true }
    });
    if (res.ok) {
        setIsApplying(null);
        setSuccessMessage("Walk-in ID application reflected in database.");
        setTimeout(() => setSuccessMessage(null), 5000);
        navigate('/admin/id/all');
    }
  };

  const getFieldClass = (fieldName: string) => {
    const hasError = errors.includes(fieldName);
    return `w-full bg-slate-50 border ${hasError ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c] transition-all`;
  };

  useEffect(() => {
    if (isApplying) {
      const nameParts = isApplying.name.split(' ');
      setIdFormData({
        firstName: isApplying.firstName || nameParts[0] || '',
        middleName: isApplying.middleName || '',
        lastName: isApplying.lastName || nameParts[nameParts.length - 1] || '',
        suffix: isApplying.suffix || '',
        birthDate: isApplying.birthDate || '',
        birthPlace: isApplying.birthPlace || '',
        sex: isApplying.sex || '',
        citizenship: isApplying.citizenship || 'Filipino',
        civilStatus: isApplying.civilStatus || '',
        address: isApplying.address || '',
        contactNumber: isApplying.contactNumber || '',
        emergencyContactPerson: isApplying.emergencyContactPerson || '',
        emergencyContactNumber: isApplying.emergencyContactNumber || '',
        joinFederation: isApplying.joinFederation || false,
        disabilityType: isApplying.disabilityType || '',
        capturedImage: undefined,
        controlNo: isApplying.pwdIdNumber || ''
      });
      setFiles(['Verified_By_Admin_Physical_Copy.pdf']);
      setWalkInStep(1);
      setCapturedImage(null);
    }
  }, [isApplying]);

  // Walk-in main screen
  if (tab === 'walk-in') {
    const walkinCitizens = users.filter(u => 
      u.role === Role.CITIZEN && 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm))
    );
    return (
      <div className="space-y-6 animate-fade-in" id="walkin-view-container">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-[32px] font-normal text-slate-800 uppercase tracking-tight">Walk-in ID Application</h1>
            <p className="text-slate-500 font-medium">Search registry and initiate ID issuance processes for on-site citizens.</p>
          </div>
        </header>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-700 text-xs font-medium uppercase tracking-widest animate-fade-in-down flex items-center gap-2">
            <CheckCircle size={16}/> {successMessage}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="relative max-w-xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input type="text" placeholder="Search registry by name or database ID..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e419c]/10 transition-all font-medium text-sm text-slate-900 uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-[#1e419c] text-white text-[10px] font-normal uppercase tracking-[0.2em]">
                    <tr>
                      <th className="p-8">Citizen Profile</th>
                      <th className="p-8">Birthdate</th>
                      <th className="p-8 text-right">Action Grid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {walkinCitizens.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-8">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                          <img 
                                              src={user.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
                                              alt={user.name} 
                                              className="w-full h-full object-cover"
                                              referrerPolicy="no-referrer"
                                          />
                                      </div>
                                      <div className="flex flex-col">
                                          <p className="font-medium text-slate-800 uppercase tracking-tight text-sm leading-tight">{user.name}</p>
                                          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Entry #{user.id}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-8 text-xs font-medium text-slate-500 uppercase">{user.birthDate || '---'}</td>
                              <td className="p-8 text-right">
                                <button onClick={() => setIsApplying(user)} className="px-6 py-3 bg-[#1e419c] text-white rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">
                                  Enroll for ID
                                </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>

        {isApplying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsApplying(null)} />
             <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
                <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl"><CreditCard size={24} /></div>
                      <div>
                        <h2 className="text-xl font-normal uppercase tracking-widest">Administrative ID Wizard</h2>
                        <p className="text-[10px] text-white/60 font-medium uppercase mt-1.5">Step {walkInStep} of 3</p>
                      </div>
                    </div>
                    <button onClick={() => setIsApplying(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar space-y-8">
                   <div className="flex items-center gap-4 mb-10">
                      {[1, 2, 3].map(s => <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${walkInStep >= s ? 'bg-[#1e419c]' : 'bg-slate-200'}`}></div>)}
                   </div>
                   {walkInStep === 1 && (
                      <div className="animate-fade-in-up space-y-8">
                          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                              <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Registry Data Extraction</h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">First Name <span className="text-red-500">*</span></label>
                                      <input name="firstName" value={idFormData.firstName} onChange={handleInputChange} className={getFieldClass('firstName')} />
                                      {errors.includes('firstName') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Last Name <span className="text-red-500">*</span></label>
                                      <input name="lastName" value={idFormData.lastName} onChange={handleInputChange} className={getFieldClass('lastName')} />
                                      {errors.includes('lastName') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Birthdate <span className="text-red-500">*</span></label>
                                      <input type="date" name="birthDate" value={idFormData.birthDate} onChange={handleInputChange} className={getFieldClass('birthDate')} />
                                      {errors.includes('birthDate') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Gender</label>
                                    <select name="sex" value={idFormData.sex} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-[#1e419c]">
                                      <option value="">Select</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                    </select>
                                  </div>
                              </div>
                              <div className="space-y-1.5">
                                   <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Type of Disability <span className="text-red-500">*</span></label>
                                   <input 
                                      type="text"
                                      name="disabilityType" 
                                      placeholder="e.g. Visual Impairment"
                                      value={idFormData.disabilityType} 
                                      onChange={handleInputChange} 
                                      className={getFieldClass('disabilityType')} 
                                   />
                                   {errors.includes('disabilityType') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                               </div>
                               <div className="space-y-1.5"><label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Current Address</label><input name="address" value={idFormData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c]" /></div>
                          </div>
                      </div>
                   )}
                   {walkInStep === 2 && (
                      <div className="animate-fade-in-up space-y-8">
                          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 text-center">
                              <Upload size={32} className="mx-auto text-[#1e419c]" />
                              <h4 className="font-medium text-slate-800 uppercase tracking-widest text-sm">Administrative Requirements Scan</h4>
                              <p className="text-slate-600 text-xs font-medium">Verify physical PSA and Residency documents on desk.</p>
                              <div className="flex flex-wrap justify-center gap-2 mt-4">
                                 {files.map((f, i) => <div key={i} className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[9px] font-medium uppercase">{f}</div>)}
                              </div>
                          </div>
                      </div>
                   )}
                   {walkInStep === 3 && (
                      <div className="animate-fade-in-up space-y-8 flex flex-col items-center">
                          <div className={`aspect-square w-64 ${errors.includes('capturedImage') ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'} border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden group transition-all`}>
                              {capturedImage ? <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Captured" /> : <button onClick={() => { setIsCameraOpen(true); startCamera(); }} className="flex flex-col items-center gap-4"><Camera size={32} className={errors.includes('capturedImage') ? 'text-red-300' : 'text-[#1e419c]'} /><p className={`text-[9px] font-medium uppercase ${errors.includes('capturedImage') ? 'text-red-400' : 'text-slate-400'}`}>Capture Bio Photo</p></button>}
                              {capturedImage && <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"><X size={12}/></button>}
                          </div>
                          {capturedImage && (
                              <div className="w-full flex flex-col items-center gap-4 animate-scale-up">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Preview with New Photo</p>
                                  <IDCard user={{
                                      id: isApplying?.id || 'WALKIN-TEMP',
                                      role: Role.CITIZEN,
                                      name: `${idFormData.firstName} ${idFormData.lastName}`,
                                      firstName: idFormData.firstName,
                                      lastName: idFormData.lastName,
                                      middleName: idFormData.middleName,
                                      suffix: idFormData.suffix,
                                      birthDate: idFormData.birthDate,
                                      sex: idFormData.sex,
                                      address: idFormData.address,
                                      email: 'walkin@temp.com',
                                      disabilityType: idFormData.disabilityType,
                                      avatarUrl: capturedImage,
                                      pwdIdNumber: isApplying?.pwdIdNumber || getNextPwdIdNumber()
                                  }} />
                              </div>
                          )}
                          <div className="bg-[#1e419c] p-8 rounded-[2.5rem] text-white w-full text-center"><p className="text-[10px] font-medium uppercase tracking-widest leading-relaxed">System will auto-validate registry handshake upon submission.</p></div>
                           {errors.includes('capturedImage') && <p className="text-[10px] text-red-500 font-medium uppercase -mt-4">Biometric photo is required</p>}
                      </div>
                   )}
                </div>
                <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
                    <button onClick={() => walkInStep === 1 ? setIsApplying(null) : setWalkInStep(walkInStep - 1)} className="px-10 py-3 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50">Previous Step</button>
                    <button onClick={() => walkInStep < 3 ? (walkInStep === 1 ? validateWalkInStep1() && setWalkInStep(walkInStep + 1) : setWalkInStep(walkInStep + 1)) : handleConfirmApplication()} className="px-14 py-3 bg-[#1e419c] text-white font-medium text-[10px] uppercase tracking-widest rounded-xl shadow-xl hover:opacity-90">{walkInStep === 3 ? 'Reflect in Database' : 'Continue'}</button>
                </div>
             </div>
          </div>
        )}
        {isCameraOpen && <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center p-4"><div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden relative border-4 border-white/10 shadow-2xl"><video ref={videoRef} autoPlay playsInline className="w-full h-auto" /><div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div></div><div className="absolute top-6 left-6 right-6 flex justify-between items-start"><div className="bg-[#1e419c] text-white px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-widest shadow-lg">Bio Scan Active</div><button onClick={() => { setIsCameraOpen(false); if(videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all"><X size={24}/></button></div><div className="absolute bottom-8 left-0 right-0 flex justify-center"><button onClick={capturePhoto} className="p-1 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"><div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center"><div className="w-12 h-12 bg-slate-900 rounded-full"></div></div></button></div></div></div>}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Management tab / default view (GET api-dbpwd.drchiocms.com/api/id-issuance)
  return (
    <div className="space-y-6 animate-fade-in" id="management-view-container">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800 uppercase tracking-tight">ID Issuance Management</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium text-lg">Central ID Lifecycle Registry</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600">API Sync Live</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={fetchIssuanceRecords} 
            disabled={isLoading} 
            className="flex items-center gap-2 px-6 py-3 bg-[#1e419c] text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Fetching State...' : 'Sync Database'}
          </button>
        </div>
      </header>

      {/* SUCCESS / ERROR TOP-BAR */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] text-emerald-700 text-xs font-medium animate-fade-in-down flex items-start gap-3 shadow-sm">
          <CheckCircle className="shrink-0 mt-0.5" size={18}/>
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-widest text-[10px]">Operation Successful</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2rem] text-rose-700 text-xs font-medium animate-fade-in-down flex items-start gap-3 shadow-sm">
          <AlertCircle className="shrink-0 mt-0.5 animate-bounce" size={18}/>
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-widest text-[10px]">Application Core Error</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR PANEL */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#1e419c]" size={20} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Search by PWD Number, Full Name, Barangay, Status..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1e419c]/10 outline-none transition-all text-sm text-slate-900 font-medium uppercase tracking-tight" 
              />
            </div>
            
            {/* Stat Tag */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-white rounded-2xl border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 self-start xl:self-auto">
              <Database size={12} className="text-[#1e419c]" /> Registered ID Application Count: {searchedAndFiltered.length}
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {/* Status Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Filter Application Status</label>
              <div className="relative">
                <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-700 font-bold uppercase outline-none focus:border-[#1e419c]"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">ALL STATUSES</option>
                  {statusOptions.filter(o => o !== 'all').map(opt => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Request Type Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Filter Request Type</label>
              <div className="relative">
                <ClipboardList size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-700 font-bold uppercase outline-none focus:border-[#1e419c]"
                  value={filterRequestType}
                  onChange={e => setFilterRequestType(e.target.value)}
                >
                  <option value="all">ALL REQUEST TYPES</option>
                  {requestTypeOptions.filter(o => o !== 'all').map(opt => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modality Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Filter Modality</label>
              <div className="relative">
                <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-700 font-bold uppercase outline-none focus:border-[#1e419c]"
                  value={filterModality}
                  onChange={e => setFilterModality(e.target.value)}
                >
                  <option value="all">ALL MODALITIES</option>
                  {modalityOptions.filter(o => o !== 'all').map(opt => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        {isLoading ? (
          <div className="p-32 text-center flex flex-col items-center justify-center gap-4">
            <RefreshCw className="animate-spin text-[#1e419c] drop-shadow-md" size={48} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
              Retrieving dynamic ID issuance logs...
            </p>
          </div>
        ) : searchedAndFiltered.length === 0 ? (
          <div className="p-32 text-center text-slate-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database size={60} className="opacity-10" />
            </div>
            <p className="font-bold uppercase tracking-[0.3em] text-xs text-slate-400">No records found matching query filters.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto select-none">
            <table className="w-full text-left border-collapse table-auto min-w-[1100px]">
              <thead className="bg-[#1e419c] text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6">PWD Number</th>
                  <th className="p-6">Fullname</th>
                  <th className="p-6">Barangay</th>
                  <th className="p-6">Application Date</th>
                  <th className="p-6">Request Type</th>
                  <th className="p-6">Modality</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedResponse.map(record => {
                  const statusLower = (record.application_status?.status || '').toLowerCase();
                  const showPreview = statusLower === 'approved' || statusLower === 'released';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* PWD Number */}
                      <td className="p-6 font-semibold text-slate-700">
                        {record.personal_information?.pwd_number || '-'}
                      </td>

                      {/* Full Name */}
                      <td className="p-6 font-bold text-slate-900 uppercase">
                        {record.personal_information?.full_name || '-'}
                      </td>

                      {/* Barangay */}
                      <td className="p-6 uppercase text-slate-600 font-medium">
                        {record.address?.barangay || '-'}
                      </td>

                      {/* Application Date */}
                      <td className="p-6 font-medium text-slate-500">
                        {formatReadableDate(record.application_status?.application_date)}
                      </td>

                      {/* Request Type */}
                      <td className="p-6 text-[#1e419c] font-black uppercase tracking-wider text-[10px]">
                        {record.application_status?.request_type || '-'}
                      </td>

                      {/* Modality */}
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                          (record.application_status?.modality || '').toLowerCase() === 'walk-in' 
                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {(record.application_status?.modality || '').toLowerCase() === 'walk-in' ? <MapPin size={10} /> : <Globe size={10} />}
                          {record.application_status?.modality || '-'}
                        </span>
                      </td>

                      {/* Application Status */}
                      <td className="p-6">
                        {renderStatusBadge(record.application_status?.status)}
                      </td>

                      {/* Action Sticky Column / Action Button */}
                      <td className="p-6 text-right relative">
                        <div className="flex justify-end">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuRowId(openMenuRowId === record.id ? null : record.id);
                            }}
                            className="p-2 text-slate-400 hover:text-[#1e419c] hover:bg-slate-100 rounded-xl transition-all"
                            title="Options"
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {openMenuRowId === record.id && (
                            <>
                              {/* Click-out overlay */}
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuRowId(null)} />
                              <div className="absolute right-6 top-12 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 w-56 text-left z-50 animate-scale-up font-sans">
                                <button
                                  onClick={() => {
                                    setViewingRecord(record);
                                    setOpenMenuRowId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                                >
                                  <Eye size={14} className="text-slate-400" />
                                  View Details
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>
                                <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Change Status
                                </div>

                                {(['pending', 'approved', 'disapproved', 'released'] as const).map((st) => {
                                  // Map 'disapproved' to 'rejected' for active match if appropriate
                                  const dbStatus = st === 'disapproved' ? 'rejected' : st;
                                  const isCurrent = (record.application_status?.status || '').toLowerCase() === dbStatus;
                                  return (
                                    <button
                                      key={st}
                                      onClick={() => {
                                        handleUpdateStatus(record, st);
                                        setOpenMenuRowId(null);
                                      }}
                                      className={`w-full px-4 py-1.5 hover:bg-slate-50 text-xs font-medium flex items-center justify-between transition-colors ${
                                        isCurrent ? 'text-[#1e419c] bg-slate-50 font-semibold' : 'text-slate-600'
                                      }`}
                                    >
                                      <span className="capitalize">{st}</span>
                                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#1e419c]" />}
                                    </button>
                                  );
                                })}

                                {showPreview && (
                                  <>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => {
                                        setPreviewingIdRecord(record);
                                        setOpenMenuRowId(null);
                                      }}
                                      className="w-full px-4 py-2 hover:bg-slate-50 text-[#1e419c] text-xs font-bold flex items-center gap-2 transition-colors"
                                    >
                                      <CreditCard size={14} className="text-[#1e419c]" />
                                      Preview ID
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION NAVIGATION FOOTER */}
        {!isLoading && searchedAndFiltered.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Showing Page {currentPage} of {totalPages} | Total records: {searchedAndFiltered.length}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 enabled:hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 enabled:hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW PROFILE DETAIL MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingRecord(null)} />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl text-white">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-normal uppercase tracking-widest text-white">PWD Candidate Profile</h2>
                </div>
              </div>
              <button onClick={() => setViewingRecord(null)} className="p-2 text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-6 custom-scrollbar">
              
              {/* Profile Grid Block */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                  {safeParseAttachment(viewingRecord.attachments?.photo_url) ? (
                    <img 
                      src={safeParseAttachment(viewingRecord.attachments?.photo_url)!} 
                      alt="Applicant Photo" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={36} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                    {viewingRecord.personal_information?.full_name || 'No Full Name Provided'}
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                      PWD ID: {viewingRecord.personal_information?.pwd_number || 'NOT ISSUED'}
                    </span>
                    {renderStatusBadge(viewingRecord.application_status?.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* A. APPLICATION STATUS */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                  <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-[0.15em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <ClipboardList size={14} /> Application Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Status</span>
                      <span className="text-slate-900 uppercase font-bold">{viewingRecord.application_status?.status || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Request Type</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.application_status?.request_type || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Modality</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.application_status?.modality || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Application Date</span>
                      <span className="text-slate-900">{formatReadableDate(viewingRecord.application_status?.application_date)}</span>
                    </div>
                  </div>
                </div>

                {/* B. PERSONAL INFORMATION */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                  <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-[0.15em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <UserIcon size={14} /> Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">PWD Number</span>
                      <span className="text-slate-900">{viewingRecord.personal_information?.pwd_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Full Name</span>
                      <span className="text-slate-900 uppercase block truncate">{viewingRecord.personal_information?.full_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">First Name</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.personal_information?.first_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Middle Name</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.personal_information?.middle_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Last Name</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.personal_information?.last_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Suffix</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.personal_information?.suffix || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Gender / Sex</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.personal_information?.gender || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Date of Birth</span>
                      <span className="text-slate-900">{formatReadableDate(viewingRecord.personal_information?.date_of_birth)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Civil Status</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.personal_information?.civil_status || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Mobile Number</span>
                      <span className="text-slate-900">{viewingRecord.personal_information?.mobile_no || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* C. ADDRESS */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                  <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-[0.15em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <MapPin size={14} /> Physical Address Address
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold">
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 uppercase block">House Number / Street / District</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.address?.house_street || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Barangay</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.address?.barangay || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">City / Municipality</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.address?.municipality || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Province</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.address?.province || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Region</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.address?.region || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* D. EMERGENCY CONTACT */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                  <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-[0.15em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Contact Person Name</span>
                      <span className="text-slate-900 uppercase">{viewingRecord.emergency_contact?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Mobile/Contact Number</span>
                      <span className="text-slate-900">{viewingRecord.emergency_contact?.number || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* E. ISSUANCE DETAILS */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3.5 col-span-1 md:col-span-2">
                  <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-[0.15em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <CreditCard size={14} /> ID Issuance & Clearance Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Passed Review Date</span>
                      <span className="text-slate-900">{formatReadableDate(viewingRecord.issuance_details?.date_reviewed)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Released Date</span>
                      <span className="text-slate-900">{formatReadableDate(viewingRecord.issuance_details?.released_date)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Expiration Date</span>
                      <span className="text-slate-900">{formatReadableDate(viewingRecord.issuance_details?.expiration_date)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Rejection Remarks / Reason</span>
                      <span className="text-rose-600 block max-h-16 overflow-y-auto uppercase text-[11px] font-bold">{viewingRecord.issuance_details?.rejection_remarks || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* F. ATTACHMENTS SECTION */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 col-span-1 md:col-span-2">
                  <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-[0.15em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <FileText size={14} /> Attachments & Downloadable Files
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Display Photo */}
                    <AttachmentItem label="Display Photo" value={viewingRecord.attachments?.photo_url} />

                    {/* Display Signature */}
                    <AttachmentItem label="Display Signature" value={viewingRecord.attachments?.signature_url} />

                    {/* Disability Certificate */}
                    <AttachmentItem label="Disability Certificate" value={viewingRecord.attachments?.disability_certificate || viewingRecord.attachments?.disability_certificate_url} />

                    {/* Residency Certificate */}
                    <AttachmentItem label="Residency Certificate" value={viewingRecord.attachments?.residency_certificate || viewingRecord.attachments?.residency_certificate_url} />

                    {/* Government ID */}
                    <AttachmentItem label="Government ID" value={viewingRecord.attachments?.government_id || viewingRecord.attachments?.government_id_url || viewingRecord.attachments?.gov_id_url} />
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-slate-100 flex justify-end shrink-0">
              <button onClick={() => setViewingRecord(null)} className="px-12 py-3.5 bg-[#1e419c] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md hover:bg-opacity-90">
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ID CARD PREVIEW MODAL */}
      {previewingIdRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewingIdRecord(null)} />
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl relative z-20 flex flex-col items-center max-w-lg w-full gap-6 animate-scale-up border border-slate-100">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={18} className="text-[#1e419c]" /> PWD ID Preview
              </h3>
              <button onClick={() => setPreviewingIdRecord(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* State for Front/Back Side of the ID card */}
            <div className="flex gap-2">
              <button 
                onClick={() => setIdCardSide('front')} 
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all ${
                  idCardSide === 'front' 
                    ? 'bg-[#1e419c] text-white border-[#1e419c]' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Front Side
              </button>
              <button 
                onClick={() => setIdCardSide('back')} 
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all ${
                  idCardSide === 'back' 
                    ? 'bg-[#1e419c] text-white border-[#1e419c]' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Back Side
              </button>
            </div>

            {/* The actual ID card component wrapped with proportional container */}
            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl w-full border border-slate-200/50 overflow-auto">
              <div className="transform scale-90 origin-center">
                <IDCard 
                  user={{
                    id: previewingIdRecord.id?.toString() || 'PWD-ID',
                    role: Role.CITIZEN,
                    name: previewingIdRecord.personal_information?.full_name || '',
                    firstName: previewingIdRecord.personal_information?.first_name || '',
                    lastName: previewingIdRecord.personal_information?.last_name || '',
                    middleName: previewingIdRecord.personal_information?.middle_name || '',
                    suffix: previewingIdRecord.personal_information?.suffix || '',
                    pwdIdNumber: previewingIdRecord.personal_information?.pwd_number || '',
                    barangay: previewingIdRecord.address?.barangay || '',
                    birthDate: previewingIdRecord.personal_information?.date_of_birth || '',
                    gender: previewingIdRecord.personal_information?.gender || '',
                    disabilityType: previewingIdRecord.personal_information?.disability_type || '',
                    avatarUrl: safeParseAttachment(previewingIdRecord.attachments?.photo_url) || undefined,
                  } as unknown as User} 
                  side={idCardSide} 
                />
              </div>
            </div>

            <div className="flex justify-end w-full mt-2">
              <button 
                onClick={() => setPreviewingIdRecord(null)} 
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1e419c] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md hover:bg-opacity-90"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingRecord(null)} />
          <form onSubmit={handleSaveEdit} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
            
            <div className="bg-amber-600 p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-normal uppercase tracking-widest text-white">Edit ID Issuance Registry Record</h2>
                  <p className="text-[10px] text-white/75 font-bold uppercase mt-1">Transaction Node ID: #{editingRecord.id}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditingRecord(null)} className="p-2 text-white/60 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-6 custom-scrollbar text-xs">
              
              {/* Personal info fields */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-b pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">PWD Number</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.pwd_number} onChange={e => handleEditInputChange('personal_information', 'pwd_number', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Full Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.full_name} onChange={e => handleEditInputChange('personal_information', 'full_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">First Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.first_name} onChange={e => handleEditInputChange('personal_information', 'first_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Middle Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.middle_name} onChange={e => handleEditInputChange('personal_information', 'middle_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Last Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.last_name} onChange={e => handleEditInputChange('personal_information', 'last_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Suffix</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.suffix} onChange={e => handleEditInputChange('personal_information', 'suffix', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Gender / Sex</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.gender} onChange={e => handleEditInputChange('personal_information', 'gender', e.target.value)}>
                      <option value="Male">MALE</option>
                      <option value="Female">FEMALE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Date of Birth</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.date_of_birth} onChange={e => handleEditInputChange('personal_information', 'date_of_birth', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Civil Status</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.civil_status} onChange={e => handleEditInputChange('personal_information', 'civil_status', e.target.value)}>
                      <option value="Single">SINGLE</option>
                      <option value="Married">MARRIED</option>
                      <option value="Widowed">WIDOWED</option>
                      <option value="Separated">SEPARATED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Mobile Number</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.personal_information?.mobile_no} onChange={e => handleEditInputChange('personal_information', 'mobile_no', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Address Fields */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-b pb-2">Address details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">House Number / Street / District</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.address?.house_street} onChange={e => handleEditInputChange('address', 'house_street', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Barangay</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.address?.barangay} onChange={e => handleEditInputChange('address', 'barangay', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Municipality</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.address?.municipality} onChange={e => handleEditInputChange('address', 'municipality', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Province</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.address?.province} onChange={e => handleEditInputChange('address', 'province', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Region</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.address?.region} onChange={e => handleEditInputChange('address', 'region', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Emergency info and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-b pb-2">Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Contact Person</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.emergency_contact?.name} onChange={e => handleEditInputChange('emergency_contact', 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Contact Number</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.emergency_contact?.number} onChange={e => handleEditInputChange('emergency_contact', 'number', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-b pb-2">Application Status Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Status</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.application_status?.status} onChange={e => handleEditInputChange('application_status', 'status', e.target.value)}>
                        <option value="pending">PENDING</option>
                        <option value="approved">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                        <option value="released">RELEASED</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Request Type</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.application_status?.request_type} onChange={e => handleEditInputChange('application_status', 'request_type', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Modality</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.application_status?.modality} onChange={e => handleEditInputChange('application_status', 'modality', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Application Date</label>
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.application_status?.application_date} onChange={e => handleEditInputChange('application_status', 'application_date', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clearance Details */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-b pb-2">Issuance Clearance details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Date Reviewed</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.issuance_details?.date_reviewed || ''} onChange={e => handleEditInputChange('issuance_details', 'date_reviewed', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Released Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.issuance_details?.released_date || ''} onChange={e => handleEditInputChange('issuance_details', 'released_date', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Expiration Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.issuance_details?.expiration_date || ''} onChange={e => handleEditInputChange('issuance_details', 'expiration_date', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Rejection Remarks</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase hover:border-[#1e419c] focus:border-[#1e419c] outline-none" value={editFormData.issuance_details?.rejection_remarks || ''} onChange={e => handleEditInputChange('issuance_details', 'rejection_remarks', e.target.value)} />
                  </div>
                </div>
              </div>

            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setEditingRecord(null)} className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Cancel
              </button>
              <button type="submit" className="px-10 py-3 bg-amber-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md hover:bg-amber-700">
                Save Changes
              </button>
            </div>

          </form>
        </div>
      )}

      {/* CONFIRM RELEASE MODAL */}
      {confirmingReleaseRecord && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmingReleaseRecord(null)} />
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-[#1e419c] rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                <Tag size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Confirm Physical ID Release?</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  This marks the physical card for <span className="text-slate-900 font-bold uppercase">{confirmingReleaseRecord.personal_information?.full_name}</span> as officially collected and distributed.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setConfirmingReleaseRecord(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                Cancel
              </button>
              <button onClick={handleReleaseSubmit} className="flex-1 py-3 bg-[#1e419c] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90">
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRejectingRecord(null)} />
          <form onSubmit={handleRejectSubmit} className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-20 overflow-hidden animate-scale-up">
            <div className="bg-rose-50 p-6 flex items-center gap-3 border-b border-rose-100">
              <XCircle className="text-rose-600" size={20} />
              <h3 className="font-bold text-rose-950 uppercase tracking-widest">Disapproval Confirmation</h3>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Provide reasons/notes for rejecting this candidate application:
              </p>
              <textarea 
                required 
                value={rejectionRemarks} 
                onChange={(e) => setRejectionRemarks(e.target.value)} 
                placeholder="e.g. Discrepancies found with uploaded certificate paths." 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-950 outline-none focus:border-red-500 resize-none" 
                rows={4} 
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button type="button" onClick={() => setRejectingRecord(null)} className="px-4 py-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-rose-700">
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
