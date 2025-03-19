import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CircularList from './components/CircularList';
import CircularDetail from './components/CircularDetails';
import Login from './components/Login';
import DashboardLayout from './components/Dashboard';

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Redirect root to RBI */}
            <Route path="/" element={<Navigate to="/rbi" replace />} />

            {/* Protected RBI routes */}
            <Route
              path="/rbi"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList type="rbi" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/rbi/page/:page"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList type="rbi" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/rbi/circular/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularDetail type="rbi" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected SEBI routes */}
            <Route
              path="/sebi"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList type="sebi" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sebi/page/:page"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList type="sebi" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sebi/circular/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularDetail type="sebi" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - 404 */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <h1 className="text-4xl font-bold text-gray-800">404</h1>
                  <p className="text-gray-600 mt-2">Page not found</p>
                </div>
              }
            />
          </Routes>
        </div>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;