# React 19 + TypeScript + Vite + Redux Toolkit Starter Template

A production-ready, enterprise-grade React 19 frontend template pre-configured with the latest best practices, modular architecture, dark/light themes, automatic token refresh, and client-side API simulation.

---

## 🚀 Tech Stack

- **Core**: React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, RTK Query, React Router DOM v6
- **UI & Forms**: Lucide Icons, Recharts, Framer Motion, React Hook Form, Zod (Validation), Sonner (Toasts)
- **Utilities**: Date-fns, Lodash-es, React-use, React-error-boundary, Clsx, Tailwind-merge

---

## 📁 Directory Structure

The project uses a scalable, feature-based architecture under the `src` directory:

```text
src/
├── app/               # Core application setup
│   ├── providers.tsx  # Global providers (Redux, Theme, Helmet, Toast, Error Boundary)
│   ├── router.tsx     # React Router routes and code splitting (lazy loading)
│   └── store.ts       # Global Redux store configuration
├── api/               # RTK Query root api configuration
│   └── baseApi.ts     # Base RTK query using Custom Axios client
├── assets/            # Static assets (images, logos, svg vectors)
├── components/        # Reusable UI & layout elements
│   ├── common/        # Shared loading fallbacks, page error blocks
│   ├── layout/        # Shell headers, sidebars, structures
│   └── ui/            # Reusable Shadcn-style components (Button, Input, Table, etc.)
├── constants/         # App constants, routes, and localStorage keys
├── contexts/          # React contexts (Theme context provider)
├── features/          # Feature-based pages and API modules
│   ├── auth/          # Auth components, forms, slice, protected routes, and endpoints
│   ├── dashboard/     # SaaS dashboard page, statistics, and Recharts graphs
│   ├── settings/      # Account settings pages and UI preferences
│   └── users/         # User directory data-tables, forms, and CRUD actions
├── hooks/             # Custom global React hooks (e.g. typed Redux hooks)
├── layouts/           # Structural layout templates (AuthLayout, DashboardLayout)
├── lib/               # Shared libraries configurations (Axios, Mock adapter system)
├── pages/             # Layout-free pages (404, 403, 500 error boundaries)
├── routes/            # Route maps and links configurations
├── services/          # Storage token services helpers
├── styles/            # Styling utility presets
├── types/             # Common TypeScript interfaces
└── utils/             # Core utility formatters (date, currency helpers)
```

---

## ⚙️ Environment Configuration

The template uses a structured `.env` configuration. The variables are exposed via `src/constants/index.ts`.

Copy `.env.example` to `.env` to configure:

```ini
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Antigravity Core
VITE_ENABLE_MOCK_API=true
```

- **`VITE_ENABLE_MOCK_API`**: Set to `true` to intercept network requests locally. This lets the template run as a fully stateful app in the browser without any backend server.

---

## 🛠️ Available Scripts

Execute these scripts in the `client` directory:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **`npm run dev`** | `vite` | Starts the local dev server. |
| **`npm run build`** | `tsc -b && vite build` | Compiles TypeScript and builds the production bundle in `dist/`. |
| **`npm run lint`** | `oxlint` | Lints the codebase using Oxlint for fast static analysis. |
| **`npm run preview`** | `vite preview` | Previews the compiled production build locally. |

---

## 🔒 Authentication & Network Features

- **JWT Storage**: Tokens are securely saved in `localStorage` and sent in headers via Axios request interceptors.
- **Refresh Token Interceptor**: Response interceptors catch `401 Unauthorized` responses, queue requests, refresh tokens, and retry.
- **Auto Logout**: Redirects users to `/login` if refresh tokens expire or are missing.
- **Optimistic Updates**: RTK Query mutations (e.g., updating a user) optimistically update cached lists, rolling back state if network calls fail.

---

## ⚡ Deployment Instructions

### 1. Production Build
Generate the production-ready assets:
```bash
npm run build
```
This builds static assets (HTML, CSS, JS chunks) to the `dist/` directory.

### 2. Static Hosting (Vercel, Netlify, AWS S3)
Deploy the `dist/` folder. Ensure you redirect all traffic to `index.html` to support Client-Side Routing:
- **Netlify**: Create a `_redirects` file in the public folder:
  ```text
  /*    /index.html   200
  ```
- **Vercel**: Pre-configured by default.
- **Nginx**: Add a fallback rule:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
