import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import { EASE, Spinner } from '../motion';

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const r = await api('/auth/reset', { method: 'POST', json: { token, password } });
      setDone(r.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><KeyRound className="size-8 text-white" /></div>
            <h2 className="mb-2 font-display font-semibold text-2xl">Set a New Password</h2>
          </div>
          {!token ? (
            <p className="text-center text-gray-600">This page needs the reset link sent by our support team. <Link to="/login" className="text-emerald-600">Back to login</Link></p>
          ) : done ? (
            <div className="text-center">
              <CheckCircle className="size-12 text-emerald-600 mx-auto mb-3" />
              <p className="mb-6">{done}</p>
              <Link to="/login" className="aa-btn inline-flex bg-emerald-600 text-white px-6 py-3 rounded-lg">Go to login</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="np" className="block mb-2">New password</label>
                <input id="np" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="cp" className="block mb-2">Confirm password</label>
                <input id="cp" type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              {error && <p role="alert" className="flex gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm"><AlertCircle className="size-5 shrink-0" />{error}</p>}
              <button disabled={busy} className="aa-btn w-full bg-emerald-600 text-white p-3 rounded-lg inline-flex items-center justify-center gap-2">{busy && <Spinner />} Update password</button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
