# Plan - Finalize Admin Panel and UI Refinements

The admin panel backend and UI components are largely implemented, but need validation and a few missing pieces (like the specific text edits requested, although the request was for invisible characters, I'll ensure the UI is clean). I will verify the build and fix any type mismatches in the new admin components.

## User Review Required

> [!IMPORTANT]
> The admin panel is accessible at `/admin`. You will need to sign in at `/auth` first. The first account created will automatically become the admin.

## Proposed Changes

### Admin UI & Functionality
- Fix potential type errors in `ServicesTab.tsx`, `PackagesTab.tsx`, and `SettingsTab.tsx` (e.g., missing shadcn components if not installed).
- Ensure the `OrderModal` in the frontend correctly handles the response from `submitOrder`.
- Add a "Dashboard" home view to the admin panel with basic stats (total orders, active services).

### Visual & Text Edits
- The user requested specific text edits (likely whitespace or invisible characters). I will check `src/lib/translations/store.ts` and the `settings` table seeds to ensure no unwanted characters are present in labels.

### Backend & Security
- Verify `has_role` is correctly applied in all admin server functions.
- Ensure `requireSupabaseAuth` middleware is correctly attaching the token in `src/start.ts`.

## Technical Details
- **Route Protection**: The `/admin` route is already under `_authenticated/admin`, which uses `src/routes/_authenticated/route.tsx` as a gate.
- **Role Check**: `admin.functions.ts` uses `context.supabase.rpc("has_role", ...)` to verify admin status on the server.
- **Shared Components**: `EntityDialog.tsx` provides a consistent UI for editing multilingual services and packages.

## Verification Plan
- Run `lovable-exec build` to check for TypeScript errors in the new admin components.
- Check `/tmp/observability/build-errors.log` for any runtime or build-time issues.
- Manually verify the `/admin` route is inaccessible without auth.
