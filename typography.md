# 🔤 CineLocal — Typography System
> Cinematic, legible, and performant across all devices

---

## Font Strategy

CineLocal uses a **two-family system** — one for display/branding, one for body/UI — both loaded from Google Fonts for zero install friction.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Type Families

### Display — Outfit
Used for: movie titles, hero headings, logo wordmark, section labels

Outfit is geometric, modern, and slightly cinematic — it reads well at large sizes on dark backgrounds and pairs naturally with streaming platform aesthetics.

| Weight | Value | Usage |
|---|---|---|
| ExtraBold | 800 | Logo wordmark, hero title |
| Bold | 700 | Movie titles on cards, page headings |
| SemiBold | 600 | Section headers, CTA button text |
| Medium | 500 | Sub-headings, metadata labels |

```css
font-family: 'Outfit', sans-serif;
```

---

### Body — Inter
Used for: descriptions, form labels, navigation links, body copy, timestamps, cast names

Inter is purpose-built for screens — it's exceptionally legible at small sizes and is the de facto standard for modern web UI.

| Weight | Value | Usage |
|---|---|---|
| SemiBold | 600 | Input labels, strong emphasis |
| Medium | 500 | Navigation links, button labels |
| Regular | 400 | Descriptions, plot text, metadata |

```css
font-family: 'Inter', sans-serif;
```

---

## Type Scale

All sizes use `rem` for accessibility (respects browser zoom).

| Token | rem | px equiv. | Font | Weight | Usage |
|---|---|---|---|---|---|
| `--text-hero` | 3rem | 48px | Outfit | 800 | Hero banner title |
| `--text-h1` | 2rem | 32px | Outfit | 700 | Page titles, movie detail title |
| `--text-h2` | 1.5rem | 24px | Outfit | 700 | Section headers ("Continue Watching") |
| `--text-h3` | 1.125rem | 18px | Outfit | 600 | Card titles (hover state), modal headers |
| `--text-body-lg` | 1rem | 16px | Inter | 400 | Plot descriptions, about text |
| `--text-body` | 0.9375rem | 15px | Inter | 400 | General UI text, form inputs |
| `--text-sm` | 0.875rem | 14px | Inter | 400 | Card movie title (default state) |
| `--text-xs` | 0.8125rem | 13px | Inter | 400 | Metadata, year, genre chips |
| `--text-2xs` | 0.75rem | 12px | Inter | 400 | Timestamps, "Added X days ago" |
| `--text-label` | 0.6875rem | 11px | Inter | 600 | Uppercase labels, rating badges |

---

## CSS Custom Properties

```css
:root {
  /* Families */
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Scale */
  --text-hero:    3rem;
  --text-h1:      2rem;
  --text-h2:      1.5rem;
  --text-h3:      1.125rem;
  --text-body-lg: 1rem;
  --text-body:    0.9375rem;
  --text-sm:      0.875rem;
  --text-xs:      0.8125rem;
  --text-2xs:     0.75rem;
  --text-label:   0.6875rem;

  /* Line heights */
  --leading-tight:  1.2;
  --leading-snug:   1.35;
  --leading-normal: 1.55;
  --leading-relaxed:1.75;

  /* Letter spacing */
  --tracking-tight:  -0.02em;
  --tracking-normal: 0em;
  --tracking-wide:   0.04em;
  --tracking-wider:  0.08em;
  --tracking-widest: 0.12em;
}
```

---

## Usage Rules by Component

### Logo / Wordmark
```css
font-family: var(--font-display);
font-size: 1.375rem;        /* 22px */
font-weight: 800;
letter-spacing: var(--tracking-tight);
color: var(--accent);
```

### Hero Title
```css
font-family: var(--font-display);
font-size: clamp(2rem, 5vw, var(--text-hero));  /* Fluid, min 32px */
font-weight: 800;
line-height: var(--leading-tight);
letter-spacing: var(--tracking-tight);
color: var(--text-primary);
```

### Section Header (e.g. "Continue Watching")
```css
font-family: var(--font-display);
font-size: var(--text-h2);
font-weight: 700;
line-height: var(--leading-tight);
letter-spacing: var(--tracking-tight);
color: var(--text-primary);
```

### Movie Card Title
```css
font-family: var(--font-display);
font-size: var(--text-sm);
font-weight: 700;
line-height: var(--leading-snug);
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
color: var(--text-primary);
```

### Movie Card Metadata (Year · Genre)
```css
font-family: var(--font-body);
font-size: var(--text-xs);
font-weight: 400;
color: var(--text-secondary);
letter-spacing: var(--tracking-normal);
```

### Rating Badge
```css
font-family: var(--font-body);
font-size: var(--text-label);
font-weight: 600;
letter-spacing: var(--tracking-wider);
text-transform: uppercase;
color: var(--rating-star);
```

### Plot / Description
```css
font-family: var(--font-body);
font-size: var(--text-body);
font-weight: 400;
line-height: var(--leading-relaxed);
color: var(--text-secondary);
```

### Navigation Links
```css
font-family: var(--font-body);
font-size: var(--text-sm);
font-weight: 500;
letter-spacing: var(--tracking-normal);
color: var(--text-secondary);
/* Active state */
color: var(--text-primary);
font-weight: 600;
```

### Button Text
```css
font-family: var(--font-display);
font-size: var(--text-sm);
font-weight: 600;
letter-spacing: var(--tracking-wide);
```

### Form Input
```css
font-family: var(--font-body);
font-size: var(--text-body);
font-weight: 400;
color: var(--text-primary);
```

### Form Label
```css
font-family: var(--font-body);
font-size: var(--text-xs);
font-weight: 600;
letter-spacing: var(--tracking-wide);
text-transform: uppercase;
color: var(--text-secondary);
```

### Timestamp / Muted Text
```css
font-family: var(--font-body);
font-size: var(--text-2xs);
font-weight: 400;
color: var(--text-muted);
```

---

## Responsive Type Adjustments

```css
/* Reduce hero title on smaller screens */
@media (max-width: 600px) {
  .hero-title {
    font-size: clamp(1.5rem, 8vw, 2.25rem);
  }

  .section-header {
    font-size: 1.25rem;
  }
}
```

---

## Anti-Aliasing

Apply globally for crisp text on dark backgrounds:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

---

## Do & Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use Outfit for all titles and headings | Mix more than 2 families |
| Use Inter for all body/UI text | Use system fonts for titles (inconsistent) |
| Use `clamp()` for fluid hero sizes | Set fixed px sizes on hero type |
| Truncate long titles with `text-overflow: ellipsis` | Let titles overflow cards |
| Use `--tracking-tight` on large display type | Use default tracking on 40px+ headings |
| Keep metadata in Inter Regular at 12–13px | Use display font for plot descriptions |
| Use uppercase + wide tracking only on tiny labels | Apply wide tracking to body text |
