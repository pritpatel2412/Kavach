# Design System Inventory: Web App Redesign

**Source of Truth:** `DESIGN.md` (Deals Community / Dense Card Feed Design System)  
**Target:** Kavach Web Applications (`apps/site`, `apps/app`, `apps/admin`, `packages/ui`)  
**Date:** 2026-10-19  

---

## 1. Stack Detection & Technical Baseline

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Monorepo** | pnpm workspaces | `apps/*`, `packages/*` |
| **Framework** | Next.js 14.2 (App Router) | React 18, Server & Client Components |
| **Styling** | TailwindCSS 3.4 + Vanilla CSS | Unified preset in `packages/ui/tailwind.preset.js` |
| **Design System Package** | `@kavach/ui` (`packages/ui`) | Central tokens, primitives, and shared component library |
| **Icons** | Iconify (`iconify-icon`) & SVG icons | Clean inline SVG and icon primitives |
| **State Management** | React hooks (`useState`, `useReducer`, `useEffect`) | Local and URL state management |
| **Build & Typecheck** | TypeScript 5.6 + Next.js build | Strict type checking |
| **Test Setup** | Playwright + Pytest (API) | Cross-browser smoke & visual tests |

---

## 2. Page & Route Inventory

### A. Marketing & Public Pages (`apps/site` on `:3000`)
1. **`/`** — Master Landing Page (Hero, Value Prop, Problem Statistics, How It Works, Audio Demo, Features, Story, FAQ, CTA).
2. **`/pricing`** — Subscription Tiers, Billing Switcher, Coupon Validation, Early-Access Waitlist Registration.
3. **`/how-it-works`** — Interactive 4-step call intercept and acoustic listening demonstration.
4. **`/features`** — Complete technical breakdown of scam detection engine and hardware compatibility.
5. **`/changelog`** — Chronological release history with version badges.
6. **`/contact`** — Support enquiry and enterprise contact form.
7. **`/help`** — Knowledge base and FAQ hub.
8. **`/security`** — Security whitepaper, encryption protocols, and zero-raw-audio guarantee.
9. **`/status`** — System operational status, STT uptime, and incident feed.
10. **`/learn`** — Scam education library overview.
11. **`/learn/digital-arrest`** — Deep-dive guide on digital arrest scams.
12. **`/learn/courier-parcel`** — Deep-dive guide on customs and parcel courier scams.
13. **`/learn/kyc-otp`** — Deep-dive guide on bank KYC and utility disconnect threats.
14. **Legal Pages:**
    - `/acceptable-use`
    - `/consent-notice`
    - `/cookies`
    - `/grievance`
    - `/privacy`
    - `/refunds`
    - `/subprocessors`
    - `/terms`

### B. Guardian & Elder Application (`apps/app` on `:3001`)
15. **`/`** — Guardian Mobile/Desktop Dashboard (Elders list, live protection status, quick alerts, recent threat events).
16. **`/elder`** — Dedicated Tabletop Kiosk Listening Screen (Large-typography status, live mic wave indicator, high-contrast warning banner).
17. **`/onboarding`** — 5-Step Guardian Enrollment & Consent Wizard (Elder profile, voice cloning liveness challenge, contact pairing).
18. **`/alerts/[id]`** — Detailed Incident & Threat Transcript View with action triage.
19. **`/auth`** — Guardian passwordless magic link / phone authentication.
20. **`/billing`** — Guardian subscription management, STT credit top-ups, invoice history.
21. **`/privacy`** — DPDP 2023 compliance portal, voice embedding purge request, data download.

### C. Operations & Admin Console (`apps/admin` on `:3002`)
22. **`/`** — Single-Page Unified Operations Console:
    - Overview & KPI summary cards
    - Support Tickets CRM & Live Messaging Thread
    - Waitlist CRM with batch invite code issuer
    - Coupons & Promotions Manager with 60% discount ceiling
    - Tamper-Evident SHA-256 Audit Log Viewer
    - Visual Analytics & Conversion Funnel
    - Households & Elders Directory
    - Kiosk Devices & Heartbeat Monitor
    - DPDP Statutory Data Rights Queue
    - System Health & Configuration
23. **`/auth`** — Administrator Authentication (Magic link + RFC 6238 TOTP hardware challenge).

---

## 3. Shared Components & Primitives Inventory (`packages/ui`)

### Existing Components in `packages/ui/src/components/`:
- `Accordion.tsx`
- `AuroraCanvas.tsx`
- `Bars.tsx`
- `Button.tsx`
- `Checkbox.tsx`
- `Chip.tsx`
- `EmptyState.tsx`
- `FloatingCard.tsx`
- `Frame.tsx`
- `GlassCard.tsx`
- `HatchOverlay.tsx`
- `Icon.tsx`
- `Input.tsx`
- `KavachLogo.tsx`
- `MagneticButton.tsx`
- `Modal.tsx`
- `RiskMeter.tsx`
- `Select.tsx`
- `Skeleton.tsx`
- `SliderMeter.tsx`
- `SmoothScroll.tsx`
- `StageChip.tsx`
- `StatusDot.tsx`
- `Stepper.tsx`
- `Table.tsx`
- `Tabs.tsx`
- `TiltCard.tsx`
- `Toast.tsx`
- `WordReveal.tsx`

### Shell Components in Apps:
- `apps/site/src/components/SiteHeader.tsx`
- `apps/site/src/components/SiteFooter.tsx`
- `apps/site/src/components/LegalBanner.tsx`
- `apps/app/src/components/MockBanner.tsx`
- `apps/admin/src/components/AdminBanner.tsx`

---

## 4. Modal, Drawer, Toast, Dropdown & State Inventory

| Component Type | Locations / Usages | States Required |
| :--- | :--- | :--- |
| **Modals & Dialogs** | Guardian voice consent challenge (`/onboarding`), Admin action confirmations, coupon simulator (`/admin`), ticket canned macros | Default, open/enter animation, backdrop blur, close/exit, elevated shadow (level 3) |
| **Drawers / Sidebars** | Mobile navigation drawer (`SiteHeader`), Admin ticket detail drawer | Open, collapsed, sliding transition |
| **Toasts & Alerts** | Action feedback notifications (copy coupon, save settings, ticket reply) | Success (mint/green), Error (hot red), Warning (amber/yellow), Info (blue/neutral) |
| **Dropdowns & Menus** | Country selector, language selector (EN/HI/GU), role filter, category selector | Collapsed, expanded, item hover, keyboard selected |
| **Empty States** | Empty ticket queue, 0 alerts, empty waitlist segment, 0 search results | Friendly neutral illustration, clear message, primary pill CTA |
| **Loading States** | Page skeletons, button busy spinners, STT connecting pulse | Clean skeleton pulse on canvas/surface, no jitter |
| **Error States** | 404 Not Found, 500 Server Error, input validation error, API offline | Distinct error card, retry action button |
