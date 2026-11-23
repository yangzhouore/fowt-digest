# Subscribe MVP

The public intelligence pages, Global Search, and Subscribe page shells are
statically rendered. Subscribe's two Next.js handlers use Neon Postgres over
HTTPS and the Resend Email API at request time. They read accepted content
through the existing adapters. Only Subscribe persists preferences, sends
emails, and runs a weekly schedule. Research collection, ranking, review,
and publication stay in their existing workflows.

## Production setup

1. Create a Neon Postgres database and apply
   `web/subscribe/migrations/001_subscribe.sql` once, for example in the Neon
   SQL Editor. The migration creates `subscribers` (identity, status, locale,
   preference flags and canonical company IDs), `subscription_confirmations`
   (requested preferences, hashed token, expiry and consumption time), and
   `subscription_deliveries` (product, week, edition or period key, selected
   companies and included item IDs, outcome and provider message ID). Use a
   separate database or branch for any preview deployment.
2. Verify a sending domain in Resend, add its DNS records, and create an API key
   with sending access. Keep click and open tracking disabled on the sending
   domain. In particular, link rewriting can interfere with token fragments.
3. Set these server-only Vercel variables in the production environment. Give
   preview deployments a separate setup if they are intended to send mail.
   Ordinary builds and public browsing work without these variables. All six
   settings are required for Subscribe to accept requests. Hosted site origins
   use HTTPS. The two secrets use visible ASCII without whitespace.

| Variable | Value |
| --- | --- |
| `SUBSCRIBE_DATABASE_URL` | Neon Postgres connection string with TLS |
| `RESEND_API_KEY` | Resend key with sending access for the verified domain |
| `SUBSCRIBE_FROM_EMAIL` | Verified sender, such as `Floating Wind Digest <digest@example.org>` |
| `SUBSCRIBE_SITE_URL` | Public HTTPS origin, with no path, credentials, query, or fragment |
| `SUBSCRIBE_TOKEN_SECRET` | Independent random secret of at least 32 characters used to sign management links |
| `CRON_SECRET` | Separate random secret of at least 32 characters sent in Vercel's Bearer authorization header |

Enable Cron for the Vercel project rooted at `web/`. The schedule in
`web/vercel.json` calls `GET /api/subscribe/weekly` Mondays at 18:00 UTC, after
the normal weekly publishing window. Vercel invokes the job on production
deployments. Retain the same management secret across deployments to preserve
existing links.

Provider references for [Neon’s HTTP driver](https://neon.com/docs/serverless/serverless-driver),
[Resend’s send endpoint](https://resend.com/docs/api-reference/emails/send-email),
[Resend’s idempotency policy](https://resend.com/changelog/idempotency-keys), and
[Vercel Cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

## Confirmation and preferences

`/subscribe` posts the product choices and canonical company IDs to the
same-origin `POST /api/subscribe` handler. The handler validates inputs and
uses parameterized queries. Email addresses are trimmed and lowercased while
keeping dots and plus tags. The atomic confirmation reservation allows one
email per normalized address every 30 minutes. During that interval a repeat
request gets a wait message. Once a later request is reserved, it replaces the
previous pending token. The inbox acknowledgement requires a provider ID and
a persisted send timestamp on the current request. Responses do not disclose
whether an address already has an active subscription.

A confirmation link contains a 256-bit random token in the URL fragment. The
database keeps only its SHA-256 hash. The recipient must press Confirm on
`/subscribe/confirm`. An atomic database statement consumes the unexpired
token with a recorded send and applies the pending preferences. Tokens expire after 24 hours, and
weekly processing deletes expired requests. An older pending request cannot
reactivate a subscriber who subsequently unsubscribed.

`/subscribe/manage` accepts a bearer link signed with HMAC-SHA-256 and bound
to a random subscriber ID and management version. It supports loading and
saving preferences and permanent opt-out until the address is confirmed
again. Confirmation and unsubscribe rotate the management version and
invalidate earlier links. The pages remove the fragment after reading it.
The pages use `Referrer-Policy: no-referrer` and load same-origin assets.
Opening a link by itself does not confirm a subscription or trigger an
unsubscribe. To reopen a management page after a reload, use the original
email link. Weekly emails include both management and unsubscribe links.
The initial verification message links to confirmation, which provides a
management link once verified. Subscriber email addresses are absent from
links. Application logs omit request bodies, raw tokens, and driver/provider
errors that can carry sensitive data.

## Weekly delivery and recovery

The previous completed Monday–Sunday **UTC** week determines the job period.
It starts Monday at 00:00 UTC and ends just before the following Monday at
00:00 UTC. Subscribers become eligible once the next delivery period closes
after their latest confirmation. A confirmation exactly at the closing
boundary belongs to the next period. Current preferences are read at delivery.

News and Research require the edition whose week-end slug equals that Sunday
and whose generation timestamp is no later than the run. News uses selected Engineering items,
their existing one-line summaries, and source links. Research uses selected
paper titles, authors, publishers, tags, and paper links. A missing or empty
current edition records a skip. Earlier editions and events are never
automatically backfilled. A recorded skip closes that subscriber's product
for the period, including on repeated runs.

Company Brief matches event publication dates inside that UTC week and explicit
canonical company IDs. It includes summary, category, retained original citations,
and verified project links. Each event ID appears once per brief, under the
alphabetically first selected canonical company on that event, with other
participating companies identified. A brief without any matches records a skip.

A unique database constraint per subscriber/product/edition or period and a
second constraint per subscriber/product/week guard delivery. A worker renders
the email before claiming the right to send. A local preparation failure is
recorded as retryable without contacting Resend. Resend receives a deterministic
idempotency key.
Successful requests store the provider ID and timestamp. Definite provider
rejections remain failed and can be retried with the same selected items during
the same week. Ambiguous sends and interrupted claims become uncertain and are
never automatically replayed. This avoids duplicates even after Resend's
idempotency window expires.

For operations, review the restricted delivery table for `failed`, `uncertain`,
and stale `sending` rows. Verify uncertain cases in Resend before taking any
manual action. The endpoint returns authenticated aggregate counts, uses
HTTP 503 for unresolved current-week work, and does not expose subscriber
details. Vercel does not automatically retry failed cron invocations. After
resolving a transient problem, an operator can call the same endpoint with
the cron Bearer secret within the same UTC week. Runs use a 30-second work
budget and a paced sender suited to a small initial list. If a run runs out of
time, a repeat invocation skips completed rows and continues. Unsubscribe
prevents new claims. A provider request already in flight may still complete.

## Local tests and safe rendering

Run `npm run test:subscribe` from `web/` to apply the SQL to an in-memory
PostgreSQL instance, exercise lifecycle and delivery behavior, and render the
HTML and text templates from committed data. The normal `npm run test:data`
also runs these tests.

After `npm run build`, `npm run test:smoke` starts a loopback-only Next.js test
server with an in-memory database and intercepted email requests. Browser tests
read a local fake mailbox under `web/.next/cache/`. No real email or production
credentials are used. The ordinary development and production commands do not
load the test fixture. Without configuration, the public pages still render
and subscription requests return a generic unavailable response.
