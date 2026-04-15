# Debug Plan: Uploaded Videos Not Appearing on Home

## Problem Understanding
Users can upload movie/series files and get success feedback, but newly uploaded content is not visible on `home.html`.
The objective is to trace ingestion -> persistence -> API retrieval -> frontend render, then fix only the visibility bug without changing architecture.

## Investigation Steps

### 1) Verify upload completion writes to DB
- Check movie completion path in `routes/upload.js` (`POST /api/upload/complete`):
  - chunk merge
  - metadata mapping/fallback
  - `INSERT INTO movies (...)`
- Check series/episode completion path in `routes/upload-series.js`:
  - `POST /series/init` creates series
  - `POST /episode/complete` creates episode

### 2) Verify persisted records after upload
- Query newest content rows:
  - movies: `id, title, created_at, file_path, uploaded_by`
  - series: `id, title, uploaded_at`
  - episodes: `id, series_id, season_id, uploaded_at`

### 3) Trace homepage dependency chain
- Inspect `public/home.html` `loadData()` and `applyFilters()`:
  - request sequence
  - failure behavior (fail-fast vs partial success)
  - filter/query construction

### 4) Validate API routes/contract shapes used by home
- Confirm payload contracts for:
  - `/api/movies`
  - `/api/series`
  - `/api/progress`
  - `/api/progress/episode/in-progress`
  - `/api/watchlist`
  - `/api/watchlist/series`

### 5) Validate route ordering for episode progress
- Ensure `/in-progress` is matched before `/:episodeId` in `routes/progress-episode.js`.

### 6) Validate post-upload visibility with active filters
- Confirm fresh uploads are not silently excluded by existing filters (language/year/rating/genre).

## Root Cause Analysis

### Root Cause A (primary)
`home.html` had a fragile aggregation pattern where non-critical endpoint failures could prevent or destabilize catalog rendering, even when `/api/movies` succeeded.

### Root Cause B (primary)
`/api/progress/episode/in-progress` could collide with dynamic `/:episodeId` when ordering/handling is incorrect, yielding wrong response shape for home expectations.

### Root Cause C (secondary)
Active filters can hide newly uploaded items immediately after upload, creating a false impression that ingestion failed.

## Fix Strategy

1. Route correctness (no architecture change)
   - Keep explicit `GET /in-progress` before `GET /:episodeId`.
   - Return `{ success: true, series: [...] }` for in-progress series.

2. Home data loading resiliency
   - Use `Promise.allSettled` in `loadData()` and search/filter fetches.
   - Require movies feed for base rendering; degrade optional feeds to empty arrays.

3. Post-upload fresh view guard
   - Redirect upload success actions to `/home.html?fresh=1`.
   - On home load, if `fresh=1`, clear filters/sort once, then strip query param.

4. Keep patch minimal
   - No schema redesign.
   - No new frameworks.
   - No unrelated refactors.
