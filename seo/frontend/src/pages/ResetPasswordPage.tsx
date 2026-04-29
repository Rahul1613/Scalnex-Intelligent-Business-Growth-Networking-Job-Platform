import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Mail } from 'lucide-react';
import Button from '../components/Common/Button';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Verify OTP, 2 = Reset Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const resp = await fetch('http://127.0.0.1:5001/api/auth/verify-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }
      setSuccess(data.message || 'OTP Verified! Enter your new password.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      if(step !== 2) setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const resp = await fetch('http://127.0.0.1:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      setSuccess(data.message || 'Password reset successful!');
      setTimeout(() => navigate('/user-login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-800 opacity-90"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Create your new <br /><span className="text-blue-200">password.</span></h1>
          <p className="text-lg text-blue-100 mb-10 leading-relaxed">
            Ensure your account stays secure by choosing a strong password.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/user-login')} className="mb-6 text-sm flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            ← Back to Login
          </button>
          
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4"
            >
              <ShieldCheck className="w-8 h-8" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 1 ? 'Verify Code' : 'Set New Password'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {step === 1 ? 'Enter the 6-digit code sent to your email.' : 'Please enter your new password below.'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl text-sm justify-between flex items-center"
            >
              {success} {success.includes("successful") && <span className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />}
            </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    readOnly={!!location.state?.email}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">6-Digit Code</label>
                <div className="relative flex justify-center py-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full max-w-[200px] text-center tracking-[1em] font-mono text-2xl py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="000000"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading || code.length < 6} className="w-full py-3.5 text-base shadow-lg shadow-blue-500/20">
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={loading || !newPassword} className="w-full py-3.5 text-base shadow-lg shadow-blue-500/20">
                {loading ? 'Reseting...' : 'Set New Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
