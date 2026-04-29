import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';

const BusinessSignup: React.FC = () => {
  const navigate = useNavigate();
  const { companySignup } = useAuth();
  
  // Steps: 'email' -> 'otp' -> 'details' -> 'password'
  const [step, setStep] = useState<'email' | 'otp' | 'details' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website] = useState('');
  const [description] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid OTP');
      
      setStep('details');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await companySignup({
        email,
        password,
        companyName,
        industry,
        location,
        website: website || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        description: description || `Professional ${industry} services based in ${location}`
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">List your business <br /><span className="text-blue-200">and reach thousands.</span></h1>
          <p className="text-lg text-blue-100 mb-10 leading-relaxed">
            Join our All-in-one AI Growth Platform and get discovered by customers looking for your services.
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4"
            >
              {step === 'email' ? <Mail className="w-8 h-8" /> :
               step === 'otp' ? <ShieldCheck className="w-8 h-8" /> :
               <Building2 className="w-8 h-8" />}
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 'email' ? 'Business Registration' :
               step === 'otp' ? 'Verify Business Email' :
               'Business Details'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {step === 'email' ? 'Enter your business email to get started' :
               step === 'otp' ? `Verification code sent to ${email}` :
               'Complete your business profile'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP}
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="business@company.com"
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Verification OTP'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Verification Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none tracking-[0.5em] text-center text-xl font-bold"
                      placeholder="000000"
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="text-center">
                  <button type="button" onClick={() => setStep('email')} className="text-sm text-blue-600 font-medium">Change Email</button>
                </div>
              </motion.form>
            )}

            {(step === 'details' || step === 'password') && (
              <motion.form
                key="form-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={step === 'details' ? (e) => { e.preventDefault(); setStep('password'); } : handleSubmit}
                className="space-y-5"
              >
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {step === 'details' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Company Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                          placeholder="Your Company Name"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Industry"
                      />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Location"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Create Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Creating Account...' : 'Complete Registration'}
                    </Button>
                    <button type="button" onClick={() => setStep('details')} className="w-full text-sm text-gray-500">Back to details</button>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have a business account?{' '}
              <button
                onClick={() => navigate('/business-signin')}
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSignup;
