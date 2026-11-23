import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LayoutDashboard, LogOut, ShieldCheck, ChevronDown, Fingerprint, School } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useAuth } from '../lib/auth';
import { EASE } from './motion';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isStaff, logout } = useAuth();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));
  useEffect(() => setMobileMenuOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(user
      ? [{ path: '/dashboard', label: 'My Dashboard' }]
      : [
          { path: '/register', label: 'Register' },
          { path: '/login', label: 'Login' },
        ]),
    { path: '/biometric-verification', label: 'Biometric Verify' },
    { path: '/border-control', label: 'Border Control' },
    { path: '/school-enrollment', label: 'School Enrollment' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/faq', label: 'FAQ' },
    { path: '/find-school', label: 'Find a School' },
    { path: '/resources', label: 'Help / Resources' },
    ...(isStaff ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  // Desktop groups the service pages into a dropdown so the bar stays on one line.
  const serviceLinks = [
    { path: '/biometric-verification', label: 'Biometric Verify', desc: 'Submit identity documents', icon: Fingerprint },
    { path: '/border-control', label: 'Border Control', desc: 'Staff verification console', icon: ShieldCheck },
    { path: '/school-enrollment', label: 'School Enrollment', desc: 'Apply for a school place', icon: School },
  ];
  const servicePaths = serviceLinks.map((l) => l.path);
  const desktopLinks = navLinks.filter((l) => !servicePaths.includes(l.path));
  const servicesActive = servicePaths.includes(location.pathname);
  useEffect(() => setServicesOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(6,78,59,0.25)]' : 'bg-white shadow-sm'
      }`}
    >
      <div className="border-b-4 border-emerald-600">
        <div className={`max-w-7xl mx-auto px-4 transition-[padding] duration-500 ${scrolled ? 'py-2.5' : 'py-4'}`}>
          <div className="flex items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="African Admission home">
              <motion.div
                className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-600/30"
                whileHover={{ rotate: -8, scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              >
                <GraduationCap className={`text-white transition-all duration-500 ${scrolled ? 'size-6' : 'size-8'}`} />
              </motion.div>
              <div>
                <h1 className="text-emerald-700 font-display font-semibold leading-tight text-base sm:text-lg whitespace-nowrap">African Admission</h1>
                <p className={`text-sm text-gray-600 transition-all duration-500 origin-left hidden sm:block xl:hidden 2xl:block ${scrolled ? 'h-0 opacity-0 scale-y-0' : 'h-5 opacity-100'}`}>
                  Healthcare & Education Access Platform
                </p>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 -mr-2 shrink-0 rounded-lg hover:bg-emerald-50 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <nav className="hidden xl:block" aria-label="Main">
              <ul className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
                {desktopLinks.map((link, idx) => (
                  <Fragment key={link.path}>
                    {idx === (user ? 2 : 3) && (
                      <li
                        key="services"
                        className="relative"
                        onMouseEnter={() => { setHovered('services'); setServicesOpen(true); }}
                        onMouseLeave={() => setServicesOpen(false)}
                      >
                        <button
                          onClick={() => setServicesOpen((o) => !o)}
                          aria-expanded={servicesOpen}
                          className={`relative z-10 flex items-center gap-1 px-3 py-1.5 text-[0.9rem] whitespace-nowrap rounded-full transition-colors duration-300 ${servicesActive ? 'text-emerald-700' : 'text-gray-700 hover:text-emerald-700'}`}
                        >
                          Services
                          <motion.span animate={{ rotate: servicesOpen ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown className="size-3.5" /></motion.span>
                        </button>
                        {hovered === 'services' && (
                          <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-emerald-50" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                        )}
                        {servicesActive && (
                          <motion.span layoutId="nav-active" className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-emerald-600" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                        )}
                        <AnimatePresence>
                          {servicesOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(4px)' }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, y: 6, scale: 0.98, filter: 'blur(4px)' }}
                              transition={{ duration: 0.3, ease: EASE }}
                              className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-20"
                            >
                              <div className="w-72 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-emerald-950/15 ring-1 ring-gray-100 p-2">
                                {serviceLinks.map((l, i) => (
                                  <motion.div key={l.path} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}>
                                    <Link to={l.path} className={`group flex items-start gap-3 p-3 rounded-xl transition-colors ${isActive(l.path) ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                                      <span className="size-9 shrink-0 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                        <l.icon className="size-4.5" />
                                      </span>
                                      <span>
                                        <span className="block text-sm font-medium text-gray-900">{l.label}</span>
                                        <span className="block text-xs text-gray-500">{l.desc}</span>
                                      </span>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    )}
                    <li className="relative" onMouseEnter={() => setHovered(link.path)}>
                      <Link
                        to={link.path}
                        className={`relative z-10 block px-3 py-1.5 text-[0.9rem] whitespace-nowrap rounded-full transition-colors duration-300 ${
                          isActive(link.path) ? 'text-emerald-700' : 'text-gray-700 hover:text-emerald-700'
                        }`}
                      >
                        {link.label}
                      </Link>
                      {hovered === link.path && (
                        <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-emerald-50" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                      )}
                      {isActive(link.path) && (
                        <motion.span layoutId="nav-active" className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-emerald-600" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                      )}
                    </li>
                  </Fragment>
                ))}
                {user && (
                  <li>
                    <button onClick={handleLogout} className="ml-2 p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Log out" aria-label="Log out">
                      <LogOut className="size-4" />
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="xl:hidden border-t bg-white/95 backdrop-blur-xl overflow-y-auto max-h-[calc(100vh-80px)]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Mobile">
              <motion.ul className="space-y-1" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } } }}>
                {navLinks.map((link) => (
                  <motion.li key={link.path} variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } } }}>
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${
                        isActive(link.path) ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {link.path === '/dashboard' && <LayoutDashboard className="size-4" />}
                      {link.path === '/admin' && <ShieldCheck className="size-4" />}
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
                {user && (
                  <motion.li variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-red-600 hover:bg-red-50">
                      <LogOut className="size-4" /> Log out
                    </button>
                  </motion.li>
                )}
              </motion.ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
