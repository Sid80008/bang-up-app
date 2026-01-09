This folder contains SQL migrations and instructions for applying database changes to Supabase.

Migration created: `20260109_add_location_fields.sql`

Purpose:
- Add `location_radius_unit` (text, default 'km') to `profiles`
- Add `address` (text, nullable) to `profiles`
- Convert `location_radius` to numeric if it's currently stored as text by extracting numeric digits

How to apply

Option A — Supabase SQL editor (recommended for quick apply):
1. Open your Supabase project dashboard.
2. Go to "SQL" -> "New query".
3. Copy the contents of `supabase/migrations/20260109_add_location_fields.sql` and paste into the editor.
4. Run the query and confirm success.

Option B — Using psql (direct DB connection):
1. Get your database connection string from Supabase (Settings -> Database -> Connection string (URI)).
2. Run locally (PowerShell / Terminal):

```bash
psql "postgres://<db_user>:<db_pass>@<host>:5432/<db_name>" -f supabase/migrations/20260109_add_location_fields.sql
```

Option C — Supabase CLI (if configured):
1. Ensure `supabase` CLI is installed and logged in.
2. Run (adjust as needed):

```bash
supabase db remote set <your-remote>
psql "$(supabase db url)" -f supabase/migrations/20260109_add_location_fields.sql
```

Caveats & manual review
- The migration attempts a best-effort conversion of textual `location_radius` values by stripping non-numeric characters. If you have values like `3 miles` or `5000 meters` encoded as text, review and run a more tailored migration converting units to kilometers (the app converts values by unit; post-conversion data should match expected numeric units).
- Always run migrations on a staging copy first if possible.

If you'd like, I can run the migration for you — provide Supabase project access or run the command in your environment and paste any errors here and I will help fix them.