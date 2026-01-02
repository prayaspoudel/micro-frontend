import React, { useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider, MenuBar, SafeWrapper } from '@shared/ui-components';
import { useAppStore } from '@shared/state';
import { healthTheme } from './theme';

import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Contacts from './pages/Contacts';
import Appointments from './pages/Appointments';

interface HealthAppProps {
  basename?: string;
}

const HealthApp = ({ basename }: HealthAppProps) => {
  const { initializeAppState } = useAppStore();
  
  // Initialize app state when Health module loads
  useEffect(() => {
    initializeAppState();
  }, [initializeAppState]);

  // Check if we're running as a standalone app or as a micro frontend
  const currentPort = window.location.port;
  const isStandalone = currentPort === '3006';
  
  const AppContent = () => {
    const location = useLocation();
    
    return (
      <SafeWrapper fallback={<div>Loading Health Module...</div>}>
        <ThemeProvider moduleTheme={healthTheme}>
        <div className="health-app">
          <MenuBar 
            moduleId="health" 
            currentPath={location.pathname}
          />
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetails />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="appointments" element={<Appointments />} />
          </Routes>
        </div>
        </ThemeProvider>
      </SafeWrapper>
    );
  };

  if (isStandalone) {
    return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename={basename}>
      <AppContent />
    </BrowserRouter>
  );
};

export default HealthApp;
