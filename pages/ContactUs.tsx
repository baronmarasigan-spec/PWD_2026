import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  Headset, 
  ArrowLeft,
  Clock,
  Globe
} from 'lucide-react';

export const ContactUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      {/* Decorative Elements */}
       <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow pointer-events-none z-0"></div>
       <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '2s' }}></div>

      {/* Header / Hero */}
      <div 
        className="relative bg-slate-900 text-white py-20 px-4 z-10"
        style={{
             backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/02/jpp12-scaled.jpg')",
             backgroundSize: 'cover',
             backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        
        {/* Navigation */}
        <div className="absolute top-8 left-8 z-30">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white hover:text-primary-200 transition-colors font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20"
            >
                <ArrowLeft size={18} />
                <span className="hidden md:inline">Back to Home</span>
            </button>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact Us</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                We are here to assist you. Reach out to our dedicated PWD Affairs team for inquiries, support, or feedback.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Cards */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="text-primary-500" /> Key Officials
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PDAO Head</p>
                                <h3 className="font-bold text-slate-800 text-lg">Ms. Elena Cruz</h3>
                                <p className="text-sm text-slate-500 mt-1">Persons with Disability Affairs Office</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                                <Headset size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Support</p>
                                <h3 className="font-bold text-slate-800 text-lg">IT System Support</h3>
                                <p className="text-sm text-slate-500 mt-1">System & Registration Assistance</p>
                                <p className="text-sm font-mono text-blue-600 font-medium mt-1">(02) 8888-9900</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Phone className="text-primary-500" /> Direct Lines
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <Mail className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                <p className="text-slate-700 font-medium">publicinfo@sanjuancity.gov.ph</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <Phone className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Hotline</p>
                                <p className="text-slate-700 font-medium">(02) 7729 0005</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <Clock className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Office Hours</p>
                                <p className="text-slate-700 font-medium">Mon - Fri, 8:00 AM - 5:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-3 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full min-h-[500px] flex flex-col">
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MapPin className="text-primary-500" /> Visit Us
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">City Government of San Juan, Pinaglabanan, San Juan City</p>
                        </div>
                        <a 
                            href="https://maps.google.com/maps?ll=14.604085,121.033361&z=16&t=m&hl=en&gl=PH&mapclient=embed&cid=7082357770932580798" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-colors"
                        >
                            <Globe size={16} /> Open in Google Maps
                        </a>
                    </div>
                    
                    <div className="flex-1 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.916847847424!2d121.03138831484032!3d14.60384698979986!2m3!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7d780f2d843%3A0x62913076735a770!2sCity%20Government%20of%20San%20Juan!5e0!3m2!1sen!2sph!4v1629876543210!5m2!1sen!2sph" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0, minHeight: '400px' }} 
                            allowFullScreen={true} 
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="San Juan City Hall Map"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};