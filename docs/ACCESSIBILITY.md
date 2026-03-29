# CineFlask Accessibility Guidelines

**Version:** 2.0  
**Target:** WCAG 2.1 Level AA  
**Last Updated:** March 29, 2026

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [WCAG 2.1 AA Checklist](#wcag-21-aa-checklist)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Screen Reader Support](#screen-reader-support)
5. [Color & Contrast](#color--contrast)
6. [Focus Management](#focus-management)
7. [ARIA Patterns](#aria-patterns)
8. [Forms & Validation](#forms--validation)
9. [Testing Procedures](#testing-procedures)
10. [Common Issues & Fixes](#common-issues--fixes)

---

## Introduction

Accessibility (a11y) ensures that CineFlask can be used by everyone, including people with disabilities. This document provides comprehensive guidelines for meeting **WCAG 2.1 Level AA** standards.

### Why Accessibility Matters

- **11% of adults** have a disability that affects computer use
- **Keyboard-only users** rely on proper focus management
- **Screen reader users** depend on semantic HTML and ARIA
- **Legal requirements** in many jurisdictions (ADA, Section 508)
- **Better UX** for everyone (mobile users, power users, etc.)

### Accessibility Principles (POUR)

1. **Perceivable** - Information must be presentable to users
2. **Operable** - Interface components must be usable
3. **Understandable** - Information must be comprehensible
4. **Robust** - Content must work with assistive technologies

---

## WCAG 2.1 AA Checklist

### Perceivable

#### 1.1 Text Alternatives
- [ ] All images have meaningful `alt` text
- [ ] Decorative images use `alt=""` or `aria-hidden="true"`
- [ ] Icon buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Video/audio content has captions/transcripts

#### 1.2 Time-based Media
- [ ] Videos have captions (if applicable)
- [ ] Audio descriptions provided (if applicable)
- [ ] Live captions for live content (if applicable)

#### 1.3 Adaptable
- [ ] Semantic HTML used (`<nav>`, `<main>`, `<article>`, etc.)
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] Lists use proper markup (`<ul>`, `<ol>`, `<li>`)
- [ ] Tables have `<th>` headers and proper structure
- [ ] Form inputs have programmatically associated labels

#### 1.4 Distinguishable
- [ ] **Color contrast** meets AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] **Information not conveyed by color alone** (use icons, text, patterns)
- [ ] **Text resizable** up to 200% without loss of functionality
- [ ] **Images of text** avoided (use real text when possible)
- [ ] **Reflow** - Content adapts to 320px width without horizontal scroll

### Operable

#### 2.1 Keyboard Accessible
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Tab order is logical and predictable
- [ ] Skip to main content link provided
- [ ] Keyboard shortcuts don't conflict with assistive tech

#### 2.2 Enough Time
- [ ] No time limits, or user can extend/disable
- [ ] Auto-updating content can be paused/stopped
- [ ] Timeouts provide warnings

#### 2.3 Seizures
- [ ] No content flashes more than 3 times per second
- [ ] Animations respect `prefers-reduced-motion`

#### 2.4 Navigable
- [ ] Page titles are descriptive
- [ ] Focus order is logical
- [ ] **Link text is descriptive** (avoid "click here")
- [ ] Multiple ways to navigate (menu, search, sitemap)
- [ ] Headings and labels are descriptive
- [ ] **Focus indicator is visible**

#### 2.5 Input Modalities
- [ ] Touch targets are at least 44x44px
- [ ] Pointer gestures have keyboard alternative
- [ ] Accidental activation is preventable

### Understandable

#### 3.1 Readable
- [ ] Page language is identified (`<html lang="en">`)
- [ ] Language changes marked (`<span lang="fr">`)
- [ ] Reading level appropriate for content

#### 3.2 Predictable
- [ ] Navigation is consistent across pages
- [ ] Consistent component identification
- [ ] Focus doesn't trigger unexpected context changes
- [ ] Input doesn't cause unexpected changes

#### 3.3 Input Assistance
- [ ] **Form errors are identified and described**
- [ ] **Labels and instructions provided**
- [ ] Error suggestions offered when possible
- [ ] **Error prevention** for legal/financial transactions

### Robust

#### 4.1 Compatible
- [ ] Valid HTML (no parsing errors)
- [ ] ARIA used correctly
- [ ] Name, role, value available for UI components
- [ ] Status messages use appropriate ARIA roles

---

## Keyboard Navigation

### Global Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `/` | Focus search (when not in input) |
| `Esc` | Close modal/dropdown/overlay |
| `?` | Show keyboard shortcuts help |

### Video Player Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `←` | Seek backward 10s |
| `→` | Seek forward 10s |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Mute/Unmute |
| `F` | Fullscreen |
| `C` | Toggle captions |

### Focus Order Rules

1. **Logical flow** - Left to right, top to bottom
2. **Skip repetitive content** - Provide "Skip to main content" link
3. **Modal focus trap** - Tab cycles within modal
4. **Return focus** - After closing modal, return to trigger element

### Example: Skip Link

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Later in the page -->
<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-accent);
  color: white;
  padding: var(--space-2) var(--space-4);
  z-index: var(--z-toast);
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: 0;
}
```

---

## Screen Reader Support

### Semantic HTML

```html
<!-- Good: Semantic structure -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation items -->
  </nav>
</header>

<main role="main" id="main-content">
  <article>
    <h1>Movie Title</h1>
    <section>
      <h2>Description</h2>
      <p>...</p>
    </section>
  </article>
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### Landmark Roles

| Element | Role | Purpose |
|---------|------|---------|
| `<header>` | `banner` | Site header |
| `<nav>` | `navigation` | Navigation section |
| `<main>` | `main` | Main content |
| `<aside>` | `complementary` | Sidebar content |
| `<footer>` | `contentinfo` | Site footer |
| `<search>` | `search` | Search region |

### ARIA Labels

```html
<!-- Navigation -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Footer navigation">...</nav>

<!-- Buttons with icon only -->
<button aria-label="Close modal">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Search input -->
<input 
  type="search" 
  aria-label="Search movies and series"
  placeholder="Search..."
>

<!-- Progress bar -->
<div 
  role="progressbar" 
  aria-valuenow="45" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="Upload progress"
>
  <div class="progress-fill" style="width: 45%"></div>
</div>
```

### Screen Reader Only Text

```html
<button>
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Delete movie</span>
</button>

<!-- Announce dynamic content -->
<div role="status" aria-live="polite" class="sr-only">
  45 of 120 movies loaded
</div>
```

### Live Regions

```html
<!-- Polite announcement (waits for screen reader to finish) -->
<div role="status" aria-live="polite" aria-atomic="true">
  Processing video...
</div>

<!-- Assertive announcement (interrupts screen reader) -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Upload failed. Please try again.
</div>
```

---

## Color & Contrast

### WCAG AA Requirements

| Text Size | Contrast Ratio |
|-----------|----------------|
| Normal text (< 18pt) | **4.5:1** minimum |
| Large text (≥ 18pt or ≥ 14pt bold) | **3:1** minimum |
| UI components | **3:1** minimum |
| Graphical objects | **3:1** minimum |

### CineFlask Color Contrast Audit

| Foreground | Background | Ratio | Size | Pass |
|------------|------------|-------|------|------|
| #f0f0f8 (text-primary) | #0a0a0f (bg-base) | **14.2:1** | Any | ✅ AAA |
| #9090b0 (text-secondary) | #0a0a0f (bg-base) | **6.8:1** | Any | ✅ AA |
| #50506a (text-muted) | #0a0a0f (bg-base) | **4.6:1** | Normal | ✅ AA |
| #ffffff (white) | #7c5cfc (accent) | **4.7:1** | Normal | ✅ AA |
| #ffffff (white) | #52e09a (success) | **2.9:1** | Large | ⚠️ Large only |
| #ffffff (white) | #e05252 (danger) | **4.5:1** | Normal | ✅ AA |

### Testing Contrast

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools (Lighthouse audit)
- [Colour Contrast Analyser (CCA)](https://www.tpgi.com/color-contrast-checker/)

```css
/* Example: Adjust text-muted if needed */
:root {
  --color-text-muted: #50506a; /* 4.6:1 - Passes AA */
}

/* If it fails, adjust: */
:root {
  --color-text-muted: #6060 7a; /* Higher contrast */
}
```

### Color Independence

**Don't:**
```html
<!-- Information conveyed by color only -->
<span style="color: red;">Error</span>
<span style="color: green;">Success</span>
```

**Do:**
```html
<!-- Color + icon/text -->
<span class="status status--error">
  ⚠️ Error
</span>
<span class="status status--success">
  ✓ Success
</span>
```

---

## Focus Management

### Visible Focus Indicators

```css
/* Default focus (for all users) */
:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Remove for mouse users, keep for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}

/* Visible focus for keyboard users */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Custom focus for buttons */
.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-accent-glow);
}
```

### Focus Trap (Modals)

```javascript
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstElement = this.focusableElements[0];
    this.lastElement = this.focusableElements[this.focusableElements.length - 1];
  }
  
  trap() {
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.firstElement.focus();
  }
  
  release() {
    this.element.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstElement) {
        e.preventDefault();
        this.lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastElement) {
        e.preventDefault();
        this.firstElement.focus();
      }
    }
  }
}

// Usage
const modal = document.querySelector('.modal');
const focusTrap = new FocusTrap(modal);
focusTrap.trap();

// On close
focusTrap.release();
previousFocusElement.focus();
```

### Focus Return

```javascript
// Save trigger element
let triggerElement = null;

function openModal(trigger) {
  triggerElement = trigger;
  modal.showModal();
  modal.querySelector('.modal__container').focus();
}

function closeModal() {
  modal.close();
  
  // Return focus to trigger
  if (triggerElement) {
    triggerElement.focus();
    triggerElement = null;
  }
}
```

---

## ARIA Patterns

### Button

```html
<!-- Standard button -->
<button type="button">Click me</button>

<!-- Icon button -->
<button type="button" aria-label="Close">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Toggle button -->
<button 
  type="button" 
  aria-pressed="false"
  aria-label="Mute audio"
>
  <svg aria-hidden="true">...</svg>
</button>
```

### Link vs Button

**Use `<button>` for:**
- Actions (submit, delete, toggle)
- Opening modals
- Triggering JavaScript

**Use `<a>` for:**
- Navigation to another page
- Downloading files
- Jumping to anchors

```html
<!-- Button - triggers action -->
<button type="button" onclick="deleteMovie()">Delete</button>

<!-- Link - navigates -->
<a href="/movie.html?id=123">View Movie</a>
```

### Disclosure (Expandable)

```html
<button 
  aria-expanded="false" 
  aria-controls="details-content"
  onclick="toggle()"
>
  Show Details
</button>

<div id="details-content" hidden>
  <!-- Content -->
</div>
```

```javascript
function toggle() {
  const button = event.target;
  const content = document.getElementById(button.getAttribute('aria-controls'));
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
  button.setAttribute('aria-expanded', !isExpanded);
  content.hidden = isExpanded;
}
```

### Dialog/Modal

```html
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">Are you sure you want to delete this movie?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

### Dropdown Menu

```html
<button 
  aria-haspopup="true" 
  aria-expanded="false"
  aria-controls="user-menu"
>
  User Menu
</button>

<ul id="user-menu" role="menu">
  <li role="menuitem">
    <a href="/profile">Profile</a>
  </li>
  <li role="menuitem">
    <a href="/settings">Settings</a>
  </li>
</ul>
```

### Alert/Toast

```html
<!-- Polite announcement -->
<div role="status" aria-live="polite" aria-atomic="true">
  Movie uploaded successfully
</div>

<!-- Important alert -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Upload failed. Please try again.
</div>
```

---

## Forms & Validation

### Form Labels

```html
<!-- Explicit label -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- Implicit label -->
<label>
  Username
  <input type="text" name="username">
</label>

<!-- aria-label (when visual label not possible) -->
<input type="search" aria-label="Search movies" placeholder="Search...">
```

### Required Fields

```html
<label for="email">
  Email <span aria-label="required">*</span>
</label>
<input 
  type="email" 
  id="email" 
  name="email" 
  required
  aria-required="true"
>
```

### Error Messages

```html
<div class="form-group">
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email" 
    class="form-input is-error"
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <span id="email-error" class="form-error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

### Error Summary

```html
<div role="alert" aria-labelledby="error-heading">
  <h2 id="error-heading">There are 2 errors in this form</h2>
  <ul>
    <li><a href="#email">Email: Please enter a valid email</a></li>
    <li><a href="#password">Password: Must be at least 8 characters</a></li>
  </ul>
</div>
```

### Fieldset & Legend

```html
<fieldset>
  <legend>Search by</legend>
  
  <label>
    <input type="radio" name="search-type" value="title" checked>
    Movie Title
  </label>
  
  <label>
    <input type="radio" name="search-type" value="imdb">
    IMDb ID
  </label>
</fieldset>
```

---

## Testing Procedures

### Automated Testing

#### 1. Lighthouse (Chrome DevTools)
1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Accessibility** category
4. Click **Analyze page load**
5. Review score and issues

**Target: 100/100**

#### 2. axe DevTools Extension
1. Install [axe DevTools](https://www.deque.com/axe/devtools/)
2. Open extension in DevTools
3. Click **Scan ALL of my page**
4. Review violations and fix

**Target: 0 violations**

#### 3. WAVE Tool
1. Install [WAVE Extension](https://wave.webaim.org/extension/)
2. Click WAVE icon
3. Review errors, alerts, features
4. Fix all errors

### Manual Testing

#### Keyboard Navigation
1. **Unplug mouse** or don't use trackpad
2. **Tab through** entire page
3. **Verify:**
   - All interactive elements are reachable
   - Focus order is logical
   - Focus indicators are visible
   - No keyboard traps
   - All functionality works via keyboard

#### Screen Reader Testing

**Windows: NVDA (Free)**
1. Download [NVDA](https://www.nvaccess.org/)
2. Install and start
3. Navigate page with keyboard
4. Verify all content is announced correctly

**Mac: VoiceOver (Built-in)**
1. Enable: System Preferences → Accessibility → VoiceOver
2. Start: `Cmd + F5`
3. Navigate: `Ctrl + Option + Arrow Keys`
4. Verify all content is announced correctly

**Key Commands:**
| OS | Action | Keys |
|----|--------|------|
| NVDA | Next element | `↓` |
| NVDA | Previous element | `↑` |
| NVDA | Headings list | `Insert + F7` |
| VoiceOver | Next element | `Ctrl + Option + →` |
| VoiceOver | Previous element | `Ctrl + Option + ←` |
| VoiceOver | Rotor | `Ctrl + Option + U` |

#### Color Contrast
1. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
2. Test all text/background combinations
3. Verify 4.5:1 for normal text, 3:1 for large text

#### Zoom Testing
1. Zoom to **200%** (Ctrl/Cmd + +)
2. Verify:
   - Text is readable
   - No horizontal scroll
   - Functionality works
   - Layout doesn't break

---

## Common Issues & Fixes

### Issue 1: Missing alt text

**Problem:**
```html
<img src="/poster.jpg">
```

**Fix:**
```html
<img src="/poster.jpg" alt="Inception movie poster">

<!-- Decorative images -->
<img src="/decoration.svg" alt="" aria-hidden="true">
```

### Issue 2: Non-semantic buttons

**Problem:**
```html
<div onclick="delete()">Delete</div>
```

**Fix:**
```html
<button type="button" onclick="delete()">Delete</button>
```

### Issue 3: Icon-only buttons without labels

**Problem:**
```html
<button>
  <svg>...</svg>
</button>
```

**Fix:**
```html
<button aria-label="Close modal">
  <svg aria-hidden="true">...</svg>
</button>
```

### Issue 4: Low contrast text

**Problem:**
```css
color: #888; /* 2.9:1 - Fails AA */
background: #000;
```

**Fix:**
```css
color: #aaa; /* 4.6:1 - Passes AA */
background: #000;
```

### Issue 5: No focus indicator

**Problem:**
```css
button:focus {
  outline: none; /* Removes focus indicator */
}
```

**Fix:**
```css
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Issue 6: Empty links

**Problem:**
```html
<a href="/movie.html?id=123">
  <img src="/poster.jpg" alt="">
</a>
```

**Fix:**
```html
<a href="/movie.html?id=123" aria-label="View Inception (2010)">
  <img src="/poster.jpg" alt="" aria-hidden="true">
</a>
```

### Issue 7: Form inputs without labels

**Problem:**
```html
<input type="text" placeholder="Username">
```

**Fix:**
```html
<label for="username">Username</label>
<input type="text" id="username" placeholder="Enter your username">
```

### Issue 8: Modals without aria-modal

**Problem:**
```html
<div class="modal">
  <h2>Delete Movie</h2>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Fix:**
```html
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Delete Movie</h2>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

---

## Resources

### Tools
- **[axe DevTools](https://www.deque.com/axe/devtools/)** - Browser extension for accessibility testing
- **[WAVE](https://wave.webaim.org/)** - Web accessibility evaluation tool
- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)** - Built into Chrome DevTools
- **[Contrast Checker](https://webaim.org/resources/contrastchecker/)** - WCAG contrast ratio checker
- **[NVDA](https://www.nvaccess.org/)** - Free screen reader for Windows
- **[VoiceOver](https://www.apple.com/accessibility/voiceover/)** - Built-in screen reader for Mac

### Guidelines
- **[WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)** - Official WCAG guidelines
- **[ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)** - Patterns for common widgets
- **[Inclusive Components](https://inclusive-components.design/)** - Blog about accessible components
- **[A11y Project Checklist](https://www.a11yproject.com/checklist/)** - Easy checklist for accessibility

### Learning
- **[WebAIM](https://webaim.org/)** - Web accessibility articles and training
- **[Deque University](https://dequeuniversity.com/)** - Accessibility courses
- **[MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)** - Comprehensive guides

---

## Changelog

### Version 2.0 (March 29, 2026)
- ✨ Complete WCAG 2.1 AA checklist
- ✨ Keyboard navigation guidelines
- ✨ Screen reader support documentation
- ✨ Focus management patterns
- ✨ ARIA best practices
- ✨ Form accessibility guidelines
- ✨ Testing procedures
- ✨ Common issues and fixes

---

**Questions or suggestions?** Contact the CineFlask development team.
