import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setDevOtp(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Request reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message || 'Reset code sent to your email!');
      if (res?.devOtp) setDevOtp(res.devOtp);
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP & new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, otp, newPassword);
      setSuccess(res.message || 'Password reset successfully! You can now log in.');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl p-6 relative border border-[#00d4ff30] shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #080c16 0%, #03040a 100%)',
          boxShadow: '0 0 50px rgba(0, 212, 255, 0.15)'
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4a6080] hover:text-[#00d4ff] hover:bg-[#00d4ff10] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border border-[#00d4ff30] mb-3"
            style={{ background: 'rgba(0,212,255,0.08)', boxShadow: '0 0 20px rgba(0,212,255,0.25)' }}
          >
            <KeyRound className="w-6 h-6 text-[#00d4ff]" />
          </div>
          <h3 className="font-bold text-lg text-[#e8f4ff] tracking-tight">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h3>
          <p className="text-xs text-[#8fa3bf] mt-1">
            {step === 1
              ? 'Enter your work email and we will send you a 6-digit recovery code'
              : `Enter the 6-digit code sent to ${email} and choose a new password`}
          </p>
        </div>

        {/* Dev OTP Pill */}
        {devOtp && step === 2 && (
          <div className="mb-4 p-2.5 rounded-xl border border-[#00d4ff30] bg-[#00d4ff08] text-center">
            <span className="text-[11px] text-[#4a6080]">Dev / Simulated Mode Code: </span>
            <span className="text-xs font-mono font-bold text-[#00d4ff] tracking-widest">{devOtp}</span>
            <button
              type="button"
              onClick={() => setOtp(devOtp)}
              className="ml-2 text-[10px] text-[#0066ff] underline hover:text-[#00d4ff]"
            >
              (Auto-fill)
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border-red-500/25">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl border flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border-emerald-500/25">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Request OTP */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a6080]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="vyuha-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-vyuha w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending Code...' : 'Send Recovery Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Reset Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                6-Digit Recovery Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="vyuha-input w-full py-2.5 px-4 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#00d4ff]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                New Password (min 8 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a6080]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vyuha-input w-full pl-10 pr-10 py-2.5 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#4a6080] hover:text-[#00d4ff] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a6080]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vyuha-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8fa3bf] hover:text-[#e8f4ff] bg-[#0d2040]/50 hover:bg-[#0d2040] transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-vyuha flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Resetting Password...' : 'Reset & Save Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
