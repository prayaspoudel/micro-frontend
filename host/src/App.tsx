import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '@shared/state';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import SSOCallback from './pages/SSOCallback';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import SearchResults from './pages/SearchResults';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ProtectedModuleRoute from './components/ProtectedModuleRoute/ProtectedModuleRoute';
import RemoteErrorBoundary from './components/RemoteErrorBoundary/RemoteErrorBoundary';
import { initializeModuleRegistry } from './utils/ModuleRegistry';
import { SharedModuleLoader } from './utils/SharedModuleLoader';

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { initializeAppState } = useAppStore();

  useEffect(() => {
    initializeAuth();
    initializeAppState();
    
    // Initialize module registry for runtime loading
    initializeModuleRegistry();
  }, [initializeAuth, initializeAppState]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* SSO Callback Route */}
          <Route 
            path="/callback" 
            element={<SSOCallback />} 
          />
          
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="company/search" element={<SearchResults />} />
              <Route path="company/:id" element={<CompanyProfile />} />
              
              {/* Micro frontend routes with access control */}
              <Route 
                path="crm/*" 
                element={
                  <ProtectedModuleRoute moduleId="crm">
                    <RemoteErrorBoundary remoteName="CRM">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SharedModuleLoader.CRMApp />
                      </Suspense>
                    </RemoteErrorBoundary>
                  </ProtectedModuleRoute>
                } 
              />
              <Route 
                path="inventory/*" 
                element={
                  <ProtectedModuleRoute moduleId="inventory">
                    <RemoteErrorBoundary remoteName="Inventory">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SharedModuleLoader.InventoryApp />
                      </Suspense>
                    </RemoteErrorBoundary>
                  </ProtectedModuleRoute>
                } 
              />
              <Route 
                path="hr/*" 
                element={
                  <ProtectedModuleRoute moduleId="hr">
                    <RemoteErrorBoundary remoteName="HR">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SharedModuleLoader.HRApp />
                      </Suspense>
                    </RemoteErrorBoundary>
                  </ProtectedModuleRoute>
                } 
              />
              <Route 
                path="finance/*" 
                element={
                  <ProtectedModuleRoute moduleId="finance">
                    <RemoteErrorBoundary remoteName="Finance">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SharedModuleLoader.FinanceApp />
                      </Suspense>
                    </RemoteErrorBoundary>
                  </ProtectedModuleRoute>
                } 
              />
              <Route 
                path="task/*" 
                element={
                  <ProtectedModuleRoute moduleId="task">
                    <RemoteErrorBoundary remoteName="Task">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SharedModuleLoader.TaskApp />
                      </Suspense>
                    </RemoteErrorBoundary>
                  </ProtectedModuleRoute>
                } 
              />
              <Route 
                path="health/*" 
                element={
                  <ProtectedModuleRoute moduleId="health">
                    <RemoteErrorBoundary remoteName="Health">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SharedModuleLoader.HealthApp />
                      </Suspense>
                    </RemoteErrorBoundary>
                  </ProtectedModuleRoute>
                } 
              />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
