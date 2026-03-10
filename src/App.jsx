import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Bills from './pages/Bills'
import Debts from './pages/Debts'
import Insights from './pages/Insights';
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import './index.css'

import Layout from './components/layout/Layout'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f3f5f8] text-[#0c2420] font-bold">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'System';
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'System') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else if (theme === 'Dark Mode') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes wrapped in layout and guard */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/debts" element={<Debts />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
