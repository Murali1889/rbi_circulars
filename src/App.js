// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CircularList from './components/CircularList';
import CircularDetail from './components/CircularDetails';
import Login from './components/Login';

const App = () => {
  return (
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <CircularList />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/page/:page"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <CircularList />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/circular/:id"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <CircularDetail />
                    </>
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