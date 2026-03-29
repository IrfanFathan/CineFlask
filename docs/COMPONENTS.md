# CineFlask Component Library

**Version:** 2.0  
**Last Updated:** March 29, 2026

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Button](#button)
3. [Form Controls](#form-controls)
4. [Card](#card)
5. [Toast Notification](#toast-notification)
6. [Modal Dialog](#modal-dialog)
7. [Dropdown Menu](#dropdown-menu)
8. [Loading States](#loading-states)
9. [Empty States](#empty-states)
10. [Navigation](#navigation)
11. [Movie Components](#movie-components)
12. [Utility Components](#utility-components)

---

## Introduction

This document provides comprehensive documentation for all reusable UI components in the CineFlask design system. Each component includes:

- **Purpose** - What the component does
- **Variants** - Different visual styles
- **Props/Options** - Configuration options
- **States** - Interactive states
- **Accessibility** - ARIA attributes and keyboard support
- **Examples** - Code examples and usage

### Component Status

| Component | Status | Version |
|-----------|--------|---------|
| Button | ✅ Stable | 2.0 |
| Form Controls | ✅ Stable | 2.0 |
| Card | ✅ Stable | 2.0 |
| Toast | 🚧 New | 2.0 |
| Modal | 🚧 New | 2.0 |
| Dropdown | 🚧 New | 2.0 |
| Skeleton | 🚧 New | 2.0 |
| Empty State | 🚧 New | 2.0 |

---

## Button

### Purpose
Primary interactive element for user actions (submit, navigate, trigger events).

### Variants

#### Primary Button
**Use for:** Main call-to-action, most important action on screen

```html
<button class="btn btn--primary">
  Upload Movie
</button>
```

**Styles:**
- Background: `--color-accent`
- Text: `white`
- Hover: Lift effect with glow
- Active: Scale down slightly

#### Secondary Button
**Use for:** Secondary actions, cancel buttons

```html
<button class="btn btn--secondary">
  Cancel
</button>
```

**Styles:**
- Background: `--color-bg-card`
- Border: `1px solid --color-border`
- Text: `--color-text-primary`
- Hover: Border color changes to accent

#### Ghost Button
**Use for:** Tertiary actions, subtle navigation

```html
<button class="btn btn--ghost">
  Learn More
</button>
```

**Styles:**
- Background: `transparent`
- Text: `--color-text-secondary`
- Hover: Background becomes slightly visible

#### Danger Button
**Use for:** Destructive actions (delete, remove)

```html
<button class="btn btn--danger">
  Delete Movie
</button>
```

**Styles:**
- Background: `--color-danger`
- Text: `white`
- Hover: Darker red

### Sizes

```html
<!-- Small: 32px height -->
<button class="btn btn--primary btn--sm">Small</button>

<!-- Medium (default): 40px height -->
<button class="btn btn--primary btn--md">Medium</button>
<button class="btn btn--primary">Medium</button>

<!-- Large: 48px height -->
<button class="btn btn--primary btn--lg">Large</button>
```

### With Icons

```html
<!-- Icon + Text -->
<button class="btn btn--primary">
  <svg class="btn__icon" width="16" height="16">...</svg>
  Upload
</button>

<!-- Icon Only -->
<button class="btn btn--primary btn--icon" aria-label="Close">
  <svg width="16" height="16">...</svg>
</button>
```

### States

#### Disabled
```html
<button class="btn btn--primary" disabled>
  Disabled Button
</button>
```

**Styles:**
- Opacity: `0.5`
- Cursor: `not-allowed`
- Pointer events: `none`

#### Loading
```html
<button class="btn btn--primary is-loading" aria-busy="true">
  <span class="btn__spinner" aria-hidden="true"></span>
  <span>Loading...</span>
</button>
```

**Behavior:**
- Spinner appears
- Text dims slightly
- Button disabled

### Accessibility

**Requirements:**
- ✅ Must have clear label (text or `aria-label`)
- ✅ Focus visible with 2px outline
- ✅ Keyboard: `Space`/`Enter` to activate
- ✅ Loading state: `aria-busy="true"`
- ✅ Icon-only buttons: `aria-label` required

**Example:**
```html
<button class="btn btn--primary" aria-label="Upload new movie">
  <svg aria-hidden="true">...</svg>
  Upload
</button>
```

### CSS Implementation

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.btn--primary {
  background: var(--color-accent);
  color: white;
}

.btn--primary:hover {
  background: var(--color-accent-hover);
  box-shadow: var(--shadow-accent);
  transform: translateY(-1px);
}

.btn--primary:active {
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## Form Controls

### Text Input

#### Basic Input
```html
<div class="form-group">
  <label class="form-label" for="username">Username</label>
  <input 
    type="text" 
    id="username" 
    class="form-input" 
    placeholder="Enter your username"
    aria-describedby="username-hint"
  >
  <span id="username-hint" class="form-hint">
    3-20 characters, alphanumeric only
  </span>
</div>
```

#### Input with Icon
```html
<div class="form-group">
  <label class="form-label" for="search">Search</label>
  <div class="form-input-wrapper">
    <svg class="form-input-icon" width="16" height="16">
      <!-- Search icon -->
    </svg>
    <input 
      type="text" 
      id="search" 
      class="form-input form-input--with-icon" 
      placeholder="Search movies..."
    >
  </div>
</div>
```

#### Input States
```html
<!-- Error -->
<div class="form-group">
  <label class="form-label" for="email">Email</label>
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

<!-- Success -->
<div class="form-group">
  <input 
    type="text" 
    class="form-input is-success" 
    aria-invalid="false"
  >
  <span class="form-success">✓ Username available</span>
</div>

<!-- Disabled -->
<input type="text" class="form-input" disabled>
```

### Select Dropdown

```html
<div class="form-group">
  <label class="form-label" for="genre">Genre</label>
  <select id="genre" class="form-select">
    <option value="">Choose a genre</option>
    <option value="action">Action</option>
    <option value="comedy">Comedy</option>
    <option value="drama">Drama</option>
  </select>
</div>
```

### Textarea

```html
<div class="form-group">
  <label class="form-label" for="description">Description</label>
  <textarea 
    id="description" 
    class="form-textarea" 
    rows="4" 
    placeholder="Enter movie description..."
    aria-describedby="description-hint"
  ></textarea>
  <span id="description-hint" class="form-hint">
    Maximum 500 characters
  </span>
</div>
```

### Checkbox

```html
<label class="form-checkbox">
  <input type="checkbox" class="form-checkbox__input">
  <span class="form-checkbox__label">Remember me</span>
</label>
```

### Radio Button

```html
<div class="form-group">
  <span class="form-label">Search by</span>
  
  <label class="form-radio">
    <input type="radio" name="search-type" value="title" class="form-radio__input" checked>
    <span class="form-radio__label">Movie Title</span>
  </label>
  
  <label class="form-radio">
    <input type="radio" name="search-type" value="imdb" class="form-radio__input">
    <span class="form-radio__label">IMDb ID</span>
  </label>
</div>
```

### File Upload

```html
<div class="form-group">
  <label class="form-label" for="video-file">Video File</label>
  <div class="form-file-upload">
    <input type="file" id="video-file" class="form-file-input" accept="video/*">
    <label for="video-file" class="form-file-label">
      <svg class="form-file-icon" width="24" height="24">...</svg>
      <span class="form-file-text">Drop file here or click to browse</span>
      <span class="form-file-hint">MP4, MKV, AVI (max 50GB)</span>
    </label>
  </div>
</div>
```

### Accessibility

**Requirements:**
- ✅ Every input must have a `<label>` or `aria-label`
- ✅ Use `aria-describedby` for hints/help text
- ✅ Use `aria-invalid` and `role="alert"` for errors
- ✅ Use `required` attribute for required fields
- ✅ Provide clear error messages
- ✅ Focus indicators visible

---

## Card

### Purpose
Container for grouping related content (movie posters, info panels, etc.).

### Movie Card

```html
<div class="card card--movie" onclick="window.location.href='/movie.html?id=123'">
  <div class="card__poster-wrapper">
    <img 
      src="/posters/movie.jpg" 
      alt="Inception poster" 
      class="card__poster"
      loading="lazy"
    >
    
    <!-- Rating badge -->
    <div class="card__badge card__badge--rating">
      <svg class="card__badge-icon" width="12" height="12">...</svg>
      8.8
    </div>
    
    <!-- Progress bar (if watching) -->
    <div class="card__progress">
      <div class="card__progress-fill" style="width: 45%"></div>
    </div>
    
    <!-- Hover overlay -->
    <div class="card__overlay">
      <h3 class="card__overlay-title">Inception</h3>
      <p class="card__overlay-meta">2010 • 2h 28m • ⭐ 8.8</p>
      <p class="card__overlay-genre">Action, Sci-Fi, Thriller</p>
    </div>
  </div>
  
  <div class="card__content">
    <h3 class="card__title">Inception</h3>
    <p class="card__meta">2010 • Sci-Fi</p>
  </div>
</div>
```

### Info Card

```html
<div class="card card--info">
  <h3 class="card__title">Upload Quota</h3>
  <div class="card__content">
    <p class="card__stat">
      <span class="card__stat-value">45 GB</span>
      <span class="card__stat-label">Remaining</span>
    </p>
    <div class="card__progress">
      <div class="card__progress-fill" style="width: 65%"></div>
    </div>
  </div>
</div>
```

### Elevated Card

```html
<div class="card card--elevated">
  <h3>Featured Movie</h3>
  <p>Special content with shadow</p>
</div>
```

### States

```css
/* Default */
.card {
  transition: all var(--transition-base);
}

/* Hover */
.card--movie:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

/* Focus (keyboard navigation) */
.card:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Accessibility

```html
<div 
  class="card card--movie" 
  role="button"
  tabindex="0"
  aria-label="View Inception (2010)"
  onclick="navigate()"
  onkeydown="handleKey(event)"
>
  <!-- Card content -->
</div>
```

---

## Toast Notification

### Purpose
Temporary messages for user feedback (success, error, info, warning).

### JavaScript API

```javascript
// Success
toast.success('Movie uploaded successfully!');

// Error
toast.error('Failed to upload movie. Please try again.');

// Info
toast.info('Processing video metadata...');

// Warning
toast.warning('Storage quota almost full (90%)');

// Custom duration
toast.success('Saved!', { duration: 2000 });

// With action button
toast.info('Update available', {
  action: {
    label: 'Refresh',
    onClick: () => window.location.reload()
  }
});

// Manual dismiss
const id = toast.info('Processing...');
// Later:
toast.dismiss(id);
```

### HTML Structure

```html
<div class="toast toast--success" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="toast__icon">
    <svg width="20" height="20">...</svg>
  </div>
  <div class="toast__content">
    <p class="toast__message">Movie uploaded successfully!</p>
  </div>
  <button class="toast__close" aria-label="Close notification">
    <svg width="16" height="16">...</svg>
  </button>
  <div class="toast__progress"></div>
</div>
```

### Variants

```html
<!-- Success -->
<div class="toast toast--success">...</div>

<!-- Error -->
<div class="toast toast--error">...</div>

<!-- Info -->
<div class="toast toast--info">...</div>

<!-- Warning -->
<div class="toast toast--warning">...</div>
```

### Positioning

```css
.toast-container {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

### Accessibility

- ✅ Use `role="alert"` for important messages
- ✅ Use `aria-live="polite"` for non-critical messages
- ✅ Use `aria-live="assertive"` for critical messages
- ✅ Use `aria-atomic="true"` for complete message announcement
- ✅ Provide close button with `aria-label`
- ✅ Auto-dismiss after 5 seconds (or user-configured)
- ✅ Pause auto-dismiss on hover/focus

---

## Modal Dialog

### Purpose
Focused content overlays for confirmations, forms, or detailed information.

### JavaScript API

```javascript
// Simple confirmation
modal.confirm({
  title: 'Delete Movie',
  message: 'Are you sure you want to delete "Inception"? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger',
  onConfirm: () => deleteMovie(id)
});

// Custom content
modal.open({
  title: 'Edit Movie',
  content: '<form>...</form>',
  size: 'lg',
  onClose: () => console.log('Modal closed')
});

// Alert (single button)
modal.alert({
  title: 'Upload Complete',
  message: 'Your movie has been successfully uploaded.',
  confirmText: 'OK'
});

// Close programmatically
modal.close();
```

### HTML Structure

```html
<!-- Backdrop -->
<div class="modal-backdrop" onclick="modal.close()"></div>

<!-- Modal -->
<div 
  class="modal" 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <div class="modal__container">
    <div class="modal__header">
      <h2 id="modal-title" class="modal__title">Delete Movie</h2>
      <button class="modal__close" aria-label="Close dialog">
        <svg width="20" height="20">...</svg>
      </button>
    </div>
    
    <div class="modal__body">
      <p id="modal-description">
        Are you sure you want to delete "Inception"? This action cannot be undone.
      </p>
    </div>
    
    <div class="modal__footer">
      <button class="btn btn--secondary" onclick="modal.close()">Cancel</button>
      <button class="btn btn--danger" onclick="confirmDelete()">Delete</button>
    </div>
  </div>
</div>
```

### Sizes

```html
<!-- Small: 400px max-width -->
<div class="modal modal--sm">...</div>

<!-- Medium (default): 600px max-width -->
<div class="modal modal--md">...</div>

<!-- Large: 800px max-width -->
<div class="modal modal--lg">...</div>
```

### Variants

```html
<!-- Default -->
<div class="modal">...</div>

<!-- Danger (for destructive actions) -->
<div class="modal modal--danger">
  <div class="modal__header modal__header--danger">...</div>
</div>
```

### Accessibility

**Requirements:**
- ✅ `role="dialog"` and `aria-modal="true"`
- ✅ `aria-labelledby` pointing to title ID
- ✅ `aria-describedby` pointing to description ID
- ✅ Focus trap (Tab cycles within modal)
- ✅ Close on `Esc` key
- ✅ Focus returns to trigger element on close
- ✅ Backdrop click closes modal
- ✅ Initial focus on first focusable element

**Example:**
```javascript
// Focus management
const openModal = (triggerElement) => {
  // Save trigger for later
  modal.trigger = triggerElement;
  
  // Open and focus first input
  modal.show();
  modal.querySelector('.modal__container').focus();
};

const closeModal = () => {
  modal.hide();
  
  // Return focus to trigger
  modal.trigger?.focus();
};
```

---

## Dropdown Menu

### Purpose
Contextual menus for actions or navigation options.

### JavaScript API

```javascript
// Initialize dropdown
const dropdown = new Dropdown('#user-menu', {
  trigger: '#user-avatar',
  placement: 'bottom-right',
  offset: 8
});

// Open/close programmatically
dropdown.open();
dropdown.close();
dropdown.toggle();
```

### HTML Structure

```html
<div class="dropdown">
  <button 
    id="user-avatar" 
    class="dropdown__trigger" 
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="user-menu"
  >
    <img src="/avatar.jpg" alt="User avatar">
  </button>
  
  <div 
    id="user-menu" 
    class="dropdown__menu" 
    role="menu"
    aria-labelledby="user-avatar"
  >
    <a href="/profile" class="dropdown__item" role="menuitem">
      <svg class="dropdown__icon">...</svg>
      Profile
    </a>
    <a href="/settings" class="dropdown__item" role="menuitem">
      <svg class="dropdown__icon">...</svg>
      Settings
    </a>
    <hr class="dropdown__divider">
    <button class="dropdown__item dropdown__item--danger" role="menuitem">
      <svg class="dropdown__icon">...</svg>
      Logout
    </button>
  </div>
</div>
```

### Placement

```javascript
// Options: top, bottom, left, right
// With alignment: bottom-left, bottom-right, top-left, top-right
dropdown.setPlacement('bottom-right');
```

### Accessibility

**Requirements:**
- ✅ Trigger has `aria-haspopup="true"`
- ✅ Trigger has `aria-expanded="false"` (updates to `"true"` when open)
- ✅ Trigger has `aria-controls` pointing to menu ID
- ✅ Menu has `role="menu"`
- ✅ Items have `role="menuitem"`
- ✅ Keyboard navigation: `↑`/`↓` arrows to navigate, `Enter` to select, `Esc` to close
- ✅ Click outside to close
- ✅ Focus returns to trigger on close

---

## Loading States

### Skeleton Loader

#### Purpose
Placeholder for content while loading (better UX than spinners).

#### HTML Structure

```html
<!-- Movie card skeleton -->
<div class="skeleton skeleton--card">
  <div class="skeleton__poster"></div>
  <div class="skeleton__content">
    <div class="skeleton__text skeleton__text--title"></div>
    <div class="skeleton__text skeleton__text--subtitle"></div>
  </div>
</div>

<!-- Text skeleton -->
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--text" style="width: 80%"></div>
<div class="skeleton skeleton--text" style="width: 60%"></div>

<!-- Avatar skeleton -->
<div class="skeleton skeleton--avatar"></div>

<!-- Button skeleton -->
<div class="skeleton skeleton--button"></div>
```

#### JavaScript API

```javascript
// Show skeleton while loading
skeleton.show('#movie-grid', 'card', 6); // 6 card skeletons

// Replace with actual content
fetch('/api/movies')
  .then(res => res.json())
  .then(movies => {
    skeleton.hide('#movie-grid');
    renderMovies(movies);
  });
```

### Spinner

```html
<!-- Inline spinner -->
<span class="spinner" aria-hidden="true"></span>

<!-- Spinner with text -->
<div class="spinner-wrapper">
  <span class="spinner" aria-hidden="true"></span>
  <p>Loading movies...</p>
</div>

<!-- Full page spinner -->
<div class="spinner-overlay">
  <span class="spinner spinner--lg" aria-hidden="true"></span>
</div>
```

### Progress Bar

```html
<div class="progress">
  <div class="progress__bar" style="width: 45%" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100">
    <span class="sr-only">45% complete</span>
  </div>
</div>
```

---

## Empty States

### Purpose
Guide users when there's no content to display.

### No Movies

```html
<div class="empty-state">
  <svg class="empty-state__icon" width="64" height="64">
    <!-- Film reel icon -->
  </svg>
  <h3 class="empty-state__title">No movies yet</h3>
  <p class="empty-state__description">
    Upload your first movie to start building your collection
  </p>
  <a href="/upload.html" class="btn btn--primary">
    <svg width="16" height="16">...</svg>
    Upload Movie
  </a>
</div>
```

### No Search Results

```html
<div class="empty-state">
  <svg class="empty-state__icon">...</svg>
  <h3 class="empty-state__title">No results found</h3>
  <p class="empty-state__description">
    Try adjusting your search or filters
  </p>
  <button class="btn btn--secondary" onclick="clearFilters()">
    Clear Filters
  </button>
</div>
```

### Error State

```html
<div class="empty-state empty-state--error">
  <svg class="empty-state__icon">...</svg>
  <h3 class="empty-state__title">Something went wrong</h3>
  <p class="empty-state__description">
    Failed to load movies. Please try again.
  </p>
  <button class="btn btn--primary" onclick="retry()">
    Try Again
  </button>
</div>
```

---

## Navigation

### Navbar

```html
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <div class="navbar__content">
    <!-- Logo -->
    <a href="/home.html" class="navbar__logo">
      <svg width="28" height="28">...</svg>
      CineFlask
    </a>
    
    <!-- Search -->
    <div class="navbar__search">
      <svg class="navbar__search-icon">...</svg>
      <input 
        type="text" 
        class="navbar__search-input" 
        placeholder="Search movies & series..."
        aria-label="Search movies and series"
      >
    </div>
    
    <!-- Actions -->
    <div class="navbar__actions">
      <a href="/upload.html" class="btn btn--primary">
        <svg width="16" height="16">...</svg>
        Upload
      </a>
      
      <button class="navbar__avatar" aria-label="User menu" aria-haspopup="true">
        JD
      </button>
    </div>
  </div>
</nav>
```

### Breadcrumbs

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb__item">
      <a href="/home.html">Home</a>
    </li>
    <li class="breadcrumb__item">
      <a href="/movies.html">Movies</a>
    </li>
    <li class="breadcrumb__item" aria-current="page">
      <span>Inception</span>
    </li>
  </ol>
</nav>
```

---

## Movie Components

### Movie Grid

```html
<div class="movie-grid">
  <!-- 2-6 columns depending on screen size -->
  <div class="card card--movie">...</div>
  <div class="card card--movie">...</div>
  <div class="card card--movie">...</div>
  <!-- ... -->
</div>
```

### Movie Hero

```html
<div class="movie-hero">
  <div class="movie-hero__backdrop">
    <img src="/backdrop.jpg" alt="">
  </div>
  <div class="movie-hero__content">
    <h1 class="movie-hero__title">Inception</h1>
    <div class="movie-hero__meta">
      <span>2010</span>
      <span>•</span>
      <span>2h 28m</span>
      <span>•</span>
      <span>⭐ 8.8</span>
    </div>
    <p class="movie-hero__description">...</p>
    <div class="movie-hero__actions">
      <a href="/player.html?id=123" class="btn btn--primary btn--lg">
        <svg width="20" height="20">...</svg>
        Play
      </a>
      <button class="btn btn--secondary btn--lg">
        <svg width="20" height="20">...</svg>
        My List
      </button>
    </div>
  </div>
</div>
```

---

## Utility Components

### Badge

```html
<span class="badge">NEW</span>
<span class="badge badge--success">Available</span>
<span class="badge badge--danger">Full</span>
<span class="badge badge--warning">Low</span>
```

### Avatar

```html
<!-- With initials -->
<div class="avatar">JD</div>

<!-- With image -->
<div class="avatar">
  <img src="/avatar.jpg" alt="John Doe">
</div>

<!-- Sizes -->
<div class="avatar avatar--sm">JD</div>
<div class="avatar avatar--md">JD</div>
<div class="avatar avatar--lg">JD</div>
```

### Divider

```html
<hr class="divider">
<hr class="divider divider--vertical">
```

### Tooltip

```html
<button 
  class="btn btn--icon" 
  aria-label="Delete movie"
  data-tooltip="Delete movie"
>
  <svg width="16" height="16">...</svg>
</button>
```

---

## Component CSS Classes Reference

### Quick Reference Table

| Component | Base Class | Variants | Modifiers |
|-----------|-----------|----------|-----------|
| Button | `.btn` | `--primary`, `--secondary`, `--ghost`, `--danger` | `--sm`, `--md`, `--lg`, `--icon` |
| Card | `.card` | `--movie`, `--info`, `--elevated` | `.is-loading` |
| Toast | `.toast` | `--success`, `--error`, `--info`, `--warning` | - |
| Modal | `.modal` | `--danger` | `--sm`, `--md`, `--lg` |
| Form Input | `.form-input` | - | `.is-error`, `.is-success` |
| Skeleton | `.skeleton` | `--card`, `--text`, `--avatar`, `--button` | - |
| Empty State | `.empty-state` | `--error` | - |
| Badge | `.badge` | `--success`, `--danger`, `--warning`, `--info` | - |
| Avatar | `.avatar` | - | `--sm`, `--md`, `--lg` |

---

## Best Practices

### Do ✅
- Use semantic HTML elements
- Provide ARIA labels for interactive elements
- Test with keyboard navigation
- Test with screen readers
- Use consistent spacing (8px grid)
- Follow naming conventions
- Document custom components

### Don't ❌
- Use `div` with `onclick` (use `button` instead)
- Forget `alt` text for images
- Use `placeholder` as a label replacement
- Nest interactive elements (button inside link)
- Use `disabled` without explanation
- Remove focus indicators

---

## Resources

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Complete design system
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility guidelines
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Changelog

### Version 2.0 (March 29, 2026)
- ✨ Complete component library documentation
- ✨ New components: Toast, Modal, Dropdown, Skeleton, Empty State
- ✨ Enhanced accessibility guidance
- ✨ JavaScript API documentation
- ✨ Best practices and examples

---

**Questions or suggestions?** Contact the CineFlask development team.
