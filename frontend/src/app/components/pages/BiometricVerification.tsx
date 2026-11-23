import { useEffect, useState } from 'react';
import { Fingerprint, Shield, CheckCircle, Database, FileText, Upload, Lock, UserCheck, Search, Clock, AlertCircle, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import { api, fmtDateTime, tokenStore } from '../../lib/api';
import { EASE, Reveal, Stagger, StaggerItem } from '../motion';

type DocKey = 'photo' | 'birthCertificate' | 'passportId' | 'proofOfAddress';
type Picked = { file: File; preview: string | null } | null;

const DOCS: { key: DocKey; label: string; accept: string; hint: string }[] = [
  { key: 'photo', label: 'Applicant Photo', accept: 'image/*', hint: 'Upload Photo' },
  { key: 'birthCertificate', label: 'Birth Certificate', accept: 'image/*,application/pdf', hint: 'Upload Birth Certificate' },
  { key: 'passportId', label: 'Passport or ID Document', accept: 'image/*,application/pdf', hint: 'Upload Passport / ID' },
  { key: 'proofOfAddress', label: 'Proof of Address', accept: 'image/*,application/pdf', hint: 'Upload Proof of Address' },
];

const STATUS: Record<string, { label: string; tone: string; desc: string }> = {
  pending_review: { label: 'Under review', tone: 'bg-amber-100 text-amber-800', desc: 'A verification officer is reviewing your documents. This usually takes 1–3 working days.' },
  verified: { label: 'Verified', tone: 'bg-emerald-100 text-emerald-800', desc: 'Your identity has been verified.' },
  flagged: { label: 'Further information needed', tone: 'bg-red-100 text-red-800', desc: 'Our team needs to follow up with you. Please contact support.' },
  rejected: { label: 'Not approved', tone: 'bg-red-100 text-red-800', desc: 'Your verification could not be approved. Please contact support.' },
};

/** Upload with progress (fetch has no upload progress). */
function uploadWithProgress(url: string, form: FormData, onProgress: (p: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    const t = tokenStore.get();
    if (t) xhr.setRequestHeader('Authorization', `Bearer ${t}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data: any = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      xhr.status < 300 ? resolve(data) : reject(new Error(data?.error || 'Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Could not reach the server.'));
    xhr.send(form);
  });
}

export function BiometricVerification() {
  const { user } = useAuth();
  const [stage, setStage] = useState<'idle' | 'uploading' | 'submitted'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; status: string; createdAt: string } | null>(null);
  const [verificationData, setVerificationData] = useState({
    applicantName: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
  });
  const [files, setFiles] = useState<Record<DocKey, Picked>>({ photo: null, birthCertificate: null, passportId: null, proofOfAddress: null });

  useEffect(() => {
    if (user && !verificationData.applicantName) {
      setVerificationData((v) => ({
        ...v,
        applicantName: `${user.firstName} ${user.lastName}`,
        passportNumber: user.idNumber,
        nationality: user.nationality || '',
      }));
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setVerificationData({ ...verificationData, [e.target.name]: e.target.value });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: DocKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error('Files must be smaller than 8 MB.');
    setFiles((p) => ({ ...p, [key]: { file, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null } }));
  };

  const allDocs = DOCS.every((d) => files[d.key]);
  const allInfo = Object.values(verificationData).every((v) => v.trim());
  const ready = allDocs && allInfo;

  const submit = async () => {
    setError('');
    setStage('uploading');
    setProgress(0);
    const form = new FormData();
    Object.entries(verificationData).forEach(([k, v]) => form.append(k, v));
    DOCS.forEach((d) => form.append(d.key, files[d.key]!.file));
    try {
      const base = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const r = await uploadWithProgress(`${base}/api/verifications`, form, setProgress);
      setResult(r);
      setStage('submitted');
      toast.success('Verification submitted', { description: `Reference ${r.reference}` });
    } catch (e: any) {
      setError(e.message);
      setStage('idle');
    }
  };

  const reset = () => {
    setStage('idle');
    setResult(null);
    setFiles({ photo: null, birthCertificate: null, passportId: null, proofOfAddress: null });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
              className="relative bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/30">
              <span className="absolute inset-0 rounded-full bg-blue-500/40 aa-ping" />
              <Fingerprint className="size-10 text-white relative" />
            </motion.div>
            <h1 className="mb-2 font-display font-bold text-3xl md:text-4xl">Biometric Verification System</h1>
            <p className="text-gray-600">Identity & Document Verification for Membership</p>
          </div>

          {/* System Info Banner */}
          <Reveal className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <Shield className="size-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-900 mb-2 font-semibold">How verification works</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Submit your details and documents securely. A trained verification officer checks that your
                  photo, passport or permit, birth certificate and proof of address match. Fingerprints are captured
                  in person at a verification point if your application requires it.
                </p>
                <div className="bg-white p-3 rounded text-sm">
                  <strong>Tip:</strong> Use clear, well-lit photos or PDF scans. Blurry documents slow down review.
                </div>
              </div>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {stage !== 'submitted' ? (
              <motion.div key="form" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                {/* Applicant Information */}
                <div className="space-y-6 mb-8">
                  <h2 className="mb-4 font-display font-semibold text-xl">Applicant Information</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { name: 'applicantName', label: 'Full Name *', type: 'text', ph: 'As shown on passport' },
                      { name: 'passportNumber', label: 'Passport Number *', type: 'text', ph: 'Passport / permit number' },
                      { name: 'nationality', label: 'Nationality *', type: 'text', ph: 'e.g. Zimbabwean' },
                      { name: 'dateOfBirth', label: 'Date of Birth *', type: 'date', ph: '' },
                    ].map((f) => (
                      <div key={f.name}>
                        <label htmlFor={f.name} className="block mb-2">{f.label}</label>
                        <input
                          type={f.type}
                          id={f.name}
                          name={f.name}
                          value={(verificationData as any)[f.name]}
                          onChange={handleInputChange}
                          placeholder={f.ph}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="mt-8">
                  <h2 className="mb-4 font-display font-semibold text-xl">Required Documents Upload</h2>
                  <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded mb-6">
                    <p className="text-amber-800 text-sm">Please upload clear, legible copies of all required documents. All documents must be valid and current.</p>
                  </div>
                  <Stagger className="grid md:grid-cols-2 gap-6" stagger={0.07}>
                    {DOCS.map((d) => {
                      const f = files[d.key];
                      return (
                        <StaggerItem key={d.key}>
                          <label className="block mb-2">{d.label} *</label>
                          <motion.div layout className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors duration-300 ${f ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                            <AnimatePresence mode="wait" initial={false}>
                              {f ? (
                                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="space-y-2">
                                  {f.preview ? (
                                    <img src={f.preview} alt={d.label} className="w-32 h-32 object-cover mx-auto rounded-lg shadow" />
                                  ) : (
                                    <FileText className="size-16 text-green-600 mx-auto" />
                                  )}
                                  <p className="text-sm text-green-700 truncate">{f.file.name}</p>
                                  <button type="button" onClick={() => setFiles((p) => ({ ...p, [d.key]: null }))} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                                </motion.div>
                              ) : (
                                <motion.label key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cursor-pointer block py-4 group">
                                  <Upload className="size-12 text-gray-400 mx-auto mb-2 transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-blue-500" />
                                  <p className="text-sm text-gray-600">{d.hint}</p>
                                  <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF · max 8 MB</p>
                                  <input type="file" accept={d.accept} onChange={(e) => handleFileUpload(e, d.key)} className="hidden" />
                                </motion.label>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>
                </div>

                {/* Scanner / submit panel */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 my-8">
                  <div aria-hidden className="absolute inset-0 aa-grid opacity-10" />
                  <div className="relative text-center">
                    <div className={`relative w-56 h-56 md:w-64 md:h-64 rounded-2xl mx-auto mb-6 flex items-center justify-center border-4 overflow-hidden transition-colors duration-500 ${stage === 'uploading' ? 'bg-blue-950 border-blue-500' : ready ? 'bg-gray-700 border-emerald-500/70' : 'bg-gray-700 border-gray-600'}`}>
                      <Fingerprint className={`size-32 transition-colors duration-500 ${stage === 'uploading' ? 'text-blue-400' : ready ? 'text-emerald-400' : 'text-gray-500'}`} />
                      {stage === 'uploading' && (
                        <div aria-hidden className="aa-scanline absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent" />
                      )}
                    </div>

                    {stage === 'uploading' ? (
                      <div className="max-w-sm mx-auto">
                        <p className="text-blue-300 text-xl mb-3">Encrypting & uploading documents…</p>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400" animate={{ width: `${Math.max(progress * 100, 4)}%` }} transition={{ ease: EASE }} />
                        </div>
                        <p className="text-gray-400 text-sm mt-2">{Math.round(progress * 100)}%</p>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={submit}
                          disabled={!ready}
                          className="aa-btn bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-600"
                        >
                          Submit for Verification
                        </button>
                        <p className="text-gray-400 text-sm mt-4">Your documents are sent over an encrypted connection and only seen by verification staff.</p>
                        {!ready && (
                          <p className="text-amber-300 text-sm mt-2">
                            {!allInfo ? 'Complete all applicant fields' : 'Please upload all required documents'} before submitting
                          </p>
                        )}
                        {error && <p className="text-red-400 text-sm mt-3 flex items-center justify-center gap-2"><AlertCircle className="size-4" />{error}</p>}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              result && (
                <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="space-y-6 mb-8">
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                      className="w-40 h-40 rounded-2xl mx-auto mb-6 flex items-center justify-center border-4 border-emerald-500 bg-emerald-950">
                      <CheckCircle className="size-20 text-emerald-400" />
                    </motion.div>
                    <p className="text-emerald-400 text-2xl mb-2 font-display">Submission Received</p>
                    <p className="text-gray-300 text-sm mb-5">Keep this reference to track your verification.</p>
                    <button onClick={() => { navigator.clipboard?.writeText(result.reference); toast.success('Reference copied'); }}
                      className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 text-white font-mono text-lg px-5 py-3 rounded-xl transition-colors">
                      {result.reference} <Copy className="size-4" />
                    </button>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="text-blue-900 mb-4 font-semibold">Applicant Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <Info k="Full Name" v={verificationData.applicantName} />
                      <Info k="Passport Number" v={verificationData.passportNumber} />
                      <Info k="Nationality" v={verificationData.nationality} />
                      <Info k="Date of Birth" v={verificationData.dateOfBirth} />
                      <Info k="Submitted" v={fmtDateTime(result.createdAt)} />
                      <Info k="Status" v={STATUS[result.status]?.label} />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold mb-5">What happens next</h3>
                    <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                      {[
                        { t: 'Documents received', d: 'Your submission is stored securely.', done: true },
                        { t: 'Officer review', d: STATUS.pending_review.desc, done: false },
                        { t: 'Outcome', d: 'You will see the result in your dashboard and can check it here with your reference.', done: false },
                      ].map((s, i) => (
                        <motion.li key={s.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12, ease: EASE }} className="ml-6">
                          <span className={`absolute -left-[11px] size-5 rounded-full ring-4 ring-white ${s.done ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <p className="font-medium">{s.t}</p>
                          <p className="text-sm text-gray-600">{s.d}</p>
                        </motion.li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center pt-2">
                    <button onClick={reset} className="aa-btn bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700">New Submission</button>
                    {user ? (
                      <Link to="/dashboard" className="aa-btn bg-emerald-600 text-white px-8 py-3 rounded-lg">Go to Dashboard</Link>
                    ) : (
                      <Link to="/register" className="aa-btn bg-emerald-600 text-white px-8 py-3 rounded-lg">Create an Account</Link>
                    )}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          <StatusChecker />

          {/* System Information */}
          <div className="mt-8 bg-gray-50 p-6 rounded-xl">
            <h3 className="mb-6 font-semibold">System Integration</h3>
            <Stagger className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Lock, t: 'Encrypted upload & storage' },
                { icon: UserCheck, t: 'Reviewed by trained officers' },
                { icon: Database, t: 'Track status with your reference' },
              ].map((x) => (
                <StaggerItem key={x.t} className="text-center">
                  <x.icon className="size-10 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm">{x.t}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v?: string }) {
  return (
    <div>
      <p className="text-blue-700">{k}</p>
      <p className="text-blue-900 font-medium">{v || '—'}</p>
    </div>
  );
}

function StatusChecker() {
  const [ref, setRef] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState('');
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(''); setRes(null);
    try {
      setRes(await api(`/verifications/status?reference=${encodeURIComponent(ref.trim())}&passportNumber=${encodeURIComponent(pass.trim())}`));
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <Reveal className="mt-8 border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold mb-1 flex items-center gap-2"><Search className="size-5 text-blue-600" />Check Verification Status</h3>
      <p className="text-sm text-gray-600 mb-4">Enter the reference you received and your passport number.</p>
      <form onSubmit={check} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Reference, e.g. VR-…" required className="p-3 border border-gray-300 rounded-lg" />
        <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passport number" required className="p-3 border border-gray-300 rounded-lg" />
        <button disabled={busy} className="aa-btn bg-blue-600 text-white px-6 py-3 rounded-lg">{busy ? 'Checking…' : 'Check'}</button>
      </form>
      <AnimatePresence>
        {res && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <p className="font-medium">{res.applicantName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="size-4" /> Updated {fmtDateTime(res.updatedAt)}</p>
                <p className="text-sm text-gray-600 mt-1">{res.note || STATUS[res.status]?.desc}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${STATUS[res.status]?.tone}`}>{STATUS[res.status]?.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
    </Reveal>
  );
}
