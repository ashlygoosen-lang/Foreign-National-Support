import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import { db, newId, UPLOAD_DIR, flush } from './db.js';
import { signToken, optionalAuth, requireAuth, requireStaff, requireAdmin, publicUser } from './auth.js';
import { seed } from './seed.js';
import { renderDocument } from './documents.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
seed();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','), credentials: true }));
app.use(express.json({ limit: '2mb' }));

// ───────────────────────── helpers ─────────────────────────
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : v);
const required = (body, fields) => fields.filter((f) => !body[f] || String(body[f]).trim() === '');
const audit = (actor, action, target, detail) =>
  db.insert('auditLog', { actor: actor?.id || 'public', action, target, detail });

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.bin';
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) =>
    ALLOWED_MIME.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG, WEBP, HEIC or PDF files are allowed.')),
});

const fileMeta = (f) => (f ? { file: f.filename, originalName: f.originalname, mime: f.mimetype, size: f.size } : null);

function nextMemberNumber() {
  const year = new Date().getFullYear();
  const count = db.filter('users', (u) => u.role === 'member').length + 1;
  return `AA-${year}-${String(count).padStart(6, '0')}`;
}

const periodKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
function addMonths(period, n) {
  const [y, m] = period.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return periodKey(d);
}

function memberSummary(user) {
  const plan = config.plans[user.plan] || config.plans.both;
  const contribs = db
    .filter('contributions', (c) => c.userId === user.id)
    .sort((a, b) => (a.period < b.period ? 1 : -1));
  const paid = contribs.filter((c) => c.status === 'paid');
  const now = periodKey();
  const lastMonth = addMonths(now, -1);
  const paidPeriods = new Set(paid.map((c) => c.period));
  const latestPaid = paid.map((c) => c.period).sort().pop();
  let status = 'Pending';
  if (paidPeriods.has(now) || paidPeriods.has(lastMonth) || (latestPaid && latestPaid > now)) status = 'Active';
  else if (paid.length) status = 'Overdue';
  const nextPeriod = latestPaid && latestPaid >= now ? addMonths(latestPaid, 1) : now;
  const [ny, nm] = nextPeriod.split('-').map(Number);
  const verification = db
    .filter('verifications', (v) => v.userId === user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  return {
    plan,
    status,
    nextPaymentDate: new Date(ny, nm - 1, 1).toISOString(),
    nextPeriod,
    totalPaid: paid.reduce((s, c) => s + c.amount, 0),
    contributions: contribs,
    verification: verification
      ? { reference: verification.reference, status: verification.status, updatedAt: verification.updatedAt || verification.createdAt }
      : null,
  };
}

// ───────────────────────── public ─────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/api/config', (_req, res) =>
  res.json({ plans: Object.values(config.plans), bank: config.bank, enrollmentNotice: config.enrollmentNotice })
);

app.get('/api/stats', (_req, res) => {
  const members = db.filter('users', (u) => u.role === 'member').length;
  res.json({
    members,
    schools: db.filter('schools', (s) => s.active !== false).length,
    verifications: db.filter('verifications', (v) => v.status === 'verified').length,
    enrollments: db.all('enrollments').length,
  });
});

app.get('/api/schools', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const loc = String(req.query.location || 'all');
  let list = db.filter('schools', (s) => s.active !== false);
  if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
  if (loc !== 'all') list = list.filter((s) => s.location === loc);
  res.json(list);
});

// ───────────────────────── auth ─────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

app.post('/api/auth/register', authLimiter, asyncH(async (req, res) => {
  const b = req.body || {};
  const missing = required(b, ['firstName', 'lastName', 'idNumber', 'email', 'phone', 'address', 'nationality', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  if (String(b.password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (b.confirmPassword !== undefined && b.password !== b.confirmPassword)
    return res.status(400).json({ error: 'Passwords do not match.' });
  if (!/^\S+@\S+\.\S+$/.test(b.email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  const idNumber = clean(b.idNumber, 40).toUpperCase();
  const email = clean(b.email, 120).toLowerCase();
  if (db.find('users', (u) => u.idNumber === idNumber))
    return res.status(409).json({ error: 'An account with this ID / passport number already exists.' });
  if (db.find('users', (u) => u.email === email))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const plan = ['school', 'healthcare', 'both'].includes(b.applicationType) ? b.applicationType : 'both';
  const user = db.insert('users', {
    id: newId('U-'),
    role: 'member',
    memberNumber: nextMemberNumber(),
    plan,
    idType: b.idType === 'id' ? 'id' : 'passport',
    idNumber,
    firstName: clean(b.firstName, 80),
    lastName: clean(b.lastName, 80),
    email,
    phone: clean(b.phone, 30),
    address: clean(b.address, 300),
    nationality: clean(b.nationality, 80),
    passwordHash: await bcrypt.hash(b.password, 10),
    acceptedTermsAt: new Date().toISOString(),
  });
  audit(user, 'register', user.id);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

app.post('/api/auth/login', authLimiter, asyncH(async (req, res) => {
  const identifier = clean(req.body?.identifier || req.body?.idNumber || '', 120);
  const password = req.body?.password || '';
  if (!identifier || !password) return res.status(400).json({ error: 'Enter your ID / passport number and password.' });
  const idU = identifier.toUpperCase();
  const user = db.find('users', (u) => u.idNumber.toUpperCase() === idU || u.email === identifier.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Incorrect ID / passport number or password.' });
  if (user.disabled) return res.status(403).json({ error: 'This account has been disabled. Please contact support.' });
  db.update('users', user.id, { lastLoginAt: new Date().toISOString() });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.post('/api/auth/forgot', authLimiter, (req, res) => {
  const identifier = clean(req.body?.identifier || '', 120);
  const user = identifier
    ? db.find('users', (u) => u.idNumber.toUpperCase() === identifier.toUpperCase() || u.email === identifier.toLowerCase())
    : null;
  if (user) {
    db.insert('passwordResets', { userId: user.id, status: 'requested', token: null });
    audit(user, 'password_reset_requested', user.id);
  }
  // Same response either way so accounts can't be discovered.
  res.json({ message: 'If an account exists, our support team will send you a secure reset link within one working day.' });
});

app.post('/api/auth/reset', authLimiter, asyncH(async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || String(password).length < 8)
    return res.status(400).json({ error: 'A valid link and a password of at least 8 characters are required.' });
  const r = db.find('passwordResets', (p) => p.token === token && p.status === 'issued');
  if (!r || new Date(r.expiresAt) < new Date()) return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  db.update('users', r.userId, { passwordHash: await bcrypt.hash(password, 10) });
  db.update('passwordResets', r.id, { status: 'used', token: null });
  res.json({ message: 'Password updated. You can now log in.' });
}));

app.post('/api/auth/change-password', requireAuth, asyncH(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!(await bcrypt.compare(currentPassword || '', req.user.passwordHash)))
    return res.status(400).json({ error: 'Current password is incorrect.' });
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  db.update('users', req.user.id, { passwordHash: await bcrypt.hash(newPassword, 10) });
  res.json({ message: 'Password changed.' });
}));

// ───────────────────────── member ─────────────────────────
app.get('/api/member/summary', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), ...memberSummary(req.user) });
});

app.patch('/api/member/profile', requireAuth, (req, res) => {
  const b = req.body || {};
  const patch = {};
  for (const f of ['phone', 'address']) if (b[f]) patch[f] = clean(b[f], 300);
  if (b.plan && config.plans[b.plan]) patch.plan = b.plan;
  const user = db.update('users', req.user.id, patch);
  res.json({ user: publicUser(user) });
});

app.post('/api/contributions', requireAuth, (req, res) => {
  const user = req.user;
  const months = Math.min(Math.max(parseInt(req.body?.months, 10) || 1, 1), 12);
  const method = ['eft', 'card', 'cash', 'debit_order'].includes(req.body?.method) ? req.body.method : 'eft';
  const plan = config.plans[user.plan] || config.plans.both;
  const { nextPeriod } = memberSummary(user);
  const pendingPeriods = new Set(
    db.filter('contributions', (c) => c.userId === user.id && c.status !== 'rejected').map((c) => c.period)
  );
  const created = [];
  let p = nextPeriod;
  while (created.length < months) {
    if (!pendingPeriods.has(p)) {
      created.push(
        db.insert('contributions', {
          id: newId('C-'),
          userId: user.id,
          period: p,
          amount: plan.monthly,
          method,
          status: 'pending',
          reference: `${user.memberNumber}-${p.replace('-', '')}`,
        })
      );
    }
    p = addMonths(p, 1);
  }
  audit(user, 'contribution_created', created.map((c) => c.id).join(','));
  res.status(201).json({
    contributions: created,
    total: created.reduce((s, c) => s + c.amount, 0),
    bank: config.bank,
    message: 'Contribution recorded. Use the reference shown when you pay. It will be marked as paid once our finance team confirms receipt.',
  });
});

app.get('/api/documents', requireAuth, (req, res) => {
  const s = memberSummary(req.user);
  const docs = [];
  if (s.status === 'Active') {
    docs.push({ type: 'certificate', id: req.user.id, name: 'Membership Certificate', date: new Date().toISOString() });
    if (['healthcare', 'both'].includes(req.user.plan))
      docs.push({ type: 'card', id: req.user.id, name: 'Healthcare Access Card', date: new Date().toISOString() });
  }
  for (const c of s.contributions.filter((c) => c.status === 'paid'))
    docs.push({ type: 'receipt', id: c.id, name: `Contribution Receipt - ${c.period}`, date: c.paidAt || c.createdAt });
  res.json(docs);
});

app.get('/api/documents/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params;
  const user = req.user;
  const s = memberSummary(user);
  if ((type === 'certificate' || type === 'card') && (id !== user.id || s.status !== 'Active'))
    return res.status(404).json({ error: 'Document not available yet.' });
  let contribution = null;
  if (type === 'receipt') {
    contribution = db.get('contributions', id);
    if (!contribution || contribution.userId !== user.id || contribution.status !== 'paid')
      return res.status(404).json({ error: 'Receipt not found.' });
  }
  res.type('html').send(renderDocument(type, { user, summary: s, contribution }));
});

// ───────────────────────── verification ─────────────────────────
const verificationUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'passportId', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
]);

app.post('/api/verifications', optionalAuth, verificationUpload, (req, res) => {
  const b = req.body || {};
  const missing = required(b, ['applicantName', 'passportNumber', 'nationality', 'dateOfBirth']);
  const files = req.files || {};
  const missingDocs = ['photo', 'birthCertificate', 'passportId', 'proofOfAddress'].filter((k) => !files[k]?.[0]);
  if (missing.length || missingDocs.length)
    return res.status(400).json({ error: `Missing: ${[...missing, ...missingDocs].join(', ')}` });
  const reference = `VR-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const v = db.insert('verifications', {
    id: newId('V-'),
    reference,
    userId: req.user?.id || null,
    applicantName: clean(b.applicantName, 120),
    passportNumber: clean(b.passportNumber, 40).toUpperCase(),
    nationality: clean(b.nationality, 80),
    dateOfBirth: clean(b.dateOfBirth, 20),
    location: clean(b.location, 120) || 'Online submission',
    fingerprintCaptured: false,
    documents: {
      photo: fileMeta(files.photo[0]),
      birthCertificate: fileMeta(files.birthCertificate[0]),
      passportId: fileMeta(files.passportId[0]),
      proofOfAddress: fileMeta(files.proofOfAddress[0]),
    },
    status: 'pending_review',
    checks: [],
    reviewNote: '',
  });
  audit(req.user, 'verification_submitted', v.id);
  res.status(201).json({ reference: v.reference, status: v.status, createdAt: v.createdAt });
});

app.get('/api/verifications/status', (req, res) => {
  const ref = String(req.query.reference || '').toUpperCase();
  const pass = String(req.query.passportNumber || '').toUpperCase();
  const v = db.find('verifications', (x) => x.reference === ref && x.passportNumber === pass);
  if (!v) return res.status(404).json({ error: 'No verification found for that reference and passport number.' });
  res.json({
    reference: v.reference,
    status: v.status,
    applicantName: v.applicantName,
    submittedAt: v.createdAt,
    updatedAt: v.updatedAt || v.createdAt,
    note: v.status === 'pending_review' ? '' : v.publicNote || '',
  });
});

// ───────────────────────── forms ─────────────────────────
app.post('/api/contact', rateLimit({ windowMs: 60 * 60 * 1000, limit: 20 }), (req, res) => {
  const b = req.body || {};
  const missing = required(b, ['name', 'email', 'subject', 'message']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  const m = db.insert('messages', {
    id: newId('M-'),
    name: clean(b.name, 120),
    email: clean(b.email, 120).toLowerCase(),
    phone: clean(b.phone, 30),
    subject: clean(b.subject, 120),
    message: clean(b.message, 5000),
    status: 'new',
  });
  res.status(201).json({ id: m.id, message: 'Thank you for contacting us. We will get back to you shortly.' });
});

app.post('/api/referrals', optionalAuth, (req, res) => {
  const data = req.body?.data || req.body || {};
  if (!data.patientName && !data.patientSurname && !data.referringName && !data.healthWorkerName && Object.keys(data).length < 5)
    return res.status(400).json({ error: 'Please complete the referral form.' });
  const r = db.insert('referrals', {
    id: newId('R-'),
    reference: `RF-${Date.now().toString(36).toUpperCase()}`,
    userId: req.user?.id || null,
    data,
    status: 'received',
  });
  audit(req.user, 'referral_submitted', r.id);
  res.status(201).json({ reference: r.reference, message: 'Referral form submitted successfully. The healthcare team will review it.' });
});

app.post('/api/enrollments', optionalAuth, upload.single('photo'), (req, res) => {
  let data = {};
  try {
    data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data || {};
  } catch {
    return res.status(400).json({ error: 'Invalid form data.' });
  }
  if (!Object.values(data).some((v) => v && String(v).trim()))
    return res.status(400).json({ error: 'Please complete the enrollment form.' });
  const draft = req.body.draft === 'true';
  const e = db.insert('enrollments', {
    id: newId('E-'),
    reference: `EN-${Date.now().toString(36).toUpperCase()}`,
    userId: req.user?.id || null,
    schoolId: clean(req.body.schoolId, 60) || null,
    data,
    photo: fileMeta(req.file),
    status: draft ? 'draft' : 'submitted',
  });
  audit(req.user, draft ? 'enrollment_draft' : 'enrollment_submitted', e.id);
  res.status(201).json({
    reference: e.reference,
    status: e.status,
    message: draft
      ? 'Draft saved. Keep your reference to continue later.'
      : 'Enrollment form submitted successfully. You will be contacted regarding your application status.',
  });
});

app.get('/api/member/applications', requireAuth, (req, res) => {
  res.json({
    enrollments: db.filter('enrollments', (e) => e.userId === req.user.id).map(({ data, ...e }) => ({
      ...e,
      learner: [data.learnerFirstName || data.learnerName, data.learnerSurname].filter(Boolean).join(' '),
      grade: data.gradeApplying || data.grade || '',
    })),
    referrals: db.filter('referrals', (r) => r.userId === req.user.id).map(({ data, ...r }) => r),
  });
});

// ───────────────────────── staff / admin ─────────────────────────
app.get('/api/admin/overview', requireStaff, (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const vs = db.all('verifications');
  res.json({
    members: db.filter('users', (u) => u.role === 'member').length,
    pendingContributions: db.filter('contributions', (c) => c.status === 'pending').length,
    collected: db.filter('contributions', (c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
    verifications: {
      today: vs.filter((v) => v.createdAt.startsWith(today)).length,
      total: vs.length,
      verified: vs.filter((v) => v.status === 'verified').length,
      flagged: vs.filter((v) => v.status === 'flagged').length,
      pending: vs.filter((v) => v.status === 'pending_review').length,
    },
    referrals: db.filter('referrals', (r) => r.status === 'received').length,
    enrollments: db.filter('enrollments', (e) => e.status === 'submitted').length,
    messages: db.filter('messages', (m) => m.status === 'new').length,
    resetRequests: db.filter('passwordResets', (r) => r.status === 'requested').length,
  });
});

app.get('/api/admin/verifications', requireStaff, (req, res) => {
  const status = String(req.query.status || 'all');
  const q = String(req.query.q || '').toLowerCase();
  let list = [...db.all('verifications')].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (status !== 'all') list = list.filter((v) => v.status === status);
  if (q) list = list.filter((v) => v.applicantName.toLowerCase().includes(q) || v.passportNumber.toLowerCase().includes(q) || v.reference.toLowerCase().includes(q));
  res.json(list);
});

app.patch('/api/admin/verifications/:id', requireStaff, (req, res) => {
  const v = db.get('verifications', req.params.id);
  if (!v) return res.status(404).json({ error: 'Not found' });
  const status = req.body?.status;
  if (!['pending_review', 'verified', 'flagged', 'rejected'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const updated = db.update('verifications', v.id, {
    status,
    reviewNote: clean(req.body.reviewNote || '', 2000),
    publicNote: clean(req.body.publicNote || '', 500),
    fingerprintCaptured: req.body.fingerprintCaptured === true || v.fingerprintCaptured,
    reviewedBy: req.user.id,
    reviewedAt: new Date().toISOString(),
    checks: [
      ...(v.checks || []),
      { at: new Date().toISOString(), by: `${req.user.firstName} ${req.user.lastName}`, status, note: clean(req.body.reviewNote || '', 2000) },
    ],
  });
  audit(req.user, 'verification_reviewed', v.id, status);
  res.json(updated);
});

app.get('/api/admin/files/:name', requireStaff, (req, res) => {
  const name = path.basename(req.params.name);
  const full = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(full);
});

app.get('/api/admin/members', requireStaff, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  let list = db.filter('users', (u) => u.role === 'member');
  if (q) list = list.filter((u) => `${u.firstName} ${u.lastName} ${u.idNumber} ${u.email} ${u.memberNumber}`.toLowerCase().includes(q));
  res.json(
    list
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((u) => {
        const s = memberSummary(u);
        return { ...publicUser(u), status: s.status, planName: s.plan.name, totalPaid: s.totalPaid, verification: s.verification };
      })
  );
});

app.get('/api/admin/contributions', requireStaff, (req, res) => {
  const status = String(req.query.status || 'all');
  let list = [...db.all('contributions')].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (status !== 'all') list = list.filter((c) => c.status === status);
  res.json(
    list.map((c) => {
      const u = db.get('users', c.userId);
      return { ...c, memberName: u ? `${u.firstName} ${u.lastName}` : 'Unknown', memberNumber: u?.memberNumber };
    })
  );
});

app.patch('/api/admin/contributions/:id', requireStaff, (req, res) => {
  const c = db.get('contributions', req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const status = req.body?.status;
  if (!['pending', 'paid', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const updated = db.update('contributions', c.id, {
    status,
    paidAt: status === 'paid' ? new Date().toISOString() : null,
    confirmedBy: req.user.id,
  });
  audit(req.user, 'contribution_' + status, c.id);
  res.json(updated);
});

for (const [col, statuses] of [
  ['referrals', ['received', 'in_review', 'accepted', 'declined']],
  ['enrollments', ['draft', 'submitted', 'in_review', 'accepted', 'waitlisted', 'declined']],
  ['messages', ['new', 'replied', 'closed']],
]) {
  app.get(`/api/admin/${col}`, requireStaff, (_req, res) =>
    res.json([...db.all(col)].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))
  );
  app.patch(`/api/admin/${col}/:id`, requireStaff, (req, res) => {
    if (!statuses.includes(req.body?.status)) return res.status(400).json({ error: 'Invalid status' });
    const row = db.update(col, req.params.id, { status: req.body.status, staffNote: clean(req.body.staffNote || '', 2000) });
    if (!row) return res.status(404).json({ error: 'Not found' });
    audit(req.user, `${col}_status`, row.id, req.body.status);
    res.json(row);
  });
}

app.get('/api/admin/password-resets', requireStaff, (_req, res) =>
  res.json(
    db.filter('passwordResets', (r) => r.status === 'requested' || r.status === 'issued').map((r) => {
      const u = db.get('users', r.userId);
      return { id: r.id, status: r.status, createdAt: r.createdAt, expiresAt: r.expiresAt, member: u ? `${u.firstName} ${u.lastName}` : '?', email: u?.email, phone: u?.phone };
    })
  )
);

app.post('/api/admin/password-resets/:id/issue', requireStaff, (req, res) => {
  const r = db.get('passwordResets', req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const token = crypto.randomBytes(24).toString('base64url');
  db.update('passwordResets', r.id, {
    status: 'issued',
    token,
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    issuedBy: req.user.id,
  });
  const base = config.siteUrl || `${req.protocol}://${req.get('host')}`;
  res.json({ link: `${base}/reset-password?token=${token}`, expiresInHours: 48 });
});

app.post('/api/admin/schools', requireAdmin, (req, res) => {
  const b = req.body || {};
  const missing = required(b, ['name', 'location']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  const s = db.insert('schools', {
    name: clean(b.name, 120), location: clean(b.location, 80), grades: clean(b.grades, 40) || 'Grade 2-12',
    fees: clean(b.fees, 80), contact: clean(b.contact, 40), email: clean(b.email, 120), image: clean(b.image, 500), active: true,
  });
  res.status(201).json(s);
});

app.delete('/api/admin/schools/:id', requireAdmin, (req, res) => {
  const s = db.update('schools', req.params.id, { active: false });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.post('/api/admin/staff', requireAdmin, asyncH(async (req, res) => {
  const b = req.body || {};
  const missing = required(b, ['firstName', 'lastName', 'idNumber', 'email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  if (db.find('users', (u) => u.idNumber === b.idNumber.toUpperCase() || u.email === b.email.toLowerCase()))
    return res.status(409).json({ error: 'A user with that login ID or email already exists.' });
  const u = db.insert('users', {
    id: newId('U-'), role: 'staff', firstName: clean(b.firstName), lastName: clean(b.lastName),
    idType: 'id', idNumber: clean(b.idNumber, 40).toUpperCase(), email: clean(b.email, 120).toLowerCase(),
    memberNumber: 'AA-STAFF', passwordHash: await bcrypt.hash(b.password, 10),
  });
  res.status(201).json(publicUser(u));
}));

// ───────────────────────── errors + static ─────────────────────────
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err instanceof multer.MulterError || /allowed/.test(err.message) ? 400 : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong. Please try again.' : err.message });
});

const distCandidates = [
  process.env.FRONTEND_DIST,
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../public'),
].filter(Boolean);
const dist = distCandidates.find((p) => fs.existsSync(path.join(p, 'index.html')));
if (dist) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  console.log(`Serving frontend from ${dist}`);
}

const server = app.listen(config.port, () => console.log(`African Admission API listening on :${config.port}`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flush(); server.close(() => process.exit(0)); });
