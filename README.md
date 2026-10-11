# Restaurant Management System (RMS)

Next.js App Router application with **SSR**, **Firebase Authentication**, and **MongoDB** for roles and business data.

## Roles

| Role   | Portal | Capabilities |
| ------ | ------ | ------------ |
| Admin  | `/admin` | Dashboard KPIs, categories, menu items, tables, **orders oversight**, **staff list**, reports |
| Waiter | `/waiter` | **POS** (`/waiter/pos`), order list & status flow (pending → preparing → served → paid) |

Admins and waiters can both advance or cancel open orders. Only waiters create orders from the POS.

## Tech stack

- **Framework:** Next.js 16 (App Router, Server Components, Route Handlers)
- **Auth:** Firebase Auth (client) + Firebase Admin session cookies (SSR)
- **Database:** MongoDB via Mongoose
- **UI:** Tailwind CSS v4, shadcn-style components, Lucide React, react-select
- **Validation:** Zod (+ React Hook Form on auth forms)

## Project structure

```
app/
  (auth)/              # Login & register (public)
  (dashboard)/         # Role-protected areas (SSR guards)
    admin/             # Admin portal routes
    waiter/            # Waiter portal (POS + orders)
  api/auth/            # Session, logout, register profile
components/
  admin/               # Admin UI (SSR + lazy client forms)
  orders/              # Shared order list, detail, filters
  waiter/              # POS and waiter-specific shells
  auth/                # Auth-specific UI
  ui/                  # Shared UI (shadcn-compatible)
lib/
  firebase/            # Client & Admin SDK helpers
  mongodb/             # DB connection
  auth/                # Client session helpers
server/
  auth/                # Session + route guards (server-only)
  actions/             # Server actions (CRUD, orders)
  db/
    models/            # Mongoose schemas
    repositories/      # Data access
types/                 # Shared TypeScript types
validations/           # Zod schemas
middleware.ts          # Cookie presence + auth route redirects
```

## Setup

### 1. Install dependencies

```bash
npm install firebase firebase-admin mongoose zod react-hook-form @hookform/resolvers lucide-react react-select clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-label
```

Optional — align with the official shadcn CLI (components already match its patterns):

```bash
npx shadcn@latest init
# When prompted, use the existing paths: components/ui, lib/utils, etc.
```

### 2. Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

**Firebase client:** Firebase Console → Project settings → Your web app.

**Firebase Admin:** Firebase Console → Project settings → Service accounts → Generate new private key. Map `project_id`, `client_email`, and `private_key` to the `FIREBASE_ADMIN_*` variables. Keep `\n` in the private key or use real newlines inside quotes as shown in `.env.example`.

**MongoDB:** Local or Atlas connection string in `MONGODB_URI`.

**Registration:** By default, `ALLOW_PUBLIC_ADMIN_REGISTER=false` — new sign-ups are waiters only. Set to `true` in development if you need to create an admin via `/register`.

In Firebase Console, enable **Email/Password** sign-in under Authentication → Sign-in method.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication flow

1. User signs in or registers with **Firebase Auth** in the browser.
2. Client sends the Firebase **ID token** to `POST /api/auth/session`.
3. Server verifies the token with **Firebase Admin** and sets an **httpOnly session cookie**.
4. Server Components call `getCurrentUser()` to verify the cookie and load the user **role** from MongoDB.
5. `middleware.ts` blocks `/admin` and `/waiter` without a session cookie; nested layouts enforce admin vs waiter.

Registration creates the Firebase user, then `POST /api/auth/register` stores `firebaseUid`, email, display name, and role in MongoDB. Admin role is rejected unless `ALLOW_PUBLIC_ADMIN_REGISTER=true`.

## Portal features

### Admin (`/admin`)

- **Dashboard** — revenue, active orders, menu/table counts
- **Categories** — CRUD with sort order and active flag
- **Menu items** — CRUD linked to categories
- **Tables** — create, edit, delete (used in POS table grid)
- **Orders** — active/all filter, shared detail panel with status actions
- **Staff** — read-only list of MongoDB user profiles
- **Reports** — date-range summary, status breakdown, top items

### Waiter (`/waiter`)

- **POS** — category tabs, menu grid, table selection, ticket submit
- **Orders** — active/all filter, detail with same status workflow as admin

## Roadmap

- [x] Phase 1 — Authentication (Firebase + MongoDB roles + SSR sessions)
- [x] Phase 2 — Categories CRUD (admin, sidebar nav, SSR + lazy forms)
- [x] Phase 3 — Menu items CRUD (admin, linked to categories)
- [x] Phase 4 — Orders & tables (admin tables, waiter POS + status flow)
- [x] Phase 5 — Reporting, admin orders/staff, shared order UI, register hardening

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Production server        |
| `npm run lint` | ESLint                   |
