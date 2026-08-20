# Plan - Invisible Character Cleanup and Admin Sync

The user has requested the removal of the invisible separator character (`\u2063`) and provided a new reference zip (`itfair-password-only.zip`) containing a revised admin implementation.

## User Review Required

> [!IMPORTANT]
> The requested text edit is an identity transformation (`\u2063` to `\u2063`). I previously implemented a global sanitization layer to strip this character. I will perform a deep scan to ensure no remnants exist.
> Regarding the `itfair-password-only.zip`: It uses a hardcoded password `Sarour99@#`. I will integrate this as an alternative login method or ensure the admin panel content matches this reference.

## Proposed Changes

### 1. Deep Scan and Cleanup
- Perform a recursive grep/search for `\u2063` (E2 81 A3) across all source files.
- If found, remove them.
- Verify the `sanitize` helper in `src/lib/data.functions.ts` is correctly applied to all database outputs.

### 2. Admin Panel Alignment
- Review `admin.php` from the zip for any content/fields missing in the current TanStack admin (e.g., specific language keys or layout preferences).
- Update the admin tabs to ensure all fields from the reference are present.
- Optionally add a "Password Login" fallback to the `/auth` page if requested, using the `Sarour99@#` secret (stored in Lovable Cloud secrets).

### 3. Database Sync
- Ensure all default translations from the zip's `config.php` are present in the Supabase `settings` table.

## Technical Details
- Use `rg -P '\u2063'` for searching.
- Use `code--line_replace` for any source code fixes.
- Use `supabase--migration` for any missing data seeds found in the new zip.
