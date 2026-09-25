import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const ROLE_COLORS = {
  ADMIN:   { color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.25)' },
  MANAGER: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  MEMBER:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
  VIEWER:  { color: '#4a6080', bg: 'rgba(74,96,128,0.08)',  border: 'rgba(74,96,128,0.25)' },
};

export default function Login() {
  const [step,     setStep]     = useState(1); // 1 = credentials, 2 = role confirm
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [preview,  setPreview]  = useState(null); // { orgName, role, user, accessToken, refreshToken }

  const { login, setUserFromData } = useAuth();
  const navigate = useNavigate();

  // Step 1 — validate credentials, get org+role preview
  const handleCredentials = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen vyuha-ambient flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center"
              style={{boxShadow:'0 0 24px rgba(0,212,255,0.5)'}}>
              <span className="text-[#03040a] font-black text-xl">V</span>
            </div>
            <h1 className="font-black text-3xl tracking-widest text-[#e8f4ff]">
              VY<span className="text-[#00d4ff]" style={{textShadow:'0 0 16px #00d4ff'}}>Ū</span>HA
            </h1>
          </div>
          <h2 className="text-lg font-bold text-[#e8f4ff] tracking-tight">Sign in to your workspace</h2>
          <p className="mt-1 text-xs text-[#4a6080]">
            Your organization is auto-detected from your credentials
          </p>
        </div>

        <div className="vyuha-card rounded-2xl py-8 px-6 sm:px-10 animate-slide-in"
          style={{border:'1px solid rgba(0,212,255,0.15)', boxShadow:'0 0 40px rgba(0,102,255,0.08)'}}>

          {error && (
            <div className="mb-5 p-3 rounded-xl border text-xs text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleCredentials}>
            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a6080]">
                  <Mail className="w-4 h-4" />
                </div>
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className="vyuha-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a6080]">
                  <Lock className="w-4 h-4" />
                </div>
                <input type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vyuha-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            {/* Auto-detect hint */}
            <div className="flex items-center space-x-2 text-[10px] text-[#4a6080] py-1">
              <Building2 className="w-3.5 h-3.5 text-[#0066ff]" />
              <span>Organization &amp; role auto-detected from your account</span>
            </div>

            <button type="submit" disabled={loading}
              className="btn-vyuha w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-xl text-xs">
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#0d2040] text-center">
            <p className="text-xs text-[#4a6080]">
              New to VYŪHA?{' '}
              <Link to="/register" className="font-semibold text-[#00d4ff] hover:text-white transition"
                style={{textShadow:'0 0 8px rgba(0,212,255,0.4)'}}>
                Create or Join an organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
