
import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { 
  User, Mail, Calendar, MapPin, Phone, Heart, 
  X, ShieldCheck, Banknote, 
  Info, Plus, Upload, FileCheck, CheckCircle2,
  Fingerprint, RefreshCw, Camera, Briefcase, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApplicationStatus } from '../../types';

export const CitizenProfile: React.FC = () => {
  const { currentUser, applications } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pt-6 relative">
      {/* Floating Close Button */}
      <button 
        onClick={() => navigate('/citizen/dashboard')}
        className="absolute top-8 right-0 p-2.5 bg-white hover:bg-slate-50 rounded-lg shadow-md border border-slate-200 transition-all group z-20"
        aria-label="Close"
      >
        <X size={20} className="text-slate-400 group-hover:text-red-600" />
      </button>

      <header className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-normal text-slate-900 tracking-tight uppercase">{t('profile_header')}</h1>
        <p className="text-slate-600 font-normal">{t('profile_subheader')}</p>
      </header>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="h-24 bg-[#1e419c] relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-10 relative z-10">
            <img 
              src={currentUser.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
              alt="Profile" 
              className="w-32 h-32 rounded-xl border-4 border-white shadow-xl object-cover bg-white"
            />
            <div className="text-center md:text-left mb-2 flex-1">
              <h2 className="text-2xl font-normal text-slate-900 uppercase tracking-tight">{currentUser.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-normal uppercase tracking-widest rounded-md border border-primary-100 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> {currentUser.pwdIdNumber || (currentUser.id?.startsWith('GGG-') ? currentUser.id : 'GGG-13-7405-00-0000')}
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-normal uppercase tracking-widest rounded-md border border-emerald-100">
                  Active Account
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <Fingerprint size={20} className="text-primary-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Personal Records</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Control No.</p>
                  <p className="text-sm font-normal text-slate-800">{currentUser.controlNo || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Date Applied</p>
                  <p className="text-sm font-normal text-slate-800">{currentUser.dateApplied || '---'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Office / Unit</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.officeUnit || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Full Legal Name</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Birth Date</p>
                  <p className="text-sm font-normal text-slate-800 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-300" /> {currentUser.birthDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Gender</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.gender || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Civil Status</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.civilStatus || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <Heart size={20} className="text-amber-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Disability Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Type of Disability</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.typeOfDisability || currentUser.disabilityType || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Cause of Disability</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.causeOfDisability || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <MapPin size={20} className="text-[#1e419c]" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Address Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-1 lg:col-span-2">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Street Address</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.streetAddress || currentUser.address || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Barangay</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.barangay || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">City / Municipality</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.cityMunicipality || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Province</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.province || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Region</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.region || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <Phone size={20} className="text-emerald-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Landline</p>
                  <p className="text-sm font-normal text-slate-800">{currentUser.landline || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-normal text-slate-800 font-mono">{currentUser.mobileNumber || currentUser.contactNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-normal text-slate-800 lowercase">{currentUser.emailAddress || currentUser.email || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <ShieldCheck size={20} className="text-red-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Contact Person</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.emergencyContactPerson || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Contact Number</p>
                  <p className="text-sm font-normal text-slate-800">{currentUser.emergencyContactNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Relationship</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.emergencyContactRelationship || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <Briefcase size={20} className="text-indigo-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Education & Employment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Highest Education</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.highestEducation || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Employment Status</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.employmentStatus || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Employment Type</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.employmentType || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Employment Category</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.employmentCategory || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Occupation</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.occupation || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <Fingerprint size={20} className="text-orange-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Organization Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Organization Name</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.orgName || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Contact Person</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.orgContactPerson || '---'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Organization Address</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.orgAddress || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Contact No.</p>
                  <p className="text-sm font-normal text-slate-800">{currentUser.orgContactNo || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <CreditCard size={20} className="text-slate-600" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Government IDs</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">SSS Number</p>
                  <p className="text-sm font-normal text-slate-800 font-mono">{currentUser.sssNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">GSIS Number</p>
                  <p className="text-sm font-normal text-slate-800 font-mono">{currentUser.gsisNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Pag-IBIG Number</p>
                  <p className="text-sm font-normal text-slate-800 font-mono">{currentUser.pagIbigNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">PSN Number</p>
                  <p className="text-sm font-normal text-slate-800 font-mono">{currentUser.psnNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">PhilHealth Number</p>
                  <p className="text-sm font-normal text-slate-800 font-mono">{currentUser.philHealthNumber || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <User size={20} className="text-pink-500" />
                <h3 className="font-normal text-slate-800 uppercase tracking-widest text-sm">Family Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Father’s Name</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.fatherName || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Mother’s Name</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.motherName || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Guardian’s Name</p>
                  <p className="text-sm font-normal text-slate-800 uppercase">{currentUser.guardianName || '---'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e419c] rounded-xl p-6 text-white shadow-xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={100} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-normal text-primary-400 uppercase tracking-[0.2em] mb-4">Registry Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-normal text-white/40 uppercase tracking-widest">PWD ID Number</p>
                    <p className="text-sm font-normal font-mono tracking-wider">{currentUser.pwdIdNumber || (currentUser.id?.startsWith('GGG-') ? currentUser.id : 'GGG-13-7405-00-0000')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-normal text-white/40 uppercase tracking-widest">Member Since</p>
                    <p className="text-sm font-normal">January 15, 2024</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 mt-4">
                     <p className="text-[10px] text-white/60 leading-relaxed font-normal">This profile is synced with the Local Civil Registry (LCR) of San Juan City.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Info size={18} />
              </div>
              <div>
                <h4 className="text-xs font-normal text-blue-800 uppercase tracking-widest mb-1">Data Privacy Notice</h4>
                <p className="text-[10px] text-blue-600 font-normal leading-relaxed">
                  Your personal information is protected under the Data Privacy Act of 2012. Only authorized OSCA personnel can access full record details for benefit verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
