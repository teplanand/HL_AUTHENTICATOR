# Evidence Collection UI Documentation

## Overview

This module has been redesigned based on the API collection in `Evidance Collector.postman_collection.json`.

The previous UI pattern was mock-gallery oriented, but the API is actually built around:

- authenticated user uploads evidence against a category and reference number
- authorized client searches by category and reference number
- client views images, videos, and audio based on available transaction data

Because of that, the module was rebuilt as an API-first workspace instead of a static evidence card gallery.

## API Understanding

Base host:

- `https://evidenceapi.techelecon.in`

Main APIs used by the UI:

- `POST /api/Login/login`
  - auto-authenticates the session
- `POST /api/User/GetUserData`
  - gets current user details
- `POST /api/User/GetUserCategories`
  - gets categories assigned to the logged-in user
- `POST /api/MetaData/GetRefreneceNumbersList`
  - loads reference numbers for a category
- `POST /api/MetaData/FilterReferenceNo`
  - filters reference numbers by search text
- `GET /api/MetaData/GetRemarksList`
  - loads available remarks for a reference
- `POST /api/View/CheckTransaction`
  - verifies whether evidence transaction exists
- `POST /api/View/GetImages`
  - loads image evidence
- `POST /api/View/GetVideos`
  - loads video evidence
- `POST /api/View/GetAudio`
  - loads audio evidence
- `POST /api/Transation/v1/SaveImages`
  - uploads evidence files

## UI / UX Structure

The new UI is divided into 3 main areas.

### 1. Category Rail

Left side panel shows assigned categories only.

Purpose:

- same source of truth for upload and viewer modes
- fast switching between categories
- no unnecessary tree complexity

### 2. Collector Workspace

This is for authenticated users who can upload evidence.

Fields:

- category
- reference number
- remarks
- file upload

Behavior:

- upload is blocked until category, reference, and files are present
- file preview is shown before upload
- after successful upload, user is moved naturally toward viewer flow

### 3. Client Viewer

This is for authorized users who need to see evidence.

Flow:

1. select category
2. search or pick reference number
3. optionally filter by remark
4. switch between image, video, and audio tabs
5. open full preview in dialog

## Role Handling

The UI derives user profile from:

- decoded token
- `GetUserData` response

Rule applied in UI:

- upload is disabled for client/view-only style roles
- viewer mode remains available for authorized users

This keeps one module usable for both admin and client scenarios.

## Response Normalization Strategy

The API response shape appears flexible or inconsistent across endpoints.

To make the UI reliable, normalization helpers were added for:

- categories
- references
- remarks
- media items
- user profile
- success/message extraction

This prevents the screen from depending on one rigid JSON structure.

## Performance Decisions

The module was designed to avoid performance issues.

Applied decisions:

- categories and user data load once during bootstrap
- reference search uses deferred input behavior
- media is fetched only after a reference is selected
- images, videos, and audio are loaded separately by tab
- old mock reducer and heavy local gallery state were removed
- preview URLs are cleaned up when files change

This keeps initial load light and avoids unnecessary API calls.

## Files Updated

Updated:

- `src/pages/EvidanceCollection/Dashboard/index.tsx`
- `src/pages/EvidanceCollection/Dashboard/selectors.ts`
- `src/pages/EvidanceCollection/Dashboard/types.ts`

Removed old mock-based implementation:

- `src/pages/EvidanceCollection/Dashboard/components/CategoryTree.tsx`
- `src/pages/EvidanceCollection/Dashboard/components/CommentSection.tsx`
- `src/pages/EvidanceCollection/Dashboard/components/EvidenceCard.tsx`
- `src/pages/EvidanceCollection/Dashboard/components/FilterBar.tsx`
- `src/pages/EvidanceCollection/Dashboard/components/ImageModal.tsx`
- `src/pages/EvidanceCollection/Dashboard/mockData.ts`
- `src/pages/EvidanceCollection/Dashboard/reducer.ts`

## Final Result

The new Evidence Collection UI now matches the API intent much better:

- collector can upload evidence with category and reference
- client can search and view evidence cleanly
- UI is simpler and faster than the previous mock-driven layout
- all work stayed inside the `EvidanceCollection` folder

## Verification

Build verification completed successfully with:

- `npm run build`

The project still shows an existing chunk-size warning during production build, but the Evidence Collection module compiles correctly.


