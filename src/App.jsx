import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import QuizList from './components/QuizList';
import TakeQuiz from './components/TakeQuiz';
import ManageQuiz from './components/ManageQuiz';
import ManageQuestion from './components/ManageQuestion';
import History from './components/History';
import Leaderboard from './components/Leaderboard';
import AdminDashboard from './components/AdminDashboard';
import AdminUserResults from './components/AdminUserResults'
import UserProfile from './components/UserProfile';

// 🔒 Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role , isAuthenticated} = useAuth();

  // 1. Agar logged in nahi hai, toh direct /login par bhejo
  if ( !isAuthenticated ) {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar specific role required hai (e.g. ADMIN) aur user ke paas wo role nahi hai
  if (allowedRole) {
    const rawRole = role || localStorage.getItem('userRole') || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');
    const requiredRoles = (Array.isArray(allowedRole) ? allowedRole : [allowedRole])
      .map((r) => r.toUpperCase().replace(/^ROLE_/, ''));

    
   
    
    const hasPermission = requiredRoles.includes(userRole);
    if (!hasPermission) {
      return (
        <div style={{ textAlign: 'center', marginTop: '3rem', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#e53e3e' }}>403 - Access Denied</h2>
          <p style={{ color: '#4a5568' }}>Aapke paas is page ko access karne ki permission nahi hai.</p>
        </div>
      );
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />


          <Route
            path="/register"
            element={
                <Register />           
            }
          />


          <Route 
            path="/login" 
            element={
                <Login />
            } 
          />


          {/* User & Admin Protected Routes */}
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute allowedRole={['USER', 'ADMIN']}>
                <QuizList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRole={['USER', 'ADMIN']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/take-quiz/:id"
            element={
              <ProtectedRoute allowedRole={['USER', 'ADMIN']}>
                <TakeQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRole={['USER', 'ADMIN']}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute allowedRole={['USER', 'ADMIN']}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-Only Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminUserResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-quiz"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <ManageQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-question/:quizId"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <ManageQuestion />
              </ProtectedRoute>
            }
          />

          {/* Unknown Routes Handler */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;