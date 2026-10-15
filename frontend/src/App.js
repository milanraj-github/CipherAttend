import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import FaceCapture from './components/FaceCapture';
import MarkAttendance from './components/MarkAttendance';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import UserProfile from './components/UserProfile';
import UserAttendance from './components/UserAttendance';
import ProjectInformation from './components/ProjectInformation';
import AdminCryptoLab from './components/AdminCryptoLab';
import Navbar from './components/Navbar';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Layout component - adds top padding for fixed navbar on non-home pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <Box sx={{ pt: isHome ? 0 : '72px' }}>
      {children}
    </Box>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in for this tab (sessionStorage provides per-tab isolation)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        // Ensure this tab's sessionStorage has the active session
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(parsed));
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    // Use sessionStorage so each tab maintains its own independent session
    // (allows presenting Admin and Student dashboards in separate tabs simultaneously)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    // Clear global localStorage to prevent overwriting or interfering with other tabs
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const authValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    token: sessionStorage.getItem('token') || localStorage.getItem('token')
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        Loading...
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <AppLayout>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/project-info" element={<ProjectInformation />} />
          <Route path="/info" element={<Navigate to="/project-info" replace />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
          
          {/* Protected Routes - Admin Only */}
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/cryptography-lab" 
            element={user && user.role === 'admin' ? <AdminCryptoLab /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/crypto-lab" 
            element={<Navigate to="/admin/cryptography-lab" replace />} 
          />
          
          {/* Protected Routes - All Users */}
          <Route 
            path="/dashboard" 
            element={user ? (user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />) : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <UserProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/attendance" 
            element={user ? <UserAttendance /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/face-capture" 
            element={user ? <FaceCapture /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/mark-attendance" 
            element={<MarkAttendance />} 
          />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </AuthContext.Provider>
  );
}

export default App; 