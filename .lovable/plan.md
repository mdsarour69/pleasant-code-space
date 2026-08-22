# Plan: Admin Panel Consolidation and Simplified Management

Consolidate the admin panel into a single, unified file as requested, and ensure full management capabilities (including record deletion) are easily accessible.

## Proposed Changes

### Admin UI Consolidation
- Move all logic and UI from `src/components/admin/*.tsx` into `src/routes/_authenticated/admin.tsx`.
- This includes the Dashboard, Orders management, Services editor, Packages editor, and Site Settings.
- Delete the `src/components/admin/` directory once consolidation is complete to keep the project clean.

### Enhanced Data Management
- Add "Delete All" functionality for Orders to allow quick cleanup.
- Ensure the "Delete" button for individual Services and Packages is prominent.
- Add a "Reset Translations" button in the Settings area to revert to defaults if needed.

### Authentication & Security
- Maintain the current "Master Password" (`Sarour99@#`) fallback logic in `/auth`.
- Keep the `src/lib/admin.functions.ts` as the backend service layer (this is required by the framework for server functions, but it will be the only "dependency" for the admin route).

## Technical Details
- The consolidated `admin.tsx` will use a large `switch` or `Tabs` component to toggle between views.
- Shared UI components (like the `EntityDialog`) will be converted to local components within `admin.tsx`.
- All `useServerFn` hooks and `useQuery` logic will remain centralized in the main component.

## User Impact
- The admin panel will be easier to manage as it will be contained within a single file.
- You will have the ability to quickly delete all orders or manage individual items more efficiently.
