import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, CreditCard, ShieldCheck, FileText, School, Mail, KeyRound, UserPlus, X, Copy, Trash2, RefreshCw,
} from 'lucide-react';
import { api, fmtDate, fmtDateTime, fmtPeriod, openFile, rand } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { CountUp, EASE, PageHero, Spinner, Stagger, StaggerItem } from '../motion';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'contributions', label: 'Contributions', icon: CreditCard },
  { key: 'enrollments', label: 'Enrollments', icon: School },
  { key: 'referrals', label: 'Referrals', icon: FileText },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'resets', label: 'Password Resets', icon: KeyRound },
  { key: 'schools', label: 'Schools', icon: School, admin: true },
  { key: 'staff', label: 'Staff', icon: UserPlus, admin: true },
];

const pill = (s: string) => {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800', Active: 'bg-emerald-100 text-emerald-800', accepted: 'bg-emerald-100 text-emerald-800', verified: 'bg-emerald-100 text-emerald-800', replied: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800', Pending: 'bg-amber-100 text-amber-800', submitted: 'bg-blue-100 text-blue-800', received: 'bg-blue-100 text-blue-800', new: 'bg-blue-100 text-blue-800', in_review: 'bg-indigo-100 text-indigo-800', pending_review: 'bg-amber-100 text-amber-800', requested: 'bg-amber-100 text-amber-800', issued: 'bg-indigo-100 text-indigo-800', waitlisted: 'bg-purple-100 text-purple-800', draft: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-800', declined: 'bg-red-100 text-red-800', Overdue: 'bg-red-100 text-red-800', flagged: 'bg-red-100 text-red-800', closed: 'bg-gray-100 text-gray-700',
  };
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs capitalize whitespace-nowrap ${map[s] || 'bg-gray-100 text-gray-700'}`}>{String(s).replace('_', ' ')}</span>;
};

export function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const tabs = TABS.filter((t) => !t.admin || user?.role === 'admin');
  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero title="Admin Console" subtitle={`Signed in as ${user?.firstName} ${user?.lastName} · ${user?.role}`} icon={<ShieldCheck className="size-8" />} />
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[230px_1fr] gap-6">
        <nav className="bg-white rounded-xl shadow-sm p-3 flex lg:flex-col gap-1 overflow-x-auto h-max lg:sticky lg:top-28">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`relative shrink-0 flex items-center gap-3 p-3 rounded-lg text-left ${tab === t.key ? 'text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              {tab === t.key && <motion.span layoutId="admin-tab" className="absolute inset-0 bg-emerald-50 rounded-lg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <t.icon className="size-5 relative" /><span className="relative">{t.label}</span>
            </button>
          ))}
          <Link to="/border-control" className="shrink-0 flex items-center gap-3 p-3 rounded-lg text-blue-700 hover:bg-blue-50"><ShieldCheck className="size-5" />Verifications</Link>
        </nav>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="min-w-0">
            {tab === 'overview' && <Overview go={setTab} />}
            {tab === 'members' && <Members />}
            {tab === 'contributions' && <Contributions />}
            {tab === 'enrollments' && <Submissions col="enrollments" statuses={['submitted', 'in_review', 'accepted', 'waitlisted', 'declined']} />}
            {tab === 'referrals' && <Submissions col="referrals" statuses={['received', 'in_review', 'accepted', 'declined']} />}
            {tab === 'messages' && <Messages />}
            {tab === 'resets' && <Resets />}
            {tab === 'schools' && <Schools />}
            {tab === 'staff' && <Staff />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function useList<T = any>(path: string) {
  const [rows, setRows] = useState<T[] | null>(null);
  const load = useCallback(() => api<T[]>(path).then(setRows).catch((e) => { toast.error(e.message); setRows([]); }), [path]);
  useEffect(() => { load(); }, [load]);
  return { rows, load };
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between gap-3"><h2 className="font-semibold text-lg">{title}</h2>{action}</div>
      {children}
    </div>
  );
}

function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50"><tr>{head.map((h) => <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
      {empty && <p className="text-center text-gray-500 py-12">Nothing here yet.</p>}
    </div>
  );
}

const Loading = () => <div className="py-16 flex justify-center text-emerald-600"><Spinner className="size-7" /></div>;

function Overview({ go }: { go: (t: string) => void }) {
  const [o, setO] = useState<any>(null);
  useEffect(() => { api('/admin/overview').then(setO).catch((e) => toast.error(e.message)); }, []);
  if (!o) return <Loading />;
  const cards = [
    { label: 'Members', v: o.members, tab: 'members' },
    { label: 'Contributions to confirm', v: o.pendingContributions, tab: 'contributions' },
    { label: 'Total collected', v: o.collected, prefix: 'R', tab: 'contributions' },
    { label: 'Verifications pending', v: o.verifications.pending, link: '/border-control' },
    { label: 'New enrollments', v: o.enrollments, tab: 'enrollments' },
    { label: 'New referrals', v: o.referrals, tab: 'referrals' },
    { label: 'Unread messages', v: o.messages, tab: 'messages' },
    { label: 'Password reset requests', v: o.resetRequests, tab: 'resets' },
  ];
  return (
    <Stagger className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <StaggerItem key={c.label}>
          {c.link ? (
            <Link to={c.link} className="block bg-white rounded-xl shadow-sm p-5 aa-lift">
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className="text-3xl font-semibold mt-1"><CountUp to={c.v} /></p>
            </Link>
          ) : (
            <button onClick={() => go(c.tab!)} className="w-full text-left bg-white rounded-xl shadow-sm p-5 aa-lift">
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className="text-3xl font-semibold mt-1"><CountUp to={c.v} prefix={c.prefix} /></p>
            </button>
          )}
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function Members() {
  const [q, setQ] = useState('');
  const { rows } = useList(`/admin/members?q=${encodeURIComponent(q)}`);
  return (
    <Card title="Members" action={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="p-2 px-3 border border-gray-300 rounded-lg text-sm w-48" />}>
      {!rows ? <Loading /> : (
        <Table head={['Member', 'ID / Passport', 'Contact', 'Plan', 'Status', 'Verification', 'Paid', 'Joined']} empty={rows.length === 0}>
          {rows.map((m: any) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3"><p className="font-medium">{m.firstName} {m.lastName}</p><p className="text-xs text-gray-500">{m.memberNumber}</p></td>
              <td className="px-4 py-3">{m.idNumber}<p className="text-xs text-gray-500">{m.nationality}</p></td>
              <td className="px-4 py-3">{m.email}<p className="text-xs text-gray-500">{m.phone}</p></td>
              <td className="px-4 py-3 whitespace-nowrap">{m.planName}</td>
              <td className="px-4 py-3">{pill(m.status)}</td>
              <td className="px-4 py-3">{m.verification ? pill(m.verification.status) : <span className="text-gray-400 text-xs">none</span>}</td>
              <td className="px-4 py-3 whitespace-nowrap">{rand(m.totalPaid)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}

function Contributions() {
  const [status, setStatus] = useState('pending');
  const { rows, load } = useList(`/admin/contributions?status=${status}`);
  const set = async (id: string, s: string) => {
    try { await api(`/admin/contributions/${id}`, { method: 'PATCH', json: { status: s } }); toast.success(`Marked ${s}`); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <Card title="Contributions" action={
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm">
        <option value="pending">Awaiting confirmation</option><option value="paid">Paid</option><option value="rejected">Rejected</option><option value="all">All</option>
      </select>}>
      {!rows ? <Loading /> : (
        <Table head={['Reference', 'Member', 'Period', 'Amount', 'Method', 'Status', 'Created', '']} empty={rows.length === 0}>
          {rows.map((c: any) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{c.reference}</td>
              <td className="px-4 py-3">{c.memberName}<p className="text-xs text-gray-500">{c.memberNumber}</p></td>
              <td className="px-4 py-3 whitespace-nowrap">{fmtPeriod(c.period)}</td>
              <td className="px-4 py-3">{rand(c.amount)}</td>
              <td className="px-4 py-3 uppercase text-xs">{c.method}</td>
              <td className="px-4 py-3">{pill(c.status)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
              <td className="px-4 py-3 whitespace-nowrap space-x-2">
                {c.status !== 'paid' && <button onClick={() => set(c.id, 'paid')} className="text-emerald-700 hover:underline">Confirm paid</button>}
                {c.status === 'pending' && <button onClick={() => set(c.id, 'rejected')} className="text-red-600 hover:underline">Not received</button>}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}

function Submissions({ col, statuses }: { col: 'enrollments' | 'referrals'; statuses: string[] }) {
  const { rows, load } = useList(`/admin/${col}`);
  const [open, setOpen] = useState<any>(null);
  const update = async (id: string, status: string) => {
    try { await api(`/admin/${col}/${id}`, { method: 'PATCH', json: { status } }); toast.success('Status updated'); load(); setOpen(null); }
    catch (e: any) { toast.error(e.message); }
  };
  const nameOf = (d: any) =>
    col === 'enrollments'
      ? [d.learnerFirstName || d.learnerName || d.learnerFullNames, d.learnerSurname].filter(Boolean).join(' ') || d.parent1FullNames || '—'
      : [d.patientName || d.clientName || d.fullName, d.patientSurname || d.surname].filter(Boolean).join(' ') || d.healthWorkerName || d.referringName || '—';
  return (
    <Card title={col === 'enrollments' ? 'School Enrollments' : 'Healthcare Referrals'}>
      {!rows ? <Loading /> : (
        <Table head={['Reference', col === 'enrollments' ? 'Learner / Parent' : 'Client / Referrer', 'Submitted', 'Status', '']} empty={rows.length === 0}>
          {rows.map((r: any) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
              <td className="px-4 py-3">{nameOf(r.data || {})}</td>
              <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
              <td className="px-4 py-3">{pill(r.status)}</td>
              <td className="px-4 py-3"><button onClick={() => setOpen(r)} className="text-emerald-700 hover:underline">Open</button></td>
            </tr>
          ))}
        </Table>
      )}
      <AnimatePresence>
        {open && (
          <Modal onClose={() => setOpen(null)} title={`${open.reference}`}>
            {open.photo && <button onClick={() => openFile(open.photo.file)} className="mb-4 text-sm text-emerald-700 hover:underline">View learner photo</button>}
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm max-h-[50vh] overflow-y-auto pr-2">
              {Object.entries(open.data || {}).filter(([, v]) => v !== '' && v !== false && !(Array.isArray(v) && !v.length)).map(([k, v]) => (
                <div key={k} className="border-b border-gray-100 py-1.5">
                  <dt className="text-gray-500 text-xs">{k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</dt>
                  <dd className="break-words">{Array.isArray(v) ? v.join(', ') : v === true ? 'Yes' : String(v)}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2 mt-5">
              {statuses.map((s) => (
                <button key={s} onClick={() => update(open.id, s)} className={`px-3 py-2 rounded-lg text-sm capitalize border ${open.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-gray-50'}`}>{s.replace('_', ' ')}</button>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Messages() {
  const { rows, load } = useList('/admin/messages');
  const set = async (id: string, status: string) => { await api(`/admin/messages/${id}`, { method: 'PATCH', json: { status } }); load(); };
  return (
    <Card title="Contact Messages">
      {!rows ? <Loading /> : rows.length === 0 ? <p className="text-center text-gray-500 py-12">No messages yet.</p> : (
        <div className="divide-y">
          {rows.map((m: any) => (
            <div key={m.id} className="p-5">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <div><p className="font-medium">{m.name} · <span className="text-gray-500 font-normal">{m.subject}</span></p><p className="text-xs text-gray-500">{m.email} {m.phone && `· ${m.phone}`} · {fmtDateTime(m.createdAt)}</p></div>
                <div className="flex items-center gap-2">{pill(m.status)}
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} onClick={() => set(m.id, 'replied')} className="text-sm text-emerald-700 hover:underline">Reply</a>
                  {m.status !== 'closed' && <button onClick={() => set(m.id, 'closed')} className="text-sm text-gray-500 hover:underline">Close</button>}
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Resets() {
  const { rows, load } = useList('/admin/password-resets');
  const [link, setLink] = useState('');
  const issue = async (id: string) => {
    try { const r = await api(`/admin/password-resets/${id}/issue`, { method: 'POST' }); setLink(r.link); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <Card title="Password Reset Requests">
      {link && (
        <div className="m-5 p-4 bg-emerald-50 rounded-lg text-sm">
          <p className="mb-2">Send this one-time link to the member (valid 48 hours). Confirm their identity first.</p>
          <button onClick={() => { navigator.clipboard?.writeText(link); toast.success('Link copied'); }} className="w-full flex justify-between items-center gap-2 font-mono text-xs bg-white p-3 rounded border break-all text-left">{link}<Copy className="size-4 shrink-0" /></button>
        </div>
      )}
      {!rows ? <Loading /> : (
        <Table head={['Member', 'Contact', 'Requested', 'Status', '']} empty={rows.length === 0}>
          {rows.map((r: any) => (
            <tr key={r.id}>
              <td className="px-4 py-3">{r.member}</td>
              <td className="px-4 py-3">{r.email}<p className="text-xs text-gray-500">{r.phone}</p></td>
              <td className="px-4 py-3">{fmtDateTime(r.createdAt)}</td>
              <td className="px-4 py-3">{pill(r.status)}</td>
              <td className="px-4 py-3"><button onClick={() => issue(r.id)} className="text-emerald-700 hover:underline whitespace-nowrap inline-flex items-center gap-1"><RefreshCw className="size-3.5" />{r.status === 'issued' ? 'Re-issue link' : 'Generate link'}</button></td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}

function Schools() {
  const { rows, load } = useList('/schools');
  const [f, setF] = useState({ name: '', location: '', grades: 'Grade 2-12', fees: '', contact: '', email: '', image: '' });
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api('/admin/schools', { method: 'POST', json: f }); toast.success('School added'); setF({ name: '', location: '', grades: 'Grade 2-12', fees: '', contact: '', email: '', image: '' }); load(); }
    catch (err: any) { toast.error(err.message); }
  };
  const remove = async (id: string) => {
    if (!confirm('Remove this school from the public list?')) return;
    await api(`/admin/schools/${id}`, { method: 'DELETE' }); load();
  };
  return (
    <div className="space-y-6">
      <Card title="Add a School">
        <form onSubmit={add} className="p-5 grid sm:grid-cols-2 gap-3">
          {(['name', 'location', 'grades', 'fees', 'contact', 'email', 'image'] as const).map((k) => (
            <input key={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={k === 'image' ? 'Image URL' : k[0].toUpperCase() + k.slice(1)} required={k === 'name' || k === 'location'} className="p-3 border border-gray-300 rounded-lg text-sm" />
          ))}
          <button className="aa-btn bg-emerald-600 text-white rounded-lg p-3">Add school</button>
        </form>
      </Card>
      <Card title="Partner Schools">
        {!rows ? <Loading /> : (
          <Table head={['School', 'Location', 'Fees', 'Contact', '']} empty={rows.length === 0}>
            {rows.map((s: any) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3">{s.location}</td><td className="px-4 py-3">{s.fees}</td>
                <td className="px-4 py-3">{s.email}<p className="text-xs text-gray-500">{s.contact}</p></td>
                <td className="px-4 py-3"><button onClick={() => remove(s.id)} className="text-red-600 p-1" aria-label="Remove"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

function Staff() {
  const [f, setF] = useState({ firstName: '', lastName: '', idNumber: '', email: '', password: '' });
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api('/admin/staff', { method: 'POST', json: f }); toast.success(`Staff account created. They log in with "${f.idNumber}".`); setF({ firstName: '', lastName: '', idNumber: '', email: '', password: '' }); }
    catch (err: any) { toast.error(err.message); }
  };
  return (
    <Card title="Add a Verification Officer / Staff Member">
      <form onSubmit={add} className="p-5 grid sm:grid-cols-2 gap-3">
        <input required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} placeholder="First name" className="p-3 border border-gray-300 rounded-lg text-sm" />
        <input required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} placeholder="Last name" className="p-3 border border-gray-300 rounded-lg text-sm" />
        <input required value={f.idNumber} onChange={(e) => setF({ ...f, idNumber: e.target.value })} placeholder="Login ID (e.g. STAFF01)" className="p-3 border border-gray-300 rounded-lg text-sm" />
        <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className="p-3 border border-gray-300 rounded-lg text-sm" />
        <input required type="password" minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Temporary password" autoComplete="new-password" className="p-3 border border-gray-300 rounded-lg text-sm" />
        <button className="aa-btn bg-emerald-600 text-white rounded-lg p-3">Create staff account</button>
      </form>
    </Card>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6"
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4, ease: EASE }}>
        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold font-mono">{title}</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close"><X className="size-5" /></button></div>
        {children}
      </motion.div>
    </motion.div>
  );
}
