import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Search, MapPin, ChevronDown, Layers, Clock, Calendar, CheckCircle, XCircle, 
  MoreHorizontal, Eye, Edit2, Trash2, Info, RefreshCw, Database, ClipboardList, 
  Globe, X, UserPlus, FileText, Download, ShieldCheck, ShieldAlert, Heart, 
  Fingerprint, CreditCard, User as UserIcon, Briefcase, FileCheck
} from 'lucide-react';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api-dbpwd.drchiocms.com/api';

const METRO_MANILA_LOCATIONS: Record<string, { districts: string[], barangays: Record<string, string[]> }> = {
  "San Juan City": {
    districts: ["District 1", "District 2"],
    barangays: {
      "District 1": [
        "Addition Hills", "Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", 
        "Isabelita", "Kabayanan", "Little Baguio", "Maytunas", 
        "Onse", "Pasadeña", "Pedro Cruz", "Progreso", "Rivera", "Salapan", 
        "San Perfecto", "Santa Lucia", "Tibagan"
      ],
      "District 2": ["Greenhills", "West Crame"]
    }
  }
};

const ALL_BARANGAYS = [
  ...METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 1"],
  ...METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 2"]
].sort();

const formatDateString = (dateStr: string | null | undefined) => {
  if (!dateStr) return '---';
  try {
    const cleanDateStr = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
    const parsed = new Date(cleanDateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

// Helper to split full name or accomplished_by name safely
const parseAccomplishedByName = (fullNameStr: string) => {
  const parts = (fullNameStr || "").trim().split(/\s+/);
  if (parts.length === 0 || !fullNameStr) {
    return { first: '', middle: '', last: '' };
  }
  if (parts.length === 1) {
    return { first: parts[0], middle: '', last: '' };
  }
  if (parts.length === 2) {
    return { first: parts[0], middle: '', last: parts[1] };
  }
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(' '),
    last: parts[parts.length - 1]
  };
};

export const PwdRegistration: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  // API State Schema Requirements
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDisapproveModalOpen, setIsDisapproveModalOpen] = useState(false);
  const [isApproveConfirmModalOpen, setIsApproveConfirmModalOpen] = useState(false);
  const [viewingDisapprovalApp, setViewingDisapprovalApp] = useState<any | null>(null);

  // Filters & Support State
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Workflows Fields
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [rejectionRemarks, setRejectionRemarks] = useState<string>('');
  const [editData, setEditData] = useState<any>({});
  const [inlineErrors, setInlineErrors] = useState<Record<string, string[]>>({});

  // Helper to construct request headers
  const getHeaders = useCallback(() => {
    const headers: any = {
      'Accept': 'application/json'
    };
    const token = localStorage.getItem('pdao_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  // Fetch Applications List
  const fetchApplications = useCallback(async () => {
    setFetchLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${BASE_URL}/applications`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log("Applications", data);

      if (response.ok) {
        // Map API response to our local state
        const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        setApplications(list);
      } else {
        console.error("API Error", data);
        setErrorMessage("Unable to fetch applications list.");
      }
    } catch (e: any) {
      console.error("API Error", e);
      setErrorMessage("Network error: Unable to fetch applications.");
    } finally {
      setFetchLoading(false);
    }
  }, [getHeaders]);

  // Fetch Single Application Profile Details
  const fetchApplicationDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/applications/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        const app = data.data || data;
        console.log("Selected Application", app);
        setSelectedApplication(app);
      } else {
        console.error("API Error", data);
        setErrorMessage("Unable to view application profile.");
      }
    } catch (e) {
      console.error("API Error", e);
      setErrorMessage("Network error: Unable to open profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'walk-in') {
      navigate('/register?isWalkIn=true');
    } else {
      fetchApplications();
    }
  }, [tab, fetchApplications, navigate]);

  // Sync / manual trigger reload
  const triggerReload = () => {
    fetchApplications();
    setSuccessMessage("Database records synched.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Status mapping
  const getStatusLabel = (status: string | null | undefined): string => {
    if (!status) return 'Pending';
    const s = String(status).trim();
    if (s === 'Pending' || s === 'Scheduled' || s === 'Approved' || s === 'Disapproved') {
      return s;
    }
    return s; // Fallback to raw string
  };

  // Dynamically calculate status counters according to guidelines
  const counts = useMemo(() => {
    const total = applications.length;
    let pending = 0;
    let scheduled = 0;
    let approved = 0;
    let disapproved = 0;

    applications.forEach(a => {
      const status = getStatusLabel(a.reg_status);
      if (status === 'Pending') pending++;
      else if (status === 'Scheduled') scheduled++;
      else if (status === 'Approved') approved++;
      else if (status === 'Disapproved') disapproved++;
    });

    return { total, pending, scheduled, approved, disapproved };
  }, [applications]);

  // Filter queue
  const filteredApps = useMemo(() => {
    let list = [...applications];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(a => getStatusLabel(a.reg_status) === statusFilter);
    }

    // Barangay filter
    if (barangayFilter !== 'all') {
      list = list.filter(a => a.address_and_contact?.barangay === barangayFilter);
    }

    // Search query matches Full name, Barangay, or APP ID
    if (searchTerm) {
      const query = searchTerm.toLowerCase().trim();
      list = list.filter(a => {
        const fullName = (a.personal_information?.full_name || '').toLowerCase();
        const barangay = (a.address_and_contact?.barangay || '').toLowerCase();
        const appId = `APP-${a.id}`.toLowerCase();
        const idStr = String(a.id).toLowerCase();
        return fullName.includes(query) || barangay.includes(query) || appId.includes(query) || idStr.includes(query);
      });
    }

    // Sort by latest first
    list.sort((a, b) => Number(b.id) - Number(a.id));

    return list;
  }, [applications, statusFilter, barangayFilter, searchTerm]);

  // Trigger Edit mode
  const initEditMode = (app: any) => {
    const accParts = parseAccomplishedByName(app.processing_info?.accomplished_by_name || '');
    const fatherParts = parseAccomplishedByName(app.family_background?.father || app.family_background?.father_name || '');
    const motherParts = parseAccomplishedByName(app.family_background?.mother || app.family_background?.mother_name || '');
    const guardianParts = parseAccomplishedByName(app.family_background?.guardian || app.family_background?.guardian_name || '');
    
    setEditData({
      first_name: app.personal_information?.first_name || '',
      last_name: app.personal_information?.last_name || '',
      middle_name: app.personal_information?.middle_name || '',
      suffix: app.personal_information?.suffix || '',
      date_of_birth: app.personal_information?.date_of_birth || '',
      gender: app.personal_information?.gender || '',
      civil_status: app.personal_information?.civil_status || '',
      
      disability_types: app.congenital_outflow_defect?.types || app.disability_details?.types || '',
      congenital: app.congenital_outflow_defect?.congenital || app.disability_details?.congenital || '',
      acquired: app.congenital_outflow_defect?.acquired || app.disability_details?.acquired || '',
      
      house_street: app.address_and_contact?.house_street || '',
      barangay: app.address_and_contact?.barangay || '',
      municipality: app.address_and_contact?.municipality || 'San Juan City',
      province: app.address_and_contact?.province || 'Metro Manila',
      region: app.address_and_contact?.region || 'NCR',
      landline_no: app.address_and_contact?.landline_no || '',
      mobile_no: app.address_and_contact?.mobile_no || '',
      email_address: app.address_and_contact?.email_address || '',
      
      emergency_contact_name: app.emergency_contact?.name || '',
      emergency_contact_number: app.emergency_contact?.number || '',
      emergency_contact_relation: app.emergency_contact?.relation || '',
      
      educational_attainment: app.education_and_employment?.educational_attainment || '',
      employment_status: app.education_and_employment?.employment_status || '',
      employment_type: app.education_and_employment?.employment_type || '',
      employment_category: app.education_and_employment?.employment_category || '',
      occupation: app.education_and_employment?.occupation || '',
      
      certifying_physician: app.processing_info?.certifying_physician || '',
      physician_license_no: app.processing_info?.physician_license_no || '',
      
      organization_affiliated: app.organization_info?.affiliated || '',
      organization_contact_person: app.organization_info?.contact_person || '',
      organization_address: app.organization_info?.address || '',
      organization_tel_no: app.organization_info?.tel_no || '',
      
      sss_no: app.government_ids?.sss_no || '',
      gsis_no: app.government_ids?.gsis_no || '',
      pagibig_no: app.government_ids?.pagibig_no || '',
      psn_no: app.government_ids?.psn_no || '',
      philhealth_no: app.government_ids?.philhealth_no || '',
      
      father_first_name: app.family_background?.father_first_name || fatherParts.first || '',
      father_middle_name: app.family_background?.father_middle_name || fatherParts.middle || '',
      father_last_name: app.family_background?.father_last_name || fatherParts.last || '',
      father_name: app.family_background?.father || app.family_background?.father_name || '',
      
      mother_first_name: app.family_background?.mother_first_name || motherParts.first || '',
      mother_middle_name: app.family_background?.mother_middle_name || motherParts.middle || '',
      mother_last_name: app.family_background?.mother_last_name || motherParts.last || '',
      mother_name: app.family_background?.mother || app.family_background?.mother_name || '',
      
      guardian_first_name: app.family_background?.guardian_first_name || guardianParts.first || '',
      guardian_middle_name: app.family_background?.guardian_middle_name || guardianParts.middle || '',
      guardian_last_name: app.family_background?.guardian_last_name || guardianParts.last || '',
      guardian_name: app.family_background?.guardian || app.family_background?.guardian_name || '',
      
      accomplished_by: app.processing_info?.accomplished_by || 'Applicant',
      accomplished_by_first_name: app.processing_info?.accomplished_by_first_name || accParts.first,
      accomplished_by_middle_name: app.processing_info?.accomplished_by_middle_name || accParts.middle,
      accomplished_by_last_name: app.processing_info?.accomplished_by_last_name || accParts.last,
      
      processing_officer: app.processing_info?.processing_officer || '',
      approving_officer: app.processing_info?.approving_officer || '',
      appointment_date: app.processing_info?.appointment_date || '',
    });
    setInlineErrors({});
    setIsEditMode(true);
  };

  // Update Application via Multipart FormData API
  const handleUpdateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    setLoading(true);
    setInlineErrors({});

    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.keys(editData).forEach(key => {
      formData.append(key, editData[key] || '');
    });

    console.log("Update Payload", formData);

    try {
      const response = await fetch(`${BASE_URL}/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: formData
      });
      const resData = await response.json();

      if (response.ok) {
        setSuccessMessage("Application updated successfully.");
        setIsEditMode(false);
        // Refresh details & list
        await fetchApplicationDetails(selectedApplication.id);
        await fetchApplications();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("API Error", resData);
        if (response.status === 422 && resData.errors) {
          setInlineErrors(resData.errors);
        } else {
          setErrorMessage("Unable to update application.");
          setTimeout(() => setErrorMessage(null), 3000);
        }
      }
    } catch (error) {
      console.error("API Error", error);
      setErrorMessage("Unable to update application.");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Schedule Appointment Workflow
  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication || !appointmentDate) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("_method", "PUT"); // Backup wrapper in case backend expects it, but we also specify method: 'PUT'
    formData.append("appointment_date", appointmentDate);
    formData.append("reg_status", "Scheduled");

    console.log("Schedule Payload (PUT)", formData);

    try {
      const response = await fetch(`${BASE_URL}/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: formData
      });
      const resData = await response.json();

      if (response.ok) {
        setSuccessMessage("Appointment scheduled successfully.");
        setIsScheduleModalOpen(false);
        setAppointmentDate('');
        // Refresh details & list
        await fetchApplicationDetails(selectedApplication.id);
        await fetchApplications();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("API Error", resData);
        setErrorMessage("Unable to schedule appointment.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("API Error", error);
      setErrorMessage("Unable to schedule appointment.");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Approval flow control number generator
  const generateControlNumber = () => {
    const year = new Date().getFullYear();
    const approvedCount = applications.filter(a => getStatusLabel(a.reg_status) === "Approved").length;
    return `PWD-${year}-${String(approvedCount + 1).padStart(4, '0')}`;
  };

  // Approval Workflow Submit
  const handleApproveApplication = async () => {
    if (!selectedApplication) return;
    setLoading(true);

    const controlNo = generateControlNumber();
    const adminName = currentUser?.name || "Administrator";

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("reg_status", "Approved");
    formData.append("control_number", controlNo);
    formData.append("approving_officer", adminName);

    console.log("Approve Payload (PUT)", formData);

    try {
      const response = await fetch(`${BASE_URL}/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: formData
      });
      const resData = await response.json();

      if (response.ok) {
        setSuccessMessage("Application approved successfully.");
        // Refresh details & list
        await fetchApplicationDetails(selectedApplication.id);
        await fetchApplications();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("API Error", resData);
        setErrorMessage("Unable to approve application.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("API Error", error);
      setErrorMessage("Unable to approve application.");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Disapproval Workflow Submit
  const handleDisapproveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    if (!rejectionRemarks.trim()) {
      alert("Reason for disapproval is required.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("reg_status", "Disapproved");
    formData.append("rejection_remarks", rejectionRemarks);

    console.log("Disapprove Payload (PUT)", formData);

    try {
      const response = await fetch(`${BASE_URL}/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: formData
      });
      const resData = await response.json();

      if (response.ok) {
        setSuccessMessage("Application disapproved successfully.");
        setIsDisapproveModalOpen(false);
        setRejectionRemarks('');
        // Refresh details & list
        await fetchApplicationDetails(selectedApplication.id);
        await fetchApplications();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("API Error", resData);
        setErrorMessage("Unable to disapprove application.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("API Error", error);
      setErrorMessage("Unable to disapprove application.");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Render validation errors dynamically
  const renderInlineError = (field: string) => {
    if (inlineErrors[field] && inlineErrors[field].length > 0) {
      return (
        <span className="text-red-500 text-[10px] block font-bold mt-1 tracking-tight">
          {inlineErrors[field][0]}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Loading overlay during modifications */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-slate-100">
            <RefreshCw className="animate-spin text-[#1e419c]" size={24} />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Processing Transaction...</span>
          </div>
        </div>
      )}

      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800 leading-tight">PWD Registration Management</h1>
          <p className="text-slate-500 font-medium text-base">Verify records, schedule applicant appointments, approve registrants, and audit statuses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/register?isWalkIn=true')}
            className="flex items-center gap-2 px-6 py-3 bg-[#1e419c] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-800 transition-all active:scale-95"
          >
            <UserPlus size={16} />
            Add Application
          </button>
        </div>
      </header>

      {/* Database sync count status */}
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
                  placeholder="Search full name, barangay, application ID..." 
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
              <ClipboardList size={12} className="text-[#1e419c]" /> Listed Records: {filteredApps.length}
            </div>
          </div>

          {/* Counters row */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/50">
            {[
              { id: 'all', label: 'All Records', icon: Layers, count: counts.total },
              { id: 'Pending', label: 'Pending', icon: Clock, count: counts.pending, color: 'text-amber-500' },
              { id: 'Scheduled', label: 'Scheduled', icon: Calendar, count: counts.scheduled, color: 'text-blue-500' },
              { id: 'Approved', label: 'Approved', icon: CheckCircle, count: counts.approved, color: 'text-emerald-500' },
              { id: 'Disapproved', label: 'Disapproved', icon: XCircle, count: counts.disapproved, color: 'text-red-500' }
            ].map(tabOpt => (
              <button 
                key={tabOpt.id} 
                onClick={() => setStatusFilter(tabOpt.id)} 
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-[10px] uppercase tracking-widest transition-all ${
                  statusFilter === tabOpt.id ? 'bg-[#1e419c] text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <tabOpt.icon size={14} className={statusFilter === tabOpt.id ? "text-white" : tabOpt.color} />
                {tabOpt.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium ${
                  statusFilter === tabOpt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                }`}>{tabOpt.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic applications queue table */}
        {fetchLoading ? (
          <div className="p-32 text-center text-slate-400 space-y-4">
            <RefreshCw size={40} className="animate-spin mx-auto text-[#1e419c]" />
            <p className="text-xs uppercase tracking-widest font-bold">Querying application endpoints...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-32 text-center text-slate-300">
            <Database size={64} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium uppercase tracking-[0.2em] text-xs text-slate-400">No records found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1e419c] text-white text-[10px] font-normal uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6">Applicant Name</th>
                  <th className="p-6">Barangay</th>
                  <th className="p-6">Registration Date</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Type</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map(app => {
                  const statusLabel = getStatusLabel(app.reg_status);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-6">
                        <span className="font-semibold text-slate-800 uppercase tracking-tight text-sm block">
                          {app.personal_information?.full_name || '---'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-medium text-slate-600">
                          {app.address_and_contact?.barangay || '---'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                          <Calendar size={13} className="text-slate-300" /> 
                          {formatDateString(app.application_details?.date_applied)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            statusLabel === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            statusLabel === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            statusLabel === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {statusLabel}
                          </span>
                          
                          {/* Interactive status transitions */}
                          {statusLabel === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApplication(app);
                                setIsScheduleModalOpen(true);
                              }}
                              className="mt-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all self-start flex items-center gap-1 shadow-sm shadow-blue-100 cursor-pointer"
                              title="Schedule this applicant"
                            >
                              <Calendar size={11} />
                              Schedule
                            </button>
                          )}

                          {statusLabel === 'Scheduled' && (
                            <div className="mt-1 flex flex-col sm:flex-row gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setIsApproveConfirmModalOpen(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 shadow-sm shadow-emerald-100 cursor-pointer"
                              >
                                <CheckCircle size={10} />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setIsDisapproveModalOpen(true);
                                }}
                                className="px-2 py-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <XCircle size={10} />
                                Reject
                              </button>
                            </div>
                          )}

                          {statusLabel === 'Scheduled' && app.processing_info?.appointment_date && (
                            <span className="text-[9px] text-blue-500 font-bold block">
                              Appt: {app.processing_info.appointment_date}
                            </span>
                          )}

                          {statusLabel === 'Approved' && (
                            <span className="text-[9px] text-slate-500 font-semibold block leading-tight mt-1">
                              Reviewed: <span className="font-bold text-slate-700 block">{formatDateString(app.metadata?.updated_at || app.application_details?.date_applied)}</span>
                            </span>
                          )}

                          {statusLabel === 'Disapproved' && (
                            <button
                              type="button"
                              onClick={() => setViewingDisapprovalApp(app)}
                              className="mt-1 px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all self-start flex items-center gap-1 cursor-pointer"
                              title="Click to view rejection reason"
                            >
                              <XCircle size={10} />
                              View Reason
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold tracking-wider">
                          <Globe size={10} />
                          ONLINE
                        </span>
                      </td>
                      <td className="p-6 text-right relative">
                        <div className="flex justify-end gap-1">
                          <button 
                            type="button"
                            onClick={() => fetchApplicationDetails(app.id)}
                            className="p-2 bg-slate-50 border border-slate-100 text-[#1e419c] hover:bg-slate-100 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setOpenDropdownId(openDropdownId === app.id ? null : app.id); }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>

                        {/* Relative menu popup inside cell */}
                        {openDropdownId === app.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute right-6 top-14 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2 w-48 text-left animate-scale-up">
                              <button 
                                type="button"
                                onClick={() => { fetchApplicationDetails(app.id); setOpenDropdownId(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-wider"
                              >
                                <Eye size={14} className="text-slate-400" />
                                View Profile
                              </button>
                              
                              {statusLabel === 'Pending' && (
                                <button 
                                  type="button"
                                  onClick={() => { 
                                    setSelectedApplication(app); 
                                    setIsScheduleModalOpen(true); 
                                    setOpenDropdownId(null); 
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs text-blue-600 font-bold uppercase tracking-wider"
                                >
                                  <Calendar size={14} className="text-blue-500" />
                                  Schedule
                                </button>
                              )}

                              <button 
                                type="button"
                                onClick={async () => { 
                                  setOpenDropdownId(null);
                                  setLoading(true);
                                  try {
                                    const response = await fetch(`${BASE_URL}/applications/${app.id}`, {
                                      method: 'GET',
                                      headers: getHeaders()
                                    });
                                    const data = await response.json();
                                    if (response.ok) {
                                      const fullApp = data.data || data;
                                      setSelectedApplication(fullApp);
                                      initEditMode(fullApp);
                                    } else {
                                      setSelectedApplication(app);
                                      initEditMode(app);
                                    }
                                  } catch (e) {
                                    setSelectedApplication(app);
                                    initEditMode(app);
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-wider"
                              >
                                <Edit2 size={14} className="text-orange-500" />
                                Edit Info
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Dynamic modal population */}
      {selectedApplication && !isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedApplication(null)} />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-normal uppercase tracking-widest">Enrollment Record Review</h2>
                  <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest mt-1">Application ID: APP-{selectedApplication.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => initEditMode(selectedApplication)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  <Edit2 size={14} />
                  Edit Info
                </button>
                <button onClick={() => setSelectedApplication(null)} className="p-2 text-white/60 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Scroll Body */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50 custom-scrollbar">
              
              {/* Personal Information */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-isla-50 pb-3 flex items-center gap-2">
                  <UserIcon size={14} className="text-[#1e419c]" /> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Date Applied</label>
                    <p className="font-semibold text-slate-850 text-sm">{selectedApplication.application_details?.date_applied || '---'}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Full Legal Name</label>
                    <p className="font-bold text-[#1e419c] text-lg uppercase tracking-tight">{selectedApplication.personal_information?.full_name || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Birthdate</label>
                    <p className="font-semibold text-slate-850 text-sm">{selectedApplication.personal_information?.date_of_birth || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Gender</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.personal_information?.gender || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Civil Status</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.personal_information?.civil_status || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Accomplished By */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-isla-50 pb-3 flex items-center gap-2">
                  <UserIcon size={14} className="text-[#1e419c]" /> Accomplished By
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Relationship</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.processing_info?.accomplished_by || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">First Name</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{parseAccomplishedByName(selectedApplication.processing_info?.accomplished_by_name || '').first || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Middle Name</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{parseAccomplishedByName(selectedApplication.processing_info?.accomplished_by_name || '').middle || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Last Name</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{parseAccomplishedByName(selectedApplication.processing_info?.accomplished_by_name || '').last || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Disability Details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-isla-50 pb-3 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-amber-500" /> Disability Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Type of Disability</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.congenital_outflow_defect?.types || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Congenital Cause</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.congenital_outflow_defect?.congenital || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Acquired Cause</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.congenital_outflow_defect?.acquired || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-red-500" /> Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Street Address</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.address_and_contact?.house_street || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Barangay</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.address_and_contact?.barangay || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">City / Municipality</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.address_and_contact?.municipality || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Province</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.address_and_contact?.province || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Region</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.address_and_contact?.region || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Contact information details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Landline</label>
                    <p className="font-semibold text-slate-850 text-sm">{selectedApplication.address_and_contact?.landline_no || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mobile Number</label>
                    <p className="font-bold text-[#1e419c] text-sm tracking-wider font-mono">{selectedApplication.address_and_contact?.mobile_no || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email Address</label>
                    <p className="font-semibold text-slate-850 text-sm text-slate-700">{selectedApplication.address_and_contact?.email_address || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-red-500" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Contact Person</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.emergency_contact?.name || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Contact Number</label>
                    <p className="font-semibold text-slate-855 text-sm">{selectedApplication.emergency_contact?.number || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Relationship</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.emergency_contact?.relation || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Education and Employment */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <Briefcase size={14} className="text-indigo-500" /> Education and Employment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Educational Attainment</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.education_and_employment?.educational_attainment || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Employment Status</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.education_and_employment?.employment_status || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Employment Type</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.education_and_employment?.employment_type || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Employment Category</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.education_and_employment?.employment_category || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Occupation</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.education_and_employment?.occupation || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Physician */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> Certifying Physician
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Certifying Physician</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.processing_info?.certifying_physician || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">License No</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.processing_info?.physician_license_no || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Organization Affiliated */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" /> Organization Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Organization Affiliated</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.organization_info?.affiliated || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Contact Person</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.organization_info?.contact_person || '---'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Organization Address</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.organization_info?.address || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Contact No</label>
                    <p className="font-semibold text-slate-850 text-sm">{selectedApplication.organization_info?.tel_no || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Government IDs */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-500" /> Government IDs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">SSS Number</label>
                    <p className="font-semibold text-slate-855 text-sm font-mono">{selectedApplication.government_ids?.sss_no || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">GSIS Number</label>
                    <p className="font-semibold text-slate-850 text-sm font-mono">{selectedApplication.government_ids?.gsis_no || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pag-IBIG Number</label>
                    <p className="font-semibold text-slate-850 text-sm font-mono">{selectedApplication.government_ids?.pagibig_no || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">PSN Number</label>
                    <p className="font-semibold text-slate-850 text-sm font-mono">{selectedApplication.government_ids?.psn_no || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">PhilHealth Number</label>
                    <p className="font-semibold text-slate-850 text-sm font-mono">{selectedApplication.government_ids?.philhealth_no || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Family Background */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <Heart size={14} className="text-red-500" /> Family Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Father's Name</label>
                    <p className="font-semibold text-slate-855 text-sm uppercase">{selectedApplication.family_background?.father || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mother's Name</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.family_background?.mother || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Guardian's Name</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.family_background?.guardian || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Processing details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" /> Processing & Approval
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Processing Officer</label>
                    <p className="font-semibold text-slate-855 text-sm uppercase">{selectedApplication.processing_info?.processing_officer || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Approving Officer</label>
                    <p className="font-semibold text-slate-850 text-sm uppercase">{selectedApplication.processing_info?.approving_officer || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Appointment Date</label>
                    <p className="font-semibold text-slate-850 text-sm">{selectedApplication.processing_info?.appointment_date || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Registration Status</label>
                    <p className="font-semibold text-slate-850 text-sm">{getStatusLabel(selectedApplication.reg_status)}</p>
                  </div>
                  {/* Rejection / disapproval remarks */}
                  {getStatusLabel(selectedApplication.reg_status) === 'Disapproved' && (
                    <div className="md:col-span-2 bg-red-50 p-4 rounded-xl border border-red-100">
                      <label className="text-[10px] text-red-600 font-bold uppercase block mb-1">Rejection Remarks</label>
                      <p className="font-bold text-red-750 text-sm">{selectedApplication.rejection_remarks || '---'}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-8 bg-white border-t border-slate-100 flex flex-wrap gap-3 justify-end shrink-0">
              {getStatusLabel(selectedApplication.reg_status) === 'Pending' && (
                <>
                  <button 
                    type="button" 
                    onClick={() => { setIsDisapproveModalOpen(true); }}
                    className="px-6 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Disapprove Record
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsScheduleModalOpen(true); }}
                    className="px-6 py-3 bg-[#1e419c] text-white hover:bg-blue-800 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Schedule Appointment
                  </button>
                </>
              )}

              {getStatusLabel(selectedApplication.reg_status) === 'Scheduled' && (
                <>
                  <button 
                    type="button" 
                    onClick={() => { setIsDisapproveModalOpen(true); }}
                    className="px-6 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Disapprove Record
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsApproveConfirmModalOpen(true); }}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all text-center"
                  >
                    Approve & Register
                  </button>
                </>
              )}

              <button 
                type="button" 
                onClick={() => setSelectedApplication(null)}
                className="px-8 py-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Editing Application Modal Form */}
      {selectedApplication && isEditMode && (
        <form onSubmit={handleUpdateApplication} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditMode(false)} />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-orange-600 p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Edit2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-normal uppercase tracking-widest">Edit Application Profile</h2>
                  <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest mt-1">Modifying APP-{selectedApplication.id}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditMode(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Input Body */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50 custom-scrollbar">

              {/* Personal Info fields */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <UserIcon size={14} className="text-[#1e419c]" /> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">First Name</label>
                    <input 
                      type="text" 
                      value={editData.first_name} 
                      onChange={e => setEditData({...editData, first_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("first_name")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Middle Name</label>
                    <input 
                      type="text" 
                      value={editData.middle_name} 
                      onChange={e => setEditData({...editData, middle_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("middle_name")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Last Name</label>
                    <input 
                      type="text" 
                      value={editData.last_name} 
                      onChange={e => setEditData({...editData, last_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("last_name")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Suffix</label>
                    <input 
                      type="text" 
                      value={editData.suffix} 
                      onChange={e => setEditData({...editData, suffix: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("suffix")}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Birthdate</label>
                    <input 
                      type="date" 
                      value={editData.date_of_birth} 
                      onChange={e => setEditData({...editData, date_of_birth: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("date_of_birth")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Gender</label>
                    <select 
                      value={editData.gender} 
                      onChange={e => setEditData({...editData, gender: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {renderInlineError("gender")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Civil Status</label>
                    <select 
                      value={editData.civil_status} 
                      onChange={e => setEditData({...editData, civil_status: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                    {renderInlineError("civil_status")}
                  </div>
                </div>
              </div>

              {/* Accomplished By Fields */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <UserIcon size={14} className="text-[#1e419c]" /> Accomplished By
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Relationship</label>
                    <select 
                      value={editData.accomplished_by} 
                      onChange={e => setEditData({...editData, accomplished_by: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="Applicant">Applicant</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Representative">Representative</option>
                    </select>
                    {renderInlineError("accomplished_by")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">First Name</label>
                    <input 
                      type="text" 
                      value={editData.accomplished_by_first_name} 
                      onChange={e => setEditData({...editData, accomplished_by_first_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("accomplished_by_first_name")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Middle Name</label>
                    <input 
                      type="text" 
                      value={editData.accomplished_by_middle_name} 
                      onChange={e => setEditData({...editData, accomplished_by_middle_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("accomplished_by_middle_name")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Last Name</label>
                    <input 
                      type="text" 
                      value={editData.accomplished_by_last_name} 
                      onChange={e => setEditData({...editData, accomplished_by_last_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("accomplished_by_last_name")}
                  </div>
                </div>
              </div>

              {/* Disability Information fields */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-amber-500" /> Disability Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Type of Disability</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Visual, Hearing..."
                      value={editData.disability_types || ''} 
                      onChange={e => setEditData({...editData, disability_types: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("disability_types")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Congenital Cause</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Autism, ADHD..."
                      value={editData.congenital || ''} 
                      onChange={e => setEditData({...editData, congenital: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("congenital")}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Acquired Cause</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Injury, Chronic Illness..."
                      value={editData.acquired || ''} 
                      onChange={e => setEditData({...editData, acquired: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("acquired")}
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-[#1e419c]" /> Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1 lg:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Street Address</label>
                    <input 
                      type="text" 
                      value={editData.house_street} 
                      onChange={e => setEditData({...editData, house_street: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("house_street")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Barangay</label>
                    <input 
                      type="text" 
                      value={editData.barangay} 
                      onChange={e => setEditData({...editData, barangay: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("barangay")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">City / Municipality</label>
                    <input 
                      type="text" 
                      value={editData.municipality} 
                      onChange={e => setEditData({...editData, municipality: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("municipality")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Province</label>
                    <input 
                      type="text" 
                      value={editData.province} 
                      onChange={e => setEditData({...editData, province: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("province")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Region</label>
                    <input 
                      type="text" 
                      value={editData.region} 
                      onChange={e => setEditData({...editData, region: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("region")}
                  </div>
                </div>
              </div>

              {/* Contact Information fields */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <Clock size={14} className="text-emerald-500" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Landline</label>
                    <input 
                      type="text" 
                      value={editData.landline_no} 
                      onChange={e => setEditData({...editData, landline_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("landline_no")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Mobile Number</label>
                    <input 
                      type="text" 
                      value={editData.mobile_no} 
                      onChange={e => setEditData({...editData, mobile_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20 animate-pulse text-[#1e419c] font-bold"
                    />
                    {renderInlineError("mobile_no")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={editData.email_address} 
                      onChange={e => setEditData({...editData, email_address: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("email_address")}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-red-500" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Contact Person</label>
                    <input 
                      type="text" 
                      value={editData.emergency_contact_name} 
                      onChange={e => setEditData({...editData, emergency_contact_name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("emergency_contact_name")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Contact Number</label>
                    <input 
                      type="text" 
                      value={editData.emergency_contact_number} 
                      onChange={e => setEditData({...editData, emergency_contact_number: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("emergency_contact_number")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Relationship</label>
                    <input 
                      type="text" 
                      value={editData.emergency_contact_relation} 
                      onChange={e => setEditData({...editData, emergency_contact_relation: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("emergency_contact_relation")}
                  </div>
                </div>
              </div>

              {/* Education and Employment */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <Briefcase size={14} className="text-indigo-500" /> Education & Employment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Educational Attainment</label>
                    <select 
                      value={editData.educational_attainment} 
                      onChange={e => setEditData({...editData, educational_attainment: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Select Education</option>
                      <option value="None">None</option>
                      <option value="Elementary">Elementary Graduate</option>
                      <option value="High School">High School Graduate</option>
                      <option value="College">College Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                    {renderInlineError("educational_attainment")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Employment Status</label>
                    <select 
                      value={editData.employment_status} 
                      onChange={e => setEditData({...editData, employment_status: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Select Employment</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-Employed">Self-Employed</option>
                    </select>
                    {renderInlineError("employment_status")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Employment Type</label>
                    <input 
                      type="text" 
                      value={editData.employment_type} 
                      onChange={e => setEditData({...editData, employment_type: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("employment_type")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Employment Category</label>
                    <input 
                      type="text" 
                      value={editData.employment_category} 
                      onChange={e => setEditData({...editData, employment_category: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("employment_category")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Occupation</label>
                    <input 
                      type="text" 
                      value={editData.occupation} 
                      onChange={e => setEditData({...editData, occupation: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("occupation")}
                  </div>
                </div>
              </div>

              {/* Physician Name & License */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> Certifying Physician
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Name of Physician</label>
                    <input 
                      type="text" 
                      value={editData.certifying_physician} 
                      onChange={e => setEditData({...editData, certifying_physician: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("certifying_physician")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">License Number</label>
                    <input 
                      type="text" 
                      value={editData.physician_license_no} 
                      onChange={e => setEditData({...editData, physician_license_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("physician_license_no")}
                  </div>
                </div>
              </div>

              {/* Affiliated Organization */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" /> Organization Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Organization Name</label>
                    <input 
                      type="text" 
                      value={editData.organization_affiliated} 
                      onChange={e => setEditData({...editData, organization_affiliated: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("organization_affiliated")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Contact Person</label>
                    <input 
                      type="text" 
                      value={editData.organization_contact_person} 
                      onChange={e => setEditData({...editData, organization_contact_person: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("organization_contact_person")}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Organization Address</label>
                    <input 
                      type="text" 
                      value={editData.organization_address} 
                      onChange={e => setEditData({...editData, organization_address: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("organization_address")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Organization Tel No</label>
                    <input 
                      type="text" 
                      value={editData.organization_tel_no} 
                      onChange={e => setEditData({...editData, organization_tel_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("organization_tel_no")}
                  </div>
                </div>
              </div>

              {/* Government IDs */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-500" /> Government IDs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">SSS Number</label>
                    <input 
                      type="text" 
                      value={editData.sss_no} 
                      onChange={e => setEditData({...editData, sss_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold font-mono outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("sss_no")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">GSIS Number</label>
                    <input 
                      type="text" 
                      value={editData.gsis_no} 
                      onChange={e => setEditData({...editData, gsis_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold font-mono outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("gsis_no")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Pag-IBIG Number</label>
                    <input 
                      type="text" 
                      value={editData.pagibig_no} 
                      onChange={e => setEditData({...editData, pagibig_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold font-mono outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("pagibig_no")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">PSN Number</label>
                    <input 
                      type="text" 
                      value={editData.psn_no} 
                      onChange={e => setEditData({...editData, psn_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold font-mono outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("psn_no")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">PhilHealth Number</label>
                    <input 
                      type="text" 
                      value={editData.philhealth_no} 
                      onChange={e => setEditData({...editData, philhealth_no: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold font-mono outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("philhealth_no")}
                  </div>
                </div>
              </div>

              {/* Family Background */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <Heart size={14} className="text-red-500" /> Family Information
                </h4>
                
                {/* Father Information */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-wider block ml-1">Father's Name</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">First Name</label>
                      <input 
                        type="text" 
                        value={editData.father_first_name} 
                        onChange={e => setEditData({...editData, father_first_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("father_first_name")}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Middle Name</label>
                      <input 
                        type="text" 
                        value={editData.father_middle_name} 
                        onChange={e => setEditData({...editData, father_middle_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("father_middle_name")}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Last Name</label>
                      <input 
                        type="text" 
                        value={editData.father_last_name} 
                        onChange={e => setEditData({...editData, father_last_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("father_last_name")}
                    </div>
                  </div>
                </div>

                {/* Mother Information */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h5 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-wider block ml-1">Mother's Maiden Name</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">First Name</label>
                      <input 
                        type="text" 
                        value={editData.mother_first_name} 
                        onChange={e => setEditData({...editData, mother_first_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("mother_first_name")}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Middle Name</label>
                      <input 
                        type="text" 
                        value={editData.mother_middle_name} 
                        onChange={e => setEditData({...editData, mother_middle_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("mother_middle_name")}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Last Name</label>
                      <input 
                        type="text" 
                        value={editData.mother_last_name} 
                        onChange={e => setEditData({...editData, mother_last_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("mother_last_name")}
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h5 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-wider block ml-1">Guardian's Name</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">First Name</label>
                      <input 
                        type="text" 
                        value={editData.guardian_first_name} 
                        onChange={e => setEditData({...editData, guardian_first_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("guardian_first_name")}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Middle Name</label>
                      <input 
                        type="text" 
                        value={editData.guardian_middle_name} 
                        onChange={e => setEditData({...editData, guardian_middle_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("guardian_middle_name")}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Last Name</label>
                      <input 
                        type="text" 
                        value={editData.guardian_last_name} 
                        onChange={e => setEditData({...editData, guardian_last_name: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      {renderInlineError("guardian_last_name")}
                    </div>
                  </div>
                </div>

              </div>

              {/* Processing details */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" /> Processing and Administration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Processing Officer</label>
                    <input 
                      type="text" 
                      value={editData.processing_officer} 
                      onChange={e => setEditData({...editData, processing_officer: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("processing_officer")}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block ml-1">Approving Officer</label>
                    <input 
                      type="text" 
                      value={editData.approving_officer} 
                      onChange={e => setEditData({...editData, approving_officer: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    {renderInlineError("approving_officer")}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-8 bg-white border-t border-slate-100 flex gap-3 justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => setIsEditMode(false)}
                className="px-8 py-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Discard Changes
              </button>
              <button 
                type="submit" 
                className="px-10 py-3 bg-orange-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-all text-center"
              >
                Save Profile Updates
              </button>
            </div>

          </div>
        </form>
      )}

      {/* Approve application Confirmation Modal popup dialog */}
      {isApproveConfirmModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={() => setIsApproveConfirmModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100">
            <div className="p-10 space-y-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-normal text-slate-800 uppercase tracking-tight">Approve Application</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Are you sure you want to approve the application for <span className="font-bold text-slate-900">{selectedApplication.personal_information?.full_name || 'the applicant'}</span>?
                </p>
                <p className="text-slate-400 text-xs px-4">
                  This will generate a PWD control number, mark their registration as Approved, and close this window.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsApproveConfirmModalOpen(false)}
                  className="px-6 py-4 border border-slate-200 text-slate-450 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    setIsApproveConfirmModalOpen(false);
                    await handleApproveApplication();
                  }}
                  className="px-6 py-4 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Small Pop Modal */}
      {isScheduleModalOpen && selectedApplication && (
        <form onSubmit={handleScheduleAppointment} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100">
            <div className="p-10 space-y-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#1e419c] shadow-inner">
                  <Calendar size={40} />
                </div>
                <h3 className="text-2xl font-normal text-slate-800 uppercase tracking-tight">Schedule Appointment</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Please set an appointment date for <span className="font-bold text-slate-900">{selectedApplication.personal_information?.full_name || 'the applicant'}</span> to proceed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Appointment Date</label>
                  <input 
                    type="date" 
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-105 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-6 py-4 border border-slate-200 text-slate-450 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-4 bg-[#1e419c] text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95"
                  >
                    Set Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Disapproval Workflow Dialog Modal */}
      {isDisapproveModalOpen && selectedApplication && (
        <form onSubmit={handleDisapproveApplication} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDisapproveModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100">
            <div className="p-10 space-y-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-inner">
                  <XCircle size={40} />
                </div>
                <h3 className="text-2xl font-normal text-slate-800 uppercase tracking-tight">Disapprove Application</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Reject application for <span className="font-bold text-slate-900">{selectedApplication.personal_information?.full_name || 'the applicant'}</span>.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Reason for Disapproval <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={4}
                    value={rejectionRemarks}
                    onChange={(e) => setRejectionRemarks(e.target.value)}
                    placeholder="Provide a clear explanation for reject state..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsDisapproveModalOpen(false)}
                    className="px-6 py-4 border border-slate-200 text-slate-450 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-4 bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95"
                    disabled={!rejectionRemarks.trim()}
                  >
                    Submit Disapproval
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* View Disapproval Reason Popup Modal */}
      {viewingDisapprovalApp && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={() => setViewingDisapprovalApp(null)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100">
            <div className="p-10 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-inner">
                  <XCircle size={40} />
                </div>
                <h3 className="text-2xl font-normal text-slate-800 uppercase tracking-tight">Disapproval Inquiry</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  For Applicant: <span className="font-bold text-slate-900">{viewingDisapprovalApp.personal_information?.full_name || 'the applicant'}</span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 font-mono">Disapproval Remarks</p>
                <p className="font-semibold text-slate-800 italic">
                  "{viewingDisapprovalApp.rejection_remarks || 'No rejection reasons were given.'}"
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button 
                  type="button"
                  onClick={() => setViewingDisapprovalApp(null)}
                  className="w-full px-6 py-4 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all cursor-pointer text-center"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
          <CheckCircle size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
            <X size={16}/>
          </button>
        </div>
      )}

      {/* Error Notification Toast */}
      {errorMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
          <Info size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
            <X size={16}/>
          </button>
        </div>
      )}
    </div>
  );
};
