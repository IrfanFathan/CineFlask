# CineFlask Commit Strategy - Prioritized Commit Messages

This document outlines a prioritized approach to committing changes, organized by feature importance and dependencies.

## Priority System
- **P0 (Critical)**: Core functionality, security, database integrity
- **P1 (High)**: Essential features, user experience improvements
- **P2 (Medium)**: Nice-to-have features, optimizations
- **P3 (Low)**: Documentation, minor enhancements

---

## Phase 1: Foundation & Core Features

### P0 - Critical Infrastructure

```
feat: initialize database schema with multi-user support

- Create users table with JWT authentication support
- Add profiles table for Netflix-style multi-profile functionality
- Implement movies and series tables with full metadata support
- Add playback_progress and watchlist tables for user engagement
- Include proper foreign key constraints and cascading deletes

Essential foundation for all subsequent features.
```

```
feat: implement JWT authentication with bcrypt password hashing

- Add secure user registration with password hashing (10 salt rounds)
- Implement JWT token generation with 7-day expiration
- Create authMiddleware for protecting routes
- Add token verification and error handling
- Store tokens securely in localStorage

Security-first approach to user authentication.
```

```
feat: add video streaming with HTTP range request support

- Implement chunked file streaming for large video files
- Support HTTP range headers for seek functionality
- Enable progressive playback without full download
- Handle 50GB+ files efficiently
- Add proper MIME type detection

Critical for smooth video playback experience.
```

### P1 - Essential Features

```
feat: implement multi-profile system with avatar customization

- Allow up to 4 profiles per user account
- Add customizable avatar colors and names
- Store profile selection in sessionStorage
- Profile-specific watchlist and progress tracking
- Kids mode support for content filtering

Provides Netflix-like user experience.
```

```
feat: add TV series support with seasons and episodes

- Create series, seasons, and episodes database structure
- Implement hierarchical content organization
- Add episode-specific progress tracking
- Support batch episode upload
- Include season/episode metadata from IMDb

Essential for comprehensive media library management.
```

```
feat: implement playback progress tracking and resume functionality

- Track current timestamp and duration for all content
- Store progress per profile for personalized experience
- Auto-resume from last watched position
- Display progress percentage on content cards
- Update progress on 5-second intervals

Critical for modern streaming UX.
```

```
feat: add watchlist functionality for movies and series

- Create watchlist toggle on content pages
- Display watchlist status on content cards
- Profile-specific watchlist support
- Quick add/remove from watchlist
- Dedicated watchlist view on homepage

Essential for content discovery and user engagement.
```

---

## Phase 2: Metadata & Content Management

### P1 - High Priority Enhancements

```
feat: integrate IMDb metadata via OMDB API

- Add automatic metadata fetching by IMDb ID or title
- Import poster images, ratings, cast, and plot
- Cache metadata for 1 hour to reduce API calls
- Support both movies and TV series
- Fallback handling for missing data

Significantly improves content presentation quality.
```

```
feat: implement advanced filtering and search system

- Add genre-based filtering
- Support year range selection (min/max)
- Filter by IMDb rating threshold
- Filter by language and country
- Multiple sort options (date, title, rating, year)
- Real-time filter application without page reload

Enhances content discovery and user experience.
```

```
feat: add movie and series editing capabilities

- PUT endpoints for updating movie metadata
- PUT endpoints for updating series metadata
- Edit title, year, description, and all IMDb fields
- Update language and country information
- Validate input data before saving

Allows users to maintain accurate metadata.
```

```
feat: enhance upload flow with IMDb ID search

- Add IMDb ID search during upload
- Display metadata preview before upload
- Auto-populate fields from IMDb data
- Support manual metadata entry
- Improved upload form UX with real-time validation

Streamlines content addition process.
```

### P2 - Medium Priority Enhancements

```
feat: implement metadata caching system

- Cache IMDb API responses for 1 hour
- Cache movie list for 5 minutes
- Add cache invalidation on content updates
- Memory-based caching with node-cache
- Reduce external API calls and improve performance

Improves application performance and reduces API costs.
```

```
style: enhance poster grid with hover overlays

- Add smooth hover animations on content cards
- Display rating, year, and genre on hover
- Implement gradient overlays for better text readability
- Add hover scale effect for visual feedback
- Consistent card styling across the application

Modernizes UI with polished interactions.
```

---

## Phase 3: Advanced Features & Administration

### P1 - High Priority Features

```
feat: implement admin dashboard with system monitoring

- Create admin-only routes with authorization middleware
- Display system statistics (users, content, storage)
- Show user management panel with admin indicators
- Add cache management controls
- Include system log viewer
- First user auto-promotion to admin

Essential for platform management and monitoring.
```

```
feat: add OpenSubtitles integration for automatic subtitle download

- Integrate OpenSubtitles API for subtitle search
- Support multiple languages and formats
- One-click subtitle download and attachment
- Display available subtitle options
- Auto-associate subtitles with content

Greatly improves accessibility and user experience.
```

```
feat: implement batch upload functionality

- Support multiple file uploads simultaneously
- Add upload queue management system
- Display progress for each file
- Pause/resume/cancel individual uploads
- Bulk metadata assignment
- Concurrent upload handling

Significantly speeds up content library building.
```

```
feat: add subtitle management system

- Upload subtitle files (.srt, .vtt)
- Associate subtitles with movies and episodes
- Support multiple languages per content
- Subtitle selection during playback
- Automatic subtitle loading in video player

Critical accessibility feature.
```

### P2 - Medium Priority Features

```
feat: enhance video player with subtitle support

- Integrate WebVTT subtitle rendering
- Add subtitle track selection menu
- Support multiple subtitle languages
- Subtitle styling and positioning
- Toggle subtitles on/off during playback

Improves viewing experience and accessibility.
```

---

## Phase 4: Security & Deployment

### P0 - Critical Security

```
security: implement helmet security headers

- Add CSP, XSS, and clickjacking protection
- Configure HSTS for HTTPS enforcement
- Remove X-Powered-By header
- Enable DNS prefetch control
- Set referrer policy

Critical for production security.
```

```
security: add rate limiting to prevent abuse

- Implement strict rate limiting on auth endpoints (5 req/15min)
- Standard rate limiting on API routes (100 req/15min)
- IP-based tracking with express-rate-limit
- Custom error messages for rate limit exceeded
- Prevent brute force and DDoS attacks

Essential for production stability.
```

```
security: implement input validation and sanitization

- Add express-validator middleware
- Validate all user inputs (auth, upload, metadata)
- Sanitize strings to prevent injection attacks
- Validate file types and sizes
- Return meaningful validation errors

Prevents common security vulnerabilities.
```

### P1 - High Priority Deployment

```
feat: add Docker deployment configuration

- Create optimized Dockerfile with multi-stage builds
- Add docker-compose.yml for easy orchestration
- Configure volume mounts for persistent data
- Set up environment variable management
- Add .dockerignore for efficient builds

Enables consistent deployment across environments.
```

```
docs: create comprehensive deployment guide

- Document Docker deployment steps
- Add systemd service configuration
- Include PM2 process manager setup
- Environment variable documentation
- Nginx reverse proxy configuration
- SSL/TLS setup instructions

Critical for production deployment success.
```

---

## Phase 5: Performance & UX

### P2 - Medium Priority Optimizations

```
perf: optimize authentication flow to prevent login UI flash

- Add inline authentication check in HTML head
- Redirect before page render to prevent flash
- Smart auto-redirect for returning users
- Use window.location.replace() for seamless navigation
- Improve perceived performance

Polishes user experience for returning users.
```

```
perf: implement database query optimization

- Add indexes on frequently queried columns
- Optimize JOIN queries for better performance
- Use prepared statements for all queries
- Implement pagination for large result sets
- Cache expensive query results

Improves application responsiveness.
```

```
perf: add lazy loading for poster images

- Implement intersection observer for images
- Load images only when visible in viewport
- Add placeholder images during loading
- Progressive image loading
- Reduce initial page load time

Significantly improves page load performance.
```

### P3 - Low Priority Enhancements

```
docs: update README with comprehensive feature list

- Document all available features
- Add setup and installation instructions
- Include API endpoint documentation
- Add screenshots and usage examples
- Link to deployment guides

Improves developer onboarding experience.
```

```
docs: create API quick reference guide

- List all API endpoints with methods
- Include request/response examples
- Document authentication requirements
- Add error response formats
- Create searchable reference

Helpful for API integration and development.
```

```
test: add comprehensive test suite

- Unit tests for all route handlers
- Integration tests for auth flow
- Test metadata fetching and caching
- Validate input sanitization
- Test admin authorization

Ensures code quality and prevents regressions.
```

---

## Commit Message Format Guidelines

### Structure
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements
- `ci`: CI/CD changes

### Examples

**Good commit messages:**
```
feat(auth): implement JWT authentication with bcrypt hashing

- Add secure user registration with password hashing
- Implement JWT token generation with 7-day expiration
- Create authMiddleware for protecting routes
- Add token verification and error handling

Provides foundation for secure multi-user access.
```

```
fix(streaming): resolve range request handling for large files

- Fix byte range calculation for files >4GB
- Add proper content-length headers
- Handle edge case for final byte range
- Test with 50GB video files

Resolves seek issues in video player for large content.
```

```
perf(metadata): implement caching to reduce API calls

- Cache IMDb API responses for 1 hour
- Add memory-based cache with automatic expiration
- Reduce API calls by ~80% for repeated requests

Improves response time and reduces external dependencies.
```

**Bad commit messages (avoid):**
```
update files                    # Too vague
fix bug                        # No context
added new stuff                # Unprofessional
WIP                           # Work should be complete
fixed issue #123               # No description of what was fixed
```

---

## Priority-Based Development Workflow

### Sprint 1 (Week 1) - Foundation
1. All P0 commits from Phase 1
2. Essential P1 features (profiles, series support)

### Sprint 2 (Week 2) - Content Management
1. P1 commits from Phase 2
2. IMDb integration and filtering

### Sprint 3 (Week 3) - Advanced Features
1. P1 commits from Phase 3
2. Admin dashboard and batch upload

### Sprint 4 (Week 4) - Security & Deployment
1. All P0 security commits
2. Docker configuration and deployment docs

### Sprint 5 (Week 5) - Polish & Performance
1. P2 performance optimizations
2. P3 documentation improvements
3. Testing and bug fixes

---

## Notes

- Always commit related changes together (atomic commits)
- Keep commits focused on a single concern
- Write descriptive commit messages explaining WHY, not just WHAT
- Reference issue numbers when applicable
- Use conventional commits format for consistency
- Commit working code - don't commit broken builds
- Test before committing

---

**Generated**: 2026-03-28  
**Project**: CineFlask Media Streaming Platform  
**Purpose**: Guide prioritized development and maintain clean git history
