import { Link } from 'react-router-dom';
import { Heart, GraduationCap, Shield, ArrowRight, CheckCircle, ChevronDown, Sparkles, Stethoscope, School } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CountUp, EASE, Magnetic, Reveal, SplitHeading, Stagger, StaggerItem, TiltCard, useIsCoarse } from '../motion';
import { api } from '../../lib/api';

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const coarse = useIsCoarse();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgba(110,231,183,0.16), transparent 60%)`;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white"
      onPointerMove={(e) => {
        if (coarse) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
    >
      <div aria-hidden className="absolute inset-0 aa-grid opacity-25" />
      <div aria-hidden className="aa-orb aa-orb-a" />
      <div aria-hidden className="aa-orb aa-orb-b" />
      <div aria-hidden className="aa-orb aa-orb-c" />
      {!coarse && <motion.div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: spotlight }} />}

      <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div style={coarse ? undefined : { y: textY, opacity: fade }}>
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur px-4 py-1.5 text-sm text-emerald-50 mb-6"
            >
              <span className="relative flex size-2">
                <span className="aa-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
              </span>
              Now enrolling members across South Africa
            </motion.div>

            <h1 className="text-white mb-6 font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]" aria-label="Access Quality Healthcare & Education">
              <SplitHeading as="h2" immediate text="Access Quality" className="block" delay={0.2} />
              <span className="block">
                <span className="inline-block overflow-hidden align-bottom pb-[0.08em]">
                  <motion.span
                    className="inline-block aa-gradient-text"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.38 }}
                  >
                    Healthcare & Education
                  </motion.span>
                </span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
              className="text-lg md:text-xl text-emerald-50/90 mb-9 max-w-xl leading-relaxed"
            >
              Join our community platform providing foreign nationals with access to private
              hospitals and quality schools through affordable monthly contributions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
              className="flex flex-wrap gap-4"
            >
              <Magnetic>
                <Link
                  to="/register"
                  className="aa-btn group bg-white text-emerald-800 px-8 py-3.5 rounded-xl inline-flex items-center gap-2 font-medium shadow-xl shadow-emerald-950/30"
                >
                  Get Started
                  <ArrowRight className="size-5 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/login" className="aa-btn bg-emerald-600/70 ring-1 ring-white/25 backdrop-blur text-white px-8 py-3.5 rounded-xl inline-flex font-medium hover:bg-emerald-500/80">
                  Member Login
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.0 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-emerald-100/80"
            >
              {['Plans from R800/month', 'Grade 2–12 placements', '24/7 emergency care'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2"><CheckCircle className="size-4 text-emerald-300" />{t}</span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="relative" style={coarse ? undefined : { y: imgY }}>
            <motion.div
              initial={{ clipPath: 'inset(12% 12% 12% 12% round 24px)', opacity: 0, scale: 1.04 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1, scale: 1 }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-950/50 ring-1 ring-white/15"
            >
              <motion.div initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE, delay: 0.3 }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200"
                  alt="Healthcare and education"
                  className="w-full aspect-[4/3] object-cover"
                />
              </motion.div>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-transparent to-transparent" />
            </motion.div>

            {/* Floating glass chips */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
              className="absolute -left-4 sm:-left-8 bottom-8 sm:bottom-10"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl text-gray-900 px-4 py-3 shadow-2xl">
                <span className="size-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Stethoscope className="size-5" /></span>
                <div>
                  <p className="text-xs text-gray-500 leading-none mb-1">Private hospitals</p>
                  <p className="text-sm font-semibold leading-none">Healthcare access</p>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1.2 }}
              className="absolute -right-3 sm:-right-6 top-8"
            >
              <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl text-gray-900 px-4 py-3 shadow-2xl">
                <span className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><School className="size-5" /></span>
                <div>
                  <p className="text-xs text-gray-500 leading-none mb-1">Quality schools</p>
                  <p className="text-sm font-semibold leading-none">Grade 2–12 placement</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#notice"
        aria-label="Scroll to content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-emerald-100/70 text-xs tracking-widest uppercase"
      >
        Scroll
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}

const services = [
  {
    icon: Heart, title: 'Private Healthcare Access', tone: 'emerald',
    desc: 'Access to quality private hospitals and medical facilities when you need care.',
    items: ['24/7 Emergency care', 'Specialist consultations', 'Diagnostic services'],
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
  },
  {
    icon: GraduationCap, title: 'Private School Registration', tone: 'blue',
    desc: "Quality education at private schools for your children's bright future.",
    items: ['Grade 2-12 placement', 'Quality curriculum', 'Support services'],
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
  },
  {
    icon: Shield, title: 'Biometric Security', tone: 'purple',
    desc: 'Identity and document verification, reviewed by trained staff before membership is confirmed.',
    items: ['Photo & document checks', 'Staff-reviewed results', 'Track status by reference'],
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
  },
] as const;

const toneMap = {
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', check: 'text-emerald-600', ring: 'hover:ring-emerald-200' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', check: 'text-blue-600', ring: 'hover:ring-blue-200' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', check: 'text-purple-600', ring: 'hover:ring-purple-200' },
};

export function Home() {
  const [schools, setSchools] = useState(6);
  const [notice, setNotice] = useState(
    'Enrollment for Grade 2-7 and 9-12: Confirm acceptance of placements between 17 September - 30 September 2025'
  );
  useEffect(() => {
    api('/stats').then((s) => s?.schools && setSchools(s.schools)).catch(() => {});
    api('/config').then((c) => c?.enrollmentNotice && setNotice(c.enrollmentNotice)).catch(() => {});
  }, []);

  return (
    <div>
      <Hero />

      {/* Important Notice */}
      <section id="notice" className="bg-amber-50 border-y-4 border-amber-400 relative overflow-hidden">
        <motion.div aria-hidden className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-100/80 to-transparent"
          initial={{ x: '-100%' }} whileInView={{ x: '400%' }} viewport={{ once: true }} transition={{ duration: 2.2, ease: EASE, delay: 0.3 }} />
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <Reveal className="flex items-start gap-4">
            <motion.div initial={{ rotate: -20, scale: 0.6 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
              <Shield className="size-6 text-amber-600 flex-shrink-0 mt-1" />
            </motion.div>
            <div>
              <h3 className="text-amber-900 mb-2 font-semibold">Important Registration Period</h3>
              <p className="text-amber-800">{notice}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-white border-b border-gray-100">
        <Stagger className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { node: <CountUp to={800} prefix="R" />, label: 'Plans from, per month' },
            { node: <CountUp to={schools} />, label: 'Partner private schools' },
            { node: <><CountUp to={11} /> grades</>, label: 'Grade 2–7 and 9–12' },
            { node: <>24/<CountUp to={7} duration={1} /></>, label: 'Emergency healthcare' },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <p className="font-display font-bold text-3xl md:text-4xl text-emerald-700 tabular-nums">{s.node}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <Reveal><p className="text-sm uppercase tracking-[0.2em] text-emerald-600 mb-3 inline-flex items-center gap-2"><Sparkles className="size-4" />What we offer</p></Reveal>
            <SplitHeading text="Our Services" className="mb-4 font-display font-bold text-3xl md:text-4xl text-gray-900" />
            <Reveal delay={0.1}>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide comprehensive support for foreign nationals seeking quality healthcare
                and education services in Africa with advanced security verification.
              </p>
            </Reveal>
          </div>

          <Stagger className="grid md:grid-cols-3 gap-8" stagger={0.12}>
            {services.map((s) => {
              const t = toneMap[s.tone];
              const Icon = s.icon;
              return (
                <StaggerItem key={s.title}>
                  <TiltCard className={`${t.bg} rounded-2xl h-full ring-1 ring-transparent ${t.ring} transition-shadow duration-500 hover:shadow-2xl hover:shadow-gray-900/10`}>
                    <div className="relative h-40 overflow-hidden rounded-t-2xl">
                      <img src={s.img} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    </div>
                    <div className="p-8 pt-0 [transform:translateZ(30px)]">
                      <div className={`${t.icon} w-16 h-16 rounded-xl flex items-center justify-center mb-6 -mt-8 relative shadow-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
                        <Icon className="size-8 text-white" />
                      </div>
                      <h3 className="mb-3 font-display font-semibold text-xl">{s.title}</h3>
                      <p className="text-gray-600 mb-5">{s.desc}</p>
                      <ul className="space-y-2.5 text-sm text-gray-700">
                        {s.items.map((it) => (
                          <li key={it} className="flex items-start gap-2">
                            <CheckCircle className={`size-5 ${t.check} flex-shrink-0 mt-0.5`} />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <SplitHeading text="How It Works" className="mb-4 font-display font-bold text-3xl md:text-4xl text-gray-900" />
            <Reveal delay={0.1}>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple steps to access quality healthcare and education for you and your family.
              </p>
            </Reveal>
          </div>

          <div className="relative">
            {/* connecting line that draws on scroll */}
            <motion.div
              aria-hidden
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-500 to-emerald-200 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '0px 0px -20% 0px' }}
              transition={{ duration: 1.6, ease: EASE }}
            />
            <Stagger className="grid md:grid-cols-4 gap-10 relative" stagger={0.18}>
              {[
                { step: '1', title: 'Register', desc: 'Create your account with your ID or passport details' },
                { step: '2', title: 'Choose Plan', desc: 'Select healthcare and/or education coverage' },
                { step: '3', title: 'Contribute Monthly', desc: 'Make affordable monthly contributions' },
                { step: '4', title: 'Access Services', desc: 'Visit hospitals or register at schools when needed' },
              ].map((item) => (
                <StaggerItem key={item.step} className="text-center group">
                  <div className="relative mx-auto mb-5 w-16 h-16">
                    <span className="absolute inset-0 rounded-full bg-emerald-400/30 scale-100 transition-transform duration-700 group-hover:scale-150 group-hover:opacity-0" />
                    <div className="relative bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold shadow-lg shadow-emerald-600/30 ring-4 ring-gray-50 transition-transform duration-500 group-hover:-translate-y-1">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="mb-2 font-display font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm max-w-[16rem] mx-auto">{item.desc}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-emerald-600 text-white relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 aa-grid opacity-20" />
        <div aria-hidden className="aa-orb aa-orb-a" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <SplitHeading text="Ready to Get Started?" className="text-white mb-4 font-display font-bold text-3xl md:text-5xl" />
          <Reveal delay={0.15}>
            <p className="text-emerald-50 text-xl mb-10">
              Join thousands of foreign nationals accessing quality healthcare and education services.
            </p>
          </Reveal>
          <Reveal delay={0.25} className="flex flex-wrap gap-4 justify-center">
            <Magnetic>
              <Link to="/register" className="aa-btn bg-white text-emerald-700 px-8 py-3.5 rounded-xl inline-flex font-medium">
                Register Now
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/faq" className="aa-btn bg-emerald-700 text-white px-8 py-3.5 rounded-xl inline-flex font-medium hover:bg-emerald-800">
                Learn More
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
