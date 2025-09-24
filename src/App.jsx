import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { usePermissions } from "./hooks/usePermissions";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileCacheProvider } from "./contexts/ProfileCacheContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CandidateProfileGuard from "./components/CandidateProfileGuard";
import { RoleGuard } from "./components/RoleGuard";
import LoadingSpinner from "./components/LoadingSpinner";

// Composants légers - chargés immédiatement
import LandingPage from "./pages/LandingPage";
import RecruiterLandingPage from "./pages/RecruiterLandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import LegalPage from "./pages/LegalPage";
import PrivacyPage from "./pages/PrivacyPage";
import FAQPage from "./pages/FAQPage";
import PricingPage from "./pages/PricingPage";
import RecruiterPricingLanding from "./pages/RecruiterPricingLanding";

// Composants lourds - chargés de manière paresseuse
const CandidatesListPage = lazy(() => import("./pages/CandidatesListPage"));
const CandidateDetailPage = lazy(() => import("./pages/CandidateDetailPage"));
const AddProfilePage = lazy(() => import("./pages/AddProfilePage"));
const MyProfilePage = lazy(() => import("./pages/MyProfilePage"));
const ProfileStatsPage = lazy(() => import("./pages/ProfileStatsPage"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const SearchAnalysisPage = lazy(() => import("./pages/SearchAnalysisPage"));
const ForumPage = lazy(() => import("./pages/ForumPage"));
const ForumPostPage = lazy(() => import("./pages/ForumPostPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const PublishJobPage = lazy(() => import("./pages/PublishJobPage"));

// Composant de redirection pour les candidats
const CandidateRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(`/my-profile/talent/${id}`, { replace: true });
  }, [id, navigate]);
  
  return null;
};

// Route intelligente pour /my-profile/offer/:id: redirige les recruteurs vers /recruiter-dashboard/offer/:id
const OfferRoute = () => {
  const { id } = useParams();
  const { isRecruiter } = usePermissions();
  if (isRecruiter) {
    return <Navigate to={`/recruiter-dashboard/offer/${id}`} replace />;
  }
  return <JobDetailPage />;
};

// Composants de chargement spécialisés pour différents contextes
const PageLoadingSpinner = ({ message }) => (
  <LoadingSpinner message={message} />
);

const DashboardLoadingSpinner = () => (
  <LoadingSpinner message="Chargement du tableau de bord..." />
);

const ProfileLoadingSpinner = () => (
  <LoadingSpinner message="Chargement du profil..." />
);

const CandidatesLoadingSpinner = () => (
  <LoadingSpinner message="Chargement des candidats..." />
);

// AdminDashboard supprimé

export default function App() {
  return (
    <AuthProvider>
      <ProfileCacheProvider>
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
        <Route path="/pricing/recruiters" element={
          <PublicRoute>
            {/* Landing dédiée sans top bar */}
            <Layout hideFooter={true} hideTopBar={true}>
              <RecruiterPricingLanding />
            </Layout>
          </PublicRoute>
        } />
        
        {/* Redirections permanentes des anciennes routes Candidates */}
        <Route path="/candidates" element={<Navigate to="/my-profile/talent" replace />} />
        <Route path="/candidates/:id" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Redirection..." />}>
                <CandidateRedirect />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        {/* Route supprimée: /candidates/suggestions (système de suggestions pour candidats désactivé) */}
        <Route path="/add-profile" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement du formulaire de profil..." />}>
                <AddProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        {/* Routes pour le profil candidat avec onglets distincts */}
        <Route path="/my-profile" element={<Navigate to="/my-profile/profile" replace />} />
        <Route path="/my-profile/profile" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        {/* Alias: /my-profile/talent et /my-profile/talents pointent vers le même contenu */}
        <Route path="/my-profile/talent" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/talents" element={<Navigate to="/my-profile/talent" replace />} />
        <Route path="/my-profile/stats" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/plan" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/offer" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/offer/:id" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement de l'offre d'emploi..." />}>
                <OfferRoute />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/offers" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/forum" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<ProfileLoadingSpinner />}>
                <MyProfilePage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/my-profile/forum/:id" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement du post..." /> }>
                <ForumPostPage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/profile-stats" element={<Navigate to="/my-profile/stats" replace />} />
        {/* Détail candidat accessible sous my-profile/talent/ID */}
        <Route path="/my-profile/talent/:id" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement du profil candidat..." />}>
                <CandidateDetailPage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        {/* Dashboard recruteur: onglets en pages dédiées */}
        <Route path="/recruiter-dashboard" element={<Navigate to="/recruiter-dashboard/favorites" replace />} />
        <Route path="/recruiter-dashboard/favorites" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/appointments" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/myjobs" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/matching" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/plan" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        {/* Routes supplémentaires sous /recruiter-dashboard pour rester dans le scope dashboard */}
        <Route path="/recruiter-dashboard/talent" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        {/* Détail candidat sous le dashboard recruteur */}
        <Route path="/recruiter-dashboard/talent/:id" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement du profil candidat..." />}>
                <CandidateDetailPage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/offers" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoadingSpinner />}>
                <RecruiterDashboard />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/offers/new" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement du formulaire de publication..." />}>
                <PublishJobPage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter-dashboard/offer/:id" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement de l'offre..." />}>
                <JobDetailPage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/recruiter/search-analysis/:searchId" element={
          <Layout>
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Chargement de l'analyse de recherche..." />}>
                <SearchAnalysisPage />
              </Suspense>
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/forum" element={<Navigate to="/my-profile/forum" replace />} />
        <Route path="/forum/:id" element={<Navigate to="/my-profile/forum/:id" replace />} />
        <Route path="/jobs" element={<Navigate to="/recruiter-dashboard/offers" replace />} />
        <Route path="/jobs/new" element={<Navigate to="/recruiter-dashboard/offers/new" replace />} />
        <Route path="/jobs/:id" element={<Navigate to="/recruiter-dashboard/offer/:id" replace />} />
        <Route path="/talent" element={<Navigate to="/recruiter-dashboard/talent" replace />} />
        
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
      </ProfileCacheProvider>
    </AuthProvider>
  );
}// Force redeploy Tue Sep 16 16:06:43 CEST 2025
