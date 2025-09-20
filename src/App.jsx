import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import RecruiterLandingPage from "./pages/RecruiterLandingPage";
import CandidatesListPage from "./pages/CandidatesListPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import AddProfilePage from "./pages/AddProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import ProfileStatsPage from "./pages/ProfileStatsPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import SearchAnalysisPage from "./pages/SearchAnalysisPage";
import ForumPage from "./pages/ForumPage";
import ForumPostPage from "./pages/ForumPostPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import LegalPage from "./pages/LegalPage";
import PrivacyPage from "./pages/PrivacyPage";
import FAQPage from "./pages/FAQPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CandidateProfileGuard from "./components/CandidateProfileGuard";
import { RoleGuard } from "./components/RoleGuard";
import PublishJobPage from "./pages/PublishJobPage";
// AdminDashboard supprimé

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Route publique - Landing Page pour les visiteurs non connectés */}
        <Route path="/" element={
          <PublicRoute>
            <Layout hideFooter={true}>
              <LandingPage />
            </Layout>
          </PublicRoute>
        } />
        
        {/* Route publique - Landing Page pour les recruteurs */}
        <Route path="/recruiters" element={
          <PublicRoute>
            <Layout hideFooter={true}>
              <RecruiterLandingPage />
            </Layout>
          </PublicRoute>
        } />
        
        {/* Routes publiques d'authentification */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        <Route path="/confirm-email" element={
          <PublicRoute>
            <ConfirmEmailPage />
          </PublicRoute>
        } />
        <Route path="/mentions-legales" element={
          <PublicRoute>
            <Layout hideFooter={true}>
              <LegalPage />
            </Layout>
          </PublicRoute>
        } />
        <Route path="/politique-confidentialite" element={
          <PublicRoute>
            <Layout hideFooter={true}>
              <PrivacyPage />
            </Layout>
          </PublicRoute>
        } />
        <Route path="/faq" element={
          <PublicRoute>
            <Layout hideFooter={true}>
              <FAQPage />
            </Layout>
          </PublicRoute>
        } />
        <Route path="/pricing" element={
          <PublicRoute>
            <Layout hideFooter={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <PricingPage />
              </div>
            </Layout>
          </PublicRoute>
        } />
        
        {/* Routes protégées - Accessibles uniquement aux utilisateurs connectés */}
        <Route path="/candidates" element={
          <Layout>
            <ProtectedRoute>
              <CandidatesListPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/candidates/:id" element={
          <Layout>
            <ProtectedRoute>
              <CandidateDetailPage />
            </ProtectedRoute>
          </Layout>
        } />
        {/* Route supprimée: /candidates/suggestions (système de suggestions pour candidats désactivé) */}
        <Route path="/add-profile" element={
          <Layout>
            <ProtectedRoute>
              <AddProfilePage />
            </ProtectedRoute>
          </Layout>
        } />
        {/* Routes pour le profil candidat avec onglets distincts */}
        <Route path="/my-profile" element={<Navigate to="/my-profile/profile" replace />} />
        <Route path="/my-profile/profile" element={
          <Layout>
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/stats" element={
          <Layout>
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/plan" element={
          <Layout>
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/offer" element={
          <Layout>
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/profile-stats" element={
          <Layout>
            <ProtectedRoute>
              <ProfileStatsPage />
            </ProtectedRoute>
          </Layout>
        } />
        {/* Dashboard recruteur: onglets en pages dédiées */}
        <Route path="/recruiter-dashboard" element={<Navigate to="/recruiter-dashboard/favorites" replace />} />
        <Route path="/recruiter-dashboard/favorites" element={
          <Layout>
            <ProtectedRoute>
              <RecruiterDashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/appointments" element={
          <Layout>
            <ProtectedRoute>
              <RecruiterDashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/myjobs" element={
          <Layout>
            <ProtectedRoute>
              <RecruiterDashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/matching" element={
          <Layout>
            <ProtectedRoute>
              <RecruiterDashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter/search-analysis/:searchId" element={
          <Layout>
            <ProtectedRoute>
              <SearchAnalysisPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/forum" element={
          <Layout>
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/forum/:id" element={
          <Layout>
            <ProtectedRoute>
              <ForumPostPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/jobs" element={
          <Layout>
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/jobs/new" element={
          <Layout>
            <ProtectedRoute>
              <PublishJobPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/jobs/:id" element={
          <Layout>
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          </Layout>
        } />
        
        {/* Route Admin supprimée */}
        
        {/* Route 404 */}
        <Route path="*" element={
          <Layout>
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h1>
              <p className="text-gray-600 mb-6">La page que vous recherchez n'existe pas.</p>
              <a href="/" className="text-blue-600 hover:text-blue-700 underline">
                Retour à l'accueil
              </a>
            </div>
          </Layout>
        } />
      </Routes>
    </AuthProvider>
  );
}// Force redeploy Tue Sep 16 16:06:43 CEST 2025
