# Plan: Stable A–Z Admin Controls

Fix the intermittent admin blank/loading state first, then add safe site-wide structure and theme controls so the website can be changed from one admin panel without allowing settings that can break the layout.

## Admin reliability
- Replace the current ambiguous loading logic with explicit `loading`, `unauthorized`, `error`, and `ready` states.
- Add visible retry and sign-in-again actions when role or admin-data requests fail, instead of leaving the page stuck on “Loading…”.
- Make session expiry handling deterministic: clear stale admin queries, redirect expired sessions to `/auth`, and wait for the authenticated session before requesting protected data.
- Remove unsafe data assumptions and add mutation error feedback for orders, services, packages, bulk deletes, and settings.
- Add confirmation dialogs for destructive “Delete all” actions and disable controls while requests are running.

## Complete content management
- Restore full create/edit forms for services and packages, including every language, descriptions, icon/gradient, price/old price, duration, badge, type, button text, active status, and display order.
- Add edit, active/inactive toggle, ordering, individual delete, and bulk delete controls.
- Expand order management with status changes, customer details, delete, filtering, and safe bulk deletion.
- Keep all site text, URLs, currency, brand name, logo URL, favicon URL, and description editable in organized admin sections.

## Safe structure controls
- Add admin settings for section visibility and section order for Services, Trial, Packages, and Contact.
- Add safe layout presets for service/package grids, content width, spacing density, and corner style.
- Apply these settings on the public page with validated defaults, so invalid or missing values automatically fall back to the current layout.

## Global theme controls
- Add color controls for primary, background, surface, text, muted text, and border colors, with validation and reset-to-default.
- Add approved font and button-style presets rather than arbitrary CSS input.
- Load the selected theme through semantic CSS variables so Navbar, sections, cards, buttons, admin UI, and mobile layouts remain consistent and readable.
- Replace hardcoded page colors touched by this work with semantic design tokens.

## Admin usability and performance
- Reorganize the single admin route into clear Dashboard, Orders, Services, Packages, Content, Structure, and Theme tabs.
- Add search, save-all/unsaved indicators, responsive tables/cards, sticky mobile-friendly navigation, smooth lightweight transitions, and actionable success/error messages.
- Avoid unnecessary refetches and batch settings updates where possible for a faster, steadier panel.

## Data and security
- Add default structure/theme settings in a database migration; retain existing row-level security and admin role checks.
- Add a protected batch-settings server function with strict key/value validation for reliable multi-setting saves.
- Keep password-only login and the existing admin account flow unchanged.

## Verification
- Validate the password login → `/admin` flow, refresh behavior, expired/failed request recovery, every CRUD action, theme changes, structure presets, and reset behavior.
- Check desktop and mobile layouts for overflow/overlap, then confirm build, runtime, and browser console signals are clean.

## Technical details
- Continue using TanStack Start server functions, React Query, Lovable Cloud auth/database, Tailwind v4 semantic tokens, and existing shadcn controls.
- The error payload shown in the report contains the request text as an exception message; current logs show a clean build and no captured runtime stack. The reliability work will expose the real request/session failure in-panel rather than producing a blank screen.
