# Implementation Plan - ITFair Clone Integration

The user wants to apply "visual text edits" based on a provided ZIP file (`itfair-clone-final.zip`). This ZIP contains a full PHP/SQLite implementation of a landing page called "ITFair". I will recreate this landing page using the project's TanStack Start architecture, Tailwind CSS, and Lovable Cloud for persistence.

## User Review Required

> [!IMPORTANT]
> The provided ZIP contains a PHP site with multi-language support (Bengali, English, Arabic, French, Portuguese) and an admin panel. I will migrate the frontend design and data structure to your TanStack Start app.

- **Primary Language**: The default language is set to Bengali. Is this correct?
- **Features to Include**:
    - **Hero & Services**: Visual grid of service cards.
    - **Packages**: Pricing cards with "Buy Now" functionality.
    - **Trial Section**: Video demo placeholder and trial package options.
    - **Multilingual**: Toggle between the 5 supported languages.
    - **Admin Panel**: Do you need the admin panel functionality (package/service management) migrated as well, or just the public landing page for now?

## Proposed Changes

### 1. Database & Backend (Lovable Cloud)
- Enable Lovable Cloud.
- Create tables to match the PHP schema:
    - `settings`: For site-wide translations and configurations.
    - `services`: Service cards data (icon, title, description, gradient).
    - `packages`: Pricing plans (name, duration, price, badge).
    - `orders`: To store customer order submissions.
- Implement RLS policies for public read and authenticated (admin) write.

### 2. Frontend (TanStack Start)
- **Styles**: Migrate the custom CSS from `style.css` to `src/styles.css` using Tailwind v4 utility patterns or keeping the custom properties where appropriate for the specific theme.
- **Routing**: Update `src/routes/index.tsx` to render the ITFair landing page.
- **Components**:
    - `Navbar`: With language switcher and navigation links.
    - `Hero`: Main headline and service grid.
    - `ServiceCard`: Individual service items with gradients.
    - `TrialSection`: Trial package selection and video row.
    - `PricingSection`: Package grid with ordering logic.
    - `OrderModal`: Submission form for packages.
- **I18n**: Implement a lightweight translation hook that reads from the `settings` table/cache.

### 3. Assets
- Upload any images/icons from the ZIP to Lovable Assets (if any were binary, though most seem to be emojis/CSS-based).

## Technical Details
- **Stack**: React 19, TanStack Start v1, Tailwind CSS v4, Lovable Cloud (Supabase).
- **Navigation**: Use TanStack Router for hash-link scrolling.
- **Data Fetching**: Use `useSuspenseQuery` for initial data loading of services and packages.
- **Server Functions**: Create server functions for order submission (`submitOrder`).
