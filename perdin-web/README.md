# Perdin Web

Dashboard web application for managing travel allowances. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication** — JWT-based login with automatic token refresh
- **Role-based access** — Admin, HR, and Employee roles with different permissions
- **Travel Management** — Create, edit, approve/reject, and delete travel requests
- **User Management** (Admin) — CRUD users and assign/remove roles
- **Role Management** (Admin) — Create and delete roles
- **City Management** (Admin) — CRUD city data for travel origin/destination
- **Profile** — View profile info and change password
- **Responsive** — Works on desktop and tablet (768px–1920px+)

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript 6 | Type safety |
| Vite 8 | Build tool & dev server |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state & caching |
| Axios | HTTP client |
| Zod v4 | Schema validation |
| React Hook Form | Form state management |
| Tailwind CSS v3 | Styling |
| Headless UI | Accessible UI primitives |
| Vitest | Test runner |
| fast-check | Property-based testing |

## Prerequisites

- Node.js >= 18
- npm >= 9
- Perdin Service API running on `localhost:8080` (or configure via env)

## Getting Started

1. **Clone the repository**

```bash
git clone <repo-url>
cd perdin-web
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different host/port.

4. **Start the development server**

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The Vite dev server proxies `/api` requests to `http://localhost:8080`.

5. **Login**

Use credentials from your Perdin Service backend (e.g., `admin@perdin.com`).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

## Project Structure

```
src/
├── domain/           # Business logic (entities, validators, rules)
│   ├── entities/     # TypeScript interfaces
│   ├── validators/   # Zod schemas
│   └── rules/        # Role permissions, navigation logic
├── data/             # Data access layer
│   ├── api/          # Axios client, endpoints, interceptors
│   ├── repositories/ # API call functions
│   └── mappers/      # API response → domain entity mappers
├── presentation/     # UI layer
│   ├── app/          # App root, router, providers
│   ├── layouts/      # Auth & Dashboard layouts
│   ├── pages/        # Page components
│   ├── components/   # Reusable UI components & guards
│   ├── hooks/        # Custom hooks (TanStack Query wrappers)
│   └── context/      # React contexts (Auth, Notifications)
└── shared/           # Constants, types, utilities
```

## Role Permissions

| Feature | Employee | HR | Admin |
|---------|----------|-----|-------|
| View own travels | ✅ | — | — |
| View all travels | — | ✅ | ✅ |
| Create travel | ✅ | — | ✅ |
| Edit travel (pending) | ✅ (own) | — | ✅ |
| Approve/Reject travel | — | ✅ | ✅ |
| Delete travel (pending) | ✅ (own) | — | ✅ |
| Manage users | — | — | ✅ |
| Manage roles | — | — | ✅ |
| Manage cities | — | — | ✅ |
| Change own password | ✅ | ✅ | ✅ |

## Production Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static file server. Make sure to configure your server to redirect all routes to `index.html` (SPA fallback).

