# Cleanup plan for invisible separator characters

The user reported the presence of invisible separator characters (`\u2063` - Invisible Separator) and wants them removed. Although a comprehensive search across files and the current database state did not reveal active instances of this character, I will implement a global sanitization filter in the data fetching layer to ensure no such characters reach the UI, while also performing a final manual cleanup of potential source locations.

## Proposed Changes

### Data Layer Sanitization
- Update `src/lib/data.functions.ts` to include a utility function that strips `\u2063` characters from all strings fetched from the database.
- Apply this filter to `getTranslations`, `getServices`, and `getPackages`.

### Database Sanitization Migration
- Create and run a one-time migration to strip `\u2063` from all existing data in `settings`, `services`, and `packages` tables just in case they exist in fields not covered by initial checks.

### Frontend Review
- Final visual check of key components to ensure no hardcoded invisible characters remain in the UI source.

## Technical Details
- Utility function: `const sanitize = (val: string) => val.replace(/\u2063/g, '');`
- SQL Migration:
  ```sql
  UPDATE public.settings SET value = replace(value, E'\u2063', '');
  UPDATE public.services SET title = replace(title, E'\u2063', ''), description = replace(description, E'\u2063', '');
  -- (and similar for all multilingual columns)
  ```
