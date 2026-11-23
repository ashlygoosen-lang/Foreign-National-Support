import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Heart, GraduationCap, FileText, User, LogOut, CheckCircle, Clock, AlertTriangle, ShieldCheck, Copy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { api, fmtDate, fmtPeriod, openDocument, rand } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { CountUp, EASE, Spinner, Stagger, StaggerItem } from '../motion';

type Contribution = { id: string; period: string; amount: number; status: 'pending' | 'paid' | 'rejected'; reference: string; method: string; createdAt: string };
type Summary = {
  user: any;
  plan: { key: string; name: string; monthly: number };
  status: 'Active' | 'Pending' | 'Overdue';
  nextPaymentDate: string;
  nextPeriod: string;
  totalPaid: number;
  contributions: Contribution[];
  verification: { reference: string; status: string; updatedAt: string } | null;
};
type Doc = { type: string; id: string; name: string; date: string };

const tabs = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'contributions', label: 'Contributions', icon: CreditCard },
  { key: 'healthcare', label: 'Healthcare', icon: Heart },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'documents', label: 'Documents', icon: FileText },
];

const statusStyle: Record<string, string> = {
  Active: 'text-emerald-600',
  Pending: 'text-amber-600',
  Overdue: 'text-red-600',
};
const vStatus: Record<string, { label: string; cls: string }> = {
  pending_review: { label: 'Under review', cls: 'bg-amber-100 text-amber-800' },
  verified: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-800' },
  flagged: { label: 'Needs attention', cls: 'bg-red-100 text-red-800' },
  rejected: { label: 'Not approved', cls: 'bg-red-100 text-red-800' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<Summary | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [apps, setApps] = useState<{ enrollments: any[]; referrals: any[] }>({ enrollments: [], referrals: [] });
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, d, a] = await Promise.all([api<Summary>('/member/summary'), api<Doc[]>('/documents'), api('/member/applications')]);
      setData(s);
      setDocs(d);
      setApps(a);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (error) return <div className="max-w-xl mx-auto py-24 text-center text-red-600">{error}</div>;
  if (!data) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-28 bg-white rounded-lg" />
          <div className="grid lg:grid-cols-4 gap-6"><div className="h-72 bg-white rounded-lg" /><div className="lg:col-span-3 h-72 bg-white rounded-lg" /></div>
        </div>
      </div>
    );
  }

  const u = data.user;
  const healthcare = ['healthcare', 'both'].includes(u.plan);
  const education = ['school', 'both'].includes(u.plan);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div aria-hidden className="aa-orb aa-orb-a opacity-60" />
          <div className="relative flex justify-between items-start gap-4">
            <div>
              <h2 className="mb-2 text-white font-display font-semibold text-2xl md:text-3xl">Welcome, {u.firstName} {u.lastName}</h2>
              <p className="text-emerald-50">Member ID: {u.memberNumber} · {u.idType === 'id' ? 'ID' : 'Passport'} {u.idNumber}</p>
              <p className="text-sm text-emerald-100/80">Member since: {fmtDate(u.createdAt)}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-emerald-50 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              <LogOut className="size-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-3 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-28">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative shrink-0 lg:w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === t.key ? 'text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {activeTab === t.key && (
                    <motion.span layoutId="dash-tab" className="absolute inset-0 bg-emerald-50 rounded-lg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  <t.icon className="size-5 relative" />
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <Stagger className="grid md:grid-cols-3 gap-6">
                      <StaggerItem className="bg-white rounded-xl shadow-sm p-6 aa-lift">
                        <p className="text-gray-600 mb-2">Membership Status</p>
                        <p className={`text-2xl font-semibold ${statusStyle[data.status]}`}>{data.status}</p>
                        {data.status === 'Pending' && <p className="text-xs text-gray-500 mt-1">Becomes active once your first contribution is confirmed.</p>}
                      </StaggerItem>
                      <StaggerItem className="bg-white rounded-xl shadow-sm p-6 aa-lift">
                        <p className="text-gray-600 mb-2">Monthly Contribution</p>
                        <p className="text-2xl font-semibold"><CountUp to={data.plan.monthly} prefix="R" duration={1.2} /></p>
                      </StaggerItem>
                      <StaggerItem className="bg-white rounded-xl shadow-sm p-6 aa-lift">
                        <p className="text-gray-600 mb-2">Next Payment</p>
                        {new Date(data.nextPaymentDate) <= new Date() ? (
                          <>
                            <p className="text-lg font-semibold text-amber-600">Due now</p>
                            <p className="text-xs text-gray-500 mt-1">For {fmtPeriod(data.nextPeriod)}</p>
                          </>
                        ) : (
                          <p className="text-lg font-semibold">{fmtDate(data.nextPaymentDate)}</p>
                        )}
                      </StaggerItem>
                    </Stagger>

                    {/* Verification status */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
                      className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><ShieldCheck className="size-6" /></div>
                        <div>
                          <h3 className="font-semibold">Identity Verification</h3>
                          {data.verification ? (
                            <p className="text-sm text-gray-600">Reference {data.verification.reference} · updated {fmtDate(data.verification.updatedAt)}</p>
                          ) : (
                            <p className="text-sm text-gray-600">Not submitted yet — required before you can use services.</p>
                          )}
                        </div>
                      </div>
                      {data.verification ? (
                        <span className={`px-4 py-2 rounded-full text-sm ${vStatus[data.verification.status]?.cls}`}>{vStatus[data.verification.status]?.label}</span>
                      ) : (
                        <button onClick={() => navigate('/biometric-verification')} className="aa-btn bg-purple-600 text-white px-5 py-2.5 rounded-lg">Start verification</button>
                      )}
                    </motion.div>

                    {/* Current Plan */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.2 }} className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="mb-4 font-semibold">Your Current Plan</h3>
                      <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-emerald-700 font-medium">{data.plan.name} · {rand(data.plan.monthly)}/month</p>
                        <ul className="mt-3 space-y-2 text-sm text-gray-700">
                          {healthcare && <li>✓ Access to private hospitals and clinics</li>}
                          {education && <li>✓ Private school registration support</li>}
                          {healthcare && <li>✓ 24/7 emergency healthcare</li>}
                          {education && <li>✓ Education placement assistance</li>}
                        </ul>
                      </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.25 }} className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="mb-4 font-semibold">Quick Actions</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { label: 'Make a Contribution', cls: 'border-emerald-600 text-emerald-700 hover:bg-emerald-50', onClick: () => setPayOpen(true) },
                          { label: 'Find a School', cls: 'border-blue-600 text-blue-700 hover:bg-blue-50', onClick: () => navigate('/find-school') },
                          { label: 'Find Healthcare Provider', cls: 'border-red-600 text-red-700 hover:bg-red-50', onClick: () => window.open('https://www.google.com/maps/search/private+hospital+near+me', '_blank', 'noopener') },
                          { label: 'Submit Referral Form', cls: 'border-orange-600 text-orange-700 hover:bg-orange-50', onClick: () => navigate('/referral') },
                          { label: 'Biometric Verification', cls: 'border-purple-600 text-purple-700 hover:bg-purple-50', onClick: () => navigate('/biometric-verification') },
                          { label: 'School Enrollment', cls: 'border-indigo-600 text-indigo-700 hover:bg-indigo-50', onClick: () => navigate('/school-enrollment') },
                        ].map((a) => (
                          <motion.button key={a.label} onClick={a.onClick} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                            className={`p-4 border-2 rounded-lg transition-colors ${a.cls}`}>
                            {a.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {(apps.enrollments.length > 0 || apps.referrals.length > 0) && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="mb-4 font-semibold">My Applications</h3>
                        <div className="space-y-3">
                          {apps.enrollments.map((e) => (
                            <Row key={e.id} title={`School enrollment ${e.learner ? `– ${e.learner}` : ''}`} sub={`${e.reference} · ${fmtDate(e.createdAt)}`} badge={e.status} />
                          ))}
                          {apps.referrals.map((r) => (
                            <Row key={r.id} title="Healthcare referral" sub={`${r.reference} · ${fmtDate(r.createdAt)}`} badge={r.status} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contributions' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-semibold">Contribution History</h3>
                        <p className="text-sm text-gray-500">Total confirmed: {rand(data.totalPaid)}</p>
                      </div>
                      <button onClick={() => setPayOpen(true)} className="aa-btn bg-emerald-600 text-white px-5 py-2.5 rounded-lg">Make a Contribution</button>
                    </div>
                    {data.contributions.length === 0 ? (
                      <Empty text="No contributions yet. Make your first contribution to activate your membership." />
                    ) : (
                      <Stagger className="space-y-3" stagger={0.05}>
                        {data.contributions.map((p) => (
                          <StaggerItem key={p.id}>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p>{fmtPeriod(p.period)}</p>
                                <p className="text-sm text-gray-600">{rand(p.amount)} · Ref {p.reference}</p>
                              </div>
                              <Badge status={p.status} />
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    )}
                  </div>
                )}

                {activeTab === 'healthcare' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="mb-4 font-semibold">Healthcare Access</h3>
                    {!healthcare && <p className="mb-4 text-sm bg-amber-50 text-amber-800 p-3 rounded-lg">Your current plan does not include healthcare. Contact support to switch to Healthcare or Both Services.</p>}
                    <p className="text-gray-600 mb-6">Your membership gives you access to private healthcare facilities across South Africa.</p>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="mb-2 font-medium">Available Services</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Emergency care</li>
                          <li>• General consultations</li>
                          <li>• Specialist referrals</li>
                          <li>• Diagnostic tests</li>
                          <li>• Prescription medication</li>
                        </ul>
                      </div>
                      <button onClick={() => window.open('https://www.google.com/maps/search/private+hospital+near+me', '_blank', 'noopener')} className="aa-btn w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700">
                        Find Nearest Hospital
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="mb-4 font-semibold">Education Services</h3>
                    {!education && <p className="mb-4 text-sm bg-amber-50 text-amber-800 p-3 rounded-lg">Your current plan does not include education. Contact support to switch to School Admission or Both Services.</p>}
                    <p className="text-gray-600 mb-6">Access private schools for quality education for your children.</p>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-blue-900 mb-2 font-medium">Important Notice</h4>
                        <p className="text-blue-800 text-sm">Enrollment for Grade 2-7 and 9-12: Confirm acceptance of placements between 17 September - 30 September 2025</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="mb-2 font-medium">Available Grades</h4>
                        <p className="text-sm text-gray-700">Grade 2-7 and 9-12</p>
                      </div>
                      <button onClick={() => navigate('/find-school')} className="aa-btn w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                        Browse Schools
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="mb-4 font-semibold">My Documents</h3>
                    {docs.length === 0 ? (
                      <Empty text="Your membership certificate, access card and receipts appear here once your first contribution is confirmed." />
                    ) : (
                      <Stagger className="space-y-3" stagger={0.05}>
                        {docs.map((doc) => (
                          <StaggerItem key={doc.type + doc.id}>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p>{doc.name}</p>
                                <p className="text-sm text-gray-600">{fmtDate(doc.date)}</p>
                              </div>
                              <button
                                onClick={() => openDocument(`/documents/${doc.type}/${doc.id}`).catch((e) => toast.error(e.message))}
                                className="aa-link text-emerald-600 hover:text-emerald-700"
                              >
                                Download
                              </button>
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>{payOpen && <PayModal plan={data.plan} onClose={() => setPayOpen(false)} onDone={load} />}</AnimatePresence>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, [string, string, any]> = {
    paid: ['Paid', 'bg-emerald-100 text-emerald-700', CheckCircle],
    pending: ['Awaiting confirmation', 'bg-amber-100 text-amber-700', Clock],
    rejected: ['Not received', 'bg-red-100 text-red-700', AlertTriangle],
  };
  const [label, cls, Icon] = map[status] || [status, 'bg-gray-100 text-gray-700', Clock];
  return <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm ${cls}`}><Icon className="size-4" />{label}</span>;
}

function Row({ title, sub, badge }: { title: string; sub: string; badge: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
      <div><p>{title}</p><p className="text-sm text-gray-600">{sub}</p></div>
      <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 capitalize">{badge.replace('_', ' ')}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-center text-gray-500 py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl">{text}</div>;
}

function PayModal({ plan, onClose, onDone }: { plan: Summary['plan']; onClose: () => void; onDone: () => void }) {
  const [months, setMonths] = useState(1);
  const [method, setMethod] = useState('eft');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    setBusy(true);
    try {
      const r = await api('/contributions', { method: 'POST', json: { months, method } });
      setResult(r);
      onDone();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100" aria-label="Close"><X className="size-5" /></button>
        {!result ? (
          <>
            <h3 className="text-xl font-semibold font-display mb-1">Make a Contribution</h3>
            <p className="text-sm text-gray-600 mb-5">{plan.name} · {rand(plan.monthly)} per month</p>
            <label className="block text-sm mb-2">Number of months</label>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[1, 3, 6, 12].map((m) => (
                <button key={m} onClick={() => setMonths(m)} className={`py-2 rounded-lg border-2 transition-colors ${months === m ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>{m}</button>
              ))}
            </div>
            <label className="block text-sm mb-2">Payment method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-5">
              <option value="eft">EFT / bank transfer</option>
              <option value="debit_order">Debit order</option>
              <option value="cash">Cash deposit</option>
            </select>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 mb-5">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-semibold">{rand(plan.monthly * months)}</span>
            </div>
            <button onClick={submit} disabled={busy} className="aa-btn w-full bg-emerald-600 text-white p-3 rounded-lg inline-flex items-center justify-center gap-2">
              {busy && <Spinner />} Continue
            </button>
          </>
        ) : (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="size-8" />
            </motion.div>
            <h3 className="text-xl font-semibold font-display mb-2">Contribution recorded</h3>
            <p className="text-sm text-gray-600 mb-4">{result.message}</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 mb-4">
              <p><span className="text-gray-500">Bank:</span> {result.bank.name}</p>
              <p><span className="text-gray-500">Account name:</span> {result.bank.accountName}</p>
              <p><span className="text-gray-500">Account number:</span> {result.bank.accountNumber}</p>
              {result.bank.branchCode && <p><span className="text-gray-500">Branch code:</span> {result.bank.branchCode}</p>}
              <p><span className="text-gray-500">Amount:</span> {rand(result.total)}</p>
            </div>
            <p className="text-sm mb-2">Use this reference:</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(result.contributions[0].reference); toast.success('Reference copied'); }}
              className="w-full flex items-center justify-between bg-emerald-50 text-emerald-800 font-mono px-4 py-3 rounded-lg mb-5"
            >
              {result.contributions[0].reference} <Copy className="size-4" />
            </button>
            <button onClick={onClose} className="aa-btn w-full bg-emerald-600 text-white p-3 rounded-lg">Done</button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
