import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { PlanProvider } from './contexts/PlanContext'
import Header from './components/Layout/Header'
import LoadingScreen from './components/Common/LoadingScreen'
import { AnimatePresence } from 'framer-motion'

import HomePage from './pages/HomePage'

import DashboardPage from './pages/DashboardPage'
import SEOToolsPage from './pages/SEOToolsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import LeadsPage from './pages/LeadsPage'
import ReachOptimizationPage from './pages/ReachOptimizationPage'
import SocialInsightsPage from './pages/SocialInsightsPage'
import EnhancedSocialInsightsPage from './pages/EnhancedSocialInsightsPage'
import GrowthTipsPage from './pages/GrowthTipsPage'
import SentimentAnalysisPage from './pages/SentimentAnalysisPage'
import AdToolsDashboard from './pages/AdToolsDashboard'
import SettingsPage from './pages/SettingsPage'
import EmployeesPage from './pages/EmployeesPage'
import GeoBusinessAnalyzerPage from './pages/GeoBusinessAnalyzerPage'
import KnowledgeBucketPage from './pages/KnowledgeBucketPage'
import ContentPage from './pages/ContentPage'
import ProfilePage from './pages/ProfilePage'
import MarketplacePage from './pages/MarketplacePage'
import BusinessDetailPage from './pages/BusinessDetailPage'
import CustomerDashboard from './pages/CustomerDashboard'
import BusinessSignup from './pages/BusinessSignup'
import BusinessSignin from './pages/BusinessSignin'
import ProtectedUserRoute from './components/Auth/ProtectedUserRoute'
import ProtectedBusinessRoute from './components/Auth/ProtectedBusinessRoute'
import AuditLogsPage from './pages/AuditLogsPage'

import UserApplicationsPage from './pages/UserApplicationsPage'
import TimeTravelSimulator from './pages/TimeTravelSimulator'
import BusinessMetaversePage from './pages/BusinessMetaversePage'
import BusinessOrganismPage from './pages/BusinessOrganismPage'
import SEOMetaSpacePage from './pages/SEOMetaSpacePage'
import SEODigitalTreePage from './pages/SEODigitalTreePage'
import MetaversePage from './pages/MetaversePage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import RecruitmentDetailsPage from './pages/RecruitmentDetailsPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import ProductPage from './pages/ProductPage'
import JobListingPage from './pages/JobListingPage'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CompanySignup from './pages/CompanySignup'
import UserJobListingPage from './pages/UserJobListingPage'
import UserAppliedJobsPage from './pages/UserAppliedJobsPage'
import UserJobResponsesPage from './pages/UserJobResponsesPage'
import UserReplyToCompanyPage from './pages/UserReplyToCompanyPage'
import BusinessReplyToCandidatePage from './pages/BusinessReplyToCandidatePage'
import UserDashboard from './pages/UserDashboard'

import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AuthProvider>
      <PlanProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
              ) : (
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/list-business" element={<Navigate to="/business-signin" replace />} />
                      <Route path="/dashboard" element={
                        <ProtectedBusinessRoute>
                          <DashboardPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/customer-dashboard" element={<CustomerDashboard />} />

                      {/* User Authentication */}
                      <Route path="/user-login" element={<UserLogin />} />
                      <Route path="/user-signup" element={<UserSignup />} />
                      <Route path="/company-signup" element={<CompanySignup />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />

                      {/* User Dashboard and Job Applications - No Auth Required */}
                      <Route path="/user-dashboard" element={
                        <ProtectedUserRoute>
                          <UserDashboard />
                        </ProtectedUserRoute>
                      } />
                      <Route path="/user/job-listing" element={<UserJobListingPage />} />
                      <Route path="/user/applied-jobs" element={<UserAppliedJobsPage />} />
                      <Route path="/user/job-responses/:applicationId" element={<UserJobResponsesPage />} />
                      <Route path="/user/reply-to-company/:responseId" element={<UserReplyToCompanyPage />} />
                      <Route path="/business/reply-to-candidate/:responseId" element={<BusinessReplyToCandidatePage />} />

                      <Route path="/applications" element={
                        <ProtectedUserRoute>
                          <UserApplicationsPage />
                        </ProtectedUserRoute>
                      } />
                      <Route path="/business-signup" element={<BusinessSignup />} />
                      <Route path="/business-signin" element={<BusinessSignin />} />
                      <Route path="/marketplace" element={<MarketplacePage />} />
                      <Route path="/product/:productId" element={<ProductPage />} />
                      <Route path="/marketplace/business/:id" element={<BusinessDetailPage />} />
                      <Route path="/seo-tools" element={
                        <ProtectedBusinessRoute>
                          <SEOToolsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/seo-digital-tree" element={
                        <ProtectedBusinessRoute>
                          <SEODigitalTreePage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/seo-meta-space" element={
                        <ProtectedBusinessRoute>
                          <SEOMetaSpacePage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/metaverse" element={
                        <ProtectedBusinessRoute>
                          <MetaversePage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/analytics" element={
                        <ProtectedBusinessRoute>
                          <AnalyticsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/analytics/time-travel-simulator" element={
                        <ProtectedBusinessRoute>
                          <TimeTravelSimulator />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/analytics/business-metaverse" element={
                        <ProtectedBusinessRoute>
                          <BusinessMetaversePage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/analytics/business-organism" element={
                        <ProtectedBusinessRoute>
                          <BusinessOrganismPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/leads" element={
                        <ProtectedBusinessRoute>
                          <LeadsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/reach-optimization" element={
                        <ProtectedBusinessRoute>
                          <ReachOptimizationPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/recruitment" element={
                        <ProtectedBusinessRoute>
                          <JobListingPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/geo-analyzer" element={
                        <ProtectedBusinessRoute>
                          <GeoBusinessAnalyzerPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/knowledge-bucket" element={
                        <ProtectedBusinessRoute>
                          <KnowledgeBucketPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/social-insights-legacy" element={
                        <ProtectedBusinessRoute>
                          <SocialInsightsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/social-insights-enhanced" element={
                        <ProtectedBusinessRoute>
                          <EnhancedSocialInsightsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/growth-tips" element={
                        <ProtectedBusinessRoute>
                          <GrowthTipsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/sentiment-analysis" element={
                        <ProtectedBusinessRoute>
                          <SentimentAnalysisPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/ad-tools" element={
                        <ProtectedBusinessRoute>
                          <AdToolsDashboard />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedBusinessRoute>
                          <SettingsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/employees" element={
                        <ProtectedBusinessRoute>
                          <EmployeesPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/content" element={
                        <ProtectedBusinessRoute>
                          <ContentPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedBusinessRoute>
                          <ProfilePage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/recruitment-details" element={
                        <ProtectedBusinessRoute>
                          <RecruitmentDetailsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/product-details" element={
                        <ProtectedBusinessRoute>
                          <ProductDetailsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/audit-logs" element={
                        <ProtectedBusinessRoute>
                          <AuditLogsPage />
                        </ProtectedBusinessRoute>
                      } />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      <Route path="*" element={<HomePage />} />
                    </Routes>
                  </main>
                </>
              )}
            </AnimatePresence>
          </div>
        </ThemeProvider>
      </PlanProvider>
    </AuthProvider>
  )
}

export default App
