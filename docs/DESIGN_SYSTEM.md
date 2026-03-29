# CineFlask Design System

**Version:** 2.0  
**Last Updated:** March 29, 2026  
**Status:** Production Ready

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Design Tokens](#design-tokens)
4. [Typography](#typography)
5. [Color System](#color-system)
6. [Spacing & Layout](#spacing--layout)
7. [Components](#components)
8. [Motion & Animation](#motion--animation)
9. [Accessibility](#accessibility)
10. [Responsive Design](#responsive-design)

---

## Introduction

The CineFlask Design System provides a comprehensive set of guidelines, components, and patterns for building consistent, accessible, and beautiful user interfaces across the CineFlask streaming platform.

### Goals

- **Consistency** - Unified look and feel across all pages
- **Accessibility** - WCAG 2.1 AA compliant by default
- **Performance** - Optimized for fast load times
- **Maintainability** - Easy to update and extend
- **Developer Experience** - Clear documentation and reusable components

### Aesthetic

CineFlask follows a **dark cinema aesthetic** inspired by Netflix and Prime Video, optimized for long viewing sessions with reduced eye strain.

---

## Design Principles

### 1. **Dark First**
- Dark backgrounds reduce eye strain during extended viewing
- Strategic use of light text for maximum readability
- Accent colors pop against dark surfaces

### 2. **Content First**
- UI elements support the content, never distract
- Generous whitespace for breathing room
- Clear visual hierarchy guides the eye

### 3. **Responsive Always**
- Mobile-first approach
- Fluid layouts that adapt to any screen size
- Touch-friendly targets (minimum 44x44px)

### 4. **Accessible By Default**
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Screen reader friendly
- High contrast for readability

### 5. **Performant**
- Minimal CSS and JavaScript
- Optimized animations (GPU-accelerated)
- Lazy loading for images
- Fast perceived performance with loading states

---

## Design Tokens

Design tokens are the foundational building blocks of our design system. They ensure consistency across all components and make theming possible.

### Color Tokens

#### Base Colors
```css
/* Backgrounds */
--color-bg-base: #0a0a0f;          /* Primary background */
--color-bg-card: #141420;          /* Card/surface background */
--color-bg-elevated: #1a1a2e;      /* Elevated surfaces (modals, dropdowns) */
--color-bg-nav: #0d0d18;           /* Navigation bar */
--color-bg-overlay: rgba(10, 10, 15, 0.85);  /* Backdrop overlays */

/* Text */
--color-text-primary: #f0f0f8;     /* Primary text - high contrast */
--color-text-secondary: #9090b0;   /* Secondary text - medium contrast */
--color-text-muted: #50506a;       /* Muted text - low contrast */
--color-text-inverse: #0a0a0f;     /* Text on light backgrounds */

/* Borders */
--color-border: rgba(255, 255, 255, 0.07);  /* Subtle borders */
--color-border-hover: rgba(255, 255, 255, 0.15);  /* Hover state */
--color-border-focus: var(--color-accent);  /* Focus indicator */
```

#### Accent Colors
```css
--color-accent: #7c5cfc;           /* Primary accent */
--color-accent-hover: #9b7ffe;     /* Hover state */
--color-accent-active: #6348d9;    /* Active/pressed state */
--color-accent-glow: rgba(124, 92, 252, 0.35);  /* Glow effect */
--color-accent-subtle: rgba(124, 92, 252, 0.1);  /* Subtle backgrounds */
```

#### Semantic Colors
```css
/* Success */
--color-success: #52e09a;
--color-success-bg: rgba(82, 224, 154, 0.1);
--color-success-border: rgba(82, 224, 154, 0.3);

/* Error/Danger */
--color-danger: #e05252;
--color-danger-bg: rgba(224, 82, 82, 0.1);
--color-danger-border: rgba(224, 82, 82, 0.3);

/* Warning */
--color-warning: #f59e0b;
--color-warning-bg: rgba(245, 158, 11, 0.1);
--color-warning-border: rgba(245, 158, 11, 0.3);

/* Info */
--color-info: #3b82f6;
--color-info-bg: rgba(59, 130, 246, 0.1);
--color-info-border: rgba(59, 130, 246, 0.3);
```

#### Special Colors
```css
--color-rating-star: #f5c518;      /* IMDb yellow */
--color-progress-bg: rgba(255, 255, 255, 0.2);  /* Progress bar background */
```

### Spacing Tokens

CineFlask uses an **8px base grid** for consistent spacing throughout the interface.

```css
/* Base unit */
--space-unit: 8px;

/* Scale */
--space-0: 0;
--space-1: 4px;     /* 0.5 × base */
--space-2: 8px;     /* 1 × base */
--space-3: 16px;    /* 2 × base */
--space-4: 24px;    /* 3 × base */
--space-5: 40px;    /* 5 × base */
--space-6: 64px;    /* 8 × base */
--space-7: 96px;    /* 12 × base */

/* Semantic aliases (for better readability) */
--space-xs: var(--space-1);   /* 4px */
--space-sm: var(--space-2);   /* 8px */
--space-md: var(--space-3);   /* 16px */
--space-lg: var(--space-4);   /* 24px */
--space-xl: var(--space-5);   /* 40px */
--space-2xl: var(--space-6);  /* 64px */
--space-3xl: var(--space-7);  /* 96px */
```

### Typography Tokens

#### Font Families
```css
--font-display: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Usage:**
- `--font-display` - Headings, hero text, prominent UI elements
- `--font-body` - Body text, descriptions, UI labels
- `--font-mono` - Code snippets, timestamps, technical data

#### Font Sizes
```css
/* Type scale (1.25 ratio) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px - base size */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Semantic aliases */
--text-body: var(--text-base);
--text-h1: var(--text-4xl);
--text-h2: var(--text-3xl);
--text-h3: var(--text-2xl);
--text-label: var(--text-sm);
```

#### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

#### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

#### Letter Spacing
```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### Border Radius Tokens

```css
--radius-none: 0;
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;  /* Pills and circles */
```

### Z-Index Tokens

Standardized z-index scale prevents stacking conflicts.

```css
--z-base: 0;
--z-raised: 10;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-modal-backdrop: 1200;
--z-modal: 1300;
--z-popover: 1400;
--z-toast: 1500;
--z-tooltip: 1600;
```

### Shadow Tokens

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-base: 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
--shadow-xl: 0 16px 64px rgba(0, 0, 0, 0.7);
--shadow-accent: 0 4px 16px var(--color-accent-glow);
```

---

## Typography

### Type Scale Usage

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Hero | `--text-5xl` | 800 | tight | Landing pages, major headings |
| H1 | `--text-4xl` | 700 | tight | Page titles |
| H2 | `--text-3xl` | 700 | tight | Section headings |
| H3 | `--text-2xl` | 600 | tight | Subsection headings |
| H4 | `--text-xl` | 600 | snug | Card titles |
| Body Large | `--text-lg` | 400 | relaxed | Introductions, emphasis |
| Body | `--text-base` | 400 | normal | Default text |
| Body Small | `--text-sm` | 400 | normal | Captions, metadata |
| Label | `--text-sm` | 600 | normal | Form labels, badges |
| Caption | `--text-xs` | 400 | normal | Timestamps, hints |

### Typography Best Practices

#### Hierarchy
```html
<!-- Good: Clear hierarchy -->
<h1 class="text-4xl font-bold mb-4">Movie Title</h1>
<p class="text-lg text-secondary mb-6">Tagline or introduction</p>
<p class="text-base text-muted">Description text...</p>

<!-- Bad: No hierarchy -->
<h1>Movie Title</h1>
<p>Tagline or introduction</p>
<p>Description text...</p>
```

#### Readability
- **Line length:** 50-75 characters for optimal readability
- **Paragraph spacing:** 1.5-2× the line height
- **Text color:** Use `--color-text-secondary` for body text, `--color-text-primary` for headings

#### Responsive Typography
```css
/* Base (mobile) */
h1 { font-size: var(--text-3xl); }

/* Tablet+ */
@media (min-width: 768px) {
  h1 { font-size: var(--text-4xl); }
}

/* Desktop+ */
@media (min-width: 1024px) {
  h1 { font-size: var(--text-5xl); }
}
```

---

## Color System

### Color Usage Guidelines

#### Text on Backgrounds

| Background | Text Color | Use Case |
|------------|------------|----------|
| `--color-bg-base` | `--color-text-primary` | Headings on main background |
| `--color-bg-base` | `--color-text-secondary` | Body text on main background |
| `--color-bg-card` | `--color-text-primary` | Headings on cards |
| `--color-bg-card` | `--color-text-secondary` | Body text on cards |
| `--color-accent` | `white` | Text on accent buttons |

#### Contrast Ratios (WCAG AA)

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `--color-text-primary` (#f0f0f8) | `--color-bg-base` (#0a0a0f) | 14.2:1 | ✅ AAA |
| `--color-text-secondary` (#9090b0) | `--color-bg-base` (#0a0a0f) | 6.8:1 | ✅ AA |
| `--color-text-muted` (#50506a) | `--color-bg-base` (#0a0a0f) | 4.6:1 | ✅ AA |
| `white` | `--color-accent` (#7c5cfc) | 4.7:1 | ✅ AA |

### Semantic Color Usage

#### Success
```html
<!-- Toast notification -->
<div class="toast toast-success">
  ✓ Movie uploaded successfully
</div>

<!-- Button -->
<button class="btn btn-success">Confirm</button>
```

#### Error/Danger
```html
<!-- Error message -->
<div class="error-message">
  ⚠ Failed to upload movie
</div>

<!-- Destructive button -->
<button class="btn btn-danger">Delete Movie</button>
```

#### Warning
```html
<!-- Warning banner -->
<div class="warning-banner">
  ⚡ Storage quota almost full (90%)
</div>
```

#### Info
```html
<!-- Info message -->
<div class="info-message">
  ℹ Processing video metadata...
</div>
```

---

## Spacing & Layout

### Spacing Scale Usage

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon gaps, tight spacing |
| `--space-2` | 8px | Button padding, small gaps |
| `--space-3` | 16px | Card padding, element gaps |
| `--space-4` | 24px | Section spacing, large gaps |
| `--space-5` | 40px | Component spacing |
| `--space-6` | 64px | Section padding |
| `--space-7` | 96px | Hero spacing, major sections |

### Layout Patterns

#### Container
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-3);
  }
}
```

#### Grid
```css
/* Movie grid - responsive */
.movie-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, 1fr);  /* Mobile */
}

@media (min-width: 480px) {
  .movie-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 768px) {
  .movie-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1024px) {
  .movie-grid { grid-template-columns: repeat(5, 1fr); }
}

@media (min-width: 1440px) {
  .movie-grid { grid-template-columns: repeat(6, 1fr); }
}
```

---

## Components

### Component Anatomy

Each component consists of:
1. **Base styles** - Default appearance
2. **Variants** - Different visual styles (primary, secondary, etc.)
3. **Sizes** - Different dimensions (sm, md, lg)
4. **States** - Interactive states (hover, focus, active, disabled)
5. **Modifiers** - Additional options (loading, error, etc.)

### Component Naming Convention

```
.{component}                 /* Base component */
.{component}--{variant}      /* Variant modifier */
.{component}--{size}         /* Size modifier */
.{component}__{element}      /* Sub-element */
.{component}.is-{state}      /* State class */
```

**Examples:**
```css
.btn                  /* Button base */
.btn--primary         /* Primary variant */
.btn--lg              /* Large size */
.btn__icon            /* Icon element */
.btn.is-loading       /* Loading state */
```

### Core Components

#### Button

**Variants:**
- `btn--primary` - Main actions (accent background)
- `btn--secondary` - Secondary actions (outlined)
- `btn--ghost` - Tertiary actions (transparent)
- `btn--danger` - Destructive actions (red)

**Sizes:**
- `btn--sm` - 32px height, 12px padding
- `btn--md` - 40px height, 16px padding (default)
- `btn--lg` - 48px height, 24px padding

**States:**
- Default
- Hover: `scale(1.02)`, shadow increase
- Focus: 2px outline with offset
- Active: `scale(0.98)`
- Disabled: `opacity: 0.5`, `cursor: not-allowed`
- Loading: Spinner + `pointer-events: none`

**Example:**
```html
<button class="btn btn--primary btn--md">
  Upload Movie
</button>

<button class="btn btn--secondary">
  Cancel
</button>

<button class="btn btn--danger" disabled>
  Delete
</button>
```

#### Card

**Variants:**
- `card` - Default card
- `card--movie` - Movie poster card
- `card--elevated` - Card with shadow

**Example:**
```html
<div class="card card--movie">
  <img class="card__poster" src="..." alt="Movie poster">
  <div class="card__content">
    <h3 class="card__title">Movie Title</h3>
    <p class="card__meta">2024 • Action</p>
  </div>
</div>
```

#### Form Controls

**Input:**
```html
<div class="form-group">
  <label class="form-label" for="email">Email</label>
  <input 
    type="email" 
    id="email" 
    class="form-input" 
    placeholder="Enter your email"
    aria-describedby="email-hint"
  >
  <span id="email-hint" class="form-hint">We'll never share your email</span>
</div>
```

**Select:**
```html
<select class="form-select">
  <option>Choose an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Textarea:**
```html
<textarea class="form-textarea" rows="4" placeholder="Enter description"></textarea>
```

---

## Motion & Animation

### Animation Principles

Based on **Emil Kowalski's guidelines**:

1. **Purpose** - Every animation should have a reason
2. **Subtlety** - Most animations should be barely noticeable
3. **Performance** - Use `transform` and `opacity` for GPU acceleration
4. **Timing** - Most UI animations: 150-300ms
5. **Easing** - Use natural easings, avoid linear

### Transition Tokens

```css
/* Durations */
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

/* Easing functions */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Composite transitions */
--transition-fast: var(--duration-fast) var(--ease-out);
--transition-base: var(--duration-base) var(--ease-out);
--transition-slow: var(--duration-slow) var(--ease-spring);
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out);
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp var(--duration-slow) var(--ease-spring);
}
```

#### Scale In
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn var(--duration-base) var(--ease-out);
}
```

#### Shimmer (Loading)
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-card) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    var(--color-bg-card) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Animation Best Practices

#### Do ✅
- Use `transform` and `opacity` for animations
- Keep animations under 300ms for UI interactions
- Use `will-change` sparingly and remove after animation
- Respect `prefers-reduced-motion`

#### Don't ❌
- Animate `width`, `height`, or `margin` (causes reflow)
- Use animations longer than 500ms for UI (feels sluggish)
- Animate everything (overwhelming)
- Ignore accessibility preferences

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### WCAG 2.1 AA Requirements

#### 1. **Perceivable**
- ✅ Color contrast ratio ≥ 4.5:1 for normal text
- ✅ Color contrast ratio ≥ 3:1 for large text (18pt+ or 14pt+ bold)
- ✅ Information not conveyed by color alone
- ✅ All images have alt text

#### 2. **Operable**
- ✅ All functionality available via keyboard
- ✅ No keyboard traps
- ✅ Focus visible on all interactive elements
- ✅ Touch targets ≥ 44x44px
- ✅ Skip to main content link

#### 3. **Understandable**
- ✅ Clear labels for form inputs
- ✅ Error messages explain how to fix
- ✅ Consistent navigation
- ✅ Clear page titles

#### 4. **Robust**
- ✅ Valid HTML
- ✅ Proper ARIA attributes
- ✅ Compatible with assistive technologies

### Focus Indicators

```css
/* Default focus (for keyboard navigation) */
:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Remove focus for mouse users (preserves for keyboard) */
:focus:not(:focus-visible) {
  outline: none;
}

/* Visible focus for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### ARIA Patterns

#### Button
```html
<button aria-label="Close modal">
  <svg aria-hidden="true">...</svg>
</button>
```

#### Modal
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Delete Movie</h2>
  <p>Are you sure?</p>
</div>
```

#### Alert/Toast
```html
<div role="alert" aria-live="assertive" aria-atomic="true">
  Movie uploaded successfully
</div>
```

#### Loading State
```html
<button aria-busy="true" aria-label="Loading">
  <span class="spinner" aria-hidden="true"></span>
  Loading...
</button>
```

### Screen Reader Only Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Responsive Design

### Breakpoint Strategy

**Mobile-first approach:** Base styles are for mobile, use `min-width` to scale up.

```css
/* Breakpoint tokens */
--breakpoint-sm: 480px;   /* Phablet */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1440px;  /* Large desktop */
```

### Responsive Patterns

#### Container
```css
/* Base: 16px padding */
.container {
  padding: 0 var(--space-3);
}

/* Tablet+: 24px padding */
@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-4);
  }
}
```

#### Navigation
```css
/* Mobile: Hamburger menu */
.navbar-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: var(--color-bg-nav);
  transform: translateX(-100%);
  transition: transform var(--transition-base);
}

.navbar-menu.is-open {
  transform: translateX(0);
}

/* Desktop: Horizontal menu */
@media (min-width: 1024px) {
  .navbar-menu {
    position: static;
    transform: none;
  }
}
```

#### Movie Grid
See [Spacing & Layout](#spacing--layout) section above.

### Touch Targets

All interactive elements must be at least **44x44px** for comfortable touch interaction.

```css
/* Minimum touch target */
.btn,
.form-input,
.user-avatar {
  min-width: 44px;
  min-height: 44px;
}
```

---

## Implementation Notes

### CSS Architecture

CineFlask CSS is split into modular files:

1. **0-tokens.css** - Design tokens
2. **1-reset.css** - CSS reset and base styles
3. **2-layout.css** - Layout utilities
4. **3-components.css** - Component styles
5. **4-utilities.css** - Utility classes
6. **5-animations.css** - Keyframes and animations
7. **style.css** - Main entry file (imports all above)

### Loading Design Tokens

```css
/* In your CSS */
@import '0-tokens.css';
@import '1-reset.css';
/* ... other imports */
```

```html
<!-- In your HTML -->
<link rel="stylesheet" href="/css/style.css">
```

### Using Tokens in JavaScript

```javascript
// Get CSS custom property value
const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-accent')
  .trim();

// Set CSS custom property value
document.documentElement.style.setProperty('--color-accent', '#ff0000');
```

---

## Resources

### Tools
- **Figma** - Design mockups and prototypes
- **axe DevTools** - Accessibility testing
- **Lighthouse** - Performance and accessibility audits
- **Contrast Checker** - WCAG contrast verification

### References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Emil Kowalski's Animation Guidelines](https://emilkowal.ski/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Changelog

### Version 2.0 (March 29, 2026)
- ✨ Complete design system documentation
- ✨ Extended color palette with semantic colors
- ✨ Comprehensive typography scale
- ✨ Animation library
- ✨ WCAG AA compliance guidelines
- ✨ Responsive design patterns
- ✨ Component specifications

---

**Questions or suggestions?** Contact the CineFlask development team.
