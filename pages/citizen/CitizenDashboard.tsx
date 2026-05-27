
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  HeartHandshake, 
  IdCard, 
  Megaphone,
  Circle,
  ShieldCheck,
  Zap,
  Activity,
  Plus,
  ArrowUpRight,
  LogOut,
  Accessibility,
  Calendar as CalendarIcon,
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ApplicationType } from '../../types';

interface PosterItem {
  id: string;
  title: string;
  image: string;
  date?: string;
  createdAt?: any;
}

export const CitizenDashboard: React.FC = () => {
  const { currentUser, logout, applications, posters } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(language === Language.EN ? 'en-US' : 'tl-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr.match(/\d+/)?.[0] || '0';
      return date.getDate().toString();
    } catch {
      return '0';
    }
  };

  const menuItems = [
    { 
      label: 'Profile', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-265.png',
      path: '/citizen/profile',
      color: 'bg-blue-50 border-blue-100'
    },
    { 
      label: 'ID Services', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-263.png',
      path: '/citizen/id', 
      color: 'bg-indigo-50 border-indigo-100'
    },
    { 
      label: 'Benefits', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-262.png',
      path: '/citizen/benefits', 
      color: 'bg-emerald-50 border-emerald-100'
    },
    { 
      label: 'Complaints', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-264.png',
      path: '/citizen/complaints', 
      color: 'bg-rose-50 border-rose-100'
    },
  ];

  const ads = [
    {
      title: 'Local Market Day',
      description: 'Support our local vendors this Saturday at the City Plaza.',
      image: 'https://picsum.photos/seed/market/600/400',
      link: '#'
    },
    {
      title: 'Health and Wellness Seminar',
      description: 'Join our free seminar on health and nutrition for seniors.',
      image: 'https://picsum.photos/seed/health/600/400',
      link: '#'
    },
    {
      title: 'San Juan Heritage Tour',
      description: 'Explore the rich history of our city through a guided tour.',
      image: 'https://picsum.photos/seed/heritage/600/400',
      link: '#'
    }
  ];

  const idApplication = applications.find(a => 
    a.userId === currentUser?.id && 
    (a.type === ApplicationType.ID_NEW || a.type === ApplicationType.ID_RENEWAL || a.type === ApplicationType.ID_REPLACEMENT)
  );

  const hasIssuedID = !!currentUser?.pwdIdNumber;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center min-h-[calc(100vh-160px)] relative overflow-hidden pt-4"
    >
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none -z-10"></div>

      {/* Unified Header Row */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-12 px-6 md:px-12 lg:px-16"
      >
        <div className="space-y-2 text-left">
          <h1 className="text-[#1e419c] text-3xl font-normal tracking-tight">
            {language === Language.EN ? 'Welcome' : 'Maligayang pagdating'}, {currentUser?.firstName || currentUser?.name?.split(' ')[0]}!
          </h1>
          <div className="flex items-center gap-2">
            <Accessibility size={24} className="text-red-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PWD ID No.</span>
              <span className="text-sm font-bold text-slate-500 leading-tight">
                {hasIssuedID ? currentUser?.pwdIdNumber : (idApplication ? 'Processing Application...' : 'No ID Issued')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-start md:items-end">
            <span className="text-slate-600 font-normal text-sm leading-tight tracking-tight hidden md:block">{currentUser?.name}</span>
            <button 
              onClick={logout}
              className="text-[10px] font-normal text-red-600 uppercase tracking-[0.25em] hover:text-red-800 transition-colors mt-1 flex items-center gap-1 group/logout"
            >
              <LogOut size={10} className="group-hover/logout:-translate-x-0.5 transition-transform" />
              {t('sign_out')}
            </button>
          </div>
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-md border border-red-100 overflow-hidden shrink-0">
            {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <img src="https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png" alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </motion.div>

      {/* ID Status Alert for users without ID */}
      {!hasIssuedID && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full px-6 md:px-12 lg:px-16 mb-8"
        >
          <div className={`p-6 rounded-2xl border ${idApplication ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-amber-50 border-amber-100 text-amber-800'} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${idApplication ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {idApplication ? <RefreshCw size={24} className="animate-spin" /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {idApplication 
                    ? 'Your ID is currently being processed' 
                    : 'You do not have an official PWD ID yet'}
                </h3>
                <p className="text-sm opacity-80 mt-1">
                  {idApplication 
                    ? `Your application from ${idApplication.date} is being reviewed by our admin.` 
                    : 'Apply now to get your ID and access all benefits.'}
                </p>
              </div>
            </div>
            {!idApplication && (
              <button 
                onClick={() => navigate('/citizen/id')}
                className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
              >
                Apply for ID
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Serbisyo Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full px-6 md:px-12 lg:px-16 mb-16"
      >
        <h2 className="text-[#1e419c] text-3xl font-semibold tracking-tight mb-8 text-left">
          Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <motion.button 
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="group relative transition-all duration-300 w-full"
            >
              <img 
                src={item.image} 
                alt={item.label}
                className="w-full h-auto object-contain drop-shadow-xl group-hover:scale-[1.02] transition-transform"
                referrerPolicy="no-referrer"
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
