# Cleanup plan for invisible separator characters

The user is reporting the presence of invisible separator characters (`\u2063` - Invisible Separator) in the text content and wants them removed. These are likely artifacts from the original PHP code or translation strings.

## User Review Required

> [!IMPORTANT]
> Since I could not find literal `\u2063` strings in the codebase using search tools, these characters are likely embedded invisibly in the database seed data or source files. I will perform a search-and-replace for the actual invisible character.

## Proposed Changes

### Database Seed Data
- Clean up the `supabase/migrations/20260819000000_initial_schema.sql` file by removing any invisible U+2063 characters from the `INSERT` statements for `settings`, `services`, and `packages`.
- Run a migration to clean existing data in the database.

### Frontend Components
- Scan and clean the following components for any invisible U+2063 characters:
    - `src/components/home/Hero.tsx`
    - `src/components/home/TrialSection.tsx`
    - `src/components/home/PricingSection.tsx`
    - `src/components/home/ContactFooter.tsx`
    - `src/components/home/Navbar.tsx`

## Technical Details
- Use `sed` or a custom script to replace the U+2063 character (Invisible Separator) with an empty string or a standard space where appropriate.
- Verify the removal by running `grep -rP '\x{2063}' .` (if the environment supports it) or checking file hex dumps.
