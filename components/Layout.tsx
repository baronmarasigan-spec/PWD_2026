
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { Role } from '../types';
import { 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  UserCheck, 
  CreditCard, 
  HeartHandshake, 
  LayoutDashboard, 
  MessageSquare,
  Circle, 
  Users, 
  Database, 
  User as UserIcon,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const SubMenuItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pl-11 pr-4 py-2 w-full text-sm transition-all duration-200 ${
      active 
      ? 'text-pdao_red font-bold bg-primary-50 border-r-4 border-pdao_red' 
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    <Circle size={6} className={`${active ? 'fill-pdao_red' : 'fill-transparent'}`} />
    <span className="font-semibold">{label}</span>
  </button>
);

const MenuGroup = ({ icon: Icon, label, children, isOpen, onClick }: any) => (
  <div className="mb-1">
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        isOpen ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="text-left font-bold">{label}</span>
      </div>
      {children && (
        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
      )}
    </button>
    {isOpen && (
      <div className="mt-1 space-y-1">
        {children}
      </div>
    )}
  </div>
);

const Footer = () => (
  <footer className="bg-[#1e419c] text-white py-8 px-6 sm:px-12 mt-auto border-t-[10px] border-[#fbcaca]">
    <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-x-8 gap-y-6 w-full text-sm font-normal">
      <div className="flex items-center gap-4 whitespace-nowrap">
        <img 
          src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
          alt="Official Seal" 
          className="h-16 w-auto drop-shadow-md"
        />
        <div className="flex flex-col">
          <p className="uppercase tracking-tight font-semibold text-sm">Great City of San Juan</p>
          <p className="italic text-[10px] opacity-80">Metro Manila</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center xl:justify-end items-center gap-x-12 gap-y-4">
        <div className="flex items-center gap-3 group cursor-pointer whitespace-nowrap">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
            <MapPin size={18} className="text-white shrink-0" />
          </div>
          <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">Pinaglabanan, San Juan City, Metro Manila</span>
        </div>
        <div className="flex items-center gap-3 group cursor-pointer whitespace-nowrap">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
            <Mail size={18} className="text-white shrink-0" />
          </div>
          <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">publicinfo@sanjuancity.gov.ph</span>
        </div>
        <div className="flex items-center gap-3 group cursor-pointer whitespace-nowrap">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
            <Phone size={18} className="text-white shrink-0" />
          </div>
          <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">(02) 7729 0005</span>
        </div>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const { language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    registration: currentPath.includes('/admin/registered/'),
    id: currentPath.includes('/admin/id/'),
    benefits: currentPath.includes('/admin/benefits/'),
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isCitizen = currentUser?.role === Role.CITIZEN;
  const isMerchant = currentUser?.role === Role.MERCHANT;

  if (isCitizen || isMerchant) {
    return (
      <div 
        className="min-h-screen font-sans flex flex-col relative bg-fixed bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/02/jpp12-scaled.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/70 pointer-events-none -z-10"></div>

        <main className="flex-1 w-full relative overflow-y-auto">
          <div className="w-full pb-10">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-pdao_red rounded-lg flex items-center justify-center text-white font-bold">P</div>
           <span className="font-bold text-slate-800 text-lg tracking-tight">PWDConnect</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-10 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-8 py-10 h-full flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-10 px-2 hidden md:flex">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-[#1e419c] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">PC</div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">PWDConnect</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{currentUser?.role.replace('_', ' ')} Portal</p>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <MenuGroup icon={LayoutDashboard} label="Dashboard" onClick={() => handleNavigate('/admin/dashboard')} isOpen={currentPath === '/admin/dashboard'} />
            <MenuGroup icon={UserCheck} label="PWD Registration" isOpen={expandedGroups.registration} onClick={() => toggleGroup('registration')}>
                <SubMenuItem label="Management" active={currentPath === '/admin/registered/all'} onClick={() => handleNavigate('/admin/registered/all')} />
                <SubMenuItem label="Walk-in" active={currentPath === '/register'} onClick={() => handleNavigate('/register?isWalkIn=true')} />
            </MenuGroup>
            <MenuGroup icon={Users} label="PWD Masterlist" onClick={() => handleNavigate('/admin/masterlist')} isOpen={currentPath === '/admin/masterlist'} />
            <MenuGroup icon={CreditCard} label="PWD ID Issuance" isOpen={expandedGroups.id} onClick={() => toggleGroup('id')}>
                <SubMenuItem label="Management" active={currentPath === '/admin/id/all'} onClick={() => handleNavigate('/admin/id/all')} />
                <SubMenuItem label="Walk-in" active={currentPath === '/admin/id/walk-in'} onClick={() => handleNavigate('/admin/id/walk-in')} />
            </MenuGroup>
            <MenuGroup icon={HeartHandshake} label="Benefits Management" isOpen={expandedGroups.benefits} onClick={() => toggleGroup('benefits')}>
                <SubMenuItem label="Approvals" active={currentPath === '/admin/benefits/approval'} onClick={() => handleNavigate('/admin/benefits/approval')} />
                <SubMenuItem label="Approved List" active={currentPath === '/admin/benefits/approved'} onClick={() => handleNavigate('/admin/benefits/approved')} />
                <SubMenuItem label="Disapproved" active={currentPath === '/admin/benefits/disapproved'} onClick={() => handleNavigate('/admin/benefits/disapproved')} />
                <SubMenuItem label="Cash Grant List" active={currentPath === '/admin/benefits/cash-grant'} onClick={() => handleNavigate('/admin/benefits/cash-grant')} />
            </MenuGroup>
            <MenuGroup icon={MessageSquare} label="Client Feedback" onClick={() => handleNavigate('/admin/feedback')} isOpen={currentPath === '/admin/feedback'} />
            <div className="pt-8 pb-2">
                <div className="h-px bg-slate-100 w-full mb-4"></div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Registry Reference</p>
            </div>
            <MenuGroup icon={Database} label="LCR Registry" onClick={() => handleNavigate('/admin/registry')} isOpen={currentPath === '/admin/registry'} />
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              <span className="font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <main className="flex-1 overflow-auto p-4 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
