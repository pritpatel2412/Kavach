# UI Theme Rules (CoinCompass Law)

Follow these rules for all frontend and UI work across `apps/site`, `apps/app`, and `apps/admin`:

1. **The Theme is Law:**
   - Body bg `#e3e8dc`.
   - Wrapper padding: `p-3 sm:p-6 lg:p-10`.
   - Main frame: `relative overflow-hidden rounded-[28px]`, background `linear-gradient(160deg,#0a2a12 0%,#0d3617 45%,#0a2a12 100%)`.
   - Accent lime `#c8f542` for primary buttons, key icons, avatar borders.
   - Text: `white/90` primary, `white/60` secondary.
   - Semantic risk colours: caution amber `#f5b942`, danger red `#ff5a4d`. Must ALWAYS be paired with an icon + text, never colour alone.
2. **Typography & Icons:**
   - Fonts: Geist for headings/labels; Inter for body; Indic fallback stack (Noto Sans Devanagari, Noto Sans Gujarati).
   - Icons: `<iconify-icon>` with `solar:` prefix ONLY.
3. **Layer Hierarchy (Z-Order):**
   - `main` > `canvas#glCanvas` (absolute inset-0, opacity .9) > hatch overlay (absolute inset-0, pointer-events-none, repeating-linear-gradient at 115deg) > `header` (relative z-10) > `sections` (relative z-10) > `hero floating cards` (absolute, backdrop-blur-md).
4. **Hatch Overlay:**
   - `repeating-linear-gradient(115deg, rgba(255,255,255,.035) 0 1px, transparent 1px 9px)`.
5. **Glass Cards & Interactive States:**
   - Cards: `backdrop-blur-md`, `border 1px solid rgba(255,255,255,0.10..0.18)`, `bg-white/5`.
   - Nav links: `border 1px solid rgba(255,255,255,0.18)`, `hover:scale-104`.
   - Middle highlight card: `border: rgba(200,245,66,0.3)`.
   - Feature/team cards: `hover:-translate-y-1.5`.
6. **Honesty & Data Guard:**
   - No fake testimonials, stock people photos, or fake customer logos.
   - All statistics must come from `docs/CLAIMS.md` / `src/content/claims.ts`.
   - Never claim cellular interception. Always display: "Listens on a second device when you put a call on speaker."
   - Mock guard: `NEXT_PUBLIC_MOCK=1` required in dev; production builds with mock enabled must fail.
