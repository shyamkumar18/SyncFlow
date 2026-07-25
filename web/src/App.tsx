import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MailCenterPage = lazy(() => import('./pages/MailCenterPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const HelpCentrePage = lazy(() => import('./pages/HelpCentrePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const EmailConnectionPage = lazy(() => import('./pages/EmailConnectionPage'));
const ReviewQueuePage = lazy(() => import('./pages/ReviewQueuePage'));
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse-soft">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
              <Route path="/mail" element={<ErrorBoundary><MailCenterPage /></ErrorBoundary>} />
              <Route path="/transactions" element={<ErrorBoundary><TransactionsPage /></ErrorBoundary>} />
              <Route path="/analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
              <Route path="/budgets" element={<ErrorBoundary><BudgetsPage /></ErrorBoundary>} />
              <Route path="/help" element={<ErrorBoundary><HelpCentrePage /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="/email-connection" element={<ErrorBoundary><EmailConnectionPage /></ErrorBoundary>} />
              <Route path="/review" element={<ErrorBoundary><ReviewQueuePage /></ErrorBoundary>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
