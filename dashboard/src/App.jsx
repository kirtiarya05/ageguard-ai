import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppManager from './pages/AppManager';
import RulesManager from './pages/RulesManager';
import SleepScheduler from './pages/SleepScheduler';
import WeeklyReport from './pages/WeeklyReport';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import { ChildProvider } from './components/ChildContext';

// Layout wrapper that includes the sidebar for all protected pages
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh' }}>
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <ChildProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected — all wrapped in AppLayout (sidebar) */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/app-manager" element={
            <PrivateRoute>
              <AppLayout><AppManager /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/rules" element={
            <PrivateRoute>
              <AppLayout><RulesManager /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/sleep" element={
            <PrivateRoute>
              <AppLayout><SleepScheduler /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/report" element={
            <PrivateRoute>
              <AppLayout><WeeklyReport /></AppLayout>
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ChildProvider>
    </Router>
  );
}

export default App;
