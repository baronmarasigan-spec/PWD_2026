import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  AlertCircle,
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Store
} from 'lucide-react';


const Footer = () => (
  <footer className="bg-[#1e419c] text-white py-6 px-6 sm:px-12 border-t-[10px] border-[#fbcaca] w-full mt-auto relative z-20">
    <div className="max-w-[1200px] mx-auto flex flex-col xl:flex-row items-center justify-center gap-x-8 gap-y-4 w-full text-sm font-normal">
      <div className="flex items-center gap-4 whitespace-nowrap">
        <img 
          src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
          alt="Official Seal" 
          className="h-12 w-auto drop-shadow-md"
        />
        <p className="uppercase tracking-tight">Great City of San Juan</p>
      </div>

      <div className="hidden xl:block w-px h-4 bg-white/20"></div>

      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2 group cursor-pointer whitespace-nowrap">
          <MapPin size={16} className="text-white shrink-0" />
          <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">Pinaglabanan, San Juan City, Metro Manila</span>
        </div>
        <div className="flex items-center gap-2 group cursor-pointer whitespace-nowrap">
          <Mail size={16} className="text-white shrink-0" />
          <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">publicinfo@sanjuancity.gov.ph</span>
        </div>
        <div className="flex items-center gap-2 group cursor-pointer whitespace-nowrap">
          <Phone size={16} className="text-white shrink-0" />
          <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">(02) 7729 0005</span>
        </div>
      </div>
    </div>
  </footer>
);

export const LandingPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'citizen_admin' | 'merchant'>('citizen_admin');
  const [showMerchantPrompt, setShowMerchantPrompt] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(username, password);
      if (user) {
        if (user.role === Role.CITIZEN) {
          navigate('/citizen/dashboard');
        } else if (user.role === Role.MERCHANT) {
          navigate('/merchant/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-cover bg-center relative font-sans overflow-hidden"
      style={{
        backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/03/image-16.png')"
      }}
    >
      <div className="absolute inset-0 bg-white/75"></div>

      <div className="max-w-[1240px] mx-auto w-full flex-1 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 relative z-10 pt-12 pb-24 lg:pb-48">
        
        {/* Left Side: Content */}
        <div className="w-full lg:w-1/2 space-y-6 animate-fade-in-up mt-8">
           <div className="flex gap-3">
              <img 
                src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
                alt="Logos" 
                className="h-16 md:h-20 w-auto object-contain"
              />
           </div>
           
            <div className="space-y-4 max-w-xl">
               <h1 className="text-[24px] font-bold text-[#dc2626] uppercase tracking-tight leading-tight whitespace-nowrap">
                  PWD Care & Support System
               </h1>
              
              <div className="space-y-6 text-slate-600 font-normal text-base lg:text-lg leading-relaxed pt-2">
                <p>We are happy to see you again 💙</p>
                <p className="max-w-md">Log in to access services, updates, and support made for you.</p>
                <p className="max-w-lg">We are here to make every step easier, safer, and more accessible—because you matter.</p>
                <p className="font-bold text-slate-600 italic pt-4 text-lg tracking-tight">Sign in now and let's move forward together.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="w-full lg:w-auto flex justify-end mt-12 lg:mt-0 animate-scale-up">
            <div className="bg-white rounded-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2),0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100/50 w-full lg:w-[480px] relative">
              
              {/* Partner Store Trigger Icon in Upper Right */}
              <button
                type="button"
                onClick={() => setShowMerchantPrompt(true)}
                title="Are you a partner store? General Merchant Terminal"
                className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-[#1e419c] hover:bg-slate-50 rounded-full transition-all z-25 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100"
              >
                <Store size={22} />
              </button>

              {/* Partner Store Prompt Overlay */}
              {showMerchantPrompt && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-scale-up">
                  <div className="w-16 h-16 bg-blue-50 text-[#1e419c] rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                    <Store size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-2">
                    Are you a partner store?
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    General Merchant Terminal
                  </p>

                  <div className="flex flex-col gap-3 w-full max-w-[260px]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMerchantPrompt(false);
                        navigate('/merchant/dashboard');
                      }}
                      className="w-full bg-[#1e419c] hover:bg-[#122e70] text-white py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Yes, Go to Terminal
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowMerchantPrompt(false)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="p-10 lg:p-14 pb-4 lg:pb-4">
                 <h2 className="text-4xl lg:text-5xl font-medium text-center text-pdao_red mb-8">Log in</h2>

                  <form onSubmit={handleSubmit} className="space-y-8">
                     {error && (
                       <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-xs font-medium animate-pulse">
                         <AlertCircle size={18} />
                         {error}
                       </div>
                     )}

                     <div className="space-y-1">
                        <label className="text-[#1e419c] font-semibold text-lg ml-1">
                          Username
                        </label>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          className="w-full border-b border-slate-200 px-1 py-1.5 focus:outline-none focus:border-[#1e419c] transition-colors bg-transparent placeholder:text-slate-300 text-slate-700 text-lg"
                          placeholder="enter your username"
                        />
                     </div>

                     <div className="space-y-1 relative">
                        <label className="text-[#1e419c] font-semibold text-lg ml-1">Password</label>
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="w-full border-b border-slate-200 px-1 py-1.5 focus:outline-none focus:border-[#1e419c] transition-colors bg-transparent placeholder:text-slate-300 text-slate-700 text-lg"
                          placeholder="enter your password"
                        />
                        <div className="flex justify-end pr-1 mt-2">
                           <button type="button" className="text-[10px] text-slate-400 hover:text-slate-600 italic">
                             Forgot password?
                           </button>
                        </div>
                     </div>

                     <div className="pt-6">
                       <button 
                         type="submit"
                         disabled={loading}
                         className="w-full bg-[#1e419c] text-white rounded-md py-4 font-semibold text-xl hover:bg-[#15327a] transition-all shadow-xl shadow-[#1e419c]/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                       >
                         {loading && <RefreshCw size={20} className="animate-spin" />}
                         Log in
                       </button>
                     </div>

                     <div className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account? <button type="button" onClick={() => navigate('/register')} className="text-pdao_red font-bold underline ml-1 hover:text-red-700 transition-colors">Register here</button>
                     </div>
                  </form>
               </div>

               <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-4 opacity-50 grayscale group hover:grayscale-0 hover:opacity-100 transition-all px-10 lg:px-14 pb-6 lg:pb-8 pt-0">
                  <ShieldCheck className="text-[#1e419c] shrink-0" size={24} />
                  <p className="text-[9px] leading-relaxed font-medium uppercase tracking-widest text-slate-500">
                    Your data is protected by the Data Privacy Act of 2012. Login and registration are monitored by the San Juan PWD Registry System security node.
                  </p>
               </div>
            </div>
          </div>
        </div>


      <Footer />
    </div>
  );
};
