import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const VerifyEmailPage: React.FC = () => {
  const { verifyEmail, resendOtp } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = useMemo(() => params.get('email') || '', [params]);
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60); // resend cooldown seconds

  useEffect(() => {
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const devOtp = params.get('dev_otp');
    if (devOtp && devOtp.length === 6) {
      setDigits(devOtp.split('').slice(0, 6));
      setMessage(`Use code ${devOtp} to verify`);
    } else if (initialEmail) {
      (async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: initialEmail })
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.dev_otp && String(data.dev_otp).length === 6) {
            const codeStr = String(data.dev_otp);
            setDigits(codeStr.split('').slice(0, 6));
            setMessage('A verification code has been sent. (Dev mode: code prefilled)');
            setCooldown(60);
          }
        } catch {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  const code = digits.join('');

  const handleChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (val && index < 5) {
      const el = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
      el?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const el = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;
      el?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email || code.length !== 6) {
      setError('Enter your email and 6-digit code');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await verifyEmail(email, code);
      if (ok) {
        setMessage('Email verified! You can now log in.');
        // Redirect to login/home after short delay
        setTimeout(() => navigate('/user-login'), 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setError(null);
    setMessage(null);
    try {
      await resendOtp(email);
      setMessage('A new code has been sent to your email');
      setCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Could not resend code');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verify your email</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">We sent a 6-digit code to your email. Enter it below to verify.</p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Verification code</label>
          <div className="flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                id={`otp-${i}`}
                autoComplete="one-time-code"
                className="w-12 h-12 text-center text-xl border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            ))}
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">{message}</div>
        )}
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={cooldown > 0}
          onClick={handleResend}
          className="text-blue-600 dark:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-600"
        >
          {cooldown > 0 ? `Resend in ${formatTime(cooldown)}` : 'Resend code'}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
