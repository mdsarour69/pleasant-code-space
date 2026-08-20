# Plan: Admin Panel Completion and Reference Sync

I will synchronize the project with the `itfair-admin-complete.zip` reference, ensuring all translation keys, global settings, and admin features match the "complete" version while maintaining the React/TanStack architecture.

## User Review Required

> [!IMPORTANT]
> The admin master password remains `Sarour99@#`. The first user to sign up at `/auth` will still be granted the admin role automatically.

## Proposed Changes

### Database & Content
- Sync the `settings` table with all keys and values from `config.php` (Bengali, English, Arabic, French, Portuguese).
- Add global settings keys: `whatsapp_url`, `email`, `extension_url`, `trial_url`, `facebook_url`, `telegram_url`.
- Run a final cleanup migration to strip any remaining `\u2063` characters from the database.

### Admin Backend (`src/lib/admin.functions.ts`)
- Update Zod schemas to include all multilingual fields for services and packages.
- Ensure `adminListAll` returns the new global settings.

### Admin UI (`src/components/admin/`)
- **SettingsTab**:
    - Add a "Global Links" section for WhatsApp, Email, Extension URL, etc.
    - Improve the layout for multi-language text editing to handle the large number of keys more gracefully.
- **Packages/Services Tabs**:
    - Verify all fields from the reference PHP forms are available in the React dialogs.

### Frontend Data Layer (`src/lib/data.functions.ts`)
- Ensure the `sanitize` utility is applied consistently across all entry points.
- Map the new global links so they can be used in the footer and contact sections.

## Technical Details
- Using `supabase--migration` for content sync and cleanup.
- React components using `sonner` for notifications and `lucide-react` for icons.
- Maintaining TanStack Start server functions with Supabase Auth middleware.
