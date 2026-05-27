import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LogOut, CheckCircle2, XCircle, Search, 
  Banknote, AlertCircle, ShieldAlert, QrCode, Camera
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ClaimTransaction {
  id: string;
  pwdIdNumber: string;
  pwdName: string;
  disabilityType: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  timestamp: string;
  merchantName: string;
  status: string;
}

const formatExpiryDate = (dateStr?: string) => {
  if (!dateStr) return 'December 31, 2031';
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (e) {}
  return dateStr;
};

export const MerchantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, masterlistRecords, registryRecords } = useApp();
  
  // States
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  
  // Advanced QR Scan States
  const [cameraScanning, setCameraScanning] = useState(true);
  const [scanFeedbackMsg, setScanFeedbackMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<boolean>(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingScanRef = useRef<boolean>(false);
  const scannerStateRef = useRef<'IDLE' | 'STARTING' | 'SCANNING' | 'STOPPING'>('IDLE');

  const handleStopScanning = () => {
    if (qrScannerRef.current && (scannerStateRef.current === 'SCANNING' || scannerStateRef.current === 'STARTING')) {
      const scannerInstance = qrScannerRef.current;
      scannerStateRef.current = 'STOPPING';
      scannerInstance.stop()
        .then(() => {
          scannerStateRef.current = 'IDLE';
          setCameraScanning(false);
        })
        .catch((err) => {
          console.log("Stop error during manual stop", err);
          scannerStateRef.current = 'IDLE';
          setCameraScanning(false);
        });
      return;
    }
    scannerStateRef.current = 'IDLE';
    setCameraScanning(false);
  };

  // Discount Calculator States
  const [originalAmount, setOriginalAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [lastGrantedName, setLastGrantedName] = useState('');

  // Transactions logs
  const [claims, setClaims] = useState<ClaimTransaction[]>(() => {
    const saved = localStorage.getItem(`claims_${currentUser?.id || 'default'}`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'clm_1',
        pwdIdNumber: '2026-0004',
        pwdName: 'Benny G. Abante',
        disabilityType: 'Visual Impairment',
        originalAmount: 1250,
        discountAmount: 250,
        finalAmount: 1000,
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        merchantName: currentUser?.name || 'Partner Shop',
        status: 'Discount Approved'
      },
      {
        id: 'clm_2',
        pwdIdNumber: '2026-0012',
        pwdName: 'Clarissa M. Lopez',
        disabilityType: 'Orthopedic Disability',
        originalAmount: 800,
        discountAmount: 160,
        finalAmount: 640,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        merchantName: currentUser?.name || 'Partner Shop',
        status: 'Discount Approved'
      }
    ];
  });

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`claims_${currentUser.id}`, JSON.stringify(claims));
    }
  }, [claims, currentUser?.id]);

  // Sync amount changes
  useEffect(() => {
    const amt = parseFloat(originalAmount) || 0;
    const disc = amt * 0.20;
    const finalVal = amt - disc;
    setDiscountAmount(disc);
    setFinalAmount(finalVal);
  }, [originalAmount]);

  // Helper extraction of PWD ID from scanned QR code strings
  const extractIdFromQr = (qrText: string): string => {
    try {
      const url = new URL(qrText);
      const paths = url.pathname.split('/');
      const lastSegment = paths[paths.length - 1];
      if (lastSegment) {
        return lastSegment.trim();
      }
    } catch {
      // Just fallback
    }

    const verifyMatch = qrText.match(/\/verify\/([^/?#]+)/i);
    if (verifyMatch && verifyMatch[1]) {
      return verifyMatch[1].trim();
    }

    return qrText.trim();
  };

  // Core reusable function to perform citizen verification checks against registers
  const performIdValidation = (idValue: string) => {
    setSearched(true);
    setSearchResult(null);
    setClaimSuccess(false);

    const query = idValue.trim().toLowerCase();
    if (!query) return null;

    // Search Masterlist first (primary source of approved digitized PWD IDs)
    let found = masterlistRecords.find(r => 
      String(r.pwdIdNumber || '').toLowerCase() === query || 
      String(r.id || '').toLowerCase() === query
    );

    // If not in Masterlist, search verified registers
    if (!found) {
      found = registryRecords.find(r => 
        String(r.pwdIdNumber || '').toLowerCase() === query || 
        String(r.id || '').toLowerCase() === query
      );
    }

    if (found) {
      const targetName = found.fullName || found.name || `${found.firstName || ''} ${found.lastName || ''}`.trim() || 'Beneficiary';
      const output = {
        id: found.id,
        pwdIdNumber: found.pwdIdNumber || 'PENDING-ID',
        name: targetName,
        disabilityType: found.disabilityType || found.typeOfDisability || 'Specified Disability',
        barangay: found.barangay || 'San Juan District',
        status: found.status || 'Active',
        isValid: true,
        expiryDate: found.pwdIdExpiryDate || found.expiryDate || '2031-10-15'
      };
      setSearchResult(output);
      setSearchId(found.pwdIdNumber || found.id);
      return output;
    } else {
      setSearchResult(null);
      setSearchId(idValue);
      return null;
    }
  };

  // Handle Manual Form submission
  const handleValidateIdForm = (e: React.FormEvent) => {
    e.preventDefault();
    setScanFeedbackMsg(null);
    performIdValidation(searchId);
  };

  // Handle Camera module start scanning inside useEffect
  useEffect(() => {
    const readerId = "qr-reader";
    let active = true;

    if (cameraScanning) {
      if (scannerStateRef.current !== 'IDLE') {
        // Prevent concurrent or duplicate scanner startup
        return;
      }

      isProcessingScanRef.current = false;
      const container = document.getElementById(readerId);
      if (container) {
        setCameraPermissionError(false);
        // Clear any old inner elements left by previous instances to prevent duplicates
        container.innerHTML = "";
        
        try {
          scannerStateRef.current = 'STARTING';
          const scannerInstance = new Html5Qrcode(readerId);
          qrScannerRef.current = scannerInstance;
          
          const onScanSuccess = (decodedText: string) => {
            if (isProcessingScanRef.current || !active) return;
            isProcessingScanRef.current = true;

            const parsedId = extractIdFromQr(decodedText);
            setSearchId(parsedId);
            const verifyResult = performIdValidation(parsedId);
            
            if (verifyResult) {
              setScanFeedbackMsg({
                type: 'success',
                text: `Success! Authenticated: "${verifyResult.name}" (ID: ${verifyResult.pwdIdNumber})`
              });
            } else {
              setScanFeedbackMsg({
                type: 'error',
                text: `Parsed ID "${parsedId}", but it was not found in active PWD databases.`
              });
            }
            
            if (scannerStateRef.current === 'SCANNING' || scannerStateRef.current === 'STARTING') {
              scannerStateRef.current = 'STOPPING';
              scannerInstance.stop()
                .then(() => {
                  scannerStateRef.current = 'IDLE';
                  if (active) {
                    setCameraScanning(false);
                    const el = document.getElementById(readerId);
                    if (el) el.innerHTML = "";
                  }
                })
                .catch(err => {
                  console.log("Stop error", err);
                  scannerStateRef.current = 'IDLE';
                  if (active) {
                    setCameraScanning(false);
                  }
                });
            }
          };

          const onScanFailure = (err: any) => {
            // Frame-level scan failure, can be ignored in UI
          };

          scannerInstance.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanFailure
          ).then(() => {
            if (!active) {
              scannerStateRef.current = 'STOPPING';
              scannerInstance.stop().then(() => {
                scannerStateRef.current = 'IDLE';
                if (container) container.innerHTML = "";
              }).catch(err => {
                scannerStateRef.current = 'IDLE';
                console.log("Stopped inactive scanner", err);
              });
            } else {
              scannerStateRef.current = 'SCANNING';
            }
          }).catch(err => {
            scannerStateRef.current = 'IDLE';
            if (active) {
              console.warn("Could not start camera tracker device:", err);
              setCameraPermissionError(true);
              setScanFeedbackMsg({
                type: 'error',
                text: "Could not access camera device due to denied permissions. Please check site access keys."
              });
              setCameraScanning(false);
            }
          });
        } catch (e) {
          scannerStateRef.current = 'IDLE';
          console.error("Failed to initialize Html5Qrcode:", e);
        }
      }
    }

    return () => {
      active = false;
      const scannerInstance = qrScannerRef.current;
      if (scannerInstance) {
        if (scannerStateRef.current === 'SCANNING') {
          scannerStateRef.current = 'STOPPING';
          scannerInstance.stop()
            .then(() => {
              scannerStateRef.current = 'IDLE';
              const el = document.getElementById(readerId);
              if (el) el.innerHTML = "";
            })
            .catch(err => {
              scannerStateRef.current = 'IDLE';
              console.log("Cleanup stop error", err);
            });
        } else if (scannerStateRef.current === 'STARTING') {
          // Delayed unmount check will stop and cleanup
        } else {
          scannerStateRef.current = 'IDLE';
        }
      } else {
        scannerStateRef.current = 'IDLE';
      }
      qrScannerRef.current = null;
    };
  }, [cameraScanning]);

  // Grant Claims function
  const handleGrantDiscount = () => {
    if (!searchResult || !originalAmount) return;

    const newClaim: ClaimTransaction = {
      id: `clm_${Date.now()}`,
      pwdIdNumber: searchResult.pwdIdNumber,
      pwdName: searchResult.name,
      disabilityType: searchResult.disabilityType,
      originalAmount: parseFloat(originalAmount),
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      timestamp: new Date().toISOString(),
      merchantName: currentUser?.name || 'Partner Merchant',
      status: 'Discount Approved'
    };

    setClaims(prev => [newClaim, ...prev]);
    setLastGrantedName(searchResult.name);
    setClaimSuccess(true);
    setScanFeedbackMsg(null);
    
    // Reset inputs
    setOriginalAmount('');
    setSearchId('');
    setSearchResult(null);
    setSearched(false);
    setCameraScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header section styled with deep slate blue */}
      <header className="bg-gradient-to-r from-[#1e419c] to-[#122e70] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <img 
                src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
                alt="City Seal" 
                className="h-14 w-auto drop-shadow" 
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">
                  Lungsog ng San Juan
                </h1>
              </div>
           </div>

           <button 
             onClick={() => {
               logout();
               navigate('/');
             }}
             className="bg-white/10 hover:bg-white/20 transition-all font-semibold uppercase text-xs tracking-wider px-5 py-3 rounded-lg flex items-center gap-2 border border-white/10"
           >
              <LogOut size={16} /> Exit Terminal
           </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8 animate-fade-in-up">

          {/* Validation Form card with advanced QR SCAN */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   <QrCode size={22} className="text-[#1e419c]" />
                   <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">PWD Card & QR Validation Gate</h2>
                </div>
             </div>

             <div className="p-6 sm:p-8 space-y-6">
                
                {/* Live claim success flag */}
                {claimSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4.5 rounded-xl flex items-start gap-3 text-sm animate-scale-up font-normal shrink-0">
                    <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-900 uppercase tracking-tight text-xs">Claim Logged Successfully!</h4>
                      <p className="mt-1 text-xs">
                        Benefits and discounted invoice of 20% + VAT Exemption have been granted securely to <strong className="text-slate-900">{lastGrantedName}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Scanned Feedback banner for camera decoding logs */}
                {scanFeedbackMsg && (
                  <div className={`p-4.5 rounded-xl flex items-start gap-3 border transition-all animate-scale-up ${
                     scanFeedbackMsg.type === 'success' 
                       ? 'bg-blue-50 border-blue-100 text-[#1e419c]' 
                       : 'bg-red-50 border-red-100 text-red-800'
                  }`}>
                     {scanFeedbackMsg.type === 'success' ? (
                       <CheckCircle2 size={20} className="text-[#112e70] shrink-0 mt-0.5" />
                     ) : (
                       <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                     )}
                     <div className="flex-1">
                        <h4 className="font-extrabold text-xs uppercase tracking-tight leading-none mb-1">
                           {scanFeedbackMsg.type === 'success' ? 'Real-Time QR Scanned' : 'Validation Error'}
                        </h4>
                        <p className="text-[11px] leading-relaxed opacity-90">{scanFeedbackMsg.text}</p>
                     </div>
                     <button 
                       onClick={() => setScanFeedbackMsg(null)}
                       className="p-1 hover:bg-black/5 rounded text-xs font-bold leading-none uppercase tracking-wider ml-auto"
                     >
                       clear
                     </button>
                  </div>
                )}

                {/* Manual PWD Card Form */}
                <form onSubmit={handleValidateIdForm} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 pl-1">
                      PWD Card Number (Manual Input)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                         <input 
                           id="pwd-card-input"
                           value={searchId}
                           onChange={(e) => setSearchId(e.target.value)}
                           placeholder="Enter PWD ID Card Number (e.g. 2026-0004)"
                           className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1e419c] outline-none text-slate-800 font-medium placeholder:text-slate-400 text-base font-mono transition-all"
                           required
                         />
                         <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <button 
                        type="submit"
                        className="h-14 bg-[#1e419c] hover:bg-[#122e70] text-white px-8 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
                      >
                         Validate ID
                      </button>
                    </div>
                  </div>
                </form>

                {/* Divider to separate Camera scan section */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                    <span className="bg-white px-4 text-slate-400">or scan card barcode / qr</span>
                  </div>
                </div>

                {/* Camera QR scanner */}
                <div className="space-y-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                   <div className="text-center max-w-sm mx-auto space-y-4">
                      {/* Scanner Control/Trigger UI - shown when not scanning */}
                      {!cameraScanning && (
                        cameraPermissionError ? (
                          <div className="space-y-4 py-2 text-left bg-amber-50/50 border border-amber-200/85 rounded-2xl p-5 animate-scale-up">
                             <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider leading-none">
                                <ShieldAlert size={18} className="text-amber-600 shrink-0" />
                                Camera Access Blocked or Denied
                             </div>
                             <p className="text-[11px] text-slate-600 leading-normal font-normal">
                                The automatic camera scanner was blocked because permissions to access your camera are denied or disabled.
                             </p>
                             <div className="bg-white rounded-xl p-3 border border-amber-100/60 text-[10px] text-slate-700 space-y-2 leading-relaxed font-normal">
                                <div className="font-bold uppercase text-[9px] tracking-wider text-amber-850">Troubleshooting Steps:</div>
                                <div className="flex gap-2">
                                   <span className="font-bold text-amber-700">1.</span>
                                   <span>Allow camera permissions by clicking the **Lock Icon** 🔒 in the browser's URL address bar.</span>
                                </div>
                                <div className="flex gap-2">
                                   <span className="font-bold text-amber-700">2.</span>
                                   <span>When running inside a development iframe, browser sandboxes often restrict direct camera hardware. Open the app in its own viewport tab for direct access.</span>
                                </div>
                             </div>
                             <div className="flex flex-col sm:flex-row gap-2 pt-1 justify-center">
                                <a
                                  href={window.location.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-[#1e419c] hover:bg-[#122e70] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow no-underline"
                                >
                                   🚀 Open In New Tab
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCameraPermissionError(false);
                                    setCameraScanning(true);
                                    setScanFeedbackMsg(null);
                                  }}
                                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                                >
                                   Retry Access
                                </button>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-4 py-2">
                             <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                                <Camera size={24} />
                             </div>
                             <div className="space-y-1.5">
                                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider leading-none">Camera QR Finder</h4>
                                <p className="text-[11px] text-slate-500 font-normal leading-relaxed text-center">Turn on your device camera to scan the back-of-card QR code. Once scanned, it will automatically populate the card number above and trigger validation.</p>
                             </div>
                             <button
                               type="button"
                               onClick={() => { setCameraPermissionError(false); setCameraScanning(true); setScanFeedbackMsg(null); }}
                               className="px-6 py-3.5 bg-[#1e419c] hover:bg-[#122e70] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                             >
                                <Camera size={14} /> Enable Camera Scan
                             </button>
                          </div>
                        )
                      )}

                      {/* Active Video Scanner DOM Node (remains mounted to prevent play errors; hidden when scanning is inactive) */}
                      <div className={cameraScanning ? "space-y-4 animate-scale-up" : "hidden"}>
                         <div className="w-full aspect-square bg-slate-900 rounded-2xl relative border-2 border-[#1e419c] mx-auto shadow-inner flex items-center justify-center overflow-hidden">
                            <style>{`
                              #qr-reader {
                                border: none !important;
                                width: 100% !important;
                                height: 100% !important;
                              }
                              #qr-reader video {
                                object-fit: cover !important;
                                width: 100% !important;
                                height: 100% !important;
                              }
                              #qr-reader__scan_region {
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                width: 100% !important;
                                height: 100% !important;
                              }
                              #qr-reader__scan_region video {
                                object-fit: cover !important;
                                width: 100% !important;
                                height: 100% !important;
                              }
                            `}</style>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-white text-xs font-medium">
                               Powering video buffer...
                            </div>
                            <div id="qr-reader" className="w-full h-full" />
                         </div>
                         <button
                           type="button"
                           onClick={handleStopScanning}
                           className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 mx-auto cursor-pointer"
                         >
                            <XCircle size={14} /> Stop Scanner
                         </button>
                      </div>
                   </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal font-normal uppercase tracking-widest pl-1">
                   💡 Tip: You can query using the citizen's PWD Digitized ID code. Under local government codes, valid holders of approved cards are instantly authorized for merchant claims.
                </p>
             </div>
          </div>

          {/* Search Result view Card */}
          {searched && (
            <div className="animate-scale-up">
              {searchResult ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   {/* Verification status Banner */}
                   <div className="bg-emerald-500 text-white px-6 py-4 flex items-center gap-3">
                     <CheckCircle2 size={24} />
                     <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#d1fae5]">Realtime Registry Verification</span>
                       <h3 className="text-sm font-extrabold uppercase leading-tight tracking-tight">PWD BENEFICIARY FOUND & CONFIRMED ACTIVE</h3>
                     </div>
                   </div>

                   <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                     
                     {/* Identity card mock style */}
                     <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/60 relative overflow-hidden flex flex-col justify-between h-auto min-h-[14rem] sm:min-h-[16rem] shadow-sm font-normal">
                       <div className="absolute top-0 right-0 h-40 w-40 bg-[#1e419c]/5 rounded-full blur-2xl -z-1"></div>
                       
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">San Juan Digitized ID</p>
                           <p className="text-xl font-extrabold text-slate-900 mt-1">{searchResult.name}</p>
                         </div>
                         <div className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                           Active
                         </div>
                       </div>

                       <div className="space-y-3 mt-4">
                         <div>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">PWD Control ID</p>
                           <p className="text-md font-mono font-bold text-[#1e419c] leading-normal">{searchResult.pwdIdNumber}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Barangay Residence</p>
                             <p className="text-xs font-semibold text-slate-700 leading-normal">{searchResult.barangay}</p>
                           </div>
                           <div>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Expiration Date</p>
                             <p className="text-xs font-semibold text-slate-700 leading-normal font-mono text-[#dc2626]">
                               {formatExpiryDate(searchResult.expiryDate)}
                             </p>
                           </div>
                         </div>
                         <div>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Disability Category</p>
                           <p className="text-xs font-semibold text-slate-707 leading-normal text-slate-700">{searchResult.disabilityType}</p>
                         </div>
                       </div>
                     </div>

                     {/* Calculator Area */}
                     <div className="space-y-5">
                       <div className="bg-slate-50 p-4.5 rounded-xl border-l-4 border-slate-300">
                          <h4 className="text-[10px] font-bold text-[#1e419c] uppercase tracking-wider">Calculate Benefit Claim</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">Enter the total billing amount to auto-compute the standard 20% PWD discount.</p>
                       </div>

                       <div className="space-y-4 font-normal">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Original Bill Amount (₱)</label>
                            <input 
                              type="number" 
                              value={originalAmount}
                              onChange={(e) => setOriginalAmount(e.target.value)}
                              placeholder="e.g. 1500"
                              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-base font-bold text-slate-800 focus:border-[#1e419c] outline-none transition-all bg-white"
                              min="0"
                            />
                          </div>

                          {parseFloat(originalAmount) > 0 && (
                            <div className="bg-slate-50 rounded-xl p-4.5 space-y-2 font-normal text-xs text-slate-600 border border-slate-100">
                              <div className="flex justify-between">
                                <span>Gross Bill Total:</span>
                                <span>₱{(parseFloat(originalAmount) || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-red-600 font-bold border-b border-slate-200/50 pb-2">
                                <span>PWD Discount (20% Off):</span>
                                <span>-₱{discountAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1">
                                <span>Final Amount to Pay:</span>
                                <span className="text-[#1e419c]">₱{finalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <button 
                            type="button" 
                            onClick={handleGrantDiscount}
                            disabled={!originalAmount || parseFloat(originalAmount) <= 0}
                            className="w-full bg-[#1e419c] hover:bg-[#122e70] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm uppercase tracking-widest h-14 rounded-xl transition-all active:scale-[0.98] shadow flex items-center justify-center gap-2"
                          >
                            <Banknote size={18} /> Grant 20% Discount
                          </button>
                       </div>
                     </div>

                   </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 animate-scale-up">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert size={36} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-lg font-bold text-red-700 uppercase tracking-tight">PWD ID NOT FOUND</h3>
                     <p className="text-slate-500 text-sm leading-relaxed font-normal">
                       We could not locate any approved PWD record in the city register matching <strong className="text-slate-800 font-mono">"{searchId}"</strong>. Please verify the ID card number or guide them to complete modern registration at the San Juan PDAO office.
                     </p>
                  </div>
                  <button 
                    onClick={() => { setSearchId(''); setSearched(false); setCameraScanning(false); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}

      </main>
    </div>
  );
};
