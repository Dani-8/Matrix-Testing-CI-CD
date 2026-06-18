# Matrix Testing CI/CD — Node.js Matrix Pipeline

A production-ready backend Node.js service showcasing a **GitHub Actions matrix testing pipeline** that automatically validates compatibility across multiple Node.js versions simultaneously, paired with a secure multi-stage Docker build for production deployment.

---

## 🗺️ System & Pipeline Architecture

```text
                        [ Git Push / Pull Request to main ]
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │    GitHub Actions Pipeline    │
                        │       (ci.yml workflow)       │
                        └───────────────┬───────────────┘
                                        │
                                 Matrix Strategy
                                 fail-fast: false
                                        │
             ┌──────────────┬───────────┴───────────┬──────────────┐
             ▼              ▼                       ▼              ▼
    ┌──────────────┐ ┌──────────────┐     ┌──────────────┐ ┌──────────────┐
    │   Runner 1   │ │   Runner 2   │     │   Runner 3   │ │   Runner 4   │
    │ Node v18.x   │ │ Node v20.x   │     │ Node v22.x   │ │ Node v24.x   │
    │    (LTS)     │ │    (LTS)     │     │  (Current)   │ │   (Latest)   │
    ├──────────────┤ ├──────────────┤     ├──────────────┤ ├──────────────┤
    │ ✔ npm ci     │ │ ✔ npm ci     │    │ ✔ npm ci     │ │ ✔ npm ci     │
    │ ✔ Jest Suite │ │ ✔ Jest Suite │    │ ✔ Jest Suite │ │ ✔ Jest Suite │
    └──────────────┘ └──────────────┘     └──────────────┘ └──────────────┘
             │              │                       │              │
             └──────────────┴───────────┬───────────┴──────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │      All Versions Pass?       │
                        └───────────────┬───────────────┘
                                        │
                        ┌───────────────▼───────────────┐
                        │      Docker Build (local)     │
                        │       node:20-alpine          │
                        ├───────────────────────────────┤
                        │   Stage 1 — Builder           │
                        │   • npm ci                    │
                        │   • npm test                  │
                        │   • npm ci --omit=dev         │
                        ├───────────────────────────────┤
                        │   Stage 2 — Runner            │
                        │   • Non-root user             │
                        │   • Production files only     │
                        │   • NODE_ENV=production       │
                        └───────────────────────────────┘
```

---

## ⚙️ CI/CD Matrix Pipeline Architecture

The workflow triggers on every **push** or **pull request** to `main` and runs the full test suite across **4 Node.js versions in parallel** — catching version-specific compatibility issues before they ever reach production.

### Matrix Strategy — Node.js Compatibility Testing

| Matrix Dimension | Values |
|---|---|
| Node.js Versions | `18.x` (LTS) · `20.x` (LTS) · `22.x` (Current) · `24.x` (Latest) |
| Runner | `ubuntu-latest` |
| Fail Fast | `false` — all versions run to completion even if one fails, giving full cross-version results in a single workflow run |
| Dependency Caching | `npm` cache keyed to `backend/package-lock.json` — skips redundant installs on repeat runs |

### Pipeline Steps (per matrix job)

1. **Checkout Repository Code** — pulls code into the Actions runner
2. **Setup Node.js Environment** — installs the correct version per matrix slot, with `npm` caching via `backend/package-lock.json`
3. **Install Dependencies** — runs `npm ci` inside `./backend` for clean, reproducible installs
4. **Run Jest Test Suite** — executes all tests inside `./backend`

This ensures your service is verified against current LTS, active, and upcoming Node.js releases before any merge hits `main`.

---

## 📁 Project Directory Structure

> **Note:** `.github` must live at the absolute root of your project folder so GitHub can find your workflows!

```
.github/
└─ workflows/
   └─ ci.yml                 # Matrix CI Pipeline (Triggers on push/PR to main)
backend/
├─ server.js                 # Express application entrypoint
├─ server.test.js            # Jest / Supertest test suite
├─ package.json              # Project dependencies and scripts
├─ package-lock.json         # Lockfile for reproducible installs
└─ Dockerfile                # Multi-stage production build specification
```

---

## 🐳 Docker Virtualization Strategy

The `Dockerfile` uses a **two-stage build** to produce a lean, secure production image:

- **Builder Stage** (`node:20-alpine`): Installs all dependencies, runs the test suite, then strips dev dependencies with `npm ci --omit=dev`
- **Runner Stage** (`node:20-alpine`): Copies only the production-ready files — `server.js`, `package*.json`, and `node_modules`. Runs the app as a **non-root user** (`nodejs:nodejs`) for security hardening

---

## 🚀 Local Quickstart Guide

### Prerequisites

- Node.js v18+ installed locally
- Docker Desktop daemon running

### 1. Local Development

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run the test suite
npm test

# Start the dev server (with hot reload)
npm start
```

The server will boot up at `http://localhost:5000`.

### 2. Verified Local Docker Orchestration

```bash
# Build the optimized production image
docker build -t matrix-ci-backend .

# Run the container mapping port 5000
docker run -d -p 5000:5000 --name matrix-api matrix-ci-backend

# Verify running logs
docker logs matrix-api

# Gracefully terminate the container
docker stop matrix-api && docker rm matrix-api
```

---

## 🔌 API Endpoints Reference

| HTTP Method | Endpoint | Description | Expected Response |
|---|---|---|---|
| `GET` | `/` | Base Health Check | `Hello, This is the Matrix Testing (CI/CD) Server!` |

---

*Developed as part of a modern portfolio illustrating production-grade DevOps and CI/CD engineering practices.*