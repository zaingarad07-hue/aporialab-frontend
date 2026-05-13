# AporiaLab Frontend — Context for Claude Code

Arabic philosophy discussion platform UI. React 19 + TypeScript + Vite 7 SPA on Vercel. RTL, dark theme.

## Stack
- React 19 + TypeScript 5.9 + Vite 7
- React Router 6 — **BrowserRouter** (NOT HashRouter; was switched). `vercel.json` already rewrites all paths to `index.html`.
- Tailwind 3 + shadcn/ui (Radix primitives) — every UI primitive lives under `src/components/ui/`.
- `react-hook-form` + Zod for forms.
- `@react-oauth/google` for Google sign-in. Production domain `https://aporialab.space` is registered; **preview URLs are NOT** so OAuth fails on Vercel previews with `origin_mismatch`. Test auth-gated features by registering email/password on preview, or trust the build and merge to verify on prod.
- `i18next` with `ar` and `en` locales. RTL hard-coded in `App.tsx`. Most Navbar labels are inline Arabic strings, not i18n keys — match that style.
- `framer-motion`, `lucide-react`, `recharts`, `sonner` (toasts), `next-themes`, `date-fns` with `ar` locale.
- Sentry: `src/sentry.ts` initialized in `main.tsx`. `AuthContext` tags Sentry user on login/logout via `setSentryUser`.
- `@vercel/analytics` and `@vercel/speed-insights` mounted in App.tsx.

## Layout
- `src/App.tsx` — routes + `*WithNav` wrappers (Sidebar + Navbar + Footer + dialogs).
- `src/main.tsx` — entry, GoogleOAuthProvider, Sentry init.
- `src/services/api.ts` — single `ApiService` class with all backend calls. **One source of truth** for types like `NotificationItem`, `DiscussionDetail`, etc.
- `src/context/AuthContext.tsx` — exposes `{ user, isAuthenticated, isLoading, login, loginWithGoogle, register, logout }`. Stores JWT in `localStorage` (planned: move to httpOnly cookies, NOT done yet).
- `src/hooks/` — `use-mobile.ts`, `useUnreadNotifications.ts`.
- `src/sections/` — Navbar, Hero, Features, Discussions, Circles, Leaders, Challenge, Footer (homepage sections).
- `src/pages/` — full pages. **`DiscussionPage.tsx` is 1,696 lines — avoid editing it unless absolutely necessary.**
- `src/components/` — dialogs (LoginDialog, JoinDialog, CreateDiscussionDialog), NotificationsBell, etc.
- `src/components/ui/` — generated shadcn primitives. Don't modify by hand.

## Path aliases
`@/*` → `./src/*` (configured in `tsconfig.json`, `tsconfig.app.json`, and Vite). Use it instead of relative imports for components and services.

## API base URL
```ts
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://aporialab-backend.vercel.app';
```
`VITE_API_URL` should be set on Vercel for the frontend project. Strips trailing `/api` if present.

## Pattern for adding a new page
1. Create `src/pages/MyPage.tsx`.
2. Add a `MyPageWithNav` wrapper in `App.tsx` mirroring `SearchPageWithNav` (Sidebar + Navbar + main + Footer + 3 dialogs).
3. Register `<Route path="/my" element={<MyPageWithNav />} />`.

## Notifications system (just shipped — Phase 2)
- `services/api.ts`: types (`NotificationType`, `NotificationFilter`, `NotificationItem`, ...) and 5 methods.
- `hooks/useUnreadNotifications.ts`: polls `/api/notifications/unread-count` every 60s when authenticated; refreshes on `visibilitychange`; in-flight guard.
- `components/NotificationsBell.tsx`: Popover with last 10, mark-all action, "عرض الكل" link.
- `components/notifications/notificationDisplay.tsx`: shared `NotificationIcon` + `timeAgo` (date-fns/ar).
- `pages/NotificationsPage.tsx`: tabs filter, pagination 20/page, per-item delete.
- Mounted in `Navbar.tsx` only when `isAuthenticated`.

## Conventions
1. **No smart quotes** — only ASCII `'` `"` `` ` ``.
2. RTL is mandatory; Arabic labels inline (not i18n keys) unless the section already uses i18n.
3. Use shadcn primitives from `@/components/ui/...`. Don't introduce new dependencies for things they already cover.
4. Run `npm run build` before commit. Type errors block deploy.
5. Atomic commits with descriptive messages.
6. **Never edit `DiscussionPage.tsx` unless explicitly asked.**

## Known follow-ups
- Bundle is 977KB (gzip 273KB) — chunk-size warning is expected. Code-splitting via dynamic imports is a future task.
- Google OAuth preview origin not registered (won't be fixed; test auth on prod).
- JWT in `localStorage` (XSS-exposed) — eventually move to httpOnly cookies.

## Backlog (next session)
- **User Profile features**: edit profile fields (name, bio), change password (UI + backend `PATCH /api/users/password` to add), email verification flow.
- **Profile image upload (Cloudinary)**: client signs upload via backend signature endpoint, sends asset URL to `PUT /api/users/profile`. Need: `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` env vars; backend signature endpoint protecting the API secret.
- **Better authentication flow**: password reset (forgot password → email link), proper email verification.
- **User settings page** at `/settings`: tabs for profile, security, notifications preferences, language/theme.
- Improve `ProfilePage.tsx` editing UX.
