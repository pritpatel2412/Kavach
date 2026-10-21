# Kavach Design System (DESIGN.md)

> **Single Source of Truth** for UI tokens, typography, component geometry, risk scales, accessibility guarantees, motion, and content honesty across the Kavach product suite (`apps/site`, `apps/app`, `apps/admin`, `apps/web`, `packages/ui`).

---

## 1. Product Overview & Identity

Kavach is an acoustic real-time scam-call guardian for Indian elders. A second device (spare phone, tablet, or laptop) rests on the tabletop, listens to incoming calls on speakerphone, streams audio to Gnani Prisma STT, deterministically evaluates digital arrest and extortion patterns, sounds high-clarity voice warnings (Gnani Timbre TTS, optionally a consented cloned family voice), and instantly dispatches multi-channel alerts to family guardians.

### Core Visual Principles
1. **Calm Authority, Zero Panic:** Extortion scams weaponize artificial terror and urgent timers. Kavach counteracts this with a cool-gray ground, structured white hairline cards, crisp type hierarchy, and a deterministic 4-stage Risk Scale.
2. **One Unifying Action Green:** A single confident brand green (`#1e7e34` fill / `#30a83c` brand accent) governs primary actions, price tags, and the protective shield mark. Downgrade, secondary, or destructive actions never use primary green.
3. **Geometry Discipline:**
   - **Interactive Elements:** Fully-round 540px pills (`rounded-full`) for all buttons, tab pills, search fields, and status badges.
   - **Content Containers:** Friendly 8px radius (`rounded-md`) for cards, dialogs, drawers, and banners.
   - **Separators:** 1px hairlines (`#e2e5e9`) with zero heavy bevels.
4. **Two-Weight Typography:** Mulish at exactly two weights: **Medium (500)** for reading, metadata, and form inputs; **Bold (700)** for headings, buttons, badges, and prominent numbers.
5. **Strict Monospace Isolation:** Monospace is permitted **only** for device pairing codes (e.g. `KAV-8291`), support ticket IDs (e.g. `TKT-2026-9041`), and cryptographic/code blocks. Monospace is **strictly forbidden** on UI labels, KPIs, dropdown selects, and action buttons.

---

## 2. Color Palette & WCAG AAA/AA Verification

All colors are mathematically verified against WCAG 2.1 standards. Kavach enforces $\ge 4.5:1$ contrast (WCAG AA) on standard marketing and guardian interfaces, and strictly enforces $\ge 7:1$ contrast (WCAG AAA) on elder-facing displays.

### 2.1 Core Surfaces & Text Tokens

| Token | Hex Value | Role | White (`#ffffff`) Contrast | Canvas (`#f2f4f7`) Contrast | WCAG Rating |
|---|---|---|---|---|---|
| `{colors.canvas}` | `#f2f4f7` | Cool-gray page canvas ground | — | — | Base |
| `{colors.surface}` | `#ffffff` | Pure white cards, dialogs, navbars | — | 1.15:1 (hairline edge) | Base |
| `{colors.hairline}` | `#e2e5e9` | 1px card and table dividers | 1.28:1 | 1.11:1 | Structural |
| `{colors.hairline-dark}` | `#cbd5e1` | Accessible borders on inputs/buttons | 1.54:1 | 1.34:1 | Interactive |
| `{colors.ink}` | `#111827` | Headings, hero display, primary titles | **17.5:1** | **15.8:1** | **AAA ($\ge 7:1$)** |
| `{colors.body}` | `#374151` | Body paragraphs, labels, table data | **10.3:1** | **9.3:1** | **AAA ($\ge 7:1$)** |
| `{colors.muted}` | `#595f69` | Secondary captions, timestamps, hints | **6.1:1** | **5.5:1** | **AA ($\ge 4.5:1$)** |
| `{colors.muted-elder}`| `#1f2937` | Elder screen secondary text | **14.2:1** | **12.8:1** | **AAA ($\ge 7:1$)** |

### 2.2 Brand & Action Green

| Token | Hex Value | Role | Contrast vs `#ffffff` | WCAG Rating |
|---|---|---|---|---|
| `{colors.primary}` | `#1e7e34` | Primary button fill (`text-white`) | **4.76:1** | **AA ($\ge 4.5:1$)** |
| `{colors.primary-hover}`| `#166527` | Primary button hover fill | **6.42:1** | **AA ($\ge 4.5:1$)** |
| `{colors.brand-accent}`| `#30a83c` | Logo shield accent, light badge icon | 3.12:1 (use with dark ink) | Non-text / Graphical |
| `{colors.green-strong}`| `#166534` | Green text on light surfaces (pill labels) | **7.41:1** | **AAA ($\ge 7:1$)** |
| `{colors.green-surface}`| `#e8f8ec` | Soft green background for success pills | 1.14:1 | Background |

---

## 3. The Kavach Risk Scale (Replaces Deal/Temperature Semantics)

Deal-hunting "temperatures" (`+98°`, up/down vote arrows, discount pills) have no place in a scam-defense guardian. Kavach replaces them with a deterministic 4-stage **Risk Scale**.

> **Cardinal Rule:** Every risk state must present **Icon + Explicit Text Label**. Status is **never** communicated by color alone.

```
+-----------------------------------------------------------------------------------+
|  CALM (L0)       CAUTION (L1)          ALERT (L2)           EMERGENCY (L3)        |
|  [Shield] Calm   [!] Unverified Auth   [Siren] Extortion    [Beacon] Wire Demand  |
|  Cold Blue       Warm Orange           Hot Red              Hot Red + Pulse Ring  |
+-----------------------------------------------------------------------------------+
```

### 3.1 Risk Scale Specification

| Stage | Name | Semantic Definition | Text / Icon Hex | Surface Hex | Border Hex | Standard Contrast | Elder Screen Contrast | Required Icon & Label |
|---|---|---|---|---|---|---|---|---|
| **L0** | **Calm** | Room quiet, call benign, acoustic monitor active. | `#1d4ed8` (Blue 700) | `#eff6ff` (Blue 50) | `#bfdbfe` (Blue 200) | **6.5:1** (AA) | `#1e40af` (Blue 800) **8.5:1** (AAA) | `solar:shield-check-bold` + **"Calm / Monitoring"** |
| **L1** | **Caution** | Suspicious authority claim (police, customs, courier, TRAI, KYC). | `#c2410c` (Orange 700) | `#fff7ed` (Orange 50) | `#fed7aa` (Orange 200) | **5.2:1** (AA) | `#9a3412` (Orange 800) **7.3:1** (AAA) | `solar:danger-triangle-bold` + **"Caution: Unverified Authority"** |
| **L2** | **Alert** | Extortion signature confirmed (arrest threat, secrecy demand, video mandate). | `#b91c1c` (Red 700) | `#fef2f2` (Red 50) | `#fecaca` (Red 200) | **6.8:1** (AA) | `#991b1b` (Red 800) **8.5:1** (AAA) | `solar:alarm-bold` + **"Alert: Scam Coercion Flagged"** |
| **L3** | **Emergency**| Urgent financial transfer or safe account liquidation demand. | `#ffffff` on `#991b1b` | `#991b1b` (Solid Red 800) | `#7f1d1d` (Red 900) | **8.5:1** (AAA) | **8.5:1** (AAA) | `solar:siren-bold` + **"EMERGENCY: Immediate Payment Demand"** (Gentle 1.5s pulse) |

### 3.2 Accent Tokens

- **Premium Violet (`{colors.premium}` — `#6d28d9` / surface `#f5f3ff` / border `#ddd6fe`):**
  Reserved exclusively for consented family voice features (e.g. "Family Voice Intercom", "Cloned Guardian Audio"). Contrast vs `#ffffff`: **6.6:1** (AA); Elder screen: `#5b21b6` (**8.4:1** AAA).
- **Warning Advisory (`{colors.warning}` — `#854d0e` / surface `#fefce8` / border `#fef08a`):**
  System advisories, degraded network connection, or scheduled maintenance. Contrast vs `#ffffff`: **7.2:1** (AAA).

---

## 4. Typography System

### 4.1 Typeface Families
- **Primary Latin Sans:** `Mulish` (Google Fonts), fallback `Nunito Sans`, system-ui.
- **Hindi / Devanagari:** `Noto Sans Devanagari` (weights 500, 700).
- **Gujarati:** `Noto Sans Gujarati` (weights 500, 700).
- **Monospace (Restricted):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`. Used **strictly** for device pairing codes, ticket numbers, and code blocks.

### 4.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Primary Use |
|---|---|---|---|---|---|
| `{typography.display}` | 48px | 700 | 1.1 | -0.02em | Hero headline on desktop, Elder status line |
| `{typography.heading-lg}` | 24px | 700 | 1.2 | -0.01em | Page titles, Section headers, Plan price |
| `{typography.heading}` | 20px | 700 | 1.25 | 0 | Card headings, Drawer titles |
| `{typography.lead}` | 18px | 500 | 1.4 | 0 | Hero subtext, Article introductions |
| `{typography.body}` | 16px | 500 | 1.5 | 0 | Body copy, Incident details, Table rows |
| `{typography.ui}` | 14px | 700 | 1.3 | 0 | Button labels, Pill tabs, Risk badges |
| `{typography.caption}` | 12px | 500 | 1.3 | 0 | Timestamps, SLA metadata, Table headers |
| `{typography.micro}` | 10px | 700 | 1.2 | +0.02em | Compact uppercase tags, Version chips |
| `{typography.mono}` | 15px | 500 | 1.4 | 0 | Pairing codes, Ticket numbers only |

### 4.3 Indic Typography Rules (Hindi & Gujarati)
1. **Line Height:** Minimum `line-height: 1.5` for body and `1.6` for headings to completely prevent clipping of upper matras (e.g., `ौ`, `ै`, `ी`) and lower vowel signs (e.g., `ु`, `ू`, `ृ`).
2. **Visual Scale Normalization:** Noto Sans Devanagari and Gujarati glyphs render visually smaller than Latin x-heights at equivalent font-sizes. In multilingual contexts, Indic text is rendered at `105%` to `110%` of Latin font-size for equivalent optical weight.

---

## 5. Spacing, Geometry & Elevation

### 5.1 Spacing Scale (8px Base)
- `xxs`: 2px · `xs`: 4px · `sm`: 8px · `md`: 12px · `lg`: 16px · `xl`: 24px · `xxl`: 32px · `3xl`: 48px · `4xl`: 64px.

### 5.2 Geometry (Border Radii)
- **Cards & Containers:** `8px` (`rounded-md`).
- **Interactive Controls & Pills:** `540px` (`rounded-full`).
- **Input Fields & Textareas:** `8px` (`rounded-md`).
- **Micro Badges:** `4px` (`rounded-sm`).

### 5.3 Elevation & Shadows
- **Level 0 (Flat):** `none` (default for cards on `#f2f4f7` canvas, framed by 1px hairline `#e2e5e9`).
- **Level 1 (Subtle):** `0 1px 3px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Interactive Hover):** `0 4px 12px rgba(17, 24, 39, 0.08)`. Used **only** when hovering interactive clickable cards.
- **Level 3 (Modal / Drawer):** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`.

---

## 6. Elder Kiosk Rules (`apps/app/elder` & `apps/web/index.html`)

The elder kiosk runs on a dedicated countertop tablet or spare phone. Elders are frequently stressed, may have impaired vision or motor tremors, and must never be overwhelmed with complex dashboards.

1. **Large High-Contrast Type:**
   - Status headline: $\ge 48\text{px}$ bold.
   - Body copy & guidance: $\ge 24\text{px}$ medium.
   - Contrast ratio: strictly $\ge 7:1$ (WCAG AAA) across all text.
2. **Generous Touch Targets:**
   - Every interactive control must provide minimum $\ge 56\text{px}$ height and width.
3. **Always-Visible Listening Indicator:**
   - An acoustic radar/listening wave is permanently rendered, clearly communicating whether Kavach is armed and actively monitoring the room.
4. **Name Privacy:**
   - Hide the elder's full legal name on the screen. Render first name only (e.g. "Dadaji's Room") or a device moniker ("Living Room Tablet").
5. **Demoted Stop Button with 2-Step Confirmation:**
   - Accidental taps must never deactivate scam protection. The "Stop Listening" control is visually demoted (neutral ghost/outline style, never primary red).
   - Tapping it triggers a full-width 2-step confirmation sheet: *"Are you sure you want to pause protection? Kavach will not be able to warn you during calls."* with explicit Confirm and Cancel actions. *(Flagged for owner review).*
6. **Calm Motion Only:**
   - Zero aggressive flashing or screen-shake animations. L3 Emergency uses a gentle 1.5s radial pulse. All motion is immediately disabled under `prefers-reduced-motion: reduce`.

---

## 7. Admin Density & Operations Rules (`apps/admin`)

The Admin console is an operational command center for support engineers, operators, and safety auditors.

1. **Compact Environment Strip:**
   - Permanent 32px top strip displaying actual environment: `LOCAL` (emerald), `STAGING` (amber), or `PROD` (rose), sourced directly from backend configuration.
   - A `DEMO DATA` badge is rendered if and only if sample/seeded fixtures are active.
2. **Grouped Collapsible Sidebar:**
   - Structured into 5 clear operational domains:
     - **Operate:** Telemetry, Realtime Sessions, Device Health.
     - **Grow:** Waitlist CRM, Broadcasts, Invitations.
     - **Money:** Subscriptions, Razorpay Ledger, Coupons & Discounts.
     - **Safety:** P0 Scam Incidents, Support Tickets Inbox, Audio Purge Verifications.
     - **System:** Email Outbox & DNS, Feature Flags, Hash Chain Audit Log.
3. **Tabular Figures:**
   - All financial amounts, timestamps, and metric KPIs enforce `font-feature-settings: 'tnum'` for strict columnar alignment.
4. **Accessible Tables:**
   - Sticky headers, column visibility toggles, CSV/JSON export actions, and empty states.
5. **Two-Pane Ticket & Alert Inbox:**
   - Master list on the left (with RiskIndicator chips and SLA timers), detail inspector on the right.
6. **Keyboard Navigation:**
   - Quick command palette accessible via `Ctrl+K` (`Cmd+K`).
7. **Contrast Compliance:**
   - Low-contrast gray labels (e.g., previously illegible `"All 14 services armed"`) are upgraded to `#374151` / `#111827` ($\ge 4.5:1$).

---

## 8. Motion & Micro-Interactions

Kavach interfaces must feel instantaneous, fluid, and predictable without causing battery drain or scroll stuttering.

1. **Duration Tokens:**
   - **Micro (120ms):** Checkbox toggles, focus rings, tooltip appearances.
   - **Standard (180ms):** Button hover color transitions, 1px button lift, dropdown openings.
   - **Modal / Drawer (240ms):** Modal scale-in, side-drawer slide, tab panel cross-fades.
2. **Easing:**
   - `cubic-bezier(0, 0, 0.2, 1)` (`ease-out`) for entering elements.
   - `cubic-bezier(0.4, 0, 1, 1)` (`ease-in`) for exiting elements.
3. **Button Interaction:**
   - Primary buttons lift by 1px (`transform: translateY(-1px)`) and darken fill slightly on hover. Active press drops by 1px (`transform: translateY(0px)`).
4. **Card Interaction:**
   - Static information cards have zero hover movement. Interactive cards transition border color to `#cbd5e1` and elevate to `Level 2` shadow.
5. **Page Transitions:**
   - Subtle single fade-up on mount (maximum 4 staggered child elements, 240ms duration, 8px travel).
6. **Focus-Visible Rings:**
   - Accessible keyboard outline: `ring-2 ring-primary ring-offset-2 outline-none`.
7. **Loading States:**
   - Animated shimmer skeletons (`Skeleton`) rather than jarring full-screen spinners.
8. **Native Smooth Scrolling:**
   - Zero heavy JavaScript wheel-interception libraries (no Lenis, no GSAP ticker hijacking). Native browser smooth scrolling (`scroll-behavior: smooth`) composited on the GPU.
9. **Accessibility Reduced Motion:**
   - `@media (prefers-reduced-motion: reduce)` disables all transforms, pulses, and transitions (`transition: none !important; animation: none !important;`).

---

## 9. Content Honesty & Claims Compliance

In accordance with `docs/CLAIMS.md`, `docs/SAFETY.md`, and Sprint Y truth requirements, all interfaces must strictly adhere to the following 7 content rules:

1. **Acoustic Second-Device Framing (No Cellular Interception):**
   - **Forbidden:** *"100% Offline AI · Zero Audio Uploads"*, *"Telecom Intercept"*, *"Calls blocked at carrier level"*.
   - **Mandatory Copy:** *"Listens on a second device. No call interception."*
   - **Transcription Transparency:** *"Audio is streamed securely for transcription and is not stored."*
2. **Detection Terminology (Not Interception):**
   - Replace *"Kavach Intercept"* and *"Scam calls intercepted"* with *"Scam calls detected / flagged"*.
   - Remove unsupported latency claims like *"<0.42 ms"*. Replace with verified test latency: *"Deterministic detector rule evaluation < 1 ms (mock replay)"*.
3. **Transparent Pricing & No Fake Discounts:**
   - Remove fake strikethrough prices and unsupported *"50% OFF"* badges unless tied directly to an active configured promotion (`DEMO50`).
   - All displayed prices must be real, current, and explicitly marked **"incl. 18% GST"**.
4. **Sample Data Disclosure & Jargon Elimination:**
   - Every demo metric, simulated call, or seeded incident card must carry a visible `"Sample data"` or `"Simulated"` chip.
   - Eliminate internal engineering jargon banners (*"Zero Live Gnani Credits Burned"*, *"silence chunks saved"*, *"STT cloud burn"*) from customer interfaces. Replace with a quiet `"Demo mode"` indicator.
5. **Unified Source of Truth for Plans & SLAs:**
   - All marketing copy, guardian checkout cards, and admin tables must strictly draw from `packages/api-contract/src/plans.ts` and `apps/api/app/plans_config.py`:
     - **Free Plan:** ₹0, 30 min/month, 10 min reserve, 1 elder, 1 device.
     - **Plus Plan (Recommended):** ₹149/mo (₹1,299/yr), 150 min/month, 30 min reserve, 1 elder, 2 devices.
     - **Family Plan:** ₹299/mo (₹2,499/yr), 400 min/month, 60 min reserve, 3 elders, 5 devices.
   - **Support SLAs:** Scam Emergency = 1h response (12h resolution); High = 4h response; Normal = 24h response.
6. **Environment Integrity & Ownership Framing:**
   - Admin header must reflect the real execution environment (never show "prod" on local dev).
   - Soften absolute ownership claims in privacy copy (e.g. *"designed toward DPDP principles; not legally reviewed"* instead of *"absolute sovereign privacy guarantees"*).
7. **Legal Draft Notice:**
   - All Terms, Privacy, Cookie, and Refund pages must display a clear badge: **"DRAFT · PENDING FORMAL REGULATORY & LEGAL REVIEW"**.

---

## 10. Standard Components Specification (`packages/ui`)

| Component | Allowed Variants / Options | Design Rules |
|---|---|---|
| **Button** | `primary`, `outline-green`, `outline-neutral`, `ghost`, `destructive` | 540px fully-round pill (`rounded-full`), Mulish 700, 14px, 1px lift on hover. Destructive actions use red outline/fill, never primary green. |
| **PillTabs** | Single selection pill strip | White card or cool-gray ground, selected tab is pure white pill with subtle hairline and dark ink text. |
| **Card** | Default, interactive, elevated | 8px radius (`rounded-md`), pure white (`#ffffff`), 1px hairline (`#e2e5e9`). Level 2 shadow only on interactive cards. |
| **StatCard** | Sourced metric display | Label (12px medium muted), Value (24px bold ink, tabular numerals), Source citation link below. |
| **Badge** | `neutral`, `calm`, `caution`, `alert`, `emergency`, `premium` | 4px or pill radius, font-medium 12px, icon + text. |
| **RiskIndicator** | `L0 Calm`, `L1 Caution`, `L2 Alert`, `L3 Emergency` | Distinct color pairing, mandatory icon, explicit stage label. |
| **StageChips** | S1 Authority, S2 Coercion, S3 Secrecy, S4 Isolation, S5 Payment | Compact visual progression pills showing which scam extortion stages were flagged. |
| **Input / Select / Textarea** | Default, focus, error | 8px radius, white surface, `#cbd5e1` border, `#1e7e34` focus ring, error message below with icon. |
| **Modal / Drawer** | Centered modal, Right drawer | Backdrop blur (`rgba(17, 24, 39, 0.4)`), 8px card or sliding rail, focus-trapped, ESC dismiss. |
| **Toast** | `success`, `error`, `info`, `warning` | Bottom-right pill/card, 240ms enter/exit, optimistic notification. |
| **Table** | Data table | Sticky header (`#f9fafb`), 1px hairlines, tabular numbers, row hover `#f8fafc`. |
| **EmptyState** | Generic, search, alerts, tickets | Calm shield/search icon, 18px bold heading, 14px description, single pill action button. |
| **Skeleton** | Text line, avatar, card | `#e5e7eb` shimmer pulse with CSS animation. |
| **Stepper** | Multi-step progress (e.g. Onboarding) | Numbered circles connected by hairlines, green fill on completed steps. |
| **Tooltip** | Hover / focus explanation | Dark slate pill (`#111827`), white text (11px), 120ms enter. |
| **PageHeader** | Standard title block | Title (24px bold), optional badge, description (14px), optional actions right. |
| **AppShell** | Guardian & Admin layout shell | Responsive sidebar/topbar navigation, main scrollable canvas. |

---

## 11. Responsive Breakpoints

| Breakpoint | Viewport Width | Layout Reflow Strategy |
|---|---|---|
| **Mobile (`sm`)** | `< 768px` | Single column; bottom navigation or mobile drawer; tables scroll horizontally or convert to stacked cards; touch targets $\ge 48\text{px}$. |
| **Tablet (`md`)** | `768px – 1023px`| 2-column grids; collapsed sidebar icon rail; search bar collapses to icon; cards reflow cleanly. |
| **Desktop (`lg` / `xl`)** | `\ge 1024px` | Full multi-column layout; persistent sidebar; two-pane inboxes; max content container `1280px` (`max-w-7xl`). |

---

*Authored for the Kavach Product Suite · Gnani AI Challenge · October 2026*
