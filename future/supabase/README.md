# Optional cloud saves, deferred

The user chose browser saves after the free-project quota blocked project creation. No new Supabase project exists, no charge was authorized, and no production connection is configured. The current game has no backend. Do not reuse unrelated projects.

When the user chooses a free available project later, review current Supabase documentation, apply `schema.sql`, enable an appropriate sign-in method, and configure allowed redirect URLs for the existing Sites domain. Install the official JavaScript client then. Only a publishable key belongs in the browser; never use a secret/service key.

Persist the sanitized `Journal` payload for the authenticated user. Validate imported data with `sanitizeJournal`, and use the user's `auth.uid()` as the row key. Read/write only the user's row under RLS. Offer an explicit local-versus-cloud conflict choice before replacing progress. Continue to support local saves and journal export when offline.

Example future operations after authentication:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;
await supabase.from('field_journals').upsert({
  user_id: user.id,
  journal: sanitizeJournal(localJournal),
  updated_at: new Date().toISOString(),
});
```

This preparation is not a tested cloud integration. The SQL has not been executed.
