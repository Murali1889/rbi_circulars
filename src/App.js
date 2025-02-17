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
                    <CircularList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/rbi/page/:page"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/rbi/circular/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularDetail />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Add more sections here with the same pattern */}
            {/* Example: SEBI section
            <Route
              path="/sebi/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SEBIRoutes />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            /> 
            */}

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