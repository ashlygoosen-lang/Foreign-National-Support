import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.js';

const SCHOOLS = [
  { name: 'Cape Academy International School', location: 'Cape Town', grades: 'Grade 2-12', fees: 'R45,000 - R65,000 per year', contact: '+27 21 555 0001', email: 'info@capeacademy.co.za', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800' },
  { name: 'Johannesburg Premier College', location: 'Johannesburg', grades: 'Grade 2-12', fees: 'R50,000 - R70,000 per year', contact: '+27 11 555 0002', email: 'admissions@jpcollege.co.za', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800' },
  { name: 'Durban Excellence Academy', location: 'Durban', grades: 'Grade 2-12', fees: 'R40,000 - R60,000 per year', contact: '+27 31 555 0003', email: 'info@durbanexcellence.co.za', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800' },
  { name: 'Pretoria International School', location: 'Pretoria', grades: 'Grade 2-12', fees: 'R48,000 - R68,000 per year', contact: '+27 12 555 0004', email: 'contact@pretoriainternational.co.za', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' },
  { name: 'Port Elizabeth Learning Centre', location: 'Port Elizabeth', grades: 'Grade 2-12', fees: 'R35,000 - R55,000 per year', contact: '+27 41 555 0005', email: 'info@pelearning.co.za', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800' },
  { name: 'Stellenbosch Academic Institute', location: 'Stellenbosch', grades: 'Grade 2-12', fees: 'R42,000 - R62,000 per year', contact: '+27 21 555 0006', email: 'admissions@stellenboschai.co.za', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800' },
];

export function seed() {
  if (db.all('schools').length === 0) {
    for (const s of SCHOOLS) db.insert('schools', { ...s, active: true });
    console.log(`Seeded ${SCHOOLS.length} schools`);
  }

  const adminId = (process.env.ADMIN_ID || 'admin').trim();
  const existing = db.find('users', (u) => u.role === 'admin');
  if (!existing) {
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
    db.insert('users', {
      id: 'U-ADMIN',
      role: 'admin',
      firstName: 'Site',
      lastName: 'Administrator',
      idType: 'id',
      idNumber: adminId,
      email: (process.env.ADMIN_EMAIL || 'admin@africanadmission.org').toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      memberNumber: 'AA-ADMIN',
    });
    console.log('──────────────────────────────────────────────');
    console.log(` Admin account created. Login ID: ${adminId}`);
    if (!process.env.ADMIN_PASSWORD) console.log(` Generated admin password: ${password}`);
    console.log(' Change it via ADMIN_PASSWORD or the admin panel.');
    console.log('──────────────────────────────────────────────');
  } else if (process.env.ADMIN_PASSWORD && process.env.ADMIN_RESET_ON_BOOT === 'true') {
    db.update('users', existing.id, { passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10) });
  }
}
