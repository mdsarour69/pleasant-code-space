# Plan - Unified Admin Enhancement & Text Sync

The user has provided new instructions in `instrucoes-3.md` (in Bengali, meaning: "I want to be able to delete all files/records here and create a new admin panel with a single file, with the admin password Sarour99@#"). This reinforces the previous goal of a consolidated admin panel and adds a request for comprehensive deletion capabilities.

## User Improvements
- **Delete All Capability**: Enhance the admin panel to allow deleting all services and all packages, in addition to the existing "Delete All Orders" functionality.
- **Master Password Consistency**: Ensure the admin flow remains secured by the `Sarour99@#` master password.
- **UI Consolidation**: The admin panel is already unified in `src/routes/_authenticated/admin.tsx`. I will further refine this file to include the missing "Delete All" actions and ensure the UI matches the reference brand ("ITFair", "AUTHORIZED BD").

## Technical Details
- **Backend Updates**: Add `deleteAllServices` and `deleteAllPackages` to `src/lib/admin.functions.ts`.
- **Frontend Updates**: 
  - Add "Delete All" buttons to `ServicesTab` and `PackagesTab` in `src/routes/_authenticated/admin.tsx`.
  - Ensure the "ITFair Admin" branding is consistent.
  - Apply the `sanitize` utility to ensure no hidden characters are introduced.

## Verification
- Perform a build to ensure type safety.
- Verify the new "Delete All" actions are visible in the admin panel.
