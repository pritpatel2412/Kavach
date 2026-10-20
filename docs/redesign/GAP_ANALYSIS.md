# Gap Analysis: Current Application vs. DESIGN.md

**Date:** 2026-10-19  
**Specification:** `DESIGN.md` (Deals Community / High-Density Scannable Card Feed System)  
**Current Baseline:** Legacy Dark-Mode Glassmorphism (`#0a2a12` dark green, `#c8f542` lime, 28px glass cards)  

---

## 1. Systemic Architectural Gaps

| Dimension | Current Implementation | DESIGN.md Specification | Required Action |
| :--- | :--- | :--- | :--- |
| **Color Model** | Dark mode with green gradients (`#0a2a12` -> `#0d3617`), lime accents (`#c8f542`), translucent white borders. | **Cool-gray canvas (`#f2f4f7`)** ground with **pure white surface (`#ffffff`)** cards. Brand green (`#30a83c`) strictly reserved for actions and prices. | Replace global dark frame with cool-gray canvas. Refactor all cards to pure white with 1px hairline border (`#e2e5e9`). |
| **Status Palette** | Generic amber and red with lime highlights. | Structured status spectrum: **Hot Red (`#e02828`)**, **Cold Blue (`#1877f2`)**, **Rising Orange (`#f57c00`)**, **Premium Violet (`#7c3aed`)**, **Mint (`#e6f7ec`)**, **Warning Soft Yellow (`#fef9c3`)**. | Implement full status vocabulary. Apply strictly for functional indicators (never decorative). |
| **Shape & Geometry** | 28px frame radius (`rounded-[28px]`), 20px glass cards. | **Fully-round 540px pill (`rounded-full`)** for all buttons, search bars, chips, and temperature controls. **8px radius (`rounded-lg` / 8px)** for cards, thumbnails, tag buttons. **4px radius (`rounded`)** for small badges. Circle for avatars. | Update Tailwind preset radii: buttons and interactive pills -> `rounded-full` (540px), cards and panels -> 8px (`rounded-md`). |
| **Typography** | Geist & Inter with 5+ font weights (400, 500, 600, 700, 800). | **Mulish** (humanist geometric sans) at **two weights only: 500 (medium) and 700 (bold)**. System monospace for voucher/technical codes. | Standardize Google Fonts link to Mulish 500 & 700. Strip all font-normal, font-semibold, and font-extrabold utility classes across all components. |
| **Type Scale** | Custom Tailwind scale (`text-xs` to `text-6xl`). | Strict scale: `display` (48px/1.1), `heading-lg` (24px/1.2), `heading` (20px/1.25), `lead` (18px/1.4), `body` (16px/1.5), `ui` (14px/1.3), `caption` (12px/1.3), `micro` (10px/1.2), `mono` (16px/1.4). | Define explicit typography utilities matching exact sizes and line-heights. |
| **Depth & Elevation** | Heavy backdrop blur (`blur(16px)`), WebGL ray bands, and hatch pattern overlays. | Flat hairline-first depth. Level 0 (canvas), Level 1 (1px hairline), Level 2 (`rgba(11,22,44,0.09) 0 4px 12px` on hover/lift), Level 3 (`rgba(0,0,0,0.38) -1px 11px 15px -11px` on modals/sticky). | Remove WebGL canvas and hatch patterns. Replace glass shadows with crisp hairline borders and subtle level-2 lift. |
| **Layout & Grid** | Centered single-column hero showcase with floating decorative cards. | **Two-column shell above 768px** (main stacked content column + right utility sidebar of summary cards). Single-column stack below 768px. High density, rationed whitespace. | Restructure page layouts into main content + right rail sidebar pattern. |

---

## 2. Component-by-Component Gap Analysis

### `packages/ui` Primitives
- **`Button.tsx`:** Currently uses 12px–28px borders with lime glow. Needs full refactor to `button-primary` (deal green `#30a83c`, full pill, white text), `button-outline-green` (white fill, green text + border, full pill), `button-outline-neutral` (white fill, black text, hairline border, full pill), `button-muted` (mid-gray text, hairline, full pill), and `button-tag` (8px radius, tight 0 4px).
- **`Input.tsx`:** Currently translucent glass input. Needs `search-pill` (fully round 540px, hairline border, left magnifier) and `text-input` (fully round 540px, 9px 35px padding) and `email-input` (8px radius, 9px 16px padding).
- **`Cards` (`GlassCard`, `Frame`, `FloatingCard`):** Currently dark glassmorphism. Needs base `deal-card` pattern (white surface, 1px hairline, 8px radius, 16px padding), `sidebar-card` for right-rail tiles, and `timestamp-pill` (canvas fill, caption text).
- **Signature Components (New):**
  - `TemperatureControl`: Fully-round pill with cold-blue down-arrow, bold hot-red reading, and hot-red up-arrow. Map to threat intensity / scam risk score.
  - `PriceLockup`: Bold brand green price (`heading-lg`), struck-through muted original price, and mint discount badge (`{colors.discount-surface}`). Map to pricing plans and coupon redemptions.
- **`Modal.tsx` & `Toast.tsx`:** Currently dark green glass. Needs white surface, 8px/24px radius, and level-3 drop shadow.

---

## 3. Page-Level Gaps

### Marketing (`apps/site`)
- **Landing (`/`):** Dark hero with floating cards. Needs transformation to dense, scannable two-column overview: main column featuring live scam feed, threat alert breakdown, and interactive call preview; right sidebar featuring quick report card, helpline 1930 hot card, and community statistics.
- **Pricing (`/pricing`):** Dark glass cards. Needs white cards with `price-lockup`, mint discount pills (`-50%`), full-round pill buttons, and right-rail waitlist signup card.
- **How It Works (`/how-it-works`):** Needs clean white step cards with mint and green accent indicators.
- **Legal & Static Pages:** Currently dark background with light text. Needs clean white document cards on cool-gray canvas with bold black headings and mid-gray body copy.

### Guardian & Elder App (`apps/app`)
- **Dashboard (`/`):** Needs two-column guardian shell with elder status cards, threat temperature indicator, and quick actions.
- **Elder Screen (`/elder`):** Needs high-legibility, maximum-contrast white card on cool-gray canvas with 48px bold typography, hot-red alert banner on detection, and green active status.
- **Onboarding (`/onboarding`):** Clean white wizard cards with full-round green pill progression buttons.

### Operations Console (`apps/admin`)
- **Dashboard (`/`):** Dense data-table and KPI cards with white surface, hairline borders, green action buttons, and hot/cold status badges.
- **Auth (`/auth`):** White authentication card on cool-gray canvas with full-round inputs and green submit pill.

---

## 4. Token Assumptions & Values to Document

As required by the prompt, the following token values matching the described intent are defined in the central token source:
- `{colors.primary}`: `#30a83c` (Known specified value)
- `{colors.on-primary}`: `#ffffff` (Pure white text on primary fill)
- `{colors.canvas}`: `#f2f4f7` (Cool light-gray page ground)
- `{colors.surface}`: `#ffffff` (Pure white surface for cards)
- `{colors.hairline}`: `#e2e5e9` (1px light-gray crisp border)
- `{colors.ink}`: `#111111` (True dark black for titles and headings)
- `{colors.body}`: `#595f69` (Mid-gray for secondary text and metadata)
- `{colors.muted}`: `#8c939d` (Light-gray for quiet captions and struck-through prices)
- `{colors.green-strong}`: `#1e7e29` (Darker green for text on light/mint surfaces)
- `{colors.hot}`: `#e02828` (Hot red for temperature rating and up-vote arrow)
- `{colors.cold}`: `#1877f2` (Cold blue for down-vote arrow)
- `{colors.warm}`: `#f57c00` (Rising orange for trending alerts)
- `{colors.premium}`: `#7c3aed` (Premium violet for priority badges)
- `{colors.discount-surface}`: `#e6f7ec` (Soft mint background for savings badges)
- `{colors.warning-surface}`: `#fef9c3` (Soft yellow background for expiring/caution alerts)
- `{colors.warning-text}`: `#854d0e` (Amber-brown text for caution alerts)
- **Font:** Mulish (weights 500, 700) with Nunito Sans and system sans-serif fallback.
