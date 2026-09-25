import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TasksPage from './pages/TasksPage';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#03040a' }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center shadow-lg"
              style={{boxShadow:'0 0 20px rgba(0,212,255,0.4)'}}>
              <span className="text-[#03040a] font-black text-base">V</span>
            </div>
            <h1 className="font-black text-lg tracking-widest text-[#e8f4ff]">VY<span className="text-[#00d4ff]">Ū</span>HA</h1>
          </div>
          <div className="flex space-x-1.5">
            {[0,1,2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-bounce"
                style={{ animationDelay: `${i*0.15}s`, boxShadow: '0 0 6px #00d4ff' }} />
            ))}
          </div>
          <p className="text-[11px] text-[#4a6080] tracking-widest uppercase">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#03040a' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto" style={{ background: '#03040a' }}>
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/projects"     element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks"        element={<TasksPage />} />
            <Route path="/team"         element={<Team />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/*"        element={<ProtectedLayout />} />
    </Routes>
  );
}
