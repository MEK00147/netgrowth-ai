# NetGrowth security guide

## What may be public

The frontend can use only these environment variables:

    VITE_SUPABASE_URL
    VITE_SUPABASE_PUBLISHABLE_KEY

The publishable key identifies the Supabase project; it is not a password. Database grants and Row Level Security protect the data behind it.

## What must stay server-side

Never add these values to a VITE_ variable, commit them to Git, or paste them into browser code:

- Supabase service-role or secret keys
- database passwords and connection strings
- Gemini or OpenAI API keys
- Resend API keys
- n8n webhook secrets

Store service secrets in Supabase Edge Function secrets or the environment of a trusted server. A service-role key bypasses Row Level Security.

## Database setup

1. Create a new Supabase project.
2. Apply supabase/migrations/20260908120000_initial_secure_schema.sql.
3. Create one owner account through the NetGrowth sign-up page.
4. Add the project URL and publishable key to a local .env file.
5. Confirm that the owner can create and view their own lead.
6. Confirm that a signed-out browser cannot read or write profiles, leads, activities, or follow_ups.

The migration gives anonymous visitors no table permissions. Signed-in users can access only rows whose owner_id matches their authenticated user ID.

## Future public lead form

Do not send a public website form directly to the database. Build it behind a Supabase Edge Function or other trusted endpoint that:

1. validates and limits each field;
2. rate-limits requests and uses bot protection;
3. deduplicates submissions;
4. creates the lead server-side;
5. logs only safe operational details;
6. never returns other lead data.

## Vibe-coding guardrails

- Treat generated code as a draft; inspect every authentication rule, database policy, and environment variable.
- Keep authorization in database policies, not hidden buttons or editable browser state.
- Never rely only on client-side validation.
- Apply migrations to a test project before production and verify both allowed and denied access.
- Review dependency additions before installing them. Remove packages that are not used once the integration plan is settled.
- Rotate a secret immediately if it is committed, exposed in a screenshot, or pasted into chat.
