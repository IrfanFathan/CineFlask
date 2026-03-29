# CineFlask UI/UX Migration Plan

**Version:** 1.0  
**Date:** March 29, 2026  
**Status:** Ready for execution  
**Estimated Time:** 29-40 hours (4-5 days)

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 0: Documentation (✅ Complete)](#phase-0-documentation)
4. [Phase 1: Foundation CSS](#phase-1-foundation-css)
5. [Phase 2: Component CSS](#phase-2-component-css)
6. [Phase 3: JavaScript Components](#phase-3-javascript-components)
7. [Phase 4: HTML Enhancement](#phase-4-html-enhancement)
8. [Phase 5: Testing & Refinement](#phase-5-testing--refinement)
9. [Rollback Plan](#rollback-plan)
10. [Success Criteria](#success-criteria)
11. [Git Commit Strategy](#git-commit-strategy)

---

## Migration Overview

### Goals

Transform CineFlask from functional to production-ready with:
- ✅ **Modular CSS architecture** - Split 908-line `style.css` into 6 focused modules
- ✅ **Component library** - Reusable UI components (Toast, Modal, Dropdown, etc.)
- ✅ **WCAG AA compliance** - Full accessibility implementation
- ✅ **Enhanced UX** - Loading states, animations, better responsiveness
- ✅ **Design system** - Comprehensive token system and guidelines

### Approach

**"Plan-First" Strategy:**
1. Create comprehensive documentation before any code changes
2. Migrate CSS incrementally to avoid breaking changes
3. Add new JS components without modifying existing functionality
4. Enhance HTML pages with ARIA attributes and new components
5. Test thoroughly at each phase

### Risk Mitigation

- **No breaking changes** - All existing pages must continue to work
- **Incremental deployment** - Test after each phase completion
- **Git checkpoints** - Commit after each major step for easy rollback
- **Backup strategy** - Archive old files before modification
- **Visual regression testing** - Compare before/after screenshots

---

## Prerequisites

### Before Starting

- [x] Server running at `http://192.168.1.7:3000`
- [x] Git repository initialized and clean working tree
- [x] Documentation complete (`DESIGN_SYSTEM.md`, `COMPONENTS.md`, `ACCESSIBILITY.md`)
- [x] Node.js v18+ installed
- [ ] Browser DevTools open (Lighthouse, axe extension installed)
- [ ] Screenshot tool ready for visual regression testing

### Testing Tools Required

```bash
# Install axe DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/axe-devtools
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/

# Install WAVE browser extension
# Chrome: https://chrome.google.com/webstore/detail/wave-evaluation-tool
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/

# Optional: Install screen reader
# Windows: NVDA (https://www.nvaccess.org/)
# macOS: VoiceOver (built-in, Cmd+F5)
# Linux: Orca (pre-installed on most distros)
```

---

## Phase 0: Documentation

### Status: ✅ **COMPLETE**

### Deliverables

- [x] `docs/DESIGN_SYSTEM.md` (1,033 lines)
- [x] `docs/COMPONENTS.md` (743 lines)
- [x] `docs/ACCESSIBILITY.md` (641 lines)
- [x] `docs/MIGRATION_PLAN.md` (this file)

### Next Steps

Proceed to Phase 1: Foundation CSS

---

## Phase 1: Foundation CSS

**Estimated Time:** 4-6 hours  
**Risk Level:** Low (additive changes, no deletions)

### Objectives

1. Create modular CSS architecture
2. Establish design token system
3. Extract base styles from existing `style.css`
4. Maintain 100% visual parity with current design

### File Structure Changes

```
public/css/
├── _archived/
│   └── style-old.css          # Backup of original (create)
├── 0-tokens.css               # Design tokens (create)
├── 1-reset.css                # CSS reset & base styles (create)
├── 2-layout.css               # Layout utilities (create)
└── style.css                  # Main import file (modify)
```

### Step-by-Step Instructions

#### Step 1.1: Create Archive Directory

```bash
mkdir -p public/css/_archived
```

**Verification:** Directory exists at `public/css/_archived/`

---

#### Step 1.2: Backup Current CSS

```bash
cp public/css/style.css public/css/_archived/style-old.css
git add public/css/_archived/style-old.css
git commit -m "Phase 1.1: Backup original style.css"
```

**Verification:** Backup file created and committed

---

#### Step 1.3: Create `0-tokens.css`

**Location:** `public/css/0-tokens.css`  
**Source Lines:** Lines 7-75 from `style.css` (CSS custom properties)  
**Size:** ~200 lines (with additions from DESIGN_SYSTEM.md)

**Content to Migrate:**

```css
/* Extract from style.css lines 10-75 */
:root {
  /* Colors */
  --bg-base: #0a0a0f;
  --bg-card: #141420;
  /* ... all existing color tokens ... */
  
  /* Spacing */
  --space-xs: 4px;
  /* ... all existing spacing tokens ... */
  
  /* Typography */
  --font-display: 'Outfit', ...;
  /* ... all existing typography tokens ... */
  
  /* Transitions */
  --ease-out: cubic-bezier(0.21, 0.47, 0.32, 0.98);
  /* ... all existing transition tokens ... */
}
```

**Additions from DESIGN_SYSTEM.md:**

```css
/* Add missing tokens */
:root {
  /* Extended colors (semantic) */
  --warning: #f59e0b;
  --info: #3b82f6;
  
  /* Extended backgrounds */
  --bg-elevated: #1a1a2e;
  --bg-input: var(--bg-card);
  
  /* Extended spacing */
  --space-3xl: 96px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.5);
  
  /* Z-index scale */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-header: 1000;
  --z-modal-backdrop: 9000;
  --z-modal: 9100;
  --z-toast: 9999;
  
  /* Breakpoints (for JS reference) */
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;
}
```

**File Template:**

```css
/**
 * Design Tokens
 * Single source of truth for all design values
 * Reference: docs/DESIGN_SYSTEM.md
 */

:root {
  /* ==========================================
     COLORS
     ========================================== */
  
  /* Backgrounds */
  --bg-base: #0a0a0f;
  --bg-card: #141420;
  --bg-elevated: #1a1a2e;
  --bg-nav: #0d0d18;
  --bg-overlay: rgba(10, 10, 15, 0.85);
  --bg-input: var(--bg-card);
  
  /* Accent */
  --accent: #7c5cfc;
  --accent-hover: #9b7ffe;
  --accent-glow: rgba(124, 92, 252, 0.35);
  
  /* Semantic colors */
  --success: #52e09a;
  --danger: #e05252;
  --warning: #f59e0b;
  --info: #3b82f6;
  
  /* Text */
  --text-primary: #f0f0f8;
  --text-secondary: #9090b0;
  --text-muted: #50506a;
  
  /* Special */
  --rating-star: #f5c518;
  --border: rgba(255, 255, 255, 0.07);
  
  /* ==========================================
     SPACING (8px base grid)
     ========================================== */
  
  --space-xs: 4px;    /* 0.5 units */
  --space-sm: 8px;    /* 1 unit */
  --space-md: 16px;   /* 2 units */
  --space-lg: 24px;   /* 3 units */
  --space-xl: 40px;   /* 5 units */
  --space-2xl: 64px;  /* 8 units */
  --space-3xl: 96px;  /* 12 units */
  
  /* ==========================================
     TYPOGRAPHY
     ========================================== */
  
  /* Font families */
  --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  
  /* Type scale (1.25 ratio) */
  --text-hero: 3rem;        /* 48px */
  --text-h1: 2rem;          /* 32px */
  --text-h2: 1.5rem;        /* 24px */
  --text-h3: 1.125rem;      /* 18px */
  --text-body-lg: 1rem;     /* 16px */
  --text-body: 1rem;        /* 16px */
  --text-sm: 0.875rem;      /* 14px */
  --text-xs: 0.875rem;      /* 14px */
  --text-2xs: 0.8125rem;    /* 13px */
  --text-label: 0.875rem;   /* 14px */
  
  /* Line heights */
  --leading-tight: 1.2;
  --leading-snug: 1.35;
  --leading-normal: 1.55;
  --leading-relaxed: 1.75;
  
  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0em;
  --tracking-wide: 0.04em;
  --tracking-wider: 0.08em;
  --tracking-widest: 0.12em;
  
  /* ==========================================
     SHADOWS
     ========================================== */
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.5);
  --shadow-glow-accent: 0 4px 16px var(--accent-glow);
  
  /* ==========================================
     ANIMATIONS
     ========================================== */
  
  /* Easing functions (Emil Kowalski specs) */
  --ease-out: cubic-bezier(0.21, 0.47, 0.32, 0.98);
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  /* Combined transitions */
  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-base: var(--duration-base) var(--ease-out);
  --transition-slow: var(--duration-slow) var(--ease-spring);
  
  /* ==========================================
     BORDER RADIUS
     ========================================== */
  
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* ==========================================
     Z-INDEX SCALE
     ========================================== */
  
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-header: 1000;
  --z-modal-backdrop: 9000;
  --z-modal: 9100;
  --z-toast: 9999;
  
  /* ==========================================
     BREAKPOINTS (for JS reference)
     ========================================== */
  
  --breakpoint-sm: 480px;   /* Phablet */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1440px;  /* Large desktop */
}

/* ==========================================
   REDUCED MOTION
   ========================================== */

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 1ms;
    --duration-base: 1ms;
    --duration-slow: 1ms;
    --duration-slower: 1ms;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

**Verification:**
- File created at `public/css/0-tokens.css`
- All existing tokens present
- New tokens added from DESIGN_SYSTEM.md
- `prefers-reduced-motion` support included

**Git Checkpoint:**

```bash
git add public/css/0-tokens.css
git commit -m "Phase 1.2: Create design tokens module (0-tokens.css)"
```

---

#### Step 1.4: Create `1-reset.css`

**Location:** `public/css/1-reset.css`  
**Source Lines:** Lines 77-157 from `style.css`  
**Size:** ~150 lines

**Content to Migrate:**

```css
/* Extract from style.css lines 80-157 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  /* ... etc ... */
}

/* Typography base styles */
h1, h2, h3, h4, h5, h6 { /* ... */ }
p { /* ... */ }
a { /* ... */ }

/* Utility classes */
.tabular-nums { /* ... */ }
.prose { /* ... */ }
/* ... etc ... */
```

**File Template:**

```css
/**
 * CSS Reset & Base Styles
 * Modern CSS reset + opinionated defaults
 */

/* ==========================================
   RESET
   ========================================== */

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--text-primary);
  background-color: var(--bg-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ==========================================
   TYPOGRAPHY BASE
   ========================================== */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  text-wrap: balance;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

/* Override for first heading */
h1:first-child,
h2:first-child,
h3:first-child {
  margin-top: 0;
}

h1 { font-size: var(--text-h1); }
h2 { font-size: var(--text-h2); }
h3 { font-size: var(--text-h3); }

p {
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin-bottom: 1em;
}

p:last-child {
  margin-bottom: 0;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--accent-hover);
}

a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ==========================================
   TYPOGRAPHY UTILITIES
   ========================================== */

/* Tabular figures for consistent number width */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Prose line-length constraints for optimal readability */
.prose {
  max-width: 65ch;
}

.prose-wide {
  max-width: 75ch;
}

/* Text utilities */
.text-balance {
  text-wrap: balance;
}

.text-pretty {
  text-wrap: pretty;
}

/* ==========================================
   FORM ELEMENT RESET
   ========================================== */

button,
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}

/* ==========================================
   ACCESSIBILITY
   ========================================== */

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Screen reader only */
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

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent);
  color: white;
  padding: var(--space-sm) var(--space-md);
  text-decoration: none;
  border-radius: var(--radius-sm);
  z-index: var(--z-toast);
}

.skip-to-main:focus {
  top: var(--space-sm);
  left: var(--space-sm);
}

/* ==========================================
   IMAGE & MEDIA
   ========================================== */

img,
video {
  max-width: 100%;
  height: auto;
  display: block;
}

svg {
  display: inline-block;
  vertical-align: middle;
}
```

**Verification:**
- File created at `public/css/1-reset.css`
- All reset styles present
- Typography base styles migrated
- Accessibility utilities included
- Focus styles properly defined

**Git Checkpoint:**

```bash
git add public/css/1-reset.css
git commit -m "Phase 1.3: Create CSS reset and base styles (1-reset.css)"
```

---

#### Step 1.5: Create `2-layout.css`

**Location:** `public/css/2-layout.css`  
**Source Lines:** Lines 190-225 from `style.css`  
**Size:** ~180 lines (with additions)

**Content to Migrate:**

```css
/* Extract from style.css lines 193-224 */
.container { /* ... */ }
.section { /* ... */ }
.section-header { /* ... */ }
/* ... etc ... */
```

**File Template:**

```css
/**
 * Layout Utilities
 * Container, grid, flexbox, and spacing utilities
 */

/* ==========================================
   CONTAINER
   ========================================== */

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  width: 100%;
}

.container-fluid {
  width: 100%;
  padding: 0 var(--space-lg);
}

.container-narrow {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* ==========================================
   SECTION
   ========================================== */

.section {
  padding: var(--space-2xl) 0;
}

.section-sm {
  padding: var(--space-xl) 0;
}

.section-lg {
  padding: var(--space-3xl) 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  gap: var(--space-md);
}

.section-title {
  font-size: var(--text-h2);
  font-weight: 700;
  text-wrap: balance;
  margin: 0;
}

.section-link {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  white-space: nowrap;
}

.section-link:hover {
  color: var(--text-primary);
}

/* ==========================================
   FLEXBOX UTILITIES
   ========================================== */

.flex {
  display: flex;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }
.gap-xl { gap: var(--space-xl); }

/* ==========================================
   GRID UTILITIES
   ========================================== */

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.grid-cols-auto {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* ==========================================
   SPACING UTILITIES
   ========================================== */

/* Margin */
.m-0 { margin: 0; }
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mb-sm { margin-bottom: var(--space-sm); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }

/* Padding */
.p-0 { padding: 0; }
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }

/* ==========================================
   POSITION UTILITIES
   ========================================== */

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.fixed {
  position: fixed;
}

.sticky {
  position: sticky;
}

/* ==========================================
   DISPLAY UTILITIES
   ========================================== */

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.hidden {
  display: none;
}

.visible {
  visibility: visible;
}

.invisible {
  visibility: hidden;
}

/* ==========================================
   RESPONSIVE UTILITIES
   ========================================== */

@media (max-width: 479px) {
  .hide-mobile {
    display: none;
  }
}

@media (min-width: 480px) {
  .show-mobile {
    display: none;
  }
}

@media (max-width: 767px) {
  .hide-tablet {
    display: none;
  }
}

@media (min-width: 768px) {
  .show-tablet {
    display: none;
  }
}
```

**Verification:**
- File created at `public/css/2-layout.css`
- Container styles migrated
- Section utilities present
- Flexbox and grid utilities added
- Responsive utilities included

**Git Checkpoint:**

```bash
git add public/css/2-layout.css
git commit -m "Phase 1.4: Create layout utilities (2-layout.css)"
```

---

#### Step 1.6: Update `style.css` to Import Modules

**Location:** `public/css/style.css`  
**Action:** Replace entire file with import statements

**New Content:**

```css
/**
 * CineFlask Global Styles
 * Dark streaming platform aesthetic - Netflix/Prime Video inspired
 * 
 * Architecture: Modular CSS with clear separation of concerns
 * - 0-tokens.css:     Design system tokens (colors, spacing, typography)
 * - 1-reset.css:      CSS reset and base styles
 * - 2-layout.css:     Layout utilities (container, grid, flexbox)
 * - 3-components.css: Reusable UI components (buttons, cards, forms)
 * - 4-utilities.css:  Utility classes (text, colors, display)
 * - 5-animations.css: Keyframes and animation utilities
 * 
 * Reference documentation:
 * - Design system: docs/DESIGN_SYSTEM.md
 * - Components:    docs/COMPONENTS.md
 * - Accessibility: docs/ACCESSIBILITY.md
 * - Migration:     docs/MIGRATION_PLAN.md
 */

/* Foundation layer */
@import './0-tokens.css';
@import './1-reset.css';
@import './2-layout.css';

/* Component & utility layer (Phase 2 - to be created) */
/* @import './3-components.css'; */
/* @import './4-utilities.css'; */
/* @import './5-animations.css'; */

/* ==========================================
   TEMPORARY: Existing component styles
   Will be migrated to 3-components.css in Phase 2
   ========================================== */

/* Typography utility classes */
.empty-state-message {
  color: var(--text-secondary);
}

.form-hint {
  color: var(--text-muted);
  font-size: var(--text-xs);
  display: block;
  margin-top: var(--space-sm);
}

.badge-label {
  color: var(--accent);
  font-size: var(--text-2xs);
}

/* Subtitle list item styling */
.subtitle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
}

.subtitle-item .btn {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
}

/* ==========================================
   NAVIGATION BAR
   ========================================== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--bg-nav);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  z-index: var(--z-header);
  transition: background var(--transition-base);
}

.navbar.transparent {
  background: transparent;
  border-bottom: none;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: var(--tracking-tight);
}

.navbar-logo svg {
  width: 28px;
  height: 28px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.navbar-search {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  width: 280px;
  transition: border-color var(--transition-fast);
}

.navbar-search:focus-within {
  border-color: var(--accent);
}

.navbar-search input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-sm);
  outline: none;
}

.navbar-search input::placeholder {
  color: var(--text-muted);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
  border: none;
  padding: 0;
}

.user-avatar:hover {
  transform: scale(1.1);
}

/* Spacer for fixed navbar */
.navbar-spacer {
  height: 70px;
}

/* ==========================================
   BUTTONS
   ========================================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast),
              transform var(--transition-fast),
              box-shadow var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast);
  will-change: transform;
  text-decoration: none;
  white-space: nowrap;
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-glow-accent);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent);
}

.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* ==========================================
   FORMS
   ========================================== */
.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-body);
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-error {
  margin-top: var(--space-sm);
  font-size: var(--text-xs);
  color: var(--danger);
}

/* ==========================================
   MOVIE CARDS
   ========================================== */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-lg);
  padding: var(--space-sm) 0;
}

.movie-card {
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  will-change: transform;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  z-index: var(--z-dropdown);
}

.movie-card:hover .movie-poster {
  box-shadow: 0 12px 48px rgba(124, 92, 252, 0.3), var(--shadow-lg);
}

.movie-card:hover .movie-info-overlay {
  opacity: 1;
  transform: translateY(0);
}

.movie-poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 150%; /* 2:3 aspect ratio - uniform for all posters */
  border-radius: var(--radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
  box-shadow: var(--shadow-md);
}

.movie-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: box-shadow var(--transition-base);
}

.movie-poster-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
  color: var(--text-muted);
  padding: var(--space-md);
  text-align: center;
}

.movie-poster-fallback svg {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-sm);
  opacity: 0.5;
}

/* Hover overlay with quick info */
.movie-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
  padding: var(--space-lg) var(--space-md) var(--space-md);
  opacity: 0;
  transform: translateY(20px);
  transition: transform var(--transition-base), opacity var(--transition-base);
  will-change: transform, opacity;
  pointer-events: none;
}

.movie-info-overlay-title {
  font-size: var(--text-sm);
  font-weight: 700;
  margin-bottom: var(--space-xs);
  color: white;
}

.movie-info-overlay-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.movie-info-overlay-genre {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-rating-badge {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  padding: 4px var(--space-sm);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 4px;
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--rating-star);
  display: flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.movie-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: var(--z-base);
}

.movie-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #9d7cfc);
  transition: width var(--transition-base);
  box-shadow: 0 0 8px var(--accent);
}

.movie-info {
  margin-top: var(--space-sm);
}

.movie-title {
  font-size: var(--text-sm);
  font-weight: 700;
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.movie-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* ==========================================
   HERO BANNER
   ========================================== */
.hero {
  position: relative;
  height: 55vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(60px) brightness(0.3);
}

.hero-content {
  position: relative;
  z-index: var(--z-base);
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  gap: var(--space-2xl);
  align-items: center;
}

.hero-poster {
  flex-shrink: 0;
  width: 300px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

.hero-info {
  flex: 1;
}

.hero-title {
  font-size: clamp(2rem, 5vw, var(--text-hero));
  font-weight: 800;
  margin-bottom: var(--space-md);
  text-wrap: balance;
}

.hero-metadata {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.hero-description {
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-lg);
  max-width: 65ch;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
}

/* ==========================================
   HORIZONTAL SCROLL ROW
   ========================================== */
.scroll-row {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: var(--space-sm);
}

.scroll-row::-webkit-scrollbar {
  display: none;
}

.scroll-row .movie-card {
  flex-shrink: 0;
  width: 200px;
}

/* ==========================================
   AUTH PAGE
   ========================================== */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
}

.auth-logo {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.auth-tagline {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.auth-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.auth-tab {
  flex: 1;
  padding: var(--space-md);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast);
}

.auth-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

/* ==========================================
   TOAST NOTIFICATIONS
   ========================================== */
.toast {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  animation: slideIn var(--transition-slow);
  will-change: transform, opacity;
  max-width: 400px;
}

.toast.success {
  border-color: var(--success);
}

.toast.error {
  border-color: var(--danger);
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ==========================================
   LOADING STATES
   ========================================== */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
}

/* ==========================================
   RESPONSIVE DESIGN
   ========================================== */
@media (max-width: 600px) {
  .hero {
    height: auto;
    padding: var(--space-2xl) 0;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-poster {
    width: 200px;
  }

  .hero-title {
    font-size: clamp(1.5rem, 8vw, 2.25rem);
  }

  .hero-actions {
    justify-content: center;
  }

  .navbar-search {
    display: none;
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .section-title {
    font-size: 1.25rem;
  }
}

@media (min-width: 600px) and (max-width: 1024px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
```

**Verification:**
- File updated successfully
- Imports correct module paths
- All existing component styles preserved temporarily
- Comments indicate future migration to Phase 2
- Pages still render identically

**Git Checkpoint:**

```bash
git add public/css/style.css
git commit -m "Phase 1.5: Update style.css to import modular CSS files"
```

---

#### Step 1.7: Visual Regression Test

**Test all pages to ensure no visual changes:**

```bash
# Start server if not already running
# Server should already be running at http://192.168.1.7:3000

# Test these pages manually in browser:
# - http://192.168.1.7:3000/
# - http://192.168.1.7:3000/home.html
# - http://192.168.1.7:3000/upload.html
# - http://192.168.1.7:3000/player.html
# - http://192.168.1.7:3000/profiles.html
```

**Checklist:**
- [ ] Homepage renders identically
- [ ] Home.html (movie browse) renders identically
- [ ] Upload page renders identically
- [ ] Player page renders identically
- [ ] No console errors in DevTools
- [ ] CSS loads without 404 errors
- [ ] Hover states work correctly
- [ ] Responsive breakpoints still functional

**If any issues found:**
- Check browser console for errors
- Verify file paths in `@import` statements
- Ensure token names match between files
- Test in multiple browsers (Chrome, Firefox, Safari)

---

### Phase 1 Completion Checklist

- [ ] `public/css/_archived/` directory created
- [ ] `public/css/_archived/style-old.css` backup created
- [ ] `public/css/0-tokens.css` created with all design tokens
- [ ] `public/css/1-reset.css` created with CSS reset and base styles
- [ ] `public/css/2-layout.css` created with layout utilities
- [ ] `public/css/style.css` updated to import all modules
- [ ] Visual regression test passed (no visual changes)
- [ ] All pages load without console errors
- [ ] Git commits created for each step

### Phase 1 Success Criteria

✅ **All checks must pass before proceeding to Phase 2:**

1. **No visual regressions** - Pages look identical to before migration
2. **No console errors** - DevTools shows no errors or warnings
3. **Design tokens accessible** - `var(--accent)` works in browser DevTools
4. **Modular architecture** - 3 new CSS files created and imported correctly
5. **Git history clean** - All changes committed with descriptive messages
6. **Documentation accurate** - Token values match `DESIGN_SYSTEM.md`

### Estimated Time: 4-6 hours

**Breakdown:**
- Archive and backup: 15 minutes
- Create 0-tokens.css: 1.5 hours
- Create 1-reset.css: 1 hour
- Create 2-layout.css: 1 hour
- Update style.css: 30 minutes
- Visual regression testing: 30-1 hour

---

## Phase 2: Component CSS

**Estimated Time:** 6-8 hours  
**Status:** Pending (awaits Phase 1 completion)

### Objectives

1. Extract all component styles from `style.css` into `3-components.css`
2. Create utility classes in `4-utilities.css`
3. Create animation library in `5-animations.css`
4. Remove temporary styles from `style.css`

### File Structure Changes

```
public/css/
├── 3-components.css           # All UI components (create)
├── 4-utilities.css            # Utility classes (create)
├── 5-animations.css           # Keyframes & animations (create)
└── style.css                  # Import all modules (modify)
```

### Component Extraction Map

**From `style.css` → To `3-components.css`:**

| Component | Current Lines | Size | Priority |
|-----------|---------------|------|----------|
| Navbar | 228-332 | ~105 lines | High |
| Buttons | 336-401 | ~66 lines | High |
| Forms | 405-446 | ~42 lines | High |
| Movie Cards | 450-618 | ~169 lines | High |
| Hero Banner | 621-695 | ~75 lines | Medium |
| Auth Components | 721-774 | ~54 lines | Medium |
| Toast | 777-811 | ~35 lines | Low |
| Loading States | 880-908 | ~29 lines | Low |

**Total lines to migrate:** ~575 lines

### Step-by-Step Instructions

#### Step 2.1: Create `3-components.css`

**Location:** `public/css/3-components.css`  
**Content:** All component styles extracted from `style.css`

**Structure:**

```css
/**
 * UI Components
 * Reusable component styles for the application
 * Reference: docs/COMPONENTS.md
 */

/* Navbar */
.navbar { /* ... */ }
.navbar-content { /* ... */ }
/* ... all navbar variants ... */

/* Buttons */
.btn { /* ... */ }
.btn-primary { /* ... */ }
/* ... all button variants ... */

/* Forms */
.form-group { /* ... */ }
.form-label { /* ... */ }
/* ... all form components ... */

/* Movie Cards */
.movie-card { /* ... */ }
.movie-poster { /* ... */ }
/* ... all movie card variants ... */

/* Hero Banner */
.hero { /* ... */ }
.hero-content { /* ... */ }
/* ... all hero variants ... */

/* Auth Components */
.auth-container { /* ... */ }
.auth-card { /* ... */ }
/* ... all auth components ... */

/* Toast Notifications */
.toast { /* ... */ }
.toast.success { /* ... */ }
/* ... all toast variants ... */

/* Loading States */
.spinner { /* ... */ }
.loading-overlay { /* ... */ }
```

**Detailed instructions in Phase 2 execution section below**

---

#### Step 2.2: Create `4-utilities.css`

**Location:** `public/css/4-utilities.css`  
**Content:** Utility classes for text, colors, display, etc.

**Structure:**

```css
/**
 * Utility Classes
 * Single-purpose utility classes for rapid development
 */

/* Text utilities */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-muted { color: var(--text-muted); }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-uppercase { text-transform: uppercase; }
.text-lowercase { text-transform: lowercase; }
.text-capitalize { text-transform: capitalize; }

/* Font weights */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }

/* Background utilities */
.bg-base { background-color: var(--bg-base); }
.bg-card { background-color: var(--bg-card); }
.bg-elevated { background-color: var(--bg-elevated); }

/* Border utilities */
.border { border: 1px solid var(--border); }
.border-accent { border-color: var(--accent); }
.border-danger { border-color: var(--danger); }
.border-success { border-color: var(--success); }

/* Opacity utilities */
.opacity-0 { opacity: 0; }
.opacity-50 { opacity: 0.5; }
.opacity-100 { opacity: 1; }

/* Cursor utilities */
.cursor-pointer { cursor: pointer; }
.cursor-not-allowed { cursor: not-allowed; }

/* Overflow utilities */
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
.overflow-scroll { overflow: scroll; }

/* Width utilities */
.w-full { width: 100%; }
.w-auto { width: auto; }
.max-w-prose { max-width: 65ch; }

/* Truncate text */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

#### Step 2.3: Create `5-animations.css`

**Location:** `public/css/5-animations.css`  
**Content:** Keyframe animations and animation utilities

**Structure:**

```css
/**
 * Animations
 * Keyframe animations and motion utilities
 * Reference: docs/DESIGN_SYSTEM.md (Motion Principles)
 */

/* ==========================================
   KEYFRAME ANIMATIONS
   ========================================== */

/* Fade animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Slide animations */
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scale animations */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

/* Spin animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Shimmer loading animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* ==========================================
   ANIMATION UTILITY CLASSES
   ========================================== */

.animate-fadeIn {
  animation: fadeIn var(--duration-base) var(--ease-out);
}

.animate-slideIn {
  animation: slideIn var(--duration-slow) var(--ease-spring);
}

.animate-slideInDown {
  animation: slideInDown var(--duration-base) var(--ease-out);
}

.animate-scaleIn {
  animation: scaleIn var(--duration-base) var(--ease-out);
}

.animate-spin {
  animation: spin 0.6s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ==========================================
   TRANSITION UTILITIES
   ========================================== */

.transition-all {
  transition: all var(--transition-base);
}

.transition-colors {
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast);
}

.transition-transform {
  transition: transform var(--transition-base);
}

.transition-opacity {
  transition: opacity var(--transition-fast);
}

/* ==========================================
   HOVER EFFECTS
   ========================================== */

.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow:hover {
  box-shadow: var(--shadow-glow-accent);
}

/* ==========================================
   SKELETON LOADING
   ========================================== */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-card) 0%,
    var(--bg-elevated) 50%,
    var(--bg-card) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
  background: linear-gradient(
    90deg,
    var(--bg-card) 0%,
    var(--bg-elevated) 50%,
    var(--bg-card) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-text-short {
  width: 60%;
}

.skeleton-text-long {
  width: 100%;
}
```

---

#### Step 2.4: Update `style.css` Imports

**Action:** Uncomment Phase 2 imports and remove temporary component styles

**Updated `style.css`:**

```css
/**
 * CineFlask Global Styles
 * Dark streaming platform aesthetic - Netflix/Prime Video inspired
 * ... (header remains same) ...
 */

/* Foundation layer */
@import './0-tokens.css';
@import './1-reset.css';
@import './2-layout.css';

/* Component & utility layer */
@import './3-components.css';
@import './4-utilities.css';
@import './5-animations.css';

/* No more temporary styles - everything migrated! */
```

**Git Checkpoint:**

```bash
git add public/css/3-components.css public/css/4-utilities.css public/css/5-animations.css public/css/style.css
git commit -m "Phase 2: Create component, utility, and animation CSS modules"
```

---

### Phase 2 Completion Checklist

- [ ] `public/css/3-components.css` created with all components
- [ ] `public/css/4-utilities.css` created with utility classes
- [ ] `public/css/5-animations.css` created with animations
- [ ] `public/css/style.css` imports updated
- [ ] All temporary styles removed from `style.css`
- [ ] Visual regression test passed
- [ ] No console errors
- [ ] Git commits created

### Phase 2 Success Criteria

1. **Complete CSS migration** - No component styles left in main `style.css`
2. **No visual regressions** - Pages still look identical
3. **Modular architecture** - 6 total CSS files properly organized
4. **Utilities available** - New utility classes work correctly
5. **Animations functional** - Keyframe animations work with `prefers-reduced-motion` support

---

## Phase 3: JavaScript Components

**Estimated Time:** 8-12 hours  
**Status:** Pending (awaits Phase 2 completion)

### Objectives

1. Create reusable JavaScript component classes
2. Add global state management
3. Implement accessibility utilities
4. No changes to existing functionality (additive only)

### File Structure Changes

```
public/js/
├── components/
│   ├── toast.js               # Toast notification system (create)
│   ├── modal.js               # Modal dialog component (create)
│   ├── skeleton.js            # Loading skeleton (create)
│   └── dropdown.js            # Dropdown menu (create)
├── state.js                   # Global state manager (create)
├── a11y.js                    # Accessibility utilities (create)
└── utils.js                   # Existing utilities (keep)
```

### Components to Create

#### Component 1: Toast Notification System

**File:** `public/js/components/toast.js`  
**Size:** ~200 lines  
**Dependencies:** None  
**Features:**
- Success, error, warning, info variants
- Auto-dismiss with configurable duration
- Stack multiple toasts
- ARIA live region for screen readers
- Keyboard dismissible (Escape key)

**API:**

```javascript
const toast = new Toast();

toast.success('Movie uploaded successfully!', { duration: 3000 });
toast.error('Upload failed. Please try again.', { duration: 5000 });
toast.warning('File size exceeds limit', { persist: true });
toast.info('Processing video...', { id: 'processing' });
toast.dismiss('processing'); // Dismiss specific toast
```

---

#### Component 2: Modal Dialog

**File:** `public/js/components/modal.js`  
**Size:** ~250 lines  
**Dependencies:** None  
**Features:**
- Confirmation, alert, custom content modes
- Focus trap (keyboard navigation contained)
- Close on Escape key or backdrop click
- ARIA attributes for accessibility
- Lock body scroll when open

**API:**

```javascript
const modal = new Modal();

// Confirmation dialog
modal.confirm({
  title: 'Delete Movie',
  message: 'Are you sure you want to delete this movie?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: () => deleteMovie(id)
});

// Alert dialog
modal.alert({
  title: 'Error',
  message: 'Failed to load movie',
  variant: 'error'
});

// Custom content
modal.open({
  title: 'Movie Details',
  content: '<div>...</div>',
  size: 'large'
});
```

---

#### Component 3: Loading Skeleton

**File:** `public/js/components/skeleton.js`  
**Size:** ~100 lines  
**Dependencies:** None  
**Features:**
- Movie card skeleton
- Text skeleton (heading, paragraph)
- Custom skeleton elements
- Accessible loading state

**API:**

```javascript
const skeleton = new Skeleton();

// Show skeleton for movie grid
skeleton.showMovieGrid('#movie-container', { count: 12 });

// Show skeleton for text content
skeleton.showText('#content', { lines: 3 });

// Hide skeleton and show real content
skeleton.hide('#movie-container');
```

---

#### Component 4: Dropdown Menu

**File:** `public/js/components/dropdown.js`  
**Size:** ~150 lines  
**Dependencies:** None  
**Features:**
- Keyboard navigation (Arrow keys, Enter, Escape)
- Auto-positioning (prevent overflow)
- Close on outside click
- ARIA attributes

**API:**

```javascript
const dropdown = new Dropdown('#user-menu', {
  items: [
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
    { separator: true },
    { label: 'Logout', onClick: logout }
  ]
});
```

---

#### Component 5: Global State Manager

**File:** `public/js/state.js`  
**Size:** ~100 lines  
**Dependencies:** None  
**Features:**
- Simple pub/sub pattern
- State persistence (localStorage)
- Subscribe to state changes
- No framework dependencies

**API:**

```javascript
import State from './state.js';

// Initialize state
State.set('filters', { genre: 'all', sortBy: 'recent' });

// Subscribe to changes
State.subscribe('filters', (newFilters) => {
  renderMovies(newFilters);
});

// Update state
State.set('filters', { ...State.get('filters'), genre: 'action' });

// Persist to localStorage
State.persist('user-preferences', ['filters', 'viewMode']);
```

---

#### Component 6: Accessibility Utilities

**File:** `public/js/a11y.js`  
**Size:** ~150 lines  
**Dependencies:** None  
**Features:**
- Focus trap utility
- Announce to screen readers
- Keyboard shortcut manager
- Focus management

**API:**

```javascript
import A11y from './a11y.js';

// Create focus trap for modal
const trap = A11y.trapFocus(modalElement);
trap.activate();
// ... later
trap.deactivate();

// Announce to screen readers
A11y.announce('Movie added to favorites');

// Register keyboard shortcuts
A11y.registerShortcut('/', () => focusSearch());
A11y.registerShortcut('Escape', () => closeModal());
```

---

### Phase 3 Implementation Order

1. **State Manager** (Foundation for other components)
2. **Toast** (Simple, no dependencies)
3. **Accessibility Utilities** (Needed by Modal & Dropdown)
4. **Modal** (Uses A11y utilities)
5. **Skeleton** (Simple, standalone)
6. **Dropdown** (Uses A11y utilities)

### Phase 3 Testing

**For each component:**

1. **Unit testing** - Test component API and methods
2. **Integration testing** - Test component in actual pages
3. **Accessibility testing** - Use screen reader and keyboard only
4. **Visual testing** - Ensure proper styling
5. **Performance testing** - No memory leaks or excessive reflows

**Test checklist:**
- [ ] Component initializes without errors
- [ ] All public methods work correctly
- [ ] ARIA attributes present and correct
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Visual appearance matches design
- [ ] No console errors or warnings
- [ ] Works in all target browsers

---

## Phase 4: HTML Enhancement

**Estimated Time:** 6-8 hours  
**Status:** Pending (awaits Phase 3 completion)

### Objectives

1. Add ARIA labels to all interactive elements
2. Implement keyboard shortcuts
3. Add loading states and empty states
4. Use new components (Toast, Modal, Skeleton)
5. Improve semantic HTML

### Pages to Enhance

#### Page 1: `index.html` (Login/Register)

**Enhancements:**
- Add ARIA labels to form inputs
- Add form validation with accessible error messages
- Add loading state for login/register buttons
- Use Toast for success/error messages
- Add "Skip to main content" link

**Estimated time:** 1.5 hours

---

#### Page 2: `home.html` (Movie Browse)

**Enhancements:**
- Add ARIA labels to movie cards
- Add keyboard shortcuts (/ for search, Escape to close)
- Add Skeleton loading for movie grid
- Use Toast for notifications
- Add empty state when no movies found
- Add ARIA live region for filter changes

**Estimated time:** 2 hours

---

#### Page 3: `upload.html` (Upload Movie)

**Enhancements:**
- Add ARIA labels to all form inputs
- Add real-time validation with accessible errors
- Use Toast for upload progress and errors
- Add Skeleton loading during upload
- Use Modal for upload confirmation
- Add keyboard shortcut (Ctrl+Enter to submit)

**Estimated time:** 2 hours

---

#### Page 4: `player.html` (Video Player)

**Enhancements:**
- Add comprehensive keyboard shortcuts (Space, Arrow keys, F, M, etc.)
- Add ARIA labels to all player controls
- Add focus indicators for controls
- Add keyboard shortcut overlay (? key)
- Use Toast for player notifications

**Estimated time:** 2.5 hours

---

### HTML Enhancement Template

**Before:**

```html
<button class="btn btn-primary" onclick="deleteMovie()">
  Delete
</button>
```

**After:**

```html
<button 
  class="btn btn-primary" 
  onclick="deleteMovie()"
  aria-label="Delete movie: Inception"
>
  <svg aria-hidden="true">...</svg>
  <span>Delete</span>
</button>
```

---

## Phase 5: Testing & Refinement

**Estimated Time:** 5-8 hours  
**Status:** Pending (awaits Phase 4 completion)

### Testing Strategy

#### 1. Automated Accessibility Testing

**Tools:**
- Lighthouse (Chrome DevTools)
- axe DevTools browser extension
- WAVE browser extension

**Steps:**

```bash
# 1. Run Lighthouse accessibility audit on each page
# Chrome DevTools → Lighthouse → Accessibility
# Target score: 100/100

# Pages to test:
# - / (login)
# - /home.html (browse)
# - /upload.html (upload)
# - /player.html (player)
# - /profiles.html (profiles)

# 2. Run axe DevTools scan on each page
# Browser extension → Scan page
# Target: 0 violations

# 3. Run WAVE scan on each page
# Browser extension → Analyze page
# Target: 0 errors
```

**Success criteria:**
- Lighthouse accessibility score: 100/100 on all pages
- axe DevTools: 0 violations on all pages
- WAVE: 0 errors on all pages

---

#### 2. Manual Keyboard Navigation Testing

**Test plan:**

```
Page: home.html (Movie Browse)

1. Tab key navigation
   [ ] Tab moves through all interactive elements in logical order
   [ ] Focus indicators clearly visible on all elements
   [ ] No keyboard trap (can tab through entire page)
   [ ] Skip to main content link works

2. Keyboard shortcuts
   [ ] / focuses search input
   [ ] Escape closes modal/dropdown
   [ ] Arrow keys navigate movie grid
   [ ] Enter activates focused element

3. Form controls
   [ ] All form inputs accessible via keyboard
   [ ] Radio buttons navigable with arrow keys
   [ ] Checkboxes toggle with Space
   [ ] Select dropdowns open with Space/Enter

4. Screen reader compatibility
   [ ] All images have alt text
   [ ] All buttons have accessible names
   [ ] ARIA labels present and accurate
   [ ] Live regions announce changes
```

**Repeat for all pages**

---

#### 3. Screen Reader Testing

**Tools:**
- NVDA (Windows)
- VoiceOver (macOS)
- Orca (Linux)

**Test scenarios:**

```
Scenario 1: Browse and play a movie (home.html → player.html)

1. Navigate to home page
   [ ] Page title announced
   [ ] Main heading announced
   [ ] Movie count announced

2. Search for a movie
   [ ] Search input role and label announced
   [ ] Search results announced

3. Select a movie card
   [ ] Movie title announced
   [ ] Movie metadata (year, genre, rating) announced
   [ ] "Play" button role and label announced

4. Play the movie
   [ ] Video player controls announced
   [ ] Play/pause state announced
   [ ] Volume level announced
   [ ] Current time announced
```

**Repeat for all major user flows**

---

#### 4. Responsive Testing

**Breakpoints to test:**
- 320px (Mobile S)
- 375px (Mobile M)
- 425px (Mobile L)
- 768px (Tablet)
- 1024px (Desktop)
- 1440px (Desktop L)
- 2560px (4K)

**Test checklist:**
- [ ] Layout doesn't break at any breakpoint
- [ ] Text remains readable (no horizontal scroll)
- [ ] Images scale appropriately
- [ ] Buttons and interactive elements large enough (44x44px minimum)
- [ ] Touch targets don't overlap on mobile
- [ ] Navigation accessible on all screen sizes

---

#### 5. Cross-Browser Testing

**Browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

**Test checklist:**
- [ ] CSS renders correctly
- [ ] JavaScript components work
- [ ] Animations smooth
- [ ] Forms submit correctly
- [ ] Video player works
- [ ] No console errors

---

#### 6. Performance Testing

**Lighthouse Performance Audit:**

```bash
# Run Lighthouse performance audit
# Chrome DevTools → Lighthouse → Performance
# Target score: 90+ on all pages
```

**Metrics to monitor:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1
- Speed Index: < 3.4s

**Optimization actions:**
- Minify CSS/JS (add to build process)
- Optimize images (add WebP support)
- Add lazy loading for movie posters
- Add code splitting if needed

---

### Testing Documentation

**Create test report:** `docs/TESTING_REPORT.md`

```markdown
# Testing Report

## Accessibility Testing

### Lighthouse Scores
- Login page: 100/100
- Browse page: 100/100
- Upload page: 100/100
- Player page: 100/100

### axe DevTools Results
- Total violations: 0
- Pages tested: 5
- Date: March 29, 2026

### Manual Keyboard Testing
✅ All interactive elements accessible via keyboard
✅ Logical tab order on all pages
✅ Visible focus indicators
✅ No keyboard traps

### Screen Reader Testing (NVDA)
✅ All images have alt text
✅ All buttons have accessible names
✅ Forms properly labeled
✅ Live regions working correctly

## Performance Testing

### Lighthouse Performance Scores
- Login page: 95/100
- Browse page: 92/100
- Upload page: 94/100
- Player page: 90/100

### Core Web Vitals
- LCP: 1.8s (Good)
- FID: 45ms (Good)
- CLS: 0.05 (Good)

## Cross-Browser Testing
✅ Chrome 120+ - All features working
✅ Firefox 121+ - All features working
✅ Safari 17+ - All features working

## Responsive Testing
✅ 320px - Layout works, no horizontal scroll
✅ 768px - Tablet layout functional
✅ 1024px - Desktop layout optimal
✅ 2560px - 4K layout scales well

## Issues Found & Resolved
None

## Recommendations
1. Add service worker for offline support
2. Consider adding dark mode toggle
3. Add more keyboard shortcuts for power users
```

---

## Rollback Plan

### If Issues Occur During Migration

#### Quick Rollback (< 5 minutes)

```bash
# Restore original CSS
cp public/css/_archived/style-old.css public/css/style.css

# Restart server
# Verify pages load correctly
```

#### Granular Rollback by Phase

**Rollback Phase 3 (Keep CSS changes):**

```bash
git revert HEAD~1  # Revert last commit
# Or revert specific files
git checkout HEAD~1 -- public/js/components/
```

**Rollback Phase 2 (Keep foundation, revert components):**

```bash
git checkout HEAD~3 -- public/css/3-components.css public/css/4-utilities.css public/css/5-animations.css public/css/style.css
```

**Rollback Phase 1 (Full revert to original):**

```bash
git checkout HEAD~6 -- public/css/
# This reverts all CSS changes
```

#### Rollback Decision Tree

```
Issue detected
    ├─ Visual regression?
    │   ├─ CSS token mismatch → Fix tokens, don't rollback
    │   └─ Missing styles → Check imports, may need rollback
    │
    ├─ Console errors?
    │   ├─ File not found → Check paths, fix imports
    │   └─ JavaScript errors → Rollback Phase 3 only
    │
    ├─ Accessibility regression?
    │   ├─ Missing ARIA → Fix HTML, don't rollback
    │   └─ Focus trap broken → Fix JS component
    │
    └─ Performance degradation?
        ├─ Large CSS files → Expected, minify in production
        └─ Slow page load → Investigate, may need optimization
```

---

## Success Criteria

### Overall Migration Success

✅ **All criteria must be met:**

1. **Functionality preserved**
   - All existing features work identically
   - No regressions in user workflows
   - Video upload, playback, and management functional

2. **Accessibility achieved**
   - Lighthouse accessibility: 100/100 on all pages
   - axe DevTools: 0 violations
   - WCAG 2.1 AA compliant
   - Screen reader compatible

3. **Performance maintained**
   - Lighthouse performance: 90+ on all pages
   - No significant increase in load time
   - Smooth animations (60fps)

4. **Code quality**
   - Modular CSS architecture (6 files)
   - Reusable JS components (6 components)
   - Comprehensive documentation (4 files)
   - Clean Git history with descriptive commits

5. **Design consistency**
   - Design tokens used throughout
   - Components match COMPONENTS.md specs
   - Visual improvements noticeable but not disruptive

6. **Browser compatibility**
   - Works in Chrome, Firefox, Safari
   - Responsive across all breakpoints
   - Degrades gracefully in older browsers

---

## Git Commit Strategy

### Commit Message Format

```
Phase X.Y: Brief description (50 chars max)

Detailed explanation of changes:
- Bullet point 1
- Bullet point 2
- Bullet point 3

Related: docs/MIGRATION_PLAN.md Phase X
```

### Example Commits

```bash
# Phase 0
git commit -m "Phase 0: Create comprehensive documentation suite"

# Phase 1
git commit -m "Phase 1.1: Backup original style.css"
git commit -m "Phase 1.2: Create design tokens module (0-tokens.css)"
git commit -m "Phase 1.3: Create CSS reset and base styles (1-reset.css)"
git commit -m "Phase 1.4: Create layout utilities (2-layout.css)"
git commit -m "Phase 1.5: Update style.css to import modular CSS files"

# Phase 2
git commit -m "Phase 2.1: Extract components to 3-components.css"
git commit -m "Phase 2.2: Create utility classes (4-utilities.css)"
git commit -m "Phase 2.3: Create animation library (5-animations.css)"
git commit -m "Phase 2.4: Remove temporary styles from style.css"

# Phase 3
git commit -m "Phase 3.1: Create global state manager"
git commit -m "Phase 3.2: Create Toast notification component"
git commit -m "Phase 3.3: Create accessibility utilities"
git commit -m "Phase 3.4: Create Modal dialog component"
git commit -m "Phase 3.5: Create loading skeleton component"
git commit -m "Phase 3.6: Create dropdown menu component"

# Phase 4
git commit -m "Phase 4.1: Enhance index.html with ARIA and components"
git commit -m "Phase 4.2: Enhance home.html with accessibility features"
git commit -m "Phase 4.3: Enhance upload.html with loading states"
git commit -m "Phase 4.4: Enhance player.html with keyboard shortcuts"

# Phase 5
git commit -m "Phase 5: Complete accessibility audit and testing"
```

### Branching Strategy (Optional)

```bash
# Create feature branch for migration
git checkout -b feature/ui-ux-enhancement

# Work through phases...
# Commit after each step

# When complete and tested
git checkout main
git merge feature/ui-ux-enhancement
git tag v2.1-ui-ux-complete
git push origin main --tags
```

---

## Timeline Estimate

### Detailed Breakdown

| Phase | Tasks | Time | Dependencies |
|-------|-------|------|--------------|
| **Phase 0** | Documentation | **4h** | None |
| → | DESIGN_SYSTEM.md | 1.5h | ✅ Complete |
| → | COMPONENTS.md | 1h | ✅ Complete |
| → | ACCESSIBILITY.md | 1h | ✅ Complete |
| → | MIGRATION_PLAN.md | 0.5h | ✅ Complete |
| **Phase 1** | Foundation CSS | **4-6h** | Phase 0 |
| → | Create 0-tokens.css | 1.5h | - |
| → | Create 1-reset.css | 1h | - |
| → | Create 2-layout.css | 1h | - |
| → | Update style.css | 0.5h | - |
| → | Testing | 1h | - |
| **Phase 2** | Component CSS | **6-8h** | Phase 1 |
| → | Create 3-components.css | 3h | - |
| → | Create 4-utilities.css | 1.5h | - |
| → | Create 5-animations.css | 1.5h | - |
| → | Testing | 1h | - |
| **Phase 3** | JS Components | **8-12h** | Phase 2 |
| → | State manager | 1.5h | - |
| → | Toast component | 2h | State |
| → | A11y utilities | 2h | - |
| → | Modal component | 2.5h | A11y |
| → | Skeleton component | 1.5h | - |
| → | Dropdown component | 2h | A11y |
| → | Testing | 1.5h | All |
| **Phase 4** | HTML Enhancement | **6-8h** | Phase 3 |
| → | index.html | 1.5h | - |
| → | home.html | 2h | - |
| → | upload.html | 2h | - |
| → | player.html | 2.5h | - |
| **Phase 5** | Testing | **5-8h** | Phase 4 |
| → | Automated testing | 2h | - |
| → | Keyboard testing | 1h | - |
| → | Screen reader testing | 2h | - |
| → | Responsive testing | 1h | - |
| → | Cross-browser testing | 1h | - |
| → | Documentation | 1h | - |
| **Total** | **All phases** | **33-46h** | - |

### Work Schedule Recommendations

**5-day sprint (6-9 hours/day):**

- **Day 1:** Complete Phase 1 (6h)
- **Day 2:** Complete Phase 2 (8h)
- **Day 3:** Complete Phase 3 (9h)
- **Day 4:** Complete Phase 4 (8h)
- **Day 5:** Complete Phase 5 + buffer (8h)

**Or 7-day sprint (5-7 hours/day):**

- **Day 1-2:** Phase 1 + Phase 2 start (12h)
- **Day 3:** Phase 2 complete (6h)
- **Day 4-5:** Phase 3 (12h)
- **Day 6:** Phase 4 (7h)
- **Day 7:** Phase 5 (7h)

---

## Post-Migration Tasks

### After Successful Migration

1. **Update README.md**
   - Add section on design system
   - Link to new documentation
   - Update architecture diagram

2. **Production Optimization**
   - Minify CSS and JavaScript
   - Add Vite build process (optional)
   - Optimize images (WebP conversion)
   - Add service worker for offline support

3. **Developer Documentation**
   - Create CONTRIBUTING.md with component guidelines
   - Add JSDoc comments to all JS components
   - Create Storybook for component showcase (optional)

4. **Monitoring**
   - Set up Lighthouse CI for continuous accessibility monitoring
   - Add error tracking (Sentry, etc.)
   - Monitor Core Web Vitals in production

5. **Future Enhancements**
   - Dark mode toggle (already dark, but add light mode option)
   - User preferences persistence
   - Advanced keyboard shortcuts
   - Touch gestures for mobile
   - PWA support

---

## Conclusion

This migration plan provides a systematic approach to transform CineFlask into a production-ready, accessible, and well-architected streaming platform.

**Key principles:**
- ✅ **Incremental migration** - Small, testable changes
- ✅ **Documentation first** - Plan before code
- ✅ **No breaking changes** - Maintain functionality throughout
- ✅ **Accessibility first** - WCAG AA from the start
- ✅ **Git checkpoints** - Easy rollback if needed

**Next step:** Execute Phase 1 - Foundation CSS

---

**Document Version:** 1.0  
**Last Updated:** March 29, 2026  
**Status:** Ready for execution
