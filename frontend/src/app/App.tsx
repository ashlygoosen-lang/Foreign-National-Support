import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/pages/Home';
import { Register } from './components/pages/Register';
import { Login } from './components/pages/Login';
import { ContactUs } from './components/pages/ContactUs';
import { FAQ } from './components/pages/FAQ';
import { FindSchool } from './components/pages/FindSchool';
import { Resources } from './components/pages/Resources';
import { Dashboard } from './components/pages/Dashboard';
import { BiometricVerification } from './components/pages/BiometricVerification';
import { BorderControl } from './components/pages/BorderControl';
import { ResetPassword } from './components/pages/ResetPassword';
import { AuthProvider, useAuth } from './lib/auth';
import { EASE, ScrollProgress, Spinner } from './components/motion';
import { GraduationCap } from 'lucide-react';

// Long forms + admin are split out so the first paint stays light.
const ReferralForm = lazy(() => import('./components/pages/ReferralForm').then((m) => ({ default: m.ReferralForm })));
const SchoolEnrollment = lazy(() => import('./components/pages/SchoolEnrollment').then((m) => ({ default: m.SchoolEnrollment })));
const Admin = lazy(() => import('./components/pages/Admin').then((m) => ({ default: m.Admin })));

function RequireAuth({ children, staff = false }: { children: ReactNode; staff?: boolean }) {
  const { user, loading, isStaff } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (staff && !isStaff) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-emerald-600">
      <Spinner className="size-8" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [pathname]);
  return null;
}

/** Brief brand intro on first visit (session) — sets the premium tone, then gets out of the way. */
function Intro() {
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem('aa_intro'); } catch { return false; }
  });
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('aa_intro', '1'); } catch { /* ignore */ }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setShow(false), reduce ? 0 : 1300);
    return () => clearTimeout(t);
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}
        >
          <motion.div className="flex items-center gap-4 text-white" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6, ease: EASE }}>
            <motion.div
              className="bg-white/10 ring-1 ring-white/25 p-3 rounded-2xl"
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <GraduationCap className="size-9" />
            </motion.div>
            <div className="overflow-hidden">
              <motion.p className="text-2xl md:text-3xl font-semibold font-display" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}>
                African Admission
              </motion.p>
              <motion.div className="h-px bg-emerald-300/70 mt-2 origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.35 }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/find-school" element={<FindSchool />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/referral" element={<ReferralForm />} />
            <Route path="/school-enrollment" element={<SchoolEnrollment />} />
            <Route path="/biometric-verification" element={<BiometricVerification />} />
            <Route path="/border-control" element={<BorderControl />} />
            <Route path="/admin" element={<RequireAuth staff><Admin /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-display font-bold text-emerald-600">404</p>
      <p className="mt-3 text-gray-600">That page doesn't exist.</p>
      <a href="/" className="aa-btn mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg">Back to home</a>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <Router>
          <Intro />
          <ScrollProgress />
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </Router>
      </AuthProvider>
    </MotionConfig>
  );
}
