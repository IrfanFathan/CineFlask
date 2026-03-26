# 🎨 CineLocal — UI Design Specification
> Design reference: dark streaming platform aesthetic

---

## Design Philosophy

The UI should feel immediately familiar to anyone who uses Netflix or Prime Video — dark, cinematic, content-first. Every screen is built mobile-first and scales up to desktop without a build step.

---

## Color System

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0a0a0f` | Page background |
| `--bg-card` | `#141420` | Movie cards, modals |
| `--bg-nav` | `#0d0d18` | Navigation bar |
| `--bg-overlay` | `rgba(10,10,15,0.85)` | Gradient overlays on posters |
| `--accent` | `#7c5cfc` | Primary CTA buttons, active states |
| `--accent-hover` | `#9b7ffe` | Button hover |
| `--accent-glow` | `rgba(124,92,252,0.35)` | Box shadow on active elements |
| `--text-primary` | `#f0f0f8` | Headings, titles |
| `--text-secondary` | `#9090b0` | Metadata, subtitles, placeholders |
| `--text-muted` | `#50506a` | Timestamps, disabled states |
| `--rating-star` | `#f5c518` | IMDb-style rating badge |
| `--danger` | `#e05252` | Error states |
| `--success` | `#52e09a` | Upload success, checkmarks |
| `--border` | `rgba(255,255,255,0.07)` | Card borders, dividers |

---

## Spacing Scale

Uses an 8px base grid throughout.

| Token | Value |
|---|---|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 40px |
| `--space-2xl` | 64px |

---

## Breakpoints

| Name | Min Width | Target |
|---|---|---|
| `sm` | 0px | Phones |
| `md` | 600px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1400px | Large screens |

---

## Component Library

### Navigation Bar

- Fixed top, full width, `--bg-nav` background with `backdrop-filter: blur(12px)`
- Left: Logo mark (play icon + "CineLocal" wordmark in `--accent`)
- Right: Upload button + User avatar/dropdown
- On mobile: hamburger collapses to icon-only bar
- Fades from transparent to solid on scroll (home page only)

---

### Movie Card

```
┌─────────────────────┐
│                     │  ← Poster image (2:3 ratio)
│    [POSTER]         │
│                     │
│  ████ IMDb 8.4      │  ← Rating badge, bottom-left overlay
└─────────────────────┘
  Inception            ← Title (--text-primary, 14px bold)
  2010 · Sci-Fi        ← Metadata (--text-secondary, 12px)
```

- Default size: `160px` wide on mobile, `200px` on tablet, `220px` on desktop
- `border-radius: 10px`, `overflow: hidden`
- On hover: scale(1.05) + box-shadow `0 8px 32px var(--accent-glow)`
- Transition: `all 0.25s ease`
- Poster loads lazily (`loading="lazy"`)
- Fallback poster: dark gradient with film icon if poster_url is null

---

### Movie Grid

- CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`
- Gap: `--space-md`
- Section header row: Label left + "See all" link right

---

### Continue Watching Row

- Horizontal scroll strip (no scrollbar visible: `scrollbar-width: none`)
- Cards show progress bar at bottom (purple fill, height 3px)
- Percentage based on `timestamp_seconds / video_duration`

---

### Hero Banner (Home Page)

- Full-width, ~55vh height
- Background: movie poster blurred + darkened (`filter: blur(60px) brightness(0.3)`)
- Foreground: clean poster left, metadata right
- Metadata block: Title (40px), Year · Genre · Rating, Plot (2 lines), Play + Info buttons
- Rotates through latest 5 uploaded movies

---

### Login / Register Page

- Centered card, max-width 420px
- `--bg-card` background, `border-radius: 16px`, subtle border
- Toggle tabs: "Sign In" / "Register"
- Input fields: dark background, `--border` border, focus ring in `--accent`
- Primary button: full width, `--accent` background, rounded
- Tagline beneath logo: "Your private cinema, on any screen."

---

### Movie Detail Page

```
┌──────────────┬─────────────────────────────┐
│              │  INCEPTION                  │
│   POSTER     │  2010 · 2h 28m · PG-13      │
│  (300px)     │  ★ 8.8  IMDb                │
│              │                             │
│              │  [▶ Play]  [+ Watchlist]    │
│              │                             │
│              │  A thief who steals...      │
│              │  Genre: Sci-Fi, Action      │
│              │  Director: Christopher Nolan│
│              │  Cast: DiCaprio, Hardy...   │
└──────────────┴─────────────────────────────┘
```

- Mobile: stack vertically (poster top, details below)
- Poster: `border-radius: 12px`, subtle drop shadow
- Play button: large, `--accent`, icon + "Play" text
- Cast chips: small pill badges in `--bg-card`

---

### Video Player Page

- Full-screen dark canvas (`background: #000`)
- HTML5 `<video>` element, 100vw × 100vh
- Custom controls bar (fades out after 3s of no movement):
  - Play/Pause button
  - Seek bar (purple thumb, dark track)
  - Current time / Total time
  - Volume slider
  - Fullscreen toggle
- Back arrow (top-left) returns to movie detail
- Resume toast: "Resume from 1:23:45?" with Yes / Start Over

---

### Upload Page

- Max-width 640px centered card
- Drag-and-drop zone: dashed `--border`, dashes animate on drag-over
- File input hidden, triggered by clicking the zone
- Title input: text field for manual metadata override
- Progress bar: animated fill in `--accent` during upload
- Status area: shows "Fetching metadata from OMDB..." after upload completes
- Movie card preview appears below on success

---

## Iconography

Use [Lucide Icons](https://lucide.dev/) via CDN (SVG, 1.3KB total for used icons).

| Icon | Usage |
|---|---|
| `play` | Play buttons |
| `upload` | Upload nav icon |
| `search` | Search bar |
| `user` | User avatar fallback |
| `star` | Rating display |
| `clock` | Resume timestamp |
| `x` | Close / dismiss |
| `chevron-left` | Back navigation |
| `film` | Poster fallback |

---

## Animation Tokens

| Token | Value | Usage |
|---|---|---|
| `--transition-fast` | `0.15s ease` | Hover states |
| `--transition-base` | `0.25s ease` | Card scale, fades |
| `--transition-slow` | `0.4s ease` | Page transitions, modals |

---

## Responsive Rules

- Cards never shrink below `140px` wide
- Navigation collapses to bottom tab bar on mobile (Home, Upload, Profile)
- Movie detail stacks to single column below 600px
- Player controls always full-width regardless of orientation
- Upload drop zone becomes tap-to-select on touch devices

---

## Accessibility Baseline

- All interactive elements have `:focus-visible` ring in `--accent`
- `aria-label` on icon-only buttons
- Poster `<img>` always has `alt="<Movie Title> poster"`
- Minimum tap target: 44×44px on mobile
- Colour contrast: all text meets WCAG AA against dark backgrounds
