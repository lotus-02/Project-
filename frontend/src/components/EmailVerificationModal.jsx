import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EmailVerificationModal({ isOpen, onClose, initialEmail = '', devOtp = null }) {
  const { user, verifyEmail, resendEmailOtp } = useAuth();
  const email = initialEmail || user?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [currentDevOtp, setCurrentDevOtp] = useState(devOtp);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (devOtp) setCurrentDevOtp(devOtp);
  }, [devOtp]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      // Pasted multi-character code
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedDigits[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      if (inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await verifyEmail(email, fullOtp);
      setSuccess(res?.message || 'Email verified successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      const res = await resendEmailOtp(email);
      setSuccess('A new verification code has been sent!');
      if (res?.devOtp) setCurrentDevOtp(res.devOtp);
      setCooldown(60);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
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
        {/* Close Button */}
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
            <ShieldCheck className="w-6 h-6 text-[#00d4ff]" />
          </div>
          <h3 className="font-bold text-lg text-[#e8f4ff] tracking-tight">Verify Your Email</h3>
          <p className="text-xs text-[#8fa3bf] mt-1">
            We sent a 6-digit verification code to
          </p>
          <p className="text-xs font-semibold text-[#00d4ff] mt-0.5">{email || 'your email'}</p>
        </div>

        {/* Dev Mode OTP helper if SMTP not configured */}
        {currentDevOtp && (
          <div className="mb-4 p-2.5 rounded-xl border border-[#00d4ff30] bg-[#00d4ff08] text-center">
            <span className="text-[11px] text-[#4a6080]">Dev / Simulated Mode Code: </span>
            <span className="text-xs font-mono font-bold text-[#00d4ff] tracking-widest">{currentDevOtp}</span>
            <button
              type="button"
              onClick={() => {
                const digits = currentDevOtp.split('');
                setOtp(digits);
              }}
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

        {/* 6-digit OTP Inputs */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between items-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold font-mono rounded-xl vyuha-input focus:border-[#00d4ff] text-[#00d4ff]"
                style={{
                  boxShadow: digit ? '0 0 12px rgba(0, 212, 255, 0.2)' : 'none'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="btn-vyuha w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Code...' : 'Verify Email'}</span>
          </button>
        </form>

        {/* Resend Footer */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-xs text-[#4a6080] hover:text-[#00d4ff] transition inline-flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend verification code'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
