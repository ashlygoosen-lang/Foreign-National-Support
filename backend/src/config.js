import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

function persistentSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(DATA_DIR, '.jwt-secret');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const s = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(file, s, { mode: 0o600 });
  return s;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: persistentSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  siteUrl: process.env.SITE_URL || '',
  // Monthly contribution plans (matches the FAQ on the site)
  plans: {
    healthcare: { key: 'healthcare', name: 'Healthcare Access', monthly: 800 },
    school: { key: 'school', name: 'School Admission', monthly: 900 },
    both: { key: 'both', name: 'Healthcare & Education', monthly: 1500 },
  },
  // Bank details shown to members for EFT contributions (set in Railway variables)
  bank: {
    name: process.env.BANK_NAME || 'To be confirmed',
    accountName: process.env.BANK_ACCOUNT_NAME || 'African Admission',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'Set BANK_ACCOUNT_NUMBER',
    branchCode: process.env.BANK_BRANCH_CODE || '',
  },
  enrollmentNotice:
    process.env.ENROLLMENT_NOTICE ||
    'Enrollment for Grade 2-7 and 9-12: Confirm acceptance of placements between 17 September - 30 September 2025',
};
