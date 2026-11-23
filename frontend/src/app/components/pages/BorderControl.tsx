import { useCallback, useEffect, useState } from 'react';
import { Shield, AlertTriangle, Users, CheckCircle, XCircle, Search, Clock, Lock, X, FileText, Plug } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import { api, fmtDateTime, openFile } from '../../lib/api';
import { CountUp, EASE, Reveal, Spinner, Stagger, StaggerItem } from '../motion';

type V = {
  id: string; reference: string; applicantName: string; passportNumber: string; nationality: string; dateOfBirth: string;
  location: string; createdAt: string; status: 'pending_review' | 'verified' | 'flagged' | 'rejected'; reviewNote?: string;
  documents: Record<string, { file: string; originalName: string; mime: string } | null>;
  checks?: { at: string; by: string; status: string; note: string }[];
};

const STATUS_UI: Record<V['status'], { label: string; cls: string; icon: any }> = {
  pending_review: { label: 'Pending', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  verified: { label: 'Approved', cls: 'bg-green-100 text-green-800', icon: CheckCircle },
  flagged: { label: 'Flagged', cls: 'bg-red-100 text-red-800', icon: XCircle },
  rejected: { label: 'Rejected', cls: 'bg-gray-200 text-gray-800', icon: XCircle },
};

export function BorderControl() {
  const { user, isStaff, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'verified' | 'flagged'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<V[] | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [open, setOpen] = useState<V | null>(null);

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ status: filterStatus, q: searchTerm });
    const [list, ov] = await Promise.all([api<V[]>(`/admin/verifications?${qs}`), api('/admin/overview')]);
    setRows(list);
    setStats(ov.verifications);
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    if (!isStaff) return;
    const t = setTimeout(() => load().catch((e) => toast.error(e.message)), 200);
    return () => clearTimeout(t);
  }, [isStaff, load]);

  // Light polling so the console feels live
  useEffect(() => {
    if (!isStaff) return;
    const i = setInterval(() => load().catch(() => {}), 30000);
    return () => clearInterval(i);
  }, [isStaff, load]);

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-2xl shadow-lg p-8 mb-8">
          <div aria-hidden className="absolute inset-0 aa-grid opacity-15" />
          <div aria-hidden className="aa-orb aa-orb-a opacity-50" />
          <div className="relative flex items-center gap-4">
            <motion.div initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}>
              <Shield className="size-12" />
            </motion.div>
            <div>
              <h1 className="text-white mb-1 font-display font-bold text-2xl md:text-3xl">Border Control Dashboard</h1>
              <p className="text-blue-100">Biometric verification review console for authorised staff</p>
            </div>
            {isStaff && (
              <span className="ml-auto hidden md:inline-flex items-center gap-2 text-sm bg-white/10 rounded-full px-3 py-1.5">
                <span className="relative flex size-2"><span className="aa-ping absolute inset-0 rounded-full bg-green-400" /><span className="relative size-2 rounded-full bg-green-400" /></span>
                Live
              </span>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24 text-blue-600"><Spinner className="size-8" /></div>
        ) : !isStaff ? (
          <Reveal className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-xl mx-auto">
            <div className="size-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4"><Lock className="size-8" /></div>
            <h2 className="text-xl font-semibold mb-2">Restricted to authorised staff</h2>
            <p className="text-gray-600 mb-6">
              This console contains personal information of applicants and is only available to verification officers.
              {user ? ' Your account does not have staff access.' : ''}
            </p>
            {user ? (
              <Link to="/biometric-verification" className="aa-btn inline-flex bg-blue-600 text-white px-6 py-3 rounded-lg">Go to Biometric Verification</Link>
            ) : (
              <Link to="/login" state={{ from: '/border-control' }} className="aa-btn inline-flex bg-blue-600 text-white px-6 py-3 rounded-lg">Staff login</Link>
            )}
          </Reveal>
        ) : (
          <>
            {/* Stats Overview */}
            <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[
                { label: 'Submissions Today', v: stats?.today, icon: Users, cls: 'text-blue-600', val: '' },
                { label: 'Approved', v: stats?.verified, icon: CheckCircle, cls: 'text-green-600', val: 'text-green-600' },
                { label: 'Flagged', v: stats?.flagged, icon: XCircle, cls: 'text-red-600', val: 'text-red-600' },
                { label: 'Awaiting Review', v: stats?.pending, icon: Clock, cls: 'text-amber-600', val: 'text-amber-600' },
              ].map((s) => (
                <StaggerItem key={s.label} className="bg-white rounded-xl shadow-sm p-6 aa-lift">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 text-sm md:text-base">{s.label}</p>
                    <s.icon className={`size-6 ${s.cls}`} />
                  </div>
                  <p className={`text-3xl font-semibold tabular-nums ${s.val}`}>{stats ? <CountUp to={s.v || 0} duration={1} /> : '—'}</p>
                </StaggerItem>
              ))}
            </Stagger>

            {/* Alert Banner */}
            <Reveal className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-orange-900 mb-2 font-semibold">Review guidance</h3>
                  <p className="text-orange-800 text-sm">
                    Compare the applicant photo with the passport / ID and confirm the birth certificate and proof of address
                    match the applicant's details. Only flag a submission with a clear written reason — every decision is logged with your name.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input type="text" placeholder="Search by name, passport or reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {([
                    ['all', 'All', 'bg-blue-600'],
                    ['pending_review', 'Pending', 'bg-amber-500'],
                    ['verified', 'Approved', 'bg-green-600'],
                    ['flagged', 'Flagged', 'bg-red-600'],
                  ] as const).map(([k, label, active]) => (
                    <button key={k} onClick={() => setFilterStatus(k)}
                      className={`relative px-5 py-3 rounded-lg transition-colors whitespace-nowrap ${filterStatus === k ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {filterStatus === k && <motion.span layoutId="bc-filter" className={`absolute inset-0 rounded-lg ${active}`} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                      <span className="relative">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Scans Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b"><h2 className="font-semibold text-lg">Recent Biometric Submissions</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Reference', 'Name', 'Passport', 'Nationality', 'Location', 'Time', 'Status', 'Action'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!rows ? (
                      <tr><td colSpan={8} className="py-16 text-center text-blue-600"><Spinner className="size-6" /></td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={8} className="py-16 text-center text-gray-500">No submissions match this filter.</td></tr>
                    ) : (
                      <AnimatePresence initial={false}>
                        {rows.map((scan, i) => {
                          const S = STATUS_UI[scan.status];
                          return (
                            <motion.tr key={scan.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3), ease: EASE }}
                              className={`hover:bg-blue-50/40 transition-colors ${scan.status === 'flagged' ? 'bg-red-50' : ''}`}>
                              <td className="px-6 py-4 text-sm font-mono">{scan.reference}</td>
                              <td className="px-6 py-4">
                                <p>{scan.applicantName}</p>
                                {scan.status === 'flagged' && scan.reviewNote && <p className="text-xs text-red-600 mt-1">{scan.reviewNote}</p>}
                              </td>
                              <td className="px-6 py-4 text-sm">{scan.passportNumber}</td>
                              <td className="px-6 py-4 text-sm">{scan.nationality}</td>
                              <td className="px-6 py-4 text-sm">{scan.location}</td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap">{fmtDateTime(scan.createdAt)}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${S.cls}`}><S.icon className="size-4" />{S.label}</span>
                              </td>
                              <td className="px-6 py-4">
                                <button onClick={() => setOpen(scan)} className="aa-link text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap">View Details</button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connected Systems */}
            <Reveal className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h2 className="mb-2 font-semibold text-lg">External Database Integrations</h2>
              <p className="text-sm text-gray-600 mb-6">
                Automated checks against police or INTERPOL records require formal data-sharing agreements with those agencies.
                Until an integration is authorised and switched on, all decisions here are manual officer reviews.
              </p>
              <Stagger className="grid sm:grid-cols-2 md:grid-cols-4 gap-4" stagger={0.05}>
                {['INTERPOL', 'AFRIPOL', 'South African Police', 'Nigerian Police', 'Kenyan Police', 'Egyptian Police', 'Ghanaian Police', 'Moroccan Police'].map((name) => (
                  <StaggerItem key={name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p>{name}</p>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-300" />not connected</span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Plug className="size-3.5" /> Requires authorisation</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </>
        )}
      </div>

      <AnimatePresence>
        {open && <ReviewDrawer v={open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load(); }} />}
      </AnimatePresence>
    </div>
  );
}

function ReviewDrawer({ v, onClose, onSaved }: { v: V; onClose: () => void; onSaved: () => void }) {
  const [note, setNote] = useState(v.reviewNote || '');
  const [publicNote, setPublicNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const decide = async (status: V['status']) => {
    if ((status === 'flagged' || status === 'rejected') && !note.trim()) return toast.error('Add a written reason before flagging or rejecting.');
    setBusy(status);
    try {
      await api(`/admin/verifications/${v.id}`, { method: 'PATCH', json: { status, reviewNote: note, publicNote } });
      toast.success(`Marked as ${STATUS_UI[status].label.toLowerCase()}`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };
  const docs: [string, string][] = [['photo', 'Applicant photo'], ['passportId', 'Passport / ID'], ['birthCertificate', 'Birth certificate'], ['proofOfAddress', 'Proof of address']];
  return (
    <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-mono">{v.reference}</p>
            <h3 className="font-semibold text-lg">{v.applicantName}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[['Passport', v.passportNumber], ['Nationality', v.nationality], ['Date of birth', v.dateOfBirth], ['Submitted', fmtDateTime(v.createdAt)], ['Location', v.location], ['Status', STATUS_UI[v.status].label]].map(([k, val]) => (
              <div key={k}><p className="text-gray-500">{k}</p><p className="font-medium">{val}</p></div>
            ))}
          </div>
          <div>
            <h4 className="font-medium mb-3">Documents</h4>
            <div className="grid grid-cols-2 gap-3">
              {docs.map(([k, label]) => {
                const d = v.documents?.[k];
                return (
                  <button key={k} disabled={!d} onClick={() => d && openFile(d.file).catch((e) => toast.error(e.message))}
                    className="aa-lift flex items-center gap-3 p-3 border rounded-lg text-left disabled:opacity-50">
                    <FileText className="size-6 text-blue-600 shrink-0" />
                    <span className="text-sm"><span className="block font-medium">{label}</span><span className="text-gray-500 text-xs truncate block max-w-[9rem]">{d?.originalName || 'missing'}</span></span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Internal review note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Required when flagging or rejecting" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message shown to applicant (optional)</label>
            <input value={publicNote} onChange={(e) => setPublicNote(e.target.value)} placeholder="e.g. Please upload a clearer proof of address" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => decide('verified')} disabled={!!busy} className="aa-btn bg-green-600 text-white py-3 rounded-lg inline-flex justify-center gap-2">{busy === 'verified' && <Spinner className="size-4" />}Approve</button>
            <button onClick={() => decide('flagged')} disabled={!!busy} className="aa-btn bg-red-600 text-white py-3 rounded-lg inline-flex justify-center gap-2">{busy === 'flagged' && <Spinner className="size-4" />}Flag</button>
            <button onClick={() => decide('rejected')} disabled={!!busy} className="aa-btn bg-gray-700 text-white py-3 rounded-lg inline-flex justify-center gap-2">{busy === 'rejected' && <Spinner className="size-4" />}Reject</button>
          </div>
          {v.checks && v.checks.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Review history</h4>
              <ul className="space-y-2 text-sm">
                {v.checks.slice().reverse().map((c, i) => (
                  <li key={i} className="bg-gray-50 rounded-lg p-3">
                    <p><span className="font-medium">{c.by}</span> → {STATUS_UI[c.status as V['status']]?.label}</p>
                    <p className="text-gray-500 text-xs">{fmtDateTime(c.at)}</p>
                    {c.note && <p className="mt-1">{c.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}
