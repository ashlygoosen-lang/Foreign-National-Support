# African Admission — Healthcare & Education Access Platform

Foreign nationals register, choose a plan (Healthcare R800 · School R900 · Both R1,500 per month), pay monthly
contributions, verify their identity, and apply for school places or healthcare referrals. Staff review
everything from an admin console.

```
frontend/   React 18 + Vite + Tailwind v4 + motion (Figma Make design, kept and upgraded)
backend/    Node/Express API — JSON datastore, JWT auth, file uploads; also serves the built frontend
```

## Run locally
```bash
npm run install:all
ADMIN_PASSWORD=Admin12345 npm run dev:api     # API on :4000
npm run dev:web                               # site on :5173 (proxies /api → :4000)
```
Admin login: ID `admin` + your `ADMIN_PASSWORD` (if unset, a random one is printed in the server log on first boot).

## Deploy to Railway (one service)
1. Push this folder to GitHub and create a Railway service from the repo. `railway.json` sets
   build = `npm run build`, start = `npm start`, health check = `/api/health`.
2. **Add a Volume** mounted at `/data` and set `DATA_DIR=/data`. Without it, members, uploads and payments are wiped on every redeploy.
3. Set the variables from `.env.example` (at least `JWT_SECRET`, `ADMIN_PASSWORD`, `DATA_DIR`, `SITE_URL`, bank details).

## What's connected
| Page | Backend |
|---|---|
| Register / Login | `POST /api/auth/register`, `/login` — ID or passport number + password (bcrypt, JWT) |
| Forgot / reset password | Member requests → staff issue a 48-hour one-time link → `/reset-password` |
| Dashboard | Live status, plan, contribution history, verification status, applications, documents |
| Make a Contribution | Creates pending contributions with a payment reference; staff confirm receipt → membership becomes **Active** |
| Documents | Printable membership certificate, healthcare access card, receipts (only once paid) |
| Biometric Verify | Uploads photo, birth certificate, passport/ID, proof of address → reference number; public status check |
| Border Control | Staff-only review console: search/filter, open documents, approve / flag / reject with logged notes |
| School Enrollment | Full form + learner photo, local draft save, reference number |
| Referral Form | Full form, local draft save, reference number |
| Contact | Saved to the admin inbox |
| Find a School | Schools served from the API; admins add/remove schools |
| Admin (`/admin`) | Overview, members, contributions, enrollments, referrals, messages, password resets, schools, staff accounts |

## Notes
- **External criminal-record databases are not connected.** The original mock randomly flagged ~20% of applicants with fake
  INTERPOL/police matches. That has been replaced by real officer review. Automated checks need formal
  data-sharing agreements with those agencies. The console shows each one as "not connected" until then.
- Fingerprint capture can't happen in a browser; the flow notes it's done in person where required.
- Payments are recorded as EFT/debit-order/cash with references and confirmed by staff. A card gateway (PayFast, Yoco, Paystack) can be added later.

## Motion system
`frontend/src/app/components/motion/` — one easing curve (expo-out), shared durations, and reusable primitives:
`Reveal`, `Stagger`, `SplitHeading`, `CountUp`, `Magnetic`, `TiltCard`, `Parallax`, `ImageReveal`, `ScrollProgress`,
`PageHero`, `useRevealChildren`. Page transitions, brand intro, animated nav indicator + services dropdown,
hero spotlight/orbs/parallax, scroll-drawn timeline. Respects `prefers-reduced-motion` and tones down on touch/mobile.
Animations use transform/opacity only, so they run on the GPU.
