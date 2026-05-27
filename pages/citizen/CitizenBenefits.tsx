
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { ApplicationType, ApplicationStatus } from '../../types';
import { Accessibility, Banknote, CheckCircle2, X, Car, Film, Landmark, Info, ChevronRight, Check, Bookmark, Upload, FileCheck, RefreshCw, AlertCircle, HeartHandshake, Stethoscope, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenBenefits: React.FC = () => {
  const { currentUser, applications, addApplication } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [applyingBenefit, setApplyingBenefit] = useState<any | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = [
    {
      id: 'cash_grant',
      type: ApplicationType.BENEFIT_CASH,
      title: 'Cash Grant Assistance',
      amount: 'Financial Support',
      description: 'A special financial assistance program for PWD residents to help with daily living expenses and support.',
      icon: Banknote,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      requiresDocs: true,
      details: {
        subtitle: 'Social Welfare Program',
        inclusions: [
          'Quarterly cash stipend',
          'Emergency financial aid eligibility'
        ],
        qualifications: [
          'Must be a registered PWD in San Juan City',
          'Must provide proof of indigency',
          'Guardian representation for minors or severe cases'
        ],
        note: 'This grant is released through the City Social Welfare and Development Office.'
      }
    }
  ];

  const perks = [
    {
      title: 'Mandatory 20% Discount',
      description: '20% discount and VAT exemption on all basic services, medicine, and food establishments nationwide.',
      icon: Bookmark,
      color: 'text-blue-600',
      details: {
        subtitle: 'Republic Act No. 10754',
        inclusions: [
          '20% Discount on Medicines',
          '20% Discount on Food & Lodging',
          'VAT Exemption',
          'Priority lanes in all establishments'
        ]
      }
    },
    {
      title: 'Free Public Transport',
      description: 'Fare exemptions and dedicated priority seating in public transport within the city and MRT/LRT.',
      icon: Car,
      color: 'text-purple-600',
      details: {
        subtitle: 'Transportation Privileges',
        inclusions: [
          'Priority seating in public vehicles',
          'Fare discounts for MRT/LRT/Bus',
          'Assisted boarding services'
        ]
      }
    }
  ];

  const requiredDocs = [
    { id: 'pwd_id', label: 'Photo Copy of PWD ID' },
    { id: 'indigency', label: 'Brgy. Cert of Indigency' },
    { id: 'guardian_id', label: 'Guardian Valid ID' }
  ];

  const getStatus = (title: string) => {
    return applications.find(a => a.userId === currentUser?.id && a.description.includes(title) && a.status !== ApplicationStatus.REJECTED);
  };

  const handleFileChange = (docId: string) => {
    // Simulate file upload by adding the label to the attached files
    const doc = requiredDocs.find(d => d.id === docId);
    if (doc && !attachedFiles.includes(doc.label)) {
      setAttachedFiles(prev => [...prev, doc.label]);
    }
  };

  const handleApplyClick = (benefit: any) => {
    if (benefit.requiresDocs) {
      setApplyingBenefit(benefit);
      setAttachedFiles([]);
    } else {
      handleFinalSubmit(benefit);
    }
  };

  const handleFinalSubmit = async (benefit: any) => {
    if (benefit.requiresDocs && attachedFiles.length < requiredDocs.length) {
      alert('Please upload all required documents.');
      return;
    }

    setIsSubmitting(true);
    await addApplication({
      userId: currentUser!.id,
      userName: currentUser!.name,
      type: benefit.type,
      description: `Application for ${benefit.title}`,
      documents: attachedFiles.length > 0 ? attachedFiles : undefined
    });
    setIsSubmitting(false);
    setApplyingBenefit(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-6 relative">
      <button 
        onClick={() => navigate('/citizen/dashboard')}
        className="absolute top-8 right-0 p-2.5 bg-white hover:bg-slate-50 rounded-lg shadow-md border border-slate-200 transition-all group z-20"
      >
        <X size={20} className="text-slate-400 group-hover:text-red-600" />
      </button>

      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-normal text-slate-900 tracking-tight">{t('benefits_header')}</h1>
        <p className="text-slate-600 font-normal mt-1">{t('benefits_subheader')}</p>
      </header>

      {/* Year-End Cash Grant Status */}
      {(() => {
        const { cashGrants } = useApp();
        const myGrant = cashGrants.find(g => g.userId === currentUser?.id && g.year === new Date().getFullYear());
        if (!myGrant) return null;

        return (
          <section className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-normal text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                <CheckCircle2 size={14} className="text-emerald-500" /> Automatic Entitlements
            </h2>
            <div className="bg-gradient-to-br from-[#1e419c] to-[#15327a] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold tracking-tight">Year-End Cash Grant {myGrant.year}</h3>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
                      {myGrant.status}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm font-medium max-w-md">
                    You have been identified as an eligible beneficiary for the city's annual financial assistance program.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Grant Amount</p>
                  <p className="text-4xl font-bold">₱{myGrant.amount.toLocaleString()}</p>
                  <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                    <Clock size={12} /> Last Updated: {new Date(myGrant.dateUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                {[
                  { label: 'Eligible', active: true },
                  { label: 'Reviewed', active: ['Reviewed', 'Distributing', 'Claimed', 'Unclaimed', 'For follow up'].includes(myGrant.status) },
                  { label: 'Distribution', active: ['Distributing', 'Claimed', 'Unclaimed', 'For follow up'].includes(myGrant.status) },
                  { label: 'Claimed', active: myGrant.status === 'Claimed' }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.active ? 'bg-emerald-400 text-slate-900' : 'bg-white/10 text-white/40'}`}>
                      {step.active ? <Check size={12} strokeWidth={4} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step.active ? 'text-white' : 'text-white/30'}`}>{step.label}</span>
                    {i < 3 && <ChevronRight size={12} className="text-white/10 mx-1" />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      <section className="space-y-4">
        <h2 className="text-xs font-normal text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
            {t('apply_programs')}
        </h2>
        <div className="grid grid-cols-1 gap-4">
            {benefits.map((benefit) => {
            const status = getStatus(benefit.title);
            const isApplied = !!status;

            return (
                <div key={benefit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:border-primary-200">
                <div className={`w-2 md:w-3 ${isApplied ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                
                <div className="p-6 flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className={`w-14 h-14 ${benefit.bgColor} ${benefit.color} rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    <benefit.icon size={28} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-normal text-slate-900 tracking-tight">{benefit.title}</h3>
                            {isApplied && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-normal uppercase tracking-widest ${
                                    status.status === ApplicationStatus.ISSUED || status.status === ApplicationStatus.APPROVED 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {status.status}
                                </span>
                            )}
                        </div>
                        <p className="text-secondary-600 font-normal text-xs uppercase tracking-widest">{benefit.amount}</p>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-normal">{benefit.description}</p>
                        {benefit.details && (
                        <button 
                            onClick={() => setSelectedDetail(benefit)}
                            className="mt-2 text-[10px] font-normal uppercase text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
                        >
                            See Qualifications <ChevronRight size={12} />
                        </button>
                        )}
                    </div>

                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                        <button
                            onClick={() => handleApplyClick(benefit)}
                            disabled={isApplied}
                            className={`w-full py-3.5 rounded-lg font-normal text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-sm ${
                            isApplied 
                                ? 'bg-slate-100 text-slate-400 cursor-allowed border border-slate-200' 
                                : 'bg-[#1e419c] text-white hover:bg-[#15327a] hover:shadow-lg'
                            }`}
                        >
                            {isApplied ? <CheckCircle2 size={14} /> : null}
                            {isApplied ? t('request_sent') : t('send_request')}
                        </button>
                    </div>
                </div>
                </div>
            );
            })}
        </div>
      </section>

      {/* Application Modal */}
      {applyingBenefit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => !isSubmitting && setApplyingBenefit(null)} />
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up border border-white/20">
            <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-normal uppercase tracking-widest">Submit Requirements</h3>
                  <p className="text-[10px] text-white/60 font-normal uppercase mt-1 tracking-widest">Benefit Application</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setApplyingBenefit(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 bg-slate-50">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  To process your <strong>{applyingBenefit.title}</strong>, please upload clear photo copies of the following documents.
                </p>
              </div>

              <div className="space-y-3">
                {requiredDocs.map((doc) => {
                  const isUploaded = attachedFiles.includes(doc.label);
                  return (
                    <div key={doc.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${isUploaded ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {isUploaded ? <Check size={16} strokeWidth={3} /> : <FileCheck size={16} />}
                        </div>
                        <span className={`text-sm font-normal ${isUploaded ? 'text-emerald-700' : 'text-slate-600'}`}>{doc.label}</span>
                      </div>
                      <button 
                        onClick={() => handleFileChange(doc.id)}
                        disabled={isUploaded || isSubmitting}
                        className={`px-4 py-2 rounded-lg text-[10px] uppercase font-normal tracking-widest transition-all ${
                          isUploaded 
                            ? 'text-emerald-600 font-semibold' 
                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isUploaded ? 'Uploaded' : 'Upload'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setApplyingBenefit(null)}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-lg font-normal text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleFinalSubmit(applyingBenefit)}
                disabled={isSubmitting || attachedFiles.length < requiredDocs.length}
                className={`flex-1 py-4 rounded-lg font-normal text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                  attachedFiles.length < requiredDocs.length || isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#1e419c] text-white hover:bg-[#15327a]'
                }`}
              >
                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Perk/Benefit Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedDetail(null)} />
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center ${selectedDetail.color}`}>
                  <selectedDetail.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-normal uppercase tracking-widest">{selectedDetail.title}</h3>
                  <p className="text-[10px] text-slate-400 font-normal uppercase mt-1 tracking-widest">{selectedDetail.details.subtitle}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 bg-slate-50 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-normal text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Entitlements</h4>
                <div className="space-y-3">
                  {selectedDetail.details.inclusions.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-normal text-slate-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDetail.details.qualifications && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-normal text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">📌 Requirements</h4>
                  <div className="space-y-3">
                    {selectedDetail.details.qualifications.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Info size={12} className="text-blue-500" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-normal text-slate-500 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => setSelectedDetail(null)}
                className="w-full py-4 bg-[#1e419c] text-white rounded-lg font-normal text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#15327a] transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
