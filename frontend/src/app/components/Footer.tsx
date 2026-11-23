import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, Clock } from 'lucide-react';
import { Reveal } from './motion';

export function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white mt-auto overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[50rem] h-80 bg-emerald-600/10 blur-3xl rounded-full" />
      <div className="relative max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-600 p-2 rounded-lg"><GraduationCap className="size-5" /></div>
              <h3 className="font-display">About Us</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              African Admission provides foreign nationals access to quality private healthcare
              and education services through monthly contributions.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="mb-4 font-display">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {[
                ['/register', 'Register'],
                ['/login', 'Login'],
                ['/faq', 'FAQ'],
                ['/contact', 'Contact Us'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="aa-link hover:text-emerald-400">{label}</Link>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.16}>
            <h3 className="mb-4 font-display">Contact Information</h3>
            <ul className="text-gray-300 text-sm space-y-2.5">
              <li className="flex items-center gap-2"><Mail className="size-4 text-emerald-400" /> <a className="aa-link" href="mailto:info@saadmission.org">info@saadmission.org</a></li>
              <li className="flex items-center gap-2"><Phone className="size-4 text-emerald-400" /> <a className="aa-link" href="tel:+27211234567">+27 (0) 21 123 4567</a></li>
              <li className="flex items-center gap-2"><Clock className="size-4 text-emerald-400" /> Support Hours: Mon-Fri 8AM-5PM SAST</li>
            </ul>
          </Reveal>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} African Admission. All rights reserved.</p>
          <p className="mt-2">This is an independent platform and not affiliated with any government entity.</p>
        </div>
      </div>
    </footer>
  );
}
