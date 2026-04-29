import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';

const BusinessSignin: React.FC = () => {
  const navigate = useNavigate();
  const { companyLogin, guestBusinessLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await companyLogin(email, password);
      
      // After successful signin, redirect to main dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signin failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome back <br /><span className="text-purple-200">to your business.</span></h1>
          <p className="text-lg text-purple-100 mb-10 leading-relaxed">
            Sign in to manage your business listing and connect with customers.
          </p>
        </div>
      </div>

      {/* Right Panel - Signin Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4"
            >
              <Building2 className="w-8 h-8" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Business Sign In</h2>
            <p className="text-gray-500 dark:text-gray-400">Access your business account to manage your listing</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                  placeholder="business@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-medium text-purple-600 hover:text-purple-500">Forgot password?</button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base shadow-lg shadow-purple-500/20"
              style={{ backgroundColor: '#7C3AED' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Business Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <Button
              type="button"
              disabled={loading}
              variant="outline"
              className="w-full py-3.5 text-base"
              onClick={() => {
                guestBusinessLogin();
                navigate('/dashboard');
              }}
            >
              <span className="flex items-center gap-2">
                Continue as Guest Business
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have a business account?{' '}
              <button
                onClick={() => navigate('/business-signup')}
                className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSignin;
