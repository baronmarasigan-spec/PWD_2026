import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Register } from './pages/Register';
import { ContactUs } from './pages/ContactUs';
import { Layout } from './components/Layout';
import { Role } from './types';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard'; 
import { PwdRegistration } from './pages/admin/PwdRegistration';
import { AdminIssuance } from './pages/admin/AdminIssuance';
import { AdminFeedback } from './pages/admin/AdminFeedback';
import { Masterlist } from './pages/admin/Masterlist';
import { LcrPwdDashboard } from './pages/admin/LcrPwdDashboard';
import { AdminBenefits } from './pages/admin/AdminBenefits';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenComplaints } from './pages/citizen/CitizenComplaints';
import { CitizenID } from './pages/citizen/CitizenID';
import { CitizenBenefits } from './pages/citizen/CitizenBenefits';
import { CitizenProfile } from './pages/citizen/CitizenProfile';

// Merchant Pages
import { MerchantDashboard } from './pages/merchant/MerchantDashboard';

// Helper to identify administrative users (Roles 1-4)
const isAdminRole = (role?: Role) => 
  role === Role.ADMIN || 
  role === Role.SUPER_ADMIN || 
  role === Role.ENCODER || 
  role === Role.APPROVER;

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: Role }> = ({ children, allowedRole }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If a specific role is required (like Role.ADMIN), we check if the user is in any admin-side category
  if (allowedRole === Role.ADMIN) {
    if (!isAdminRole(currentUser.role)) {
      if (currentUser.role === Role.MERCHANT) {
        return <Navigate to="/merchant/dashboard" replace />;
      }
      return <Navigate to="/citizen/dashboard" replace />;
    }
  } else if (allowedRole && currentUser.role !== allowedRole) {
    if (isAdminRole(currentUser.role)) return <Navigate to="/admin/dashboard" replace />;
    if (currentUser.role === Role.MERCHANT) return <Navigate to="/merchant/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Route wrapper to prevent logged-in users from seeing Landing/Login pages
const PublicRoute: React.FC<{ children: React.ReactNode; allowAdmin?: boolean }> = ({ children, allowAdmin }) => {
  const { currentUser } = useApp();
  if (currentUser) {
    if (allowAdmin && isAdminRole(currentUser.role)) return <>{children}</>;
    if (isAdminRole(currentUser.role)) return <Navigate to="/admin/dashboard" replace />;
    if (currentUser.role === Role.MERCHANT) return <Navigate to="/merchant/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute allowAdmin={true}><Register /></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><ContactUs /></PublicRoute>} />
      
      {/* Admin Routes - Accessible by roles 1, 2, 3, 4 */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/masterlist" element={<ProtectedRoute allowedRole={Role.ADMIN}><Masterlist /></ProtectedRoute>} />
      <Route path="/admin/registry" element={<ProtectedRoute allowedRole={Role.ADMIN}><LcrPwdDashboard /></ProtectedRoute>} />
      
      {/* Registered Menu Routes */}
      <Route path="/admin/registered/:tab" element={<ProtectedRoute allowedRole={Role.ADMIN}><PwdRegistration /></ProtectedRoute>} />
      
      {/* ID Issuance Menu Routes */}
      <Route path="/admin/id/:tab" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminIssuance /></ProtectedRoute>} />
      
      {/* Benefits Menu Routes */}
      <Route path="/admin/benefits/:tab" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminBenefits /></ProtectedRoute>} />
      
      {/* Feedback Menu Route */}
      <Route path="/admin/feedback" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminFeedback /></ProtectedRoute>} />
      
      {/* Citizen Routes - Accessible by role 5 */}
      <Route path="/citizen/dashboard" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/complaints" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenComplaints /></ProtectedRoute>} />
      <Route path="/citizen/id" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenID /></ProtectedRoute>} />
      <Route path="/citizen/benefits" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenBenefits /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenProfile /></ProtectedRoute>} />

      {/* Merchant Route - General (no login needed) */}
      <Route path="/merchant/dashboard" element={<MerchantDashboard />} />

      {/* Catch-all route for 404s - Redirect to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <LanguageProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </LanguageProvider>
    </AppProvider>
  );
};

export default App;