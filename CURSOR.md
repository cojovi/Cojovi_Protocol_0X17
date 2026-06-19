# CURSOR.md — Iron Man Website Codebase Guide

> **Last reviewed:** 2026-06-16  
> **Purpose:** Onboarding document for Cursor AI agents and developers working in this repository.

---

## What This Project Is

**Iron Man** (`package.json` name: `iron-man`) is a single-page, scroll-driven cinematic website themed around Marvel's Tony Stark / Iron Man universe. It presents itself as a **Stark Industries** product showcase for the **Mark LXXXV** suit, with J.A.R.V.I.S.-style HUD overlays, telemetry readouts, and film-quote cards.

The site is a **proof-of-concept portfolio piece** — not a commercial Marvel product. The footer explicitly states: *"Proof of concept — fan art, no commercial use."* It doubles as a subtle agency/portfolio callout for **Devini** ("Build with Devini" appears in the hero section).

### Core Experience

1. **Hero** — Scroll through 169 frames of a Mark LXXXV suit animation while dialogue cards from Iron Man films fade in/out.
2. **Cinematic Reveal** — A second 169-frame scroll sequence (Mark III archive / Endgame theme) with a text swap from *"I am Inevitable"* to *"And I am Iron Man."*
3. **Systems Nominal** — Static telemetry panel with animated scroll-in content.
4. **Footer** — Suit archive links (placeholder `#` hrefs) and legal/disclaimer copy.

There is **one route** (`/`), no API routes, no database, no authentication, and no backend.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.2.2 |
| UI | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 (via `@tailwindcss/postcss`) |
| Smooth scroll | Lenis | ^1.3.21 |
| Scroll animations | Framer Motion | ^12.38.0 |
| Icons | @phosphor-icons/react | ^2.1.10 |
| Fonts | Geist Sans + Geist Mono (Google Fonts via `next/font`) | geist ^1.7.0 |
| Linting | ESLint + eslint-config-next | ^9 / 16.2.2 |
| Bundler (dev) | Turbopack (Next.js default in dev) | — |

### Important: Next.js 16

This project uses **Next.js 16**, which has breaking changes from earlier versions. Before modifying Next.js APIs or conventions, read the relevant guide in:

```
node_modules/next/dist/docs/
```

The repo's `AGENTS.md` and `CLAUDE.md` both point agents to this requirement.

---

## Repository Structure

```
REVAMP_iron-man-website/
├── public/
│   ├── frames/          # 169 JPGs — Hero scroll sequence (frame_0001.jpg … frame_0169.jpg)
│   └── frames2/         # 169 JPGs — Cinematic scroll sequence (same naming)
├── src/
│   ├── app/
│   │   ├── globals.css  # Tailwind import, CSS variables, utility classes
│   │   ├── layout.tsx   # Root layout, fonts, metadata, SmoothScrollProvider
│   │   └── page.tsx     # Single page composition (Navbar + sections + Footer)
│   ├── components/
│   │   ├── providers/
│   │   │   └── SmoothScrollProvider.tsx  # Lenis smooth-scroll wrapper
│   │   ├── sections/
│   │   │   ├── Hero.tsx              # Primary scroll-canvas section
│   │   │   ├── CinematicReveal.tsx   # Secondary scroll-canvas section
│   │   │   ├── SystemsNominal.tsx    # Telemetry + quote section
│   │   │   └── Footer.tsx            # Server component footer
│   │   └── ui/
│   │       ├── AnimatedSection.tsx   # Framer Motion scroll-in wrappers
│   │       ├── EyebrowBadge.tsx      # HUD-style label pill
│   │       ├── HudFrame.tsx          # Corner bracket SVG decorations
│   │       └── Navbar.tsx            # Fixed header with scroll state
│   └── lib/
│       ├── hero.ts       # Hero frame paths, dialogue timing, constants
│       └── cinematic.ts  # Cinematic frame paths, beat timing, constants
├── AGENTS.md             # Agent rule: read Next.js 16 docs before coding
├── CLAUDE.md             # Re-exports AGENTS.md
├── CURSOR.md             # This file
├── README.md             # Default create-next-app readme (mostly boilerplate)
├── next.config.ts        # Empty/default Next config
├── postcss.config.mjs    # Tailwind v4 PostCSS plugin
├── tsconfig.json         # Strict TS, `@/*` → `./src/*`
├── eslint.config.mjs     # eslint-config-next (core-web-vitals + typescript)
└── package.json
```

### Not in Source Control (typical)

- `node_modules/` — dependencies
- `.next/` — build/dev output
- `.env*` — none used currently; gitignored
- `iron-man-website.zip`, `3d-scroll-website-skill-pack-*.zip` — archived assets at repo root (~42 MB total)

### Asset Footprint

- **338 total frame images** (~25 MB combined)
- Naming convention: `frame_XXXX.jpg` (zero-padded 4 digits)
- Served statically from `/frames/` and `/frames2/` via Next.js `public/` directory

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  layout.tsx (Server)                                        │
│  ├── Geist fonts                                            │
│  ├── globals.css (design tokens)                            │
│  └── SmoothScrollProvider (Client — Lenis RAF loop)         │
│       └── page.tsx (Server)                                 │
│            ├── Navbar (Client — scroll listener)             │
│            ├── Hero (Client — canvas + scroll)              │
│            ├── CinematicReveal (Client — canvas + scroll)   │
│            ├── SystemsNominal (Client — Framer Motion)      │
│            └── Footer (Server — Phosphor SSR import)        │
└─────────────────────────────────────────────────────────────┘
```

### Server vs Client Components

| Component | Type | Why |
|-----------|------|-----|
| `layout.tsx` | Server | Metadata, font loading, HTML shell |
| `page.tsx` | Server | Static composition only |
| `Footer.tsx` | Server | No hooks; uses `@phosphor-icons/react/dist/ssr` |
| `HudFrame`, `EyebrowBadge` | Server | Pure presentational, no `"use client"` |
| Everything else in `sections/`, `ui/Navbar`, `providers/` | Client | Scroll listeners, canvas, Framer Motion, Lenis |

---

## Scroll Animation System (Critical Path)

Both `Hero.tsx` and `CinematicReveal.tsx` implement the same **scroll-scrubbed image sequence** pattern:

### How It Works

1. **Tall section** — `.scroll-animation` class sets height to `400vh` (350vh tablet, 300vh mobile) in `globals.css`.
2. **Sticky viewport** — Inner `div` is `sticky top-0` at `100dvh`, keeping the canvas pinned while the user scrolls through the tall section.
3. **Progress calculation** — On scroll, `progress = clamp(-rect.top / (sectionHeight - windowHeight), 0, 1)`.
4. **Frame index** — `floor(progress * FRAME_COUNT)` selects which preloaded JPG to draw.
5. **Canvas draw** — `drawImage` with cover-style math; mobile gets 1.3× scale for tighter crop.
6. **Overlays** — Text opacity, dialogue cards, progress bars, and HUD elements are driven by the same `progress` value.

### Preloading

On mount, each section loads all 169 images into an `HTMLImageElement[]`. A boot screen shows until all frames report `onload` or `onerror`. Progress bar reflects `loadedCount / FRAME_COUNT`.

### Performance Patterns Used

- `requestAnimationFrame` throttling via `tickingRef` on scroll
- `passive: true` scroll listeners
- `willChange: transform` / `translateZ(0)` on sticky canvas container
- Direct DOM ref updates for opacity/transform (avoids React re-renders on every scroll frame)
- React state only updates when visible dialogue/beat **sets** change (string comparison of sorted IDs)

### Lenis Interaction

`SmoothScrollProvider` runs Lenis with `lerp: 0.1`, `duration: 1.2`, `smoothWheel: true`. Hero/Cinematic sections listen to native `window` scroll events — Lenis modifies scroll position, so these listeners still fire correctly through Lenis's RAF integration.

---

## Section-by-Section Reference

### Hero (`src/components/sections/Hero.tsx`)

- **Frames:** `/frames/frame_0001.jpg` … `0169` via `lib/hero.ts`
- **Copy:** "I am Iron Man." + Devini portfolio CTA (desktop, left side)
- **HUD:** Corner brackets, arc reactor power readout (animated sine wave ~87.3%), telemetry link, progress bar
- **Dialogues:** 3 quote cards timed by scroll progress (`DIALOGUES` in `hero.ts`)
- **Anchor IDs:** none (top of page)

### Cinematic Reveal (`src/components/sections/CinematicReveal.tsx`)

- **Frames:** `/frames2/frame_0001.jpg` … `0169` via `lib/cinematic.ts`
- **Copy:** Crossfade "I am Inevitable" → "And I am Iron Man" at ~48–58% scroll
- **Beats:** 3 labeled quote cards (`BEATS` in `cinematic.ts`)
- **Outro CTA:** "Open diagnostics" links to `#systems` (appears at ~86% progress)
- **Anchor ID:** `#cinematic`

### Systems Nominal (`src/components/sections/SystemsNominal.tsx`)

- **Anchor ID:** `#systems`
- **Content:** Endgame quote, narrative paragraph, 4 telemetry rows (hardcoded)
- **Animation:** `AnimatedSection` / `AnimatedItem` — staggered spring fade-up on viewport enter

### Footer (`src/components/sections/Footer.tsx`)

- **Anchor ID:** `#footer`
- **Links:** 6 suit names (Mark I through Mark LXXXV) — all `href="#"` placeholders
- **Legal:** Fan art disclaimer, fictional Stark Industries address

### Navbar (`src/components/ui/Navbar.tsx`)

- Fixed top; gains blur/border after 40px scroll
- Links: `#systems`, `#footer`, plus "Engage" CTA → `#systems`

---

## Data & Configuration Files

### `src/lib/hero.ts`

```typescript
FRAME_COUNT = 169
framePath(n) → `/frames/frame_${padded}.jpg`
DIALOGUES[] — { id, show, hide, quote, speaker, film }
HERO_TEXT_FADE_END = 0.08
```

Dialogue visibility windows (scroll progress 0–1):
- d1: 0.10–0.30
- d2: 0.35–0.55
- d3: 0.60–0.80

### `src/lib/cinematic.ts`

```typescript
CINE_FRAME_COUNT = 169
cineFramePath(n) → `/frames2/frame_${padded}.jpg`
BEATS[] — { id, show, hide, label, quote, speaker, film }
CINE_INTRO_FADE_END = 0.08  // exported but unused in components
```

---

## Design System

Defined in `src/app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0a0b` | Page background |
| `--foreground` | `#e4e4e7` | Primary text |
| `--muted` | `#71717a` | Secondary text |
| `--accent` | `#d4a22f` | Gold — arc reactor / HUD accent |
| `--accent-soft` | `rgba(212,162,47,0.14)` | Soft accent fills |
| `--card-bg` | `rgba(24,24,27,0.55)` | Glass card background |
| `--card-border` | `rgba(255,255,255,0.08)` | Card borders |
| `--hud-line` | `rgba(255,255,255,0.1)` | HUD tick marks |

### Utility Classes

- `.card-surface` — frosted glass card (blur + border + shadow)
- `.scroll-animation` — tall scroll container heights
- `.hud-tick` — repeating horizontal line pattern
- `.grain` — fixed SVG noise overlay on `body` (subtle film grain)

### Typography

- **Sans:** Geist Sans — headlines, body
- **Mono:** Geist Mono — HUD labels, telemetry, badges
- Heavy use of `tracking-[0.22em–0.32em]` uppercase mono labels for sci-fi HUD aesthetic

---

## Path Aliases

```json
"@/*": ["./src/*"]
```

Example: `import { Hero } from "@/components/sections/Hero"`

---

## Scripts & Development

```bash
npm run dev      # next dev (Turbopack, localhost:3000)
npm run build    # next build
npm run start    # next start (production)
npm run lint     # eslint
```

### First-Time Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Initial load preloads 338 images — expect a brief "SUIT UP PROTOCOL // BOOTING" screen.

### Metadata

Set in `layout.tsx`:
- **Title:** "Stark Industries — Mark LXXXV"
- **Description:** "Arc reactor online. J.A.R.V.I.S. standing by..."
- **metadataBase:** `http://localhost:3000` (update for production deployment)

---

## What Is NOT in This Codebase

- No tests (unit, e2e, or visual)
- No CI/CD configuration
- No environment variables or secrets
- No CMS or content management
- No i18n
- No analytics
- No API routes or server actions
- No image optimization pipeline for frames (raw JPGs served as-is)
- No git repository initialized (as of last review)
- Footer suit links are non-functional placeholders

---

## Common Modification Tasks

### Change dialogue quotes or timing

Edit `DIALOGUES` in `src/lib/hero.ts` or `BEATS` in `src/lib/cinematic.ts`.  
`show` / `hide` are normalized scroll progress values (0.0–1.0).

### Replace frame sequences

1. Add new JPGs to `public/frames/` or `public/frames2/`
2. Update `FRAME_COUNT` / `CINE_FRAME_COUNT` in the corresponding lib file
3. Keep zero-padded naming: `frame_0001.jpg`

### Add a new page/route

Create `src/app/<route>/page.tsx`. Currently only `/` exists. Update `Navbar` links accordingly.

### Adjust scroll section height

Modify `.scroll-animation` heights in `globals.css`. Taller = slower frame scrub per scroll distance.

### Production deployment

1. Set `metadataBase` in `layout.tsx` to production URL
2. Consider CDN caching for `/frames/**` and `/frames2/**` (large static assets)
3. Deploy to Vercel or any Node host supporting Next.js 16
4. Run `npm run build` locally first to verify — 338 frames may increase build/deploy size

---

## Agent Guidelines (Cursor / AI)

1. **Read Next.js 16 docs** in `node_modules/next/dist/docs/` before changing framework APIs.
2. **Minimize scope** — this is a focused single-page site; avoid adding auth, CMS, or heavy abstractions unless requested.
3. **Preserve scroll performance** — Hero and CinematicReveal are performance-sensitive; avoid triggering React re-renders on scroll.
4. **Match existing patterns** — HUD typography, `card-surface`, mono uppercase labels, gold accent.
5. **Client boundary** — add `"use client"` only when using hooks, browser APIs, or Framer Motion.
6. **Legal** — maintain fan-art / non-commercial disclaimer if extending footer or metadata.
7. **Assets are large** — do not commit duplicate frame sets; the zip archives at root are backups, not runtime dependencies.

---

## File Inventory (Source Only)

| File | Lines (approx.) | Role |
|------|-----------------|------|
| `src/app/page.tsx` | 19 | Page assembly |
| `src/app/layout.tsx` | 36 | Root layout + metadata |
| `src/app/globals.css` | 82 | Global styles + tokens |
| `src/components/sections/Hero.tsx` | 365 | Primary scroll canvas |
| `src/components/sections/CinematicReveal.tsx` | 383 | Secondary scroll canvas |
| `src/components/sections/SystemsNominal.tsx` | 76 | Telemetry section |
| `src/components/sections/Footer.tsx` | 62 | Footer |
| `src/components/ui/Navbar.tsx` | 66 | Navigation |
| `src/components/ui/AnimatedSection.tsx` | 42 | Motion wrappers |
| `src/components/ui/EyebrowBadge.tsx` | 16 | Badge component |
| `src/components/ui/HudFrame.tsx` | 31 | SVG corners |
| `src/components/providers/SmoothScrollProvider.tsx` | 36 | Lenis provider |
| `src/lib/hero.ts` | 42 | Hero config |
| `src/lib/cinematic.ts` | 46 | Cinematic config |

**Total source:** ~14 TypeScript/TSX/CSS files, ~1,300 lines of application code (excluding frames).

---

## Origin & Context

The folder name `REVAMP_iron-man-website` and root zip archives (`iron-man-website.zip`, `3d-scroll-website-skill-pack-*.zip`) indicate this is a **revamp** of a scroll-driven 3D/cinematic website concept. The implementation uses **2D image sequences on canvas** rather than WebGL/Three.js — achieving a similar scroll-scrub effect with pre-rendered frames.

Build stamp in footer: `2026.04.21`. Package versions pinned April 2026 timeframe.

---

## Quick Mental Model

> A dark, HUD-styled, single-page scrollytelling site where scrolling scrubs through Iron Man suit animations frame-by-frame, overlaid with J.A.R.V.I.S. telemetry UI and MCU quotes — built as a Devini portfolio showcase on Next.js 16 + React 19.

When in doubt, scroll the site locally once before making UX changes. The experience is almost entirely scroll-position-driven and cannot be understood from static code alone.

---

## Cojovi Phase 1 (2026-06-16)

The hero section was rethemed for **cojovi.com / Protocol 0X17**:

| Item | Detail |
|------|--------|
| Site title | `Welcome to cojovi.com` |
| Hero frames | 169 JPGs (1920×1080) in `public/frames/` — extracted Jun 16 22:41 via ffmpeg |
| Source video | `Sci-fi_character_with_orange_energy_202606162226.mp4` (primary; `char_copy.mp4` is a duplicate-length alternate at repo root) |
| Iron Man backup | Original hero frames in `public/frames_ironman_backup/` (1916×1080) |
| CTA | "Built by cojovi" (replaces Devini) |
| CinematicReveal | **Complete** — Cojovi frames in `public/frames2/` (see Phase 2 below) |

### Phase 1 QA (2026-06-17)

**Asset verification**
- All 169 frames present at `public/frames/frame_0001.jpg` … `frame_0169.jpg`
- No letterboxing in source frames; full-bleed dark background
- Boot overlay copy confirmed: `0X17 BOOT SEQUENCE // INITIALIZING` (no stale Iron Man text)

**Framing comparison vs `frames_ironman_backup`**
- Iron Man sequence alternates composition (character left in early frames, right in later frames) — center crop worked across the scroll
- Cojovi sequence keeps the subject **right-weighted** with dark negative space on the left — better match for desktop "Built by cojovi" left overlay
- On mobile, the previous center crop + 1.3× zoom could clip the face because the subject is not centered

**Polish applied**
- Added focal-point cover crop in `Hero.tsx` via constants in `src/lib/hero.ts`:
  - `FRAME_FOCUS_X` / `FRAME_FOCUS_X_MOBILE` — bias crop toward right side (0.58 desktop, 0.65 mobile)
  - `FRAME_FOCUS_Y` / `FRAME_FOCUS_Y_MOBILE` — slight upward bias for face (0.5 desktop, 0.44 mobile)
  - `FRAME_MOBILE_SCALE` — 1.3 (unchanged)
- Dialogue timing left as-is (0.10–0.30, 0.35–0.55, 0.60–0.80) — motion is subtle head/hand shift; windows align with scroll scrub

**Manual check recommended**
- Run `npm run dev` and scroll the hero on desktop + mobile widths to confirm face/orb framing feels right
- Rapid scroll up/down to confirm no canvas flicker

### Phase 2 — Cinematic (2026-06-17)

| Item | Detail |
|------|--------|
| Source video | `frames2_video.mp4` (10s, 1920×1080, 24fps) |
| Cinematic frames | 169 JPGs in `public/frames2/` — extracted at `fps=169/10` via ffmpeg |
| Iron Man backup | Original cinematic frames in `public/frames2_ironman_backup/` |
| Copy / HUD | `CinematicReveal.tsx` + `src/lib/cinematic.ts` — Protocol 0X17 retheme |
| Text crossfade | "The stream fades." → "Protocol 0X17." at ~48–58% scroll |
| Canvas crop | Center focal bias (`CINE_FRAME_FOCUS_*` in `cinematic.ts`) — subject is centered in this sequence |

**Extraction command used:**
```bash
ffmpeg -i frames2_video.mp4 -vf "fps=169/10" -frames:v 169 -q:v 2 public/frames2/frame_%04d.jpg
```

### Phase 2 (pending)

1. Set `metadataBase` in `layout.tsx` to production URL when deploying

### Dev server (network access)

```bash
npm run dev
```

Binds to `0.0.0.0:3000`. View from other devices on the same LAN: `http://<your-ip>:3000` (e.g. `http://192.168.1.226:3000`).

**If dev fails with `Can't resolve 'tailwindcss' in '/Volumes/FastSSD'`:** Turbopack PostCSS workers can inherit the external volume as cwd. Fixed by setting `base` in [`postcss.config.mjs`](postcss.config.mjs) and `turbopack.root` in [`next.config.ts`](next.config.ts) to the project directory. Clear cache if needed: `rm -rf .next && npm run dev`.

