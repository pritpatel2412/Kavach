# Kavach Design System: CoinCompass Theme Specification

> **Theme Law:** This document defines the exact visual ground truth for the Kavach SaaS application suite (`apps/site`, `apps/app`, `apps/admin`). All values, gradients, layer orders, and interaction physics must adhere to these specifications without arbitrary variation.

---

## 1. Master Palette & Color Tokens

| Token | Hex / CSS Value | Description / Usage |
|---|---|---|
| **Body Background** | `#e3e8dc` | Outer page canvas background surrounding the master frame |
| **Main Dark 0** | `#0a2a12` | Start and end stop of main frame gradient |
| **Main Dark 1** | `#0d3617` | Mid stop of main frame gradient (45%) |
| **Main Frame Gradient** | `linear-gradient(160deg,#0a2a12 0%,#0d3617 45%,#0a2a12 100%)` | Master container background fill |
| **Accent Lime** | `#c8f542` | Primary buttons, active indicators, avatar borders, key icons |
| **Accent Lime Hover** | `#b5e332` | Interactive button hover state |
| **Caution Amber** | `#f5b942` | Level 2 risk alert (ALWAYS paired with icon + text) |
| **Danger Red** | `#ff5a4d` | Level 3 critical risk alert (ALWAYS paired with icon + text) |
| **Text Primary** | `rgba(255, 255, 255, 0.90)` | H1–H4, table headers, form labels, active UI text |
| **Text Secondary** | `rgba(255, 255, 255, 0.60)` | Paragraph body text, card subtitles, descriptions |
| **Text Muted** | `rgba(255, 255, 255, 0.28)` | Watermarks, decorative icons, disabled states |
| **Glass Border Subtle** | `rgba(255, 255, 255, 0.10)` | Default glass card borders |
| **Glass Border Medium** | `rgba(255, 255, 255, 0.18)` | Nav pills, ghost button borders, modal dialogs |
| **Highlight Border** | `rgba(200, 245, 66, 0.30)` | Middle pricing card highlight, active stage focus |
| **Glass Card Fill** | `rgba(255, 255, 255, 0.05)` | Card background fill with `backdrop-filter: blur(16px)` |

---

## 2. Geometry & Spacing Rules

- **Page Wrapper Padding:**
  - Mobile (`<640px`): `p-3` (12px)
  - Tablet (`640px–1023px`): `sm:p-6` (24px)
  - Desktop (`>=1024px`): `lg:p-10` (40px)
- **Master Frame Border Radius:** Exactly `28px` (`rounded-[28px]`). This radius is also strictly mirrored on the CTA container block.
- **Card Radius:** `20px` for standard glass cards, `18px` for hero floating cards, `24px` for modal dialogs.
- **Navigation Links:** `border: 1px solid rgba(255,255,255,0.18)`, `hover:scale-104` (`transform: scale(1.04)`).
- **Interactive Card Shift:** `hover:-translate-y-1.5` (`transform: translateY(-6px)`).

---

## 3. Layer Stack (Z-Order Hierarchy)

The z-index hierarchy inside the main frame is strictly enforced:
1. `main` (`relative overflow-hidden rounded-[28px]`, background gradient)
2. `canvas#glCanvas` (`absolute inset-0 pointer-events-none`, `opacity: 0.9`, `z-index: 0`)
3. `Hatch Overlay` (`absolute inset-0 pointer-events-none`, `z-index: 1`)
4. `header` (`relative z-10`)
5. `sections` (`relative z-10`)
6. `hero floating cards` (`absolute` on desktop `lg:absolute`, `z-20`, `backdrop-blur-md`)

---

## 4. Hatch Overlay (Recorded Assumptions)
- **Specification:** The exact stops for the subtle 115-degree background hatch pattern:
  ```css
  background-image: repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px);
  ```
- **Rationale:** Generates a fine 1px optical line every 9px at 115 degrees, evoking security banknote micro-printing while maintaining high contrast with foreground typography.

---

## 5. WebGL Aurora Canvas Specification
- **Canvas Selector:** `canvas#glCanvas`
- **Fragment Shader:** Procedural ray-band generator using three trigonometric oscillators with frequencies 3.2, 4.8, and 6.4 rad/s, modulated across a green-to-lime palette (`#0a2a12`, `#0d3617`, `#2e7d32`, `#c8f542`).
- **Vertical Fade:** Quadratic falloff towards bottom frame edge (`smoothstep(0.0, 0.85, 1.0 - uv.y)`).
- **Film Grain:** Hash-based high-frequency procedural noise ($\pm 0.025$) to eliminate color banding on 8-bit displays.
- **Performance Guards:**
  - Cap devicePixelRatio at `1.5`.
  - Pause rendering when document is hidden (`visibilitychange`).
  - Pause rendering via `IntersectionObserver` when canvas is scrolled off-screen.
  - Disable and fallback to static CSS gradient when `prefers-reduced-motion: reduce` is detected.
- **Parallax:** GSAP ScrollTrigger translates canvas with `yPercent: 22` on scroll.

---

## 6. Motion & Physics
1. **Word Reveal (`[data-reveal-words]`):**
   - Splits headings into words wrapped in overflow-hidden spans.
   - Initial: `yPercent: 115`, `filter: blur(8px)`, `opacity: 0`.
   - Target: `yPercent: 0`, `filter: blur(0px)`, `opacity: 1`.
   - Stagger: `0.06s`, Ease: `power4.out`, Duration: `1.2s`.
2. **Magnetic Buttons:**
   - Moves towards cursor with factor `0.3` within bounding box.
   - Elastic return on mouseleave: `ease: elastic.out(1.1, 0.4)`, duration: `0.7s`.
3. **3D Tilt Cards:**
   - Perspective: `800px`, max rotation: `6deg` on X and Y axes.
   - GSAP `quickTo` smooth tracking with `power2.out`.
4. **Hero Floating Cards:**
   - CSS keyframes `translateY(0px)` to `translateY(-8px)` over `4s–5s` with staggered delays (`0s`, `0.7s`, `1.4s`).
   - Desktop: `absolute` positioning. Mobile (`<1024px`): stacked in normal responsive grid (documented deviation).
5. **Smooth Scrolling (Lenis):**
   - Pinned version: `Lenis 1.1.13`.
   - Ticker wired to GSAP ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`.

---

## 7. Typography & Indic Fallback Stack

```css
/* Headings & UI Labels */
font-family: var(--font-geist), 'Geist', 'Noto Sans Devanagari', 'Noto Sans Gujarati', sans-serif;

/* Body Text */
font-family: var(--font-inter), 'Inter', 'Noto Sans Devanagari', 'Noto Sans Gujarati', sans-serif;
```

---

## 8. Icons & Visual Assets
- **Icon Prefix:** Iconify `<iconify-icon>` with the `solar:` prefix ONLY (e.g. `solar:shield-check-bold`, `solar:danger-triangle-bold`).
- **Logo Mark:** Original Kavach SVG mark (`viewBox="0 0 30 30"`, stroke `#c8f542`, shield outline with sound-wave arcs).
- **Semantic Risk States:** Always paired with an icon + text. Never communicate risk level by color alone.
