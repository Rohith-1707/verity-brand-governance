import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Authenticated Layout & Pages
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/auth/DashboardPage';
import { KnowledgeBasePage } from './pages/auth/KnowledgeBasePage';
import { DocumentManagementPage } from './pages/auth/DocumentManagementPage';
import { ContentVerificationPage } from './pages/auth/ContentVerificationPage';
import { VerificationReportsPage } from './pages/auth/VerificationReportsPage';
import { ChangeImpactPage } from './pages/auth/ChangeImpactPage';
import { BrandGuidelinesPage } from './pages/auth/BrandGuidelinesPage';
import { ReviewApprovalPage } from './pages/auth/ReviewApprovalPage';
import { GovernanceIntelligencePage } from './pages/auth/GovernanceIntelligencePage';
import { BrandHealthPage } from './pages/auth/BrandHealthPage';
import { AuditHistoryPage } from './pages/auth/AuditHistoryPage';
import { SettingsPage } from './pages/auth/SettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-mono text-sm">
        Authenticating VERITY Session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Pages */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="documents" element={<DocumentManagementPage />} />
            <Route path="verify" element={<ContentVerificationPage />} />
            <Route path="reports" element={<VerificationReportsPage />} />
            <Route path="impact" element={<ChangeImpactPage />} />
            <Route path="guidelines" element={<BrandGuidelinesPage />} />
            <Route path="review" element={<ReviewApprovalPage />} />
            <Route path="governance" element={<GovernanceIntelligencePage />} />
            <Route path="brand-health" element={<BrandHealthPage />} />
            <Route path="audit" element={<AuditHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};
