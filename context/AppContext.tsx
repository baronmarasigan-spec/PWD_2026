
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, Application, Complaint, Role, ApplicationStatus, RegistryRecord, ApplicationType, CashGrant, CashGrantStatus, EventItem, PosterItem } from '../types';
import { INITIAL_USERS, INITIAL_APPLICATIONS, INITIAL_COMPLAINTS, INITIAL_REGISTRY_RECORDS, INITIAL_CASH_GRANTS, INITIAL_EVENTS, INITIAL_POSTERS } from '../services/mockData';

const AUTH_URL = 'https://api-dbpwd.drchiocms.com/api/auth/login';
const FEMALE_AVATAR = 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png';

// Expanded local dummy data for External Registry simulation
const MOCK_EXTERNAL_REGISTRY: RegistryRecord[] = [];

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  users: User[];
  applications: Application[];
  complaints: Complaint[];
  registryRecords: RegistryRecord[];
  masterlistRecords: any[];
  cashGrants: CashGrant[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'date'>) => Promise<{ ok: boolean; error?: string }>;
  updateApplicationStatus: (id: string, status: ApplicationStatus, reason?: string, appointmentDate?: string) => Promise<void>;
  updateApplicationData: (id: string, updates: any) => Promise<{ ok: boolean; error?: string }>;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => void;
  updateComplaintStatus: (id: string, status: 'Open' | 'Resolved', response?: string) => void;
  verifyIdentity: (id: string) => RegistryRecord | undefined;
  issueIdCard: (appId: string) => void;
  deleteApplication: (id: string) => Promise<void>;
  deleteMasterlistRecord: (id: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  syncApplications: () => Promise<void>;
  fetchMasterlist: () => Promise<void>;
  fetchExternalRegistry: (type: 'LCR' | 'PWD') => Promise<void>;
  generateCashGrantList: (year: number) => void;
  updateCashGrantStatus: (id: string, status: CashGrantStatus, remarks?: string) => void;
  getNextPwdIdNumber: () => string;
  addEvent: (event: Omit<EventItem, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addPoster: (poster: Omit<PosterItem, 'id' | 'createdAt'>) => Promise<void>;
  updatePoster: (id: string, updates: Partial<PosterItem>) => Promise<void>;
  deletePoster: (id: string) => Promise<void>;
  moveRecordToPending: (recordId: string) => Promise<void>;
  reflectToSenior: (recordId: string) => Promise<void>;
  registerMerchant: (merchant: { name: string; email: string; contactNumber: string; address: string; username: string; password: string; businessCategory: string; permitNumber: string }) => Promise<{ ok: boolean; error?: string }>;
  events: EventItem[];
  posters: PosterItem[];
  syncError: string | null;
  actionError: string | null;
  setActionError: (err: string | null) => void;
  registryError: string | null;
  isLiveMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pdao_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pdao_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('pdao_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('pdao_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });
  const [registryRecords, setRegistryRecords] = useState<RegistryRecord[]>(() => {
    const saved = localStorage.getItem('pdao_registry_records');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRY_RECORDS;
  });
  const [cashGrants, setCashGrants] = useState<CashGrant[]>(() => {
    const saved = localStorage.getItem('pdao_cash_grants');
    return saved ? JSON.parse(saved) : INITIAL_CASH_GRANTS;
  });
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('pdao_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [posters, setPosters] = useState<PosterItem[]>(() => {
    const saved = localStorage.getItem('pdao_posters');
    return saved ? JSON.parse(saved) : INITIAL_POSTERS;
  });

  const [masterlistRecords, setMasterlistRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem('pdao_masterlist_records');
    if (saved) return JSON.parse(saved);
    
    // Default to registered PWDs from registry and users
    const registeredUsers = INITIAL_USERS
      .filter(u => u.pwdIdNumber)
      .map(u => ({
        ...u,
        userId: u.id,
        id: u.pwdIdNumber,
        type: 'PWD',
        status: 'Active',
        dateApplied: u.dateApplied || u.registrationDate || '2024-01-01'
      }));
      
    const registeredRegistry = INITIAL_REGISTRY_RECORDS
      .filter(r => r.type === 'PWD' && r.isRegistered)
      .map(r => ({
        ...r,
        pwdIdNumber: r.id.startsWith('GGG-') ? r.id : undefined,
        name: `${r.firstName} ${r.lastName}`.trim(),
        status: 'Active',
        dateApplied: '2024-01-01'
      }));
      
    return [...registeredUsers, ...registeredRegistry];
  });

  // Cleanup effect to remove dummy records requested by user
  useEffect(() => {
    const dummyNames = ['RICARDO DALISAY', 'CLARISSA MAGSALIN', 'PEDRO PENDUKO'];
    
    setApplications(prev => {
      const filtered = prev.filter(app => !dummyNames.includes(app.userName.toUpperCase()));
      if (filtered.length !== prev.length) {
        localStorage.setItem('pdao_applications', JSON.stringify(filtered));
      }
      return filtered;
    });

    setMasterlistRecords(prev => {
      const filtered = prev.filter(rec => {
        const name = rec.name || `${rec.firstName} ${rec.lastName}`;
        return !dummyNames.includes(name.toUpperCase());
      });
      if (filtered.length !== prev.length) {
        localStorage.setItem('pdao_masterlist_records', JSON.stringify(filtered));
      }
      return filtered;
    });

    setUsers(prev => {
      const filtered = prev.filter(u => {
        const name = u.name || `${u.firstName} ${u.lastName}`;
        if (u.role === Role.ADMIN) return true; // Keep admin
        return !dummyNames.includes(name.toUpperCase());
      });
      if (filtered.length !== prev.length) {
        localStorage.setItem('pdao_users', JSON.stringify(filtered));
      }
      return filtered;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('pdao_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pdao_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('pdao_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('pdao_registry_records', JSON.stringify(registryRecords));
  }, [registryRecords]);

  useEffect(() => {
    localStorage.setItem('pdao_masterlist_records', JSON.stringify(masterlistRecords));
  }, [masterlistRecords]);

  useEffect(() => {
    localStorage.setItem('pdao_cash_grants', JSON.stringify(cashGrants));
  }, [cashGrants]);

  useEffect(() => {
    localStorage.setItem('pdao_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('pdao_posters', JSON.stringify(posters));
  }, [posters]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);

  const getAuthHeaders = useCallback(() => {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }, []);

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age < 0 ? 0 : age;
  };

  const normalizeIdentity = (record: any) => {
    const apiFormData = record.formData ? (typeof record.formData === 'string' ? JSON.parse(record.formData) : record.formData) : (record.form_data || {});
    
    const firstName = record.first_name || record.firstName || apiFormData.firstName || '';
    const lastName = record.last_name || record.lastName || apiFormData.lastName || '';
    const middleName = record.middle_name || record.middleName || apiFormData.middleName || '';
    const suffix = record.suffix || record.extension || apiFormData.suffix || '';
    const birthDateRaw = record.birthdate || record.birth_date || record.birthDate || apiFormData.birthDate || '';
    const birthDate = birthDateRaw.split(' ')[0]; 

    const fullName = record.fullname || record.name || `${firstName} ${lastName}`.trim();

    return {
      firstName,
      lastName,
      middleName,
      suffix,
      birthDate,
      fullName,
      pwdIdNumber: record.pwdIdNumber || (record.type === 'PWD' && record.id?.startsWith('GGG-') ? record.id : undefined),
      seniorIdNumber: record.seniorIdNumber || record.senior_id_number || record.senior_id || (record.type === 'PWD' ? (record.pwdIdNumber || 'GGG-13-7405-00-0000') : ''),
      formData: {
        ...apiFormData,
        firstName: apiFormData.firstName || firstName,
        lastName: apiFormData.lastName || lastName,
        middleName: apiFormData.middleName || middleName,
        suffix: apiFormData.suffix || suffix,
        birthDate: apiFormData.birthDate || birthDate,
        birthPlace: apiFormData.birthPlace || record.birthplace || record.birth_place || '',
        sex: apiFormData.sex || record.gender || record.sex || '',
        civilStatus: apiFormData.civilStatus || record.civil_status || '',
        citizenship: apiFormData.citizenship || record.citizenship || 'Filipino',
        address: apiFormData.address || record.address || '',
        houseNo: apiFormData.houseNo || record.house_no || '',
        street: apiFormData.street || record.street || '',
        barangay: apiFormData.barangay || record.barangay || '',
        district: apiFormData.district || record.district || '',
        city: apiFormData.city || record.city_municipality || '',
        province: apiFormData.province || record.province || '',
        contactNumber: apiFormData.contactNumber || record.contact_number || '',
        email: apiFormData.email || record.email || '',
        livingArrangement: apiFormData.livingArrangement || record.living_arrangement || '',
        isPensioner: apiFormData.isPensioner !== undefined ? apiFormData.isPensioner : (Number(record.is_pensioner) === 1),
        pensionSource: apiFormData.pensionSource || record.pension_source || '',
        pensionAmount: apiFormData.pensionAmount || record.pension_amount || '',
        hasIllness: apiFormData.hasIllness !== undefined ? apiFormData.hasIllness : (Number(record.has_illness) === 1),
        illnessDetails: apiFormData.illnessDetails || record.illness_details || ''
      }
    };
  };

  const mapApiMasterlistRecord = useCallback((item: any) => {
    const rawPersonal = item.personal_information || {};
    const rawApp = item.application_details || {};
    const rawAddress = item.address_and_contact || {};
    const rawEmergency = item.emergency_contact || {};
    const rawEducation = item.education_and_employment || {};
    const rawGov = item.government_ids || {};
    const rawFamily = item.family_background || {};
    const rawProcessing = item.processing_info || {};
    const rawDisability = item.congenital_outflow_defect || {};
    
    const firstName = rawPersonal.first_name || '';
    const lastName = rawPersonal.last_name || '';
    const middleName = rawPersonal.middle_name || '';
    const suffix = rawPersonal.suffix || '';
    
    const fullName = rawPersonal.full_name || `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
    const id = item.id ? String(item.id) : `api_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const pwdIdNumber = rawApp.control_number || rawGov.psn_no || id;
    
    let causeOfDisability = '';
    if (rawDisability.congenital) {
      causeOfDisability = `CONGENITAL (${rawDisability.congenital})`;
    } else if (rawDisability.acquired) {
      causeOfDisability = `ACQUIRED (${rawDisability.acquired})`;
    } else if (rawDisability.types) {
      causeOfDisability = rawDisability.types;
    }
    
    return {
      id: id,
      userId: id,
      pwdIdNumber: pwdIdNumber,
      fullName: fullName,
      name: fullName,
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      suffix: suffix,
      birthDate: rawPersonal.date_of_birth || '',
      gender: rawPersonal.gender || '',
      civilStatus: rawPersonal.civil_status || '',
      typeOfDisability: rawDisability.types || 'Not Specified',
      disabilityType: rawDisability.types || 'Not Specified',
      causeOfDisability: causeOfDisability,
      
      streetAddress: rawAddress.house_street || '',
      address: `${rawAddress.house_street || ''}, ${rawAddress.barangay || ''}, ${rawAddress.municipality || ''}, ${rawAddress.province || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'N/A',
      barangay: rawAddress.barangay || '',
      cityMunicipality: rawAddress.municipality || '',
      city: rawAddress.municipality || '',
      province: rawAddress.province || '',
      region: rawAddress.region || '',
      contactNumber: rawAddress.mobile_no || rawAddress.landline_no || '',
      phone: rawAddress.mobile_no || '',
      emailAddress: rawAddress.email_address || '',
      email: rawAddress.email_address || '',
      
      emergencyContactPerson: rawEmergency.name || '',
      emergencyContactRelationship: rawEmergency.relation || '',
      relationship: rawEmergency.relation || '',
      emergencyContactNumber: rawEmergency.number || '',
      
      highestEducation: rawEducation.educational_attainment || '',
      employmentStatus: rawEducation.employment_status || '',
      employmentType: rawEducation.employment_type || '',
      employmentCategory: rawEducation.employment_category || '',
      occupation: rawEducation.occupation || '',
      
      sssNumber: rawGov.sss_no || '',
      gsisNumber: rawGov.gsis_no || '',
      pagIbigNumber: rawGov.pagibig_no || '',
      psnNumber: rawGov.psn_no || '',
      philHealthNumber: rawGov.philhealth_no || '',
      
      fatherName: rawFamily.father || (rawFamily.details?.father_names ? `${rawFamily.details.father_names.first || ''} ${rawFamily.details.father_names.middle || ''} ${rawFamily.details.father_names.last || ''}`.trim().replace(/\s+/g, ' ') : ''),
      motherName: rawFamily.mother || (rawFamily.details?.mother_names ? `${rawFamily.details.mother_names.first || ''} ${rawFamily.details.mother_names.middle || ''} ${rawFamily.details.mother_names.last || ''}`.trim().replace(/\s+/g, ' ') : ''),
      guardianName: rawFamily.guardian || (rawFamily.details?.guardian_names ? `${rawFamily.details.guardian_names.first || ''} ${rawFamily.details.guardian_names.middle || ''} ${rawFamily.details.guardian_names.last || ''}`.trim().replace(/\s+/g, ' ') : ''),
      
      dateApplied: rawApp.date_applied || '',
      approvalDate: item.metadata?.created_at?.split(' ')[0] || rawApp.date_applied || '',
      dateApproved: item.metadata?.created_at?.split(' ')[0] || rawApp.date_applied || '',
      approvedBy: rawProcessing.approving_officer || 'Admin',
      
      status: rawApp.record_status || 'Active',
      isSenior: calculateAge(rawPersonal.date_of_birth) >= 60,
      _raw: item
    };
  }, []);

  const fetchMasterlist = useCallback(async () => {
    setSyncError(null);
    try {
      const token = localStorage.getItem('pdao_auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://api-dbpwd.drchiocms.com/api/masterlistv2', {
        method: 'GET',
        headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json && Array.isArray(json.data)) {
        const mapped = json.data.map((item: any) => mapApiMasterlistRecord(item));
        
        setMasterlistRecords(prev => {
          // Keep local created records that are not synced or do not match API ids
          const localOnly = prev.filter(p => !p.id.toString().includes('api_') && !mapped.some((m: any) => m.id.toString() === p.id.toString()));
          const combined = [...mapped, ...localOnly];
          localStorage.setItem('pdao_masterlist_records', JSON.stringify(combined));
          return combined;
        });
        
        setIsLiveMode(true);
      } else {
        throw new Error('API response does not contain data array');
      }
    } catch (error: any) {
      console.error('[MASTERLIST] Sync error:', error);
      setSyncError(`Failed to fetch live masterlist: ${error.message}`);
    }
  }, [mapApiMasterlistRecord]);

  const fetchExternalRegistry = useCallback(async (type: 'LCR' | 'PWD') => {
    setRegistryError(null);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const filteredDummy = MOCK_EXTERNAL_REGISTRY.filter(r => r.type === type);

      setRegistryRecords(prev => {
        const others = prev.filter(r => r.type !== type);
        return [...others, ...filteredDummy];
      });
      
      setRegistryError(null);
      console.log(`[EXTERNAL REGISTRY] Polled local dummy data for ${type}`);
    } catch (error: any) {
      console.error(`[EXTERNAL REGISTRY] Error simulating ${type}:`, error);
      setRegistryError(`Simulation Error: ${error.message}`);
    }
  }, []);

  const syncApplications = useCallback(async () => {
    // Dummy mode: no remote fetch
    console.log('[APPS] Dummy mode active');
  }, []);

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      // First try local check for merchant or offline user (matches registered merchants/citizens)
      const localUser = users.find(u => u.username?.toLowerCase() === username.toLowerCase() && u.password === password);
      if (localUser) {
        setCurrentUser(localUser);
        localStorage.setItem('pdao_current_user', JSON.stringify(localUser));
        return localUser;
      }

      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        // Fallback to local users list just in case
        const fallbackUser = users.find(u => u.username?.toLowerCase() === username.toLowerCase() && u.password === password);
        if (fallbackUser) {
          setCurrentUser(fallbackUser);
          localStorage.setItem('pdao_current_user', JSON.stringify(fallbackUser));
          return fallbackUser;
        }
        return null;
      }

      const data = await response.json();
      
      // "the key is user"
      const userData = data.user;

      if (!userData) {
        console.error('Login response missing user key');
        return null;
      }

      // role access: 1, 2, 3, 4 = admin portal; 5 = citizen portal
      const apiRole = Number(userData.role_id || userData.role || 5);
      let assignedRole: Role;

      switch (apiRole) {
        case 1: assignedRole = Role.SUPER_ADMIN; break;
        case 2: assignedRole = Role.ADMIN; break;
        case 3: assignedRole = Role.APPROVER; break;
        case 4: assignedRole = Role.ENCODER; break;
        case 5: assignedRole = Role.CITIZEN; break;
        default: assignedRole = Role.CITIZEN;
      }

      const user: User = {
        ...userData,
        id: userData.id?.toString() || `u_${Date.now()}`,
        name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'User',
        email: userData.email || '',
        role: assignedRole,
        username: userData.username,
        avatarUrl: userData.avatar_url || userData.avatar || (userData.gender === 'Female' ? FEMALE_AVATAR : undefined)
      };

      setCurrentUser(user);
      localStorage.setItem('pdao_current_user', JSON.stringify(user));
      if (data.token) {
        localStorage.setItem('pdao_auth_token', data.token);
      }
      
      return user;
    } catch (error) {
      console.error('Login API error fallback:', error);
      // Fallback to local users list on network failure
      const fallbackUser = users.find(u => u.username?.toLowerCase() === username.toLowerCase() && u.password === password);
      if (fallbackUser) {
        setCurrentUser(fallbackUser);
        localStorage.setItem('pdao_current_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pdao_current_user');
    localStorage.removeItem('pdao_auth_token');
  };

  const addApplication = async (app: Omit<Application, 'id' | 'status' | 'date'>): Promise<{ ok: boolean; error?: string }> => {
    const newApp: Application = {
      ...app,
      id: `app_${Date.now()}`,
      status: ApplicationStatus.PENDING,
      date: new Date().toISOString().split('T')[0],
      appointmentDate: (app as any).appointmentDate
    };
    setApplications(prev => [newApp, ...prev]);
    return { ok: true };
  };

  const updateApplicationData = async (id: string, updates: any): Promise<{ ok: boolean; error?: string }> => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, formData: { ...app.formData, ...updates } } : app
    ));
    return { ok: true };
  };

  const getNextPwdIdNumber = useCallback(() => {
    const prefix = "GGG-13-7405-00";
    // Combine all sources of ID numbers to find the highest sequence
    const userIds = users.map(u => u.pwdIdNumber).filter(Boolean);
    const masterlistIds = masterlistRecords.map(r => r.pwdIdNumber || r.id).filter(id => typeof id === 'string');
    
    const allIds = [...userIds, ...masterlistIds];
    
    const sequenceNumbers = allIds
      .filter(id => id && id.startsWith(prefix))
      .map(id => {
        const parts = id!.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart, 10);
      })
      .filter(num => !isNaN(num));
    
    const maxSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;
    const nextSequence = maxSequence + 1;
    
    return `${prefix}-${nextSequence.toString().padStart(3, '0')}`;
  }, [users, masterlistRecords]);

  const updateApplicationStatus = async (id: string, status: ApplicationStatus, reason?: string, appointmentDate?: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    // Update applications state
    setApplications(prev => prev.map(a => a.id === id ? { 
      ...a, 
      status, 
      rejectionReason: reason || '', 
      appointmentDate: appointmentDate || a.appointmentDate,
      reviewedDate: new Date().toLocaleDateString(),
      formData: (status === ApplicationStatus.APPROVED && currentUser && a.formData) ? {
        ...a.formData,
        approvingOfficer: currentUser.name
      } : a.formData
    } : a));

    // If approved and it's a registration or any ID application, move to masterlist
    if (status === ApplicationStatus.APPROVED && (
      app.type === ApplicationType.REGISTRATION || 
      app.type === ApplicationType.ID_NEW || 
      app.type === ApplicationType.ID_RENEWAL || 
      app.type === ApplicationType.ID_REPLACEMENT
    )) {
      const existingUser = users.find(u => u.id === app.userId);
      const existingMasterlist = masterlistRecords.find(m => m.id === app.userId || (m.name === app.userName && m.birthDate === app.formData?.birthDate));
      
      const isRegistration = app.type === ApplicationType.REGISTRATION;
      const nextPwdId = existingUser?.pwdIdNumber || existingMasterlist?.pwdIdNumber || getNextPwdIdNumber();
      
      // Define updates based on application data
      const updates: any = {
        role: Role.CITIZEN,
        registrationDate: new Date().toISOString().split('T')[0],
        isDeceased: false,
      };

      // Only assign ID number and dates if it's NOT a registration
      if (!isRegistration) {
        updates.pwdIdNumber = nextPwdId;
        updates.pwdIdIssueDate = new Date().toISOString().split('T')[0];
        updates.pwdIdExpiryDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (existingUser?.pwdIdNumber || existingMasterlist?.pwdIdNumber) {
        // Keep existing ID if they already have one (e.g. re-registration)
        updates.pwdIdNumber = existingUser?.pwdIdNumber || existingMasterlist?.pwdIdNumber;
      }

      // Map formData to updates, only if they exist and are not empty
      const fieldMap: Record<string, string> = {
        firstName: 'firstName',
        lastName: 'lastName',
        middleName: 'middleName',
        suffix: 'suffix',
        email: 'email',
        emailAddress: 'email',
        birthDate: 'birthDate',
        address: 'address',
        contactNumber: 'contactNumber',
        mobileNumber: 'contactNumber',
        disabilityType: 'disabilityType',
        typeOfDisability: 'disabilityType',
        capturedImage: 'avatarUrl',
      };

      Object.entries(fieldMap).forEach(([formKey, userKey]) => {
        if ((app.formData as any)?.[formKey]) {
          updates[userKey] = (app.formData as any)[formKey];
        }
      });
      
      // Add the rest of the PWD fields
      const pwdFields = [
        'dateApplied', 'causeOfDisability', 
        'streetAddress', 'barangay', 'cityMunicipality', 'province', 
        'region', 'landline', 'mobileNumber', 'emailAddress',
        'emergencyContactPerson', 'emergencyContactNumber', 'highestEducation',
        'employmentStatus', 'employmentType', 'employmentCategory', 'occupation',
        'orgName', 'orgContactPerson', 'orgAddress', 'orgContactNo',
        'sssNumber', 'gsisNumber', 'pagIbigNumber', 'psnNumber', 'philHealthNumber',
        'fatherName', 'motherName', 'guardianName'
      ];
      
      pwdFields.forEach(field => {
        if ((app.formData as any)?.[field]) {
          updates[field] = (app.formData as any)[field];
        }
      });
      
      if (app.formData?.relationship) updates.emergencyContactRelationship = app.formData.relationship;

      setUsers(uPrev => {
        const exists = uPrev.some(u => u.id === app.userId);
        if (exists) {
          return uPrev.map(u => u.id === app.userId ? { ...u, ...updates } : u);
        }
        
        // For new users, ensure required fields are present
        const newUser: User = {
          id: app.userId,
          name: app.userName,
          email: updates.email || '',
          role: Role.CITIZEN,
          ...updates
        };
        return [...uPrev, newUser];
      });

      // Add to masterlist as "Active"
      setMasterlistRecords(mPrev => {
        const existing = mPrev.find(m => m.name === app.userName && m.birthDate === app.formData?.birthDate);
        if (existing) return mPrev;
        
        return [{
          id: app.userId,
          pwdIdNumber: nextPwdId,
          type: 'PWD',
          name: app.userName,
          firstName: app.formData?.firstName,
          lastName: app.formData?.lastName,
          middleName: app.formData?.middleName,
          birthDate: app.formData?.birthDate,
          address: app.formData?.address,
          disabilityType: app.formData?.disabilityType,
          registrationDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          avatarUrl: app.formData?.capturedImage,
          contactNumber: app.formData?.contactNumber,
          barangay: app.formData?.barangay || 'Unknown',
          
          // Include all new fields for masterlist details
          ...app.formData
        }, ...mPrev];
      });
    }
  };

  const addComplaint = (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => {
    const newComplaint: Complaint = {
      ...complaint,
      id: `comp_${Date.now()}`,
      status: 'Open',
      date: new Date().toISOString().split('T')[0]
    };
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const updateComplaintStatus = (id: string, status: 'Open' | 'Resolved', response?: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, adminResponse: response || c.adminResponse } : c));
  };

  const verifyIdentity = (id: string) => {
    return registryRecords.find(r => r.id === id);
  };

  const issueIdCard = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const user = users.find(u => u.id === app.userId);
    if (!user) return;

    const existingMasterlist = masterlistRecords.find(m => m.id === app.userId);
    const pwdId = user.pwdIdNumber || existingMasterlist?.pwdIdNumber;

    if (!pwdId) {
      console.error("Cannot issue ID: PWD ID Number has not been processed by the client yet.");
      return;
    }

    // Update user
    const updatedUser: User = {
      ...user,
      pwdIdNumber: pwdId,
      pwdIdIssueDate: new Date().toISOString().split('T')[0],
      pwdIdExpiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      avatarUrl: app.formData?.capturedImage || user.avatarUrl,
      emergencyContactPerson: app.formData?.emergencyContactPerson || user.emergencyContactPerson,
      emergencyContactNumber: app.formData?.emergencyContactNumber || user.emergencyContactNumber
    };
    setUsers(uPrev => uPrev.map(u => u.id === user.id ? updatedUser : u));
    if (currentUser?.id === user.id) setCurrentUser(updatedUser);

    // Update masterlist
    setMasterlistRecords(mPrev => {
      const existingIndex = mPrev.findIndex(m => 
        (m.pwdIdNumber && m.pwdIdNumber === pwdId) || 
        (m.name === user.name && m.birthDate === user.birthDate) ||
        (m.id === user.id)
      );
      
      if (existingIndex >= 0) {
        const updatedMaster = [...mPrev];
        updatedMaster[existingIndex] = {
          ...updatedMaster[existingIndex],
          pwdIdNumber: pwdId,
          seniorIdNumber: pwdId,
          status: 'Active',
          avatarUrl: app.formData?.capturedImage || user.avatarUrl || updatedMaster[existingIndex].avatarUrl
        };
        return updatedMaster;
      } else {
        return [{
          id: user.id || `REG-${Date.now()}`,
          pwdIdNumber: pwdId,
          seniorIdNumber: pwdId,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          barangay: user.address?.split(',')[1]?.trim() || 'Unknown',
          disabilityType: user.disabilityType || 'Not Specified',
          status: 'Active',
          dateRegistered: new Date().toISOString().split('T')[0],
          registrationDate: new Date().toISOString().split('T')[0],
          contactNumber: user.contactNumber || 'N/A',
          address: user.address || 'N/A',
          birthDate: user.birthDate,
          isWalkIn: app.formData?.isWalkIn || false,
          avatarUrl: app.formData?.capturedImage || user.avatarUrl
        }, ...mPrev];
      }
    });

    // Update application status
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: ApplicationStatus.ISSUED } : a));
  };

  const deleteApplication = async (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const deleteMasterlistRecord = async (id: string) => {
    const record = masterlistRecords.find(r => r.id === id || r.pwdIdNumber === id);
    if (record) {
      const userId = record.userId || record.id;
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
    setMasterlistRecords(prev => prev.filter(r => r.id !== id && r.pwdIdNumber !== id));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const generateCashGrantList = (year: number) => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const eligibleUsers = users.filter(user => {
      if (user.role !== Role.CITIZEN) return false;
      if (user.isDeceased) return false;
      
      // Filter: Registered for 6 months or more
      const regDate = user.registrationDate ? new Date(user.registrationDate) : new Date();
      if (regDate > sixMonthsAgo) return false;

      // Filter: Born 1962 and below
      if (!user.birthDate) return false;
      const birthYear = new Date(user.birthDate).getFullYear();
      if (birthYear > 1962) return false;

      // Filter: Not Senior Citizen (This is the tricky one, maybe it means not already receiving senior benefits)
      // For now, we assume it's a separate check. 
      // If we use the age check, 1962 means they are 64, so they ARE seniors.
      // Maybe the filter means "Is PWD but not yet registered as Senior"?
      // Let's just follow the "Born 1962 and below" rule as the primary age filter.
      
      // Check if already in the list for this year
      const alreadyExists = cashGrants.some(cg => cg.userId === user.id && cg.year === year);
      if (alreadyExists) return false;

      return true;
    });

    const newGrants: CashGrant[] = eligibleUsers.map(user => {
      const regApp = applications.find(a => a.userId === user.id && a.type === ApplicationType.REGISTRATION);
      return {
        id: `cg_${year}_${user.id}`,
        userId: user.id,
        userName: user.name,
        amount: 3000,
        year: year,
        status: CashGrantStatus.ELIGIBLE,
        dateGenerated: today.toISOString(),
        dateUpdated: today.toISOString(),
        isWalkIn: regApp?.formData?.isWalkIn || false
      };
    });

    setCashGrants(prev => [...newGrants, ...prev]);
  };

  const updateCashGrantStatus = (id: string, status: CashGrantStatus, remarks?: string) => {
    setCashGrants(prev => prev.map(cg => 
      cg.id === id ? { ...cg, status, remarks: remarks || cg.remarks, dateUpdated: new Date().toISOString() } : cg
    ));
  };

  const addEvent = async (event: Omit<EventItem, 'id' | 'createdAt'>) => {
    const newEvent: EventItem = {
      ...event,
      id: `e_${Date.now()}`,
      createdAt: { seconds: Date.now() / 1000 }
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const addPoster = async (poster: Omit<PosterItem, 'id' | 'createdAt'>) => {
    const newPoster: PosterItem = {
      ...poster,
      id: `p_${Date.now()}`,
      createdAt: { seconds: Date.now() / 1000 }
    };
    setPosters(prev => [newPoster, ...prev]);
  };

  const updatePoster = async (id: string, updates: Partial<PosterItem>) => {
    setPosters(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePoster = async (id: string) => {
    setPosters(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== Role.CITIZEN) {
      syncApplications();
      fetchMasterlist();
    }
  }, [currentUser, syncApplications, fetchMasterlist]);

  const moveRecordToPending = async (recordId: string) => {
    const record = masterlistRecords.find(r => r.id === recordId || r.pwdIdNumber === recordId);
    if (!record) return;

    // Remove from masterlist records
    setMasterlistRecords(prev => prev.filter(r => r.id !== recordId && r.pwdIdNumber !== recordId));

    // Update associated user if any
    const userId = record.userId || record.id;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pwdIdNumber: undefined } : u));

    // Check if there's an existing registration application
    const existingApp = applications.find(a => 
      (a.userId === userId || a.id === userId) && 
      (a.type === ApplicationType.REGISTRATION || a.type === ApplicationType.ID_NEW)
    );

    if (existingApp) {
      // Move existing application back to pending and ensure it is a REGISTRATION type
      // so it appears in PWD Registration Management
      setApplications(prev => prev.map(a => 
        a.id === existingApp.id ? { ...a, type: ApplicationType.REGISTRATION, status: ApplicationStatus.PENDING, updatedAt: new Date().toISOString() } : a
      ));
    } else {
      // Create a new pending application if none exists
      const newApp: Application = {
        id: `app_rv_${Date.now()}`,
        userId: userId,
        userName: record.name || `${record.firstName} ${record.lastName}`,
        type: ApplicationType.REGISTRATION,
        status: ApplicationStatus.PENDING,
        date: new Date().toISOString().split('T')[0],
        description: 'Transferred from Masterlist for re-evaluation',
        formData: {
          ...record,
          firstName: record.firstName,
          lastName: record.lastName,
          middleName: record.middleName,
          birthDate: record.birthDate,
          barangay: record.barangay,
          isWalkIn: record.isWalkIn || false
        }
      };
      setApplications(prev => [newApp, ...prev]);
    }
  };
  
  const reflectToSenior = async (recordId: string) => {
    const record = masterlistRecords.find(r => r.id === recordId || r.pwdIdNumber === recordId);
    if (!record) return;

    // Update masterlist records
    setMasterlistRecords(prev => prev.map(r => 
      (r.id === recordId || r.pwdIdNumber === recordId) ? { ...r, isSenior: true, updatedAt: new Date().toISOString() } : r
    ));

    // Update associated user if any
    const userId = record.userId || record.id;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSenior: true } : u));
    
    // In a real app, this might involve calling an OSCA/Senior Registry API
    console.log(`[SENIOR] Record ${recordId} reflected in senior registry`);
  };

  const registerMerchant = async (merchant: any): Promise<{ ok: boolean; error?: string }> => {
    const exists = users.some(u => u.username?.toLowerCase() === merchant.username.toLowerCase());
    if (exists) {
      return { ok: false, error: 'Username is already taken by another establishment.' };
    }
    const newUser: User = {
      id: `merchant_${Date.now()}`,
      name: merchant.name,
      role: Role.MERCHANT,
      email: merchant.email,
      contactNumber: merchant.contactNumber,
      address: merchant.address,
      username: merchant.username,
      password: merchant.password,
      disabilityType: merchant.businessCategory, // Use to store establishment category
      controlNo: merchant.permitNumber, // Use to store business permit number
    };
    setUsers(prev => [...prev, newUser]);
    return { ok: true };
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, users, applications, complaints,
      registryRecords, masterlistRecords, cashGrants, addApplication, updateApplicationStatus,
      updateApplicationData,
      addComplaint, updateComplaintStatus, verifyIdentity, issueIdCard, 
      deleteApplication, deleteMasterlistRecord, updateUser, deleteUser,
      syncApplications, fetchMasterlist, fetchExternalRegistry, generateCashGrantList, updateCashGrantStatus, getNextPwdIdNumber, 
      addEvent, updateEvent, deleteEvent, addPoster, updatePoster, deletePoster,
      moveRecordToPending, reflectToSenior, registerMerchant,
      events, posters,
      syncError, 
      actionError, setActionError, registryError, isLiveMode
    }}>
      {children}
    </AppContext.Provider>
  );
};
