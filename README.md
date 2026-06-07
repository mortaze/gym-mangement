# Gym Management System

A full-stack gym management platform with a **Next.js frontend**, **Node.js/Express backend**, and **MongoDB** persistence. The app supports role-based dashboards, user and trainer management, cafe menu management, equipment tracking, training-plan requests, profile management, and file uploads.

## Production URLs

- Backend API: `https://gym-mangement-backend.vercel.app/`
- Frontend API origin is configured with `NEXT_PUBLIC_API_URL` and defaults to the backend URL above.

## Architecture

```text
frontend/  Next.js 13 pages application
  src/config/api.js          Central API URL and asset URL configuration
  src/redux/                 RTK Query APIs and Redux store
  src/pages/                 Role dashboards and Next API enum helpers

backend/   Express API application
  index.js                   Express app, middleware, static file mounts, routes
  routes/                    API route definitions
  controller/                Request handlers
  model/                     Mongoose models
  middleware/                Auth, logging, multer upload middleware
  utils/uploadPaths.js       Vercel-safe upload path abstraction
```

The frontend communicates with backend endpoints under `${NEXT_PUBLIC_API_URL}/api`. Static uploaded assets are resolved from the backend origin, not the frontend deployment.

## Backend API Map

Mounted by `backend/index.js`:

- `GET /` health/root response.
- `/api/auth` authentication endpoints.
- `/api/users` user CRUD, profile images, status, password/reset helpers.
- `/api/upload/upload-document` document upload endpoint.
- `/api/training-requests` training plan request CRUD and photo uploads.
- `/api/equipment` equipment CRUD and maintenance endpoints.
- `/api/menu` cafe menu CRUD.
- `/menu` legacy cafe menu route kept for compatibility.
- `/uploads`, `/images`, `/documents` static file routes for uploaded/runtime files.

## Setup

### Prerequisites

- Node.js 16+
- npm
- MongoDB connection string

### Backend

```bash
cd backend
npm install
cp .env.example .env # if you add an example file later
npm run dev
```

Backend `.env` variables:

```env
PORT=7000
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<strong-secret>
CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
UPLOAD_ROOT=/tmp/uploads
IMAGE_UPLOAD_ROOT=/tmp/images
DOCUMENT_UPLOAD_ROOT=/tmp/documents
```

> `UPLOAD_ROOT`, `IMAGE_UPLOAD_ROOT`, and `DOCUMENT_UPLOAD_ROOT` are optional. On Vercel, the backend automatically uses `/tmp` when these are not set.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://gym-mangement-backend.vercel.app
```

For local backend development:

```env
NEXT_PUBLIC_API_URL=http://localhost:7000
```

## API Base URL Configuration

All frontend API origin/base handling is centralized in:

```text
frontend/src/config/api.js
```

Exports:

- `API_ORIGIN`: backend origin, e.g. `https://gym-mangement-backend.vercel.app`
- `API_BASE_URL`: API base, e.g. `https://gym-mangement-backend.vercel.app/api`
- `apiUrl(path)`: helper for API URLs
- `assetUrl(path)`: helper for backend-hosted asset URLs

Avoid hardcoding backend URLs in pages or components. Use the shared config instead.

## MongoDB Usage

MongoDB remains the system of record. Backend models are Mongoose models under `backend/model/`, and route/controller layers continue to read/write MongoDB documents for users, cafe menu items, equipment, and training requests.

File uploads store file metadata/path strings in MongoDB where existing features already did so. The binary files themselves are stored by the upload layer described below.

## File Upload System

Vercel serverless functions cannot write to the deployed project directory (for example `frontend/public` or backend source folders). Runtime uploads now use a safe abstraction:

```text
backend/utils/uploadPaths.js
```

Behavior:

- On Vercel: writes to `/tmp/uploads`, `/tmp/images`, and `/tmp/documents` by default.
- Locally: writes to backend-local public/upload folders unless overridden by env vars.
- Existing API response shapes are preserved, such as `/documents/property-documents/<file>` and `CafeMenu/<file>`.
- Express statically serves `/uploads`, `/images`, and `/documents` from the configured roots.

Important production note: `/tmp` is ephemeral in serverless environments. It prevents crashes and supports immediate runtime handling, but files can disappear between cold starts. For durable production uploads, configure a cloud storage implementation (Cloudinary/S3/Vercel Blob) behind the same path abstraction and keep API responses unchanged.

## Deployment Guide (Vercel)

### Backend Vercel project

- Root directory: `backend`
- Build command: `npm run build` (current script starts the app for Vercel compatibility in this project)
- Start command: `npm start` if needed by the platform
- Required env vars:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGIN` with your frontend URL(s)

### Frontend Vercel project

- Root directory: `frontend`
- Build command: `npm run build`
- Required env vars:
  - `NEXT_PUBLIC_API_URL=https://gym-mangement-backend.vercel.app`

## Common Issues and Fixes

### `ENOENT mkdir ... frontend/public/documents` on Vercel

Cause: serverless code attempted to write into the deployed source tree.

Fix: uploads now use `backend/utils/uploadPaths.js`, which points runtime writes to `/tmp` on Vercel.

### Frontend still calls localhost in production

Cause: hardcoded API URLs.

Fix: set `NEXT_PUBLIC_API_URL` in Vercel and use `frontend/src/config/api.js` everywhere.

### Next.js build fails on Leaflet with `window is not defined`

Cause: Leaflet requires browser globals during server-side build.

Fix: dashboard map wrappers dynamically import the shared Leaflet map with `ssr: false`.

### Next.js build fails on missing property enum backend model imports

Cause: frontend API routes imported backend-only Mongoose files that are not present in the frontend build context.

Fix: frontend enum routes now return static option payloads directly.

### Warnings about `<img>` or chart container sizes

These are non-fatal warnings in the current codebase. They do not stop production builds, but can be cleaned up later by migrating images to `next/image` and ensuring chart containers have explicit dimensions.

## Useful Commands

```bash
# Frontend production build
cd frontend && npm run build

# Backend JavaScript syntax check
find backend -name '*.js' -not -path '*/node_modules/*' -print0 | xargs -0 -n1 node --check
```
