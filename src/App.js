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
import NotFound from './components/NotFound';

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

<Route
              path="/irdai"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList type="irdai" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/irdai/page/:page"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularList type="irdai" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/irdai/circular/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CircularDetail type="irdai" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;