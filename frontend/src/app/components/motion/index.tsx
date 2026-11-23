/**
 * African Admission motion system.
 * One easing curve, three durations, consistent distances — every animation on the site uses these.
 * All components respect prefers-reduced-motion (via <MotionConfig reducedMotion="user"> in App and the hook below).
 */
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  animate,
  type Variants,
} from 'motion/react';
import { Children, useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const; // expo-out: fast start, long graceful settle
export const DUR = { fast: 0.35, base: 0.7, slow: 1.1 };

/** True on touch devices / small screens, where we tone motion down. */
export function useIsCoarse() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 767px)');
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return coarse;
}

type Dir = 'up' | 'down' | 'left' | 'right' | 'none';
const offset = (dir: Dir, d: number) =>
  dir === 'up' ? { y: d } : dir === 'down' ? { y: -d } : dir === 'left' ? { x: d } : dir === 'right' ? { x: -d } : {};

/** Fades + slides content in once it scrolls into view. */
export function Reveal({
  children, delay = 0, dir = 'up', distance = 28, className, as = 'div', once = true, blur = false, style,
}: {
  children: ReactNode; delay?: number; dir?: Dir; distance?: number; className?: string;
  as?: 'div' | 'section' | 'li' | 'span' | 'article'; once?: boolean; blur?: boolean; style?: CSSProperties;
}) {
  const coarse = useIsCoarse();
  const d = coarse ? Math.min(distance, 16) : distance;
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, ...offset(dir, d), ...(blur ? { filter: 'blur(8px)' } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(blur ? { filter: 'blur(0px)' } : {}) }}
      viewport={{ once, margin: '0px 0px -10% 0px' }}
      transition={{ duration: DUR.base, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const staggerParent: Variants = { hidden: {}, show: (s: number = 0.08) => ({ transition: { staggerChildren: s } }) };
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({ children, className, stagger = 0.08, as = 'div' }: { children: ReactNode; className?: string; stagger?: number; as?: 'div' | 'ul' }) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={staggerParent} custom={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -8% 0px' }}>
      {children}
    </M>
  );
}
export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const M = motion[as] as typeof motion.div;
  return <M className={className} variants={staggerChild}>{children}</M>;
}

/** Headline that reveals word by word from behind a mask. */
export function SplitHeading({
  text, as = 'h2', className, delay = 0, stagger = 0.06, immediate = false,
}: { text: string; as?: 'h1' | 'h2' | 'h3'; className?: string; delay?: number; stagger?: number; immediate?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const show = immediate || inView;
  const Tag = as;
  const words = text.split(' ');
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '110%' }}
            animate={show ? { y: '0%' } : { y: '110%' }}
            transition={{ duration: DUR.slow, ease: EASE, delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Counts up to a number when visible. */
export function CountUp({ to, duration = 1.8, prefix = '', suffix = '', className }: { to: number; duration?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVal(to); return; }
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return <span ref={ref} className={className}>{prefix}{val.toLocaleString('en-ZA')}{suffix}</span>;
}

/** Pulls its child gently toward the cursor. Disabled on touch + reduced motion. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const coarse = useIsCoarse();
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const off = coarse || reduce;
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className || ''}`}
      style={off ? undefined : { x, y }}
      onPointerMove={(e) => {
        if (off || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/** Card that tilts in 3D toward the cursor with a moving light sheen. */
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const coarse = useIsCoarse();
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 160, damping: 18 });
  const glow = useTransform([px, py], ([a, b]: number[]) =>
    `radial-gradient(420px circle at ${a * 100}% ${b * 100}%, rgba(255,255,255,0.55), transparent 45%)`);
  const off = coarse || reduce;
  return (
    <motion.div
      ref={ref}
      className={`group relative [transform-style:preserve-3d] ${className || ''}`}
      style={off ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileHover={off ? undefined : { y: -6 }}
      transition={{ duration: DUR.fast, ease: EASE }}
      onPointerMove={(e) => {
        if (off || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
    >
      {children}
      {!off && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-soft-light" style={{ background: glow }} />
      )}
    </motion.div>
  );
}

/** Moves children on scroll at a different speed than the page. */
export function Parallax({ children, speed = 0.15, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const coarse = useIsCoarse();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}px`, `${speed * 100}px`]);
  return (
    <motion.div ref={ref} className={className} style={coarse ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/** Thin progress bar at the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300"
      style={{ scaleX }}
    />
  );
}

/** Image that unveils with a clip-path wipe + subtle zoom-out. */
export function ImageReveal({ src, alt, className, imgClassName, delay = 0 }: { src: string; alt: string; className?: string; imgClassName?: string; delay?: number }) {
  return (
    <motion.div
      className={`overflow-hidden ${className || ''}`}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover ${imgClassName || ''}`}
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE, delay }}
      />
    </motion.div>
  );
}

/** Animated page header band reused on inner pages. */
export function PageHero({ title, subtitle, icon, tone = 'emerald', children }: {
  title: string; subtitle?: string; icon?: ReactNode; tone?: 'emerald' | 'blue' | 'indigo'; children?: ReactNode;
}) {
  const tones = {
    emerald: 'from-emerald-800 via-emerald-700 to-teal-800',
    blue: 'from-blue-950 via-blue-800 to-sky-800',
    indigo: 'from-indigo-950 via-indigo-800 to-violet-800',
  };
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} text-white`}>
      <div aria-hidden className="absolute inset-0 aa-grid opacity-[0.15]" />
      <div aria-hidden className="aa-orb aa-orb-a" />
      <div aria-hidden className="aa-orb aa-orb-b" />
      <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="flex items-start gap-5">
          {icon && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="hidden sm:flex shrink-0 size-16 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 items-center justify-center"
            >
              {icon}
            </motion.div>
          )}
          <div>
            <SplitHeading as="h1" immediate text={title} className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight" />
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.base, ease: EASE, delay: 0.35 }}
                className="mt-4 text-lg text-white/80 max-w-2xl"
              >
                {subtitle}
              </motion.p>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small spinner used in buttons. */
export function Spinner({ className = 'size-5' }: { className?: string }) {
  return <span className={`inline-block rounded-full border-2 border-current border-r-transparent animate-spin ${className}`} aria-hidden />;
}

export { motion, Children };

/**
 * Reveals matching descendants as they scroll into view — used for long legacy forms
 * where wrapping every section in <Reveal> would be noisy. Elements stay visible if JS/motion is off.
 */
export function useRevealChildren(selector = ':scope > form > *, :scope > form > section') {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root || reduce || typeof IntersectionObserver === 'undefined') return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
    els.forEach((el) => {
      const idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)';
      el.style.transitionDelay = `${(idx % 4) * 80}ms`;
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.opacity = '1';
          el.style.transform = 'none';
          io.unobserve(el);
          setTimeout(() => { el.style.transform = ''; el.style.transition = ''; el.style.transitionDelay = ''; }, 1300);
        }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, reduce]);
  return ref;
}
