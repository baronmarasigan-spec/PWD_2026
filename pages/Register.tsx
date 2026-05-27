
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, 
  ArrowRight, Upload, FileCheck, X, User as UserIcon, 
  MapPin, Phone, Calendar, Heart, Banknote, ShieldAlert,
  FileText, RefreshCw, AlertCircle, Info
} from 'lucide-react';
import { ApplicationType } from '../types';
import { notifyRegistrationSuccess } from '../services/notification';
import { submitApplication } from '../services/applicationService';

const SLIDES = [
  "https://picsum.photos/seed/pwd_ph1/800/600",
  "https://picsum.photos/seed/pwd_ph2/800/600",
  "https://picsum.photos/seed/pwd_ph3/800/600"
];

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

const DISABILITY_TYPES = [
  "Deaf or Hard of Hearing",
  "Intellectual Disability",
  "Learning Disability",
  "Mental Disability",
  "Physical Disability (Orthopedic)",
  "Psychosocial Disability",
  "Speech and Language Impairment",
  "Visual Disability",
  "Cancer (RA11215)",
  "Rare Disease (RA10747)"
];

const DISABILITY_CAUSES = [
  {
    label: "Congenital / Inborn",
    subOptions: ["Autism", "ADHD", "Cerebral Palsy", "Down Syndrome"]
  },
  {
    label: "Acquired",
    subOptions: ["Chronic Illness", "Cerebral Palsy", "Injury"]
  }
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addApplication, getNextPwdIdNumber } = useApp();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGovIdTypes, setSelectedGovIdTypes] = useState<string[]>([]);

  const queryParams = new URLSearchParams(location.search);
  const isWalkIn = queryParams.get('isWalkIn') === 'true';

  const [formData, setFormData] = useState({
    // Personal Information
    dateApplied: new Date().toISOString().split('T')[0],
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    birthDate: '',
    gender: '',
    civilStatus: '',
    
    // Disability Information
    typeOfDisability: '',
    causeOfDisability: '',
    
    // Address Information
    streetAddress: '',
    barangay: '',
    cityMunicipality: 'San Juan City',
    province: 'Metro Manila',
    region: 'NCR',
    
    // Contact Information
    landline: '',
    mobileNumber: '',
    emailAddress: '',
    
    // Emergency Contact
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    relationship: '',
    
    // Education and Employment
    highestEducation: '',
    employmentStatus: '',
    employmentType: '',
    employmentCategory: '',
    occupation: '',
    
    // Organization Information
    orgName: '',
    orgContactPerson: '',
    orgAddress: '',
    orgContactNo: '',
    
    // Government IDs
    sssNumber: '',
    gsisNumber: '',
    pagIbigNumber: '',
    psnNumber: '',
    philHealthNumber: '',
    
    // Family Information
    fatherName: '',
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    motherName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherLastName: '',
    guardianName: '',
    guardianFirstName: '',
    guardianMiddleName: '',
    guardianLastName: '',

    // Certifying Physician
    physicianName: '',
    physicianLicense: '',
    
    // Accomplished By
    accomplishedBy: 'APPLICANT',
    accomplishedByLastName: '',
    accomplishedByFirstName: '',
    accomplishedByMiddleName: '',
    
    // Legacy/Internal compatibility
    appointmentDate: '',
    disabilityType: '', // Will sync with typeOfDisability
    contactNumber: '', // Will sync with mobileNumber
    email: '', // Will sync with emailAddress
  });

  const [disabilityCert, setDisabilityCert] = useState<File | null>(null);
  const [residencyCert, setResidencyCert] = useState<File | null>(null);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiValidationErrors, setApiValidationErrors] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const renderInlineError = (apiFieldName: string) => {
    const errMessages = apiValidationErrors[apiFieldName];
    if (errMessages && errMessages.length > 0) {
      return (
        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
          <AlertCircle size={10} className="shrink-0" />
          {errMessages.join(", ")}
        </p>
      );
    }
    return null;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? target.checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      
      // Sync legacy fields
      if (name === 'typeOfDisability') next.disabilityType = value;
      if (name === 'mobileNumber') next.contactNumber = value;
      if (name === 'emailAddress') next.email = value;
      
      return next;
    });

    if (errors.includes(name)) {
      setErrors(prev => prev.filter(err => err !== name));
    }
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = (prev[name as keyof typeof prev] as string).split(', ').filter(v => v !== '');
      let nextValues;
      if (checked) {
        nextValues = [...currentValues, value];
      } else {
        nextValues = currentValues.filter(v => v !== value);
      }
      const nextString = nextValues.join(', ');
      const next = { ...prev, [name]: nextString };
      
      // Sync legacy fields
      if (name === 'typeOfDisability') next.disabilityType = nextString;
      
      return next;
    });

    if (errors.includes(name)) {
      setErrors(prev => prev.filter(err => err !== name));
    }
  };

  const getFieldClass = (name: string, isRequired: boolean) => {
    const base = "w-full bg-white border rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none transition-all";
    if (errors.includes(name)) {
      return `${base} border-red-500 ring-1 ring-red-100 bg-red-50/10`;
    }
    return `${base} border-slate-200`;
  };

  const nextStep = () => {
    const newErrors: string[] = [];
    if (step === 1) {
        if (!formData.firstName) newErrors.push('firstName');
        if (!formData.lastName) newErrors.push('lastName');
        if (!formData.birthDate) newErrors.push('birthDate');
        if (!formData.gender) newErrors.push('gender');
        if (!formData.typeOfDisability) newErrors.push('typeOfDisability');
        if (!formData.causeOfDisability) newErrors.push('causeOfDisability');
        
        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Please fill out all mandatory fields (*)');
            return;
        }
    }
    if (step === 2) {
        if (!formData.barangay) newErrors.push('barangay');
        if (!formData.mobileNumber) newErrors.push('mobileNumber');
        if (!formData.emailAddress) newErrors.push('emailAddress');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Please fill out all mandatory fields (*)');
            return;
        }
    }
    if (step === 3) {
        if (!formData.emergencyContactPerson) newErrors.push('emergencyContactPerson');
        if (!formData.emergencyContactNumber) newErrors.push('emergencyContactNumber');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Please fill out all mandatory fields (*)');
            return;
        }
    }
    if (step === 5) {
        if (!disabilityCert) newErrors.push('disabilityCert');
        if (!residencyCert) newErrors.push('residencyCert');
        if (!govIdFile) newErrors.push('govIdFile');
        if (selectedGovIdTypes.length === 0) newErrors.push('selectedGovIdTypes');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Please upload all required documents');
            return;
        }
    }
    setError('');
    setErrors([]);
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApiValidationErrors({});

    try {
      const apiResult = await submitApplication(formData, {
        certificateOfDisability: disabilityCert,
        certificateOfResidency: residencyCert,
        scannedGovernmentId: govIdFile
      });

      if (apiResult.success) {
        // Log API success response
        console.log("API response", apiResult.data);

        // Show toast
        showToastMsg(apiResult.message || "Submitted successfully!", "success");

        // Store full API response in localStorage/sessionStorage
        localStorage.setItem("last_api_response", JSON.stringify(apiResult));
        sessionStorage.setItem("last_api_response", JSON.stringify(apiResult));

        // Store application ID
        if (apiResult.data?.id) {
          localStorage.setItem("last_application_id", apiResult.data.id.toString());
          sessionStorage.setItem("last_application_id", apiResult.data.id.toString());
        }

        // Set state for visual presentation in Step 6
        setApiResponse(apiResult);

        // Keep local memory-context synced with the submission (for administrative management portal integration)
        const allFiles = [disabilityCert?.name, residencyCert?.name, govIdFile?.name].filter(Boolean) as string[];
        await addApplication({
          userId: `new_${Date.now()}`,
          userName: `${formData.firstName} ${formData.lastName}`,
          type: ApplicationType.REGISTRATION,
          description: `New PWD Online Registration. Category: ${formData.disabilityType}`,
          formData: {
            ...formData,
            controlNo: apiResult.data?.application_details?.control_number || "",
            dateApplied: apiResult.data?.application_details?.date_applied || formData.dateApplied,
            address: `${formData.streetAddress}, ${formData.barangay}, ${formData.cityMunicipality}`,
            isWalkIn: isWalkIn
          },
          appointmentDate: apiResult.data?.processing_info?.appointment_date || formData.appointmentDate,
          documents: allFiles
        });

        // Fire simulated registration notification
        try {
          await notifyRegistrationSuccess(formData.firstName, formData.contactNumber, formData.email);
        } catch (notifErr) {
          console.warn("SMS/Email simulation warning:", notifErr);
        }

        // Reset Form
        setFormData({
          dateApplied: new Date().toISOString().split('T')[0],
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          birthDate: '',
          gender: '',
          civilStatus: '',
          typeOfDisability: '',
          causeOfDisability: '',
          streetAddress: '',
          barangay: '',
          cityMunicipality: 'San Juan City',
          province: 'Metro Manila',
          region: 'NCR',
          landline: '',
          mobileNumber: '',
          emailAddress: '',
          emergencyContactPerson: '',
          emergencyContactNumber: '',
          relationship: '',
          highestEducation: '',
          employmentStatus: '',
          employmentType: '',
          employmentCategory: '',
          occupation: '',
          orgName: '',
          orgContactPerson: '',
          orgAddress: '',
          orgContactNo: '',
          sssNumber: '',
          gsisNumber: '',
          pagIbigNumber: '',
          psnNumber: '',
          philHealthNumber: '',
          fatherName: '',
          fatherFirstName: '',
          fatherMiddleName: '',
          fatherLastName: '',
          motherName: '',
          motherFirstName: '',
          motherMiddleName: '',
          motherLastName: '',
          guardianName: '',
          guardianFirstName: '',
          guardianMiddleName: '',
          guardianLastName: '',
          physicianName: '',
          physicianLicense: '',
          accomplishedBy: 'APPLICANT',
          accomplishedByLastName: '',
          accomplishedByFirstName: '',
          accomplishedByMiddleName: '',
          appointmentDate: '',
          disabilityType: '',
          contactNumber: '',
          email: '',
        });
        setDisabilityCert(null);
        setResidencyCert(null);
        setGovIdFile(null);
        setSelectedGovIdTypes([]);

        // Progress to Confirmation page
        setStep(6);
      } else {
        // Handle validation errors or network errors
        if (apiResult.errors) {
          setApiValidationErrors(apiResult.errors);
        }
        const errMsg = apiResult.message || "Unable to submit registration. Please try again.";
        setError(errMsg);
        showToastMsg(errMsg, "error");
      }
    } catch (err: any) {
      console.error("API error", err);
      const errMsg = "Unable to submit registration. Please try again.";
      setError(errMsg);
      showToastMsg(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (step === 6) {
    const appData = apiResponse?.data;
    const successMsg = apiResponse?.message || "Thank you for Registering!";

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-xl shadow-2xl p-12 max-w-2xl w-full text-center space-y-8 animate-scale-up border border-slate-100">
           <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-lg">
             <CheckCircle2 size={48} />
           </div>
           
           <div className="space-y-4">
             <h2 className="text-[32px] font-normal text-slate-900 tracking-tight uppercase leading-tight">{successMsg}</h2>
             <p className="text-slate-600 text-lg leading-relaxed font-normal">
               We have received your application exactly based on the current form fields, and mapped the payload successfully.
             </p>

             {appData && (
               <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-left space-y-4 shadow-sm animate-fade-in font-normal">
                 <h3 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-wider border-b border-slate-200 pb-2">
                   Submission Summary (API Response)
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                   <div>
                     <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Control Number</p>
                     <p className="text-sm font-mono text-[#1e419c] font-bold">{appData.application_details?.control_number || "N/A"}</p>
                   </div>
                   <div>
                     <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Application ID</p>
                     <p className="text-sm font-mono text-slate-800">{appData.id || "N/A"}</p>
                   </div>
                   <div>
                     <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Applicant Name</p>
                     <p className="text-sm text-slate-800">{appData.personal_information?.full_name || "N/A"}</p>
                   </div>
                   <div>
                     <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Date Applied</p>
                     <p className="text-sm text-slate-800">{appData.application_details?.date_applied || "N/A"}</p>
                   </div>
                   <div className="sm:col-span-2 bg-[#1e419c]/5 p-4 rounded-lg border border-blue-50">
                     <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Appointment Date</p>
                     <p className="text-sm text-[#1e419c] font-black font-mono">{appData.processing_info?.appointment_date || "To Be Scheduled"}</p>
                   </div>
                 </div>
               </div>
             )}

             <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex items-start gap-4 text-left font-normal">
                <Info size={24} className="text-[#1e419c] shrink-0" />
                <p className="text-sm text-slate-600 font-normal">
                   You will receive an SMS or Email notification once your application is reviewed and approved by our PDAO team.
                </p>
             </div>
           </div>

           <button 
             onClick={() => navigate(isWalkIn ? '/admin/registered/all' : '/')}
             className="w-full bg-[#1e419c] text-white py-5 rounded-lg font-semibold text-lg uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95"
           >
             {isWalkIn ? 'Back to Admin Management' : 'Back to Login'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col lg:flex-row overflow-hidden relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in font-bold text-sm ${toast.type === "success" ? "bg-emerald-600 border border-emerald-500 shadow-xl" : "bg-red-600 border border-red-500 shadow-xl"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
      <div className="hidden lg:flex lg:w-2/5 bg-[#1e419c] relative flex-col justify-between p-16 text-white">
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          {SLIDES.map((slide, i) => (
            <img 
              key={i} 
              src={slide} 
              alt="Slide" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e419c]/80 to-[#1e419c]"></div>
        </div>

        <div className="relative z-10 space-y-8">
           <div className="flex items-center gap-4">
              <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="h-16 w-auto" alt="Seal" />
              <h1 className="text-2xl font-black uppercase tracking-widest leading-none">San Juan City <br/><span className="text-primary-300 font-normal">PWD Connect</span></h1>
           </div>
           <div className="space-y-4">
              <h2 className="text-5xl font-light leading-tight tracking-tight">We are with you in <br/><span className="font-normal text-white">progress.</span></h2>
              <p className="text-white/70 text-lg font-light leading-relaxed max-w-md">
                This program aims to provide faster service and support for our Persons with Disabilities in San Juan.
              </p>
           </div>
        </div>

        <div className="relative z-10">
           <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 font-normal">
              <ShieldCheck size={32} className="text-primary-300" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Data Privacy Guaranteed</p>
                <p className="text-sm">Your information is safe under the Data Privacy Act of 2012.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 xl:p-20">
        <div className="max-w-3xl mx-auto space-y-10">
          <button 
            onClick={() => navigate(isWalkIn ? '/admin/registered/all' : '/')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#1e419c] transition-colors font-semibold uppercase text-xs tracking-widest"
          >
            <ArrowLeft size={16} /> {isWalkIn ? 'Back to Admin' : 'Back to Home'}
          </button>

          <header className="space-y-2">
            <h2 className="text-[32px] font-normal text-slate-900 tracking-tight">Registration</h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`h-1.5 w-8 rounded-full ${step >= s ? 'bg-[#1e419c]' : 'bg-slate-200'} transition-all duration-500`}></div>
                ))}
              </div>
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Step {step} of 5</span>
            </div>
          </header>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3 text-xs font-semibold border border-red-100 animate-shake">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12 font-normal">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isWalkIn && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Date Applied</label>
                      <input type="date" name="dateApplied" value={formData.dateApplied} onChange={handleInputChange} className={getFieldClass('dateApplied', false)} />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">First Name <span className="text-red-500">*</span></label>
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={getFieldClass('firstName', true)} required />
                    {renderInlineError("first_name")}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Last Name <span className="text-red-500">*</span></label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className={getFieldClass('lastName', true)} required />
                    {renderInlineError("last_name")}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                    <input name="middleName" value={formData.middleName} onChange={handleInputChange} className={getFieldClass('middleName', false)} />
                    {renderInlineError("middle_name")}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Suffix</label>
                    <input name="suffix" value={formData.suffix} onChange={handleInputChange} className={getFieldClass('suffix', false)} />
                    {renderInlineError("suffix")}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Birthdate <span className="text-red-500">*</span></label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={getFieldClass('birthDate', true)} required />
                    {renderInlineError("date_of_birth")}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className={getFieldClass('gender', true)} required>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {renderInlineError("gender")}
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Civil Status</label>
                    <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className={getFieldClass('civilStatus', false)}>
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                    {renderInlineError("civil_status")}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Disability Information</h3>
                </div>
                <div className="space-y-6">
                  <div className={`space-y-3 p-4 rounded-xl transition-all ${errors.includes('typeOfDisability') ? 'bg-red-50 ring-1 ring-red-200' : ''}`}>
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1 block">Type of Disability <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISABILITY_TYPES.map(type => (
                        <label key={type} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.typeOfDisability.includes(type) ? 'bg-blue-50 border-[#1e419c]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-[#1e419c] focus:ring-[#1e419c]"
                            checked={formData.typeOfDisability.includes(type)}
                            onChange={(e) => handleCheckboxChange('typeOfDisability', type, e.target.checked)}
                          />
                          <span className="text-xs text-slate-700 font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`space-y-3 p-4 rounded-xl transition-all ${errors.includes('causeOfDisability') ? 'bg-red-50 ring-1 ring-red-200' : ''}`}>
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1 block">9. Cause of Disability <span className="text-red-500">*</span></label>
                    <div className="space-y-4">
                      {DISABILITY_CAUSES.map(cause => (
                        <div key={cause.label} className="space-y-2">
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.causeOfDisability.includes(cause.label) ? 'bg-blue-50 border-[#1e419c]' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-[#1e419c] focus:ring-[#1e419c]"
                              checked={formData.causeOfDisability.includes(cause.label)}
                              onChange={(e) => handleCheckboxChange('causeOfDisability', cause.label, e.target.checked)}
                            />
                            <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">{cause.label}</span>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                            {cause.subOptions.map(sub => (
                              <label key={sub} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.causeOfDisability.includes(sub) ? 'bg-blue-50 border-[#1e419c]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-slate-300 text-[#1e419c] focus:ring-[#1e419c]"
                                  checked={formData.causeOfDisability.includes(sub)}
                                  onChange={(e) => handleCheckboxChange('causeOfDisability', sub, e.target.checked)}
                                />
                                <span className="text-xs text-slate-700 font-medium">{sub}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c] mt-8">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Certifying Physician</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Name of Certifying Physician</label>
                    <input name="physicianName" value={formData.physicianName} onChange={handleInputChange} className={getFieldClass('physicianName', false)} placeholder="DR. JUAN DELA CRUZ" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">License No.</label>
                    <input name="physicianLicense" value={formData.physicianLicense} onChange={handleInputChange} className={getFieldClass('physicianLicense', false)} placeholder="1234567" />
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all">
                    Next: Address & Contact <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Address Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                    <input name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} className={getFieldClass('streetAddress', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Barangay (San Juan) <span className="text-red-500">*</span></label>
                    <select name="barangay" value={formData.barangay} onChange={handleInputChange} className={getFieldClass('barangay', true)} required>
                      <option value="">Select Barangay</option>
                      {METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 1"].map(b => <option key={b} value={b}>{b}</option>)}
                      {METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 2"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">City / Municipality</label>
                    <input name="cityMunicipality" value={formData.cityMunicipality} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-400 font-medium uppercase outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Province</label>
                    <input name="province" value={formData.province} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-400 font-medium uppercase outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Region</label>
                    <input name="region" value={formData.region} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-400 font-medium uppercase outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Landline</label>
                    <input name="landline" value={formData.landline} onChange={handleInputChange} className={getFieldClass('landline', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Mobile Number <span className="text-red-500">*</span></label>
                    <input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={getFieldClass('mobileNumber', true)} placeholder="09XXXXXXXXX" required />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label>
                    <input name="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} className={getFieldClass('emailAddress', true)} required />
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
                    Next: Emergency & Family <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Emergency Contact Person <span className="text-red-500">*</span></label>
                    <input name="emergencyContactPerson" value={formData.emergencyContactPerson} onChange={handleInputChange} className={getFieldClass('emergencyContactPerson', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Contact Number <span className="text-red-500">*</span></label>
                    <input name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} className={getFieldClass('emergencyContactNumber', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Relationship</label>
                    <input name="relationship" value={formData.relationship} onChange={handleInputChange} className={getFieldClass('relationship', false)} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Family Information</h3>
                </div>
                <div className="space-y-8">
                  {/* Father's Name */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Father's Name</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                        <input name="fatherFirstName" value={formData.fatherFirstName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                        <input name="fatherMiddleName" value={formData.fatherMiddleName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                        <input name="fatherLastName" value={formData.fatherLastName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Mother's Name */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Mother's Name</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                        <input name="motherFirstName" value={formData.motherFirstName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                        <input name="motherMiddleName" value={formData.motherMiddleName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                        <input name="motherLastName" value={formData.motherLastName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Guardian's Name */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Guardian's Name</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                        <input name="guardianFirstName" value={formData.guardianFirstName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                        <input name="guardianMiddleName" value={formData.guardianMiddleName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                        <input name="guardianLastName" value={formData.guardianLastName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
                    Next: Education & Employment <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Education and Employment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Educational Attainment</label>
                    <select name="highestEducation" value={formData.highestEducation} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none">
                      <option value="">Select</option>
                      <option value="None">None</option>
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="Elementary">Elementary</option>
                      <option value="High School">High School</option>
                      <option value="Vocational">Vocational</option>
                      <option value="College">College</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Employment Status</label>
                    <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none">
                      <option value="">Select</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-Employed">Self-Employed</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Types of Employment</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {['Permanent / Regular', 'Seasonal', 'Casual', 'Emergency'].map(type => (
                        <label key={type} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.employmentType === type ? 'bg-blue-50 border-[#1e419c]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="radio" 
                            name="employmentType"
                            value={type}
                            className="w-4 h-4 text-[#1e419c] focus:ring-[#1e419c]"
                            checked={formData.employmentType === type}
                            onChange={handleInputChange}
                          />
                          <span className="text-xs text-slate-700 font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Category of Employment</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {['Government', 'Private'].map(cat => (
                        <label key={cat} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.employmentCategory === cat ? 'bg-blue-50 border-[#1e419c]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="radio" 
                            name="employmentCategory"
                            value={cat}
                            className="w-4 h-4 text-[#1e419c] focus:ring-[#1e419c]"
                            checked={formData.employmentCategory === cat}
                            onChange={handleInputChange}
                          />
                          <span className="text-xs text-slate-700 font-medium">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Occupation</label>
                    <input name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Organization Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Organization affiliated</label>
                    <input name="orgName" value={formData.orgName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Contact Person</label>
                    <input name="orgContactPerson" value={formData.orgContactPerson} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Office Address</label>
                    <input name="orgAddress" value={formData.orgAddress} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Tel. Nos.</label>
                    <input name="orgContactNo" value={formData.orgContactNo} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
                    Next: IDs & Requirements <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 space-y-3">
                    <h3 className="text-sm font-bold text-[#1e419c] uppercase tracking-wider">Required Documents for PWD ID:</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-xs text-slate-600">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span><strong>Certificate of Disability</strong> (from San Juan Medical Center)</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-slate-600">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span><strong>Certificate of Residency</strong> (from your Barangay - Purpose: For PWD ID Requirement)</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-slate-600">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span><strong>Government-Issued ID</strong> (Please select and provide numbers below)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Government IDs</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1 block">Select Government ID Types to Provide</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {['SSS Number', 'GSIS Number', 'Pag-IBIG Number', 'PSN Number', 'PhilHealth Number'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedGovIdTypes(prev => 
                              prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                            );
                          }}
                          className={`p-3 text-[10px] font-bold uppercase tracking-widest border rounded-xl transition-all ${selectedGovIdTypes.includes(type) ? 'bg-[#1e419c] text-white border-[#1e419c] shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1e419c]'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedGovIdTypes.includes('SSS Number') && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">SSS Number</label>
                      <input name="sssNumber" value={formData.sssNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" placeholder="00-0000000-0" />
                    </div>
                  )}
                  {selectedGovIdTypes.includes('GSIS Number') && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">GSIS Number</label>
                      <input name="gsisNumber" value={formData.gsisNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" placeholder="00000000000" />
                    </div>
                  )}
                  {selectedGovIdTypes.includes('Pag-IBIG Number') && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Pag-IBIG Number</label>
                      <input name="pagIbigNumber" value={formData.pagIbigNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" placeholder="0000-0000-0000" />
                    </div>
                  )}
                  {selectedGovIdTypes.includes('PSN Number') && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">PSN Number</label>
                      <input name="psnNumber" value={formData.psnNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" placeholder="0000-0000-0000-0000" />
                    </div>
                  )}
                  {selectedGovIdTypes.includes('PhilHealth Number') && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">PhilHealth Number</label>
                      <input name="philHealthNumber" value={formData.philHealthNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" placeholder="00-000000000-0" />
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c] mt-8">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Document Uploads</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Disability Certificate */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Certificate of Disability <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed ${errors.includes('disabilityCert') ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl p-6 flex flex-col items-center justify-center group hover:bg-slate-50 cursor-pointer relative transition-all h-40`}>
                      <input type="file" onChange={(e) => { if(e.target.files?.[0]) { setDisabilityCert(e.target.files[0]); setErrors(prev => prev.filter(err => err !== 'disabilityCert')); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {disabilityCert ? (
                        <div className="flex flex-col items-center text-emerald-600 text-center">
                          <FileCheck size={32} />
                          <span className="text-[10px] mt-2 font-medium break-all px-2">{disabilityCert.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className={`${errors.includes('disabilityCert') ? 'text-red-300' : 'text-slate-300'} mb-2`} />
                          <p className={`text-[10px] text-center font-medium ${errors.includes('disabilityCert') ? 'text-red-400' : 'text-slate-400'}`}>Upload Certificate of Disability</p>
                        </>
                      )}
                    </div>
                    {renderInlineError("certificate_of_disability")}
                  </div>

                  {/* Residency Certificate */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Certificate of Residency <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed ${errors.includes('residencyCert') ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl p-6 flex flex-col items-center justify-center group hover:bg-slate-50 cursor-pointer relative transition-all h-40`}>
                      <input type="file" onChange={(e) => { if(e.target.files?.[0]) { setResidencyCert(e.target.files[0]); setErrors(prev => prev.filter(err => err !== 'residencyCert')); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {residencyCert ? (
                        <div className="flex flex-col items-center text-emerald-600 text-center">
                          <FileCheck size={32} />
                          <span className="text-[10px] mt-2 font-medium break-all px-2">{residencyCert.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className={`${errors.includes('residencyCert') ? 'text-red-300' : 'text-slate-300'} mb-2`} />
                          <p className={`text-[10px] text-center font-medium ${errors.includes('residencyCert') ? 'text-red-400' : 'text-slate-400'}`}>Upload Certificate of Residency</p>
                        </>
                      )}
                    </div>
                    {renderInlineError("certificate_of_residency")}
                  </div>

                  {/* Government ID */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Scanned Government ID <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed ${errors.includes('govIdFile') ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl p-6 flex flex-col items-center justify-center group hover:bg-slate-50 cursor-pointer relative transition-all h-40`}>
                      <input type="file" onChange={(e) => { if(e.target.files?.[0]) { setGovIdFile(e.target.files[0]); setErrors(prev => prev.filter(err => err !== 'govIdFile')); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {govIdFile ? (
                        <div className="flex flex-col items-center text-emerald-600 text-center">
                          <FileCheck size={32} />
                          <span className="text-[10px] mt-2 font-medium break-all px-2">{govIdFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className={`${errors.includes('govIdFile') ? 'text-red-300' : 'text-slate-300'} mb-2`} />
                          <p className={`text-[10px] text-center font-medium ${errors.includes('govIdFile') ? 'text-red-400' : 'text-slate-400'}`}>Upload Scanned Government ID</p>
                        </>
                      )}
                    </div>
                    {renderInlineError("scanned_government_id")}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c] mt-8">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Accomplished By</h3>
                </div>
                <div className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1 block">Accomplished By <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['APPLICANT', 'GUARDIAN', 'REPRESENTATIVE'].map(type => (
                        <label key={type} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.accomplishedBy === type ? 'bg-blue-50 border-[#1e419c]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="radio" 
                            name="accomplishedBy"
                            value={type}
                            className="w-4 h-4 text-[#1e419c] focus:ring-[#1e419c]"
                            checked={formData.accomplishedBy === type}
                            onChange={handleInputChange}
                          />
                          <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                      <input name="accomplishedByLastName" value={formData.accomplishedByLastName} onChange={handleInputChange} className={getFieldClass('accomplishedByLastName', false)} placeholder="LAST NAME" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                      <input name="accomplishedByFirstName" value={formData.accomplishedByFirstName} onChange={handleInputChange} className={getFieldClass('accomplishedByFirstName', false)} placeholder="FIRST NAME" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                      <input name="accomplishedByMiddleName" value={formData.accomplishedByMiddleName} onChange={handleInputChange} className={getFieldClass('accomplishedByMiddleName', false)} placeholder="MIDDLE NAME" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Complete Registration
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
