# Plan - Transition to "Password Only" Admin & Final Text Cleanup

I will finalize the transition to a password-only admin authentication flow as requested in the reference zip (`itfair-password-only-v2.zip`) and perform a final sweep for the hidden `\u2063` characters to ensure they are fully removed from all layers.

## User Review Required

> [!IMPORTANT]
> The "Password Only" admin implementation uses a fallback mechanism where the master password `Sarour99@#` confirms authorization, but the underlying Supabase architecture still requires an authenticated session for RLS. I will automate the "sign in as admin" flow after the password is verified to preserve the requested "password only" experience for the user.

## Proposed Changes

### Database & Security
- Execute a final migration to strip `\u2063` from any newly inserted or missed rows in `settings`, `services`, and `packages`.
- Revoke execution of `SECURITY DEFINER` functions from `PUBLIC` and `anon` to resolve the security linter warning from the previous turn.

### Admin Authentication (`src/routes/auth.tsx` & `src/lib/admin.functions.ts`)
- **Backend**: Update `passwordLogin` to return the email of the first admin user found in `user_roles`.
- **Frontend**: Simplify the `/auth` page to show **only** a password field by default, matching the reference `admin.php`.
- **Auto-Login**: When the correct master password is entered, the frontend will automatically perform a `signInWithPassword` using the retrieved admin email and the master password (which I will ensure matches the admin account for seamless flow).

### Final Text Alignment
- Re-scan `src/lib/data.functions.ts` and `src/lib/admin.functions.ts` to ensure the `sanitize` helper is applied to every text output.
- Update the default site subtitle from "AUTHORIZED BD" to "AUTHORIZED BD" (removing any potential hidden characters in the process).

## Verification Plan

### Automated Tests
- Run a Playwright script to:
  1. Navigate to `/auth`.
  2. Verify only the "Password" field is visible.
  3. Enter the master password `Sarour99@#`.
  4. Verify automatic redirection to `/admin`.
  5. Check for `\u2063` characters in the resulting admin page DOM.

### Manual Verification
- Confirm the admin panel metrics (Total Orders, etc.) load correctly after the "password only" login.
