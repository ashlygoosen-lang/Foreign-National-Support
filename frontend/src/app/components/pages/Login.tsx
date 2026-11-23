import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { EASE, Spinner } from '../motion';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [idType, setIdType] = useState<'id' | 'passport'>('id');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(idNumber, password);
      toast.success(`Welcome back, ${user.firstName}`);
      const from = (location.state as any)?.from;
      navigate(from || (user.role === 'member' ? '/dashboard' : '/admin'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const requestReset = async () => {
    if (!idNumber) return setError('Enter your ID / passport number above first.');
    setError('');
    try {
      const r = await api('/auth/forgot', { method: 'POST', json: { identifier: idNumber } });
      setForgotMsg(r.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-gray-100 p-8">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }} className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
              <LogIn className="size-8 text-white" />
            </motion.div>
            <h2 className="mb-2">Member Login</h2>
            <p className="text-gray-600">Access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Type Selection */}
            <div>
              <label className="block mb-2">Login with:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIdType('id')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    idType === 'id'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  ID Number
                </button>
                <button
                  type="button"
                  onClick={() => setIdType('passport')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    idType === 'passport'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  Passport / Permit
                </button>
              </div>
            </div>

            {/* ID/Passport Number */}
            <div>
              <label htmlFor="idNumber" className="block mb-2">
                {idType === 'id' ? 'ID Number' : 'Passport / Permit Number'}
              </label>
              <input
                type="text"
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={idType === 'id' ? 'Enter your ID number' : 'Enter your passport number'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <button type="button" onClick={() => setForgotOpen((o) => !o)} className="aa-link text-emerald-600 hover:text-emerald-700">
                Forgot password?
              </button>
              <button type="button" onClick={() => { setForgotOpen(true); requestReset(); }} className="aa-link text-emerald-600 hover:text-emerald-700">
                Reset password
              </button>
            </div>

            <AnimatePresence>
              {forgotOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                  <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-900">
                    {forgotMsg ? (
                      <p className="flex gap-2"><CheckCircle className="size-5 shrink-0 text-emerald-600" />{forgotMsg}</p>
                    ) : (
                      <>
                        <p className="mb-3">Enter your ID / passport number above, then request a reset. Our support team will send you a secure reset link.</p>
                        <button type="button" onClick={requestReset} className="aa-btn bg-emerald-600 text-white px-4 py-2 rounded-lg">Request reset link</button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} transition={{ duration: 0.4 }} role="alert" className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                <AlertCircle className="size-5 shrink-0" /> {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="aa-btn w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Spinner />} {submitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Not registered yet?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
