# Redesign Execution Task List & Tracking

**Specification:** `DESIGN.md`  
**Definition of Done per Task:**
- [x] Uses only design tokens (zero hardcoded values or magic numbers)
- [x] Uses shared components from Phase 2
- [x] Verified at Mobile (375px), Tablet (768px), and Desktop (1280px+)
- [x] Default, hover, focus-visible, active, disabled, loading, empty, and error states styled
- [x] Functionality, API calls, and validation completely preserved
- [x] Passes WCAG AA contrast and accessibility checks
- [x] Strictly matches DESIGN.md Do's and Don'ts

---

## Phase 1: Design Tokens
- [x] **T-TOK-01:** Update `packages/ui/src/tokens.ts` with complete DESIGN.md color, typography, spacing, radius, and elevation tokens.
- [x] **T-TOK-02:** Update `packages/ui/tailwind.preset.js` to expose all tokens as Tailwind utilities and CSS variables.
- [x] **T-TOK-03:** Load Mulish (500, 700) from Google Fonts across all app layouts with Nunito Sans fallback; enforce 500/700 weight discipline.
- [x] **T-TOK-04:** Apply cool-gray canvas ground (`#f2f4f7`) globally to `body` across `apps/site`, `apps/app`, and `apps/admin`.

---

## Phase 2: Primitives & Shared Components (`packages/ui`)
- [x] **T-CMP-01: Buttons:** Implement `button-primary` (green fill, full pill), `button-outline-green`, `button-outline-neutral`, `button-muted`, `button-tag` (8px).
- [x] **T-CMP-02: Inputs:** Implement `search-pill` (full pill), `text-input` (full pill), `email-input` (8px radius) with error, disabled, helper states.
- [x] **T-CMP-03: Cards & Containers:** Implement base `deal-card` (white surface, 1px hairline, 8px radius, 16px padding), `sidebar-card`, and `timestamp-pill`.
- [x] **T-CMP-04: Badges:** Implement `discount-badge` (mint pill, strong green text), `badge-neutral-subtle`, `badge-filled`, `premium-badge` (violet), `warning-badge` (yellow/amber).
- [x] **T-CMP-05: Signature Controls:** Implement `temperature-control` (cold-blue down arrow, hot-red text, hot-red up arrow), `temperature-up`, `temperature-down`, and `price-lockup` (green price, struck-through muted, discount badge).
- [x] **T-CMP-06: Other Primitives:** Avatar (circle, canvas fill, white ring), modal dialog (level-3 shadow), toast notifications, full-round filter chips/tabs, tables, pagination, skeleton loaders, and empty states.
- [x] **T-CMP-07: Navigation:** Implement redesigned `nav-bar` (white surface, hairline bottom, menu pill, search pill, text links, green action pill) and `footer` (white surface, hairline top, link columns, social circles).
- [x] **T-CMP-08: Style Guide:** Build `/styleguide` dev page rendering every primitive in all states for review.

---

## Phase 3: Page-by-Page Redesign

### Group 1: Shells & Layouts
- [x] **T-PAGE-01:** `apps/site/src/app/layout.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`
- [x] **T-PAGE-02:** `apps/app/src/app/layout.tsx` (Guardian navigation and shell)
- [x] **T-PAGE-03:** `apps/admin/src/app/layout.tsx` and `AdminBanner.tsx`

### Group 2: Marketing & Content (`apps/site`)
- [x] **T-PAGE-04:** Landing Page (`apps/site/src/app/page.tsx`) — 2-column feed layout with live scam alerts and sidebar
- [x] **T-PAGE-05:** Pricing & Waitlist Page (`apps/site/src/app/pricing/page.tsx`) — `price-lockup`, discount badges, coupon box, waitlist card
- [x] **T-PAGE-06:** How It Works (`apps/site/src/app/how-it-works/page.tsx`)
- [x] **T-PAGE-07:** Features Page (`apps/site/src/app/features/page.tsx`)
- [x] **T-PAGE-08:** Changelog Page (`apps/site/src/app/changelog/page.tsx`)
- [x] **T-PAGE-09:** Help & Contact Pages (`apps/site/src/app/help/`, `apps/site/src/app/contact/`)
- [x] **T-PAGE-10:** Security & Status Pages (`apps/site/src/app/security/`, `apps/site/src/app/status/`)
- [x] **T-PAGE-11:** Learn Hub & Scam Guides (`apps/site/src/app/learn/`)
- [x] **T-PAGE-12:** Legal Pages (`terms`, `privacy`, `refunds`, `cookies`, etc.)

### Group 3: Guardian & Elder Application (`apps/app`)
- [x] **T-PAGE-13:** Guardian Dashboard (`apps/app/src/app/page.tsx`)
- [x] **T-PAGE-14:** Tabletop Elder Listening Kiosk (`apps/app/src/app/elder/page.tsx`)
- [x] **T-PAGE-15:** Onboarding 5-Step Wizard (`apps/app/src/app/onboarding/page.tsx`)
- [x] **T-PAGE-16:** Alert Details (`apps/app/src/app/alerts/[id]/page.tsx`)
- [x] **T-PAGE-17:** Billing & Privacy Portals (`apps/app/src/app/billing/`, `apps/app/src/app/privacy/`)
- [x] **T-PAGE-18:** Guardian Auth (`apps/app/src/app/auth/page.tsx`)

### Group 4: Operations Console (`apps/admin`)
- [x] **T-PAGE-19:** Admin Operations Dashboard (`apps/admin/src/app/page.tsx`)
- [x] **T-PAGE-20:** Admin Auth & TOTP Step (`apps/admin/src/app/auth/page.tsx`)

---

## Phase 4: Accessibility & Quality
- [x] **T-QA-01:** Contrast checks (WCAG AA across text and controls; green-strong on light surfaces).
- [x] **T-QA-02:** Visible focus rings (`focus-visible:ring-2`) and keyboard navigation.
- [x] **T-QA-03:** Touch targets >= 44px on mobile viewports.
- [x] **T-QA-04:** Respect `prefers-reduced-motion` and cleanup old/unused CSS.

---

## Phase 5: Verification & Report
- [x] **T-VER-01:** Full monorepo build check (`pnpm build`) — 100% clean exit code 0.
- [x] **T-VER-02:** Offline test suite execution (`make test` / pytest) — 139/139 passed.
- [x] **T-VER-03:** Capture cross-device screenshots (Mobile 375px, Tablet 768px, Desktop 1280px+).
- [x] **T-VER-04:** Produce final deliverable `docs/redesign/REPORT.md`.
