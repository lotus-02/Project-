import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    organizationName: '', name: '', email: '', password: ''
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { registerOrganization } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await registerOrganization(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'organizationName', label: 'Organization Name', icon: Building2, type: 'text',     ph: 'Acme Corporation' },
    { key: 'name',             label: 'Admin Full Name',   icon: User,       type: 'text',     ph: 'Alex Mercer' },
    { key: 'email',            label: 'Admin Email',       icon: Mail,       type: 'email',    ph: 'admin@acme.com' },
    { key: 'password',         label: 'Password (min 8)',  icon: Lock,       type: 'password', ph: '••••••••', minLength: 8 },
  ];

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
          <h2 className="text-lg font-bold text-[#e8f4ff] tracking-tight">Create New Organization</h2>
          <p className="mt-1 text-xs text-[#4a6080]">
            Provision an isolated tenant with automated ADMIN access
          </p>
        </div>

        <div className="vyuha-card rounded-2xl py-8 px-6 sm:px-10 animate-slide-in"
          style={{border:'1px solid rgba(0,212,255,0.15)', boxShadow:'0 0 40px rgba(0,102,255,0.08)'}}>

          {/* Security notice */}
          <div className="mb-5 p-3 rounded-xl flex items-start space-x-2.5 text-xs"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <ShieldCheck className="w-4 h-4 text-[#a78bfa] shrink-0 mt-0.5" />
            <p className="text-[#a78bfa] leading-relaxed">
              Only organization creation is allowed here. Members are added securely by the Admin from the <span className="font-bold">Team</span> page after login.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl border text-xs text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {fields.map(({ key, label, icon: Icon, type, ph, minLength }) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                  {label} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a6080]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <input type={type} required minLength={minLength} value={formData[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={ph}
                    className="vyuha-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs" />
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="btn-vyuha w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-xl text-xs">
                <span>{loading ? 'Creating Organization...' : 'Register Organization'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#0d2040] text-center">
            <p className="text-xs text-[#4a6080]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#00d4ff] hover:text-white transition"
                style={{textShadow:'0 0 8px rgba(0,212,255,0.4)'}}>
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
