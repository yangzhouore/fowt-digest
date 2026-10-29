# Private analytics dashboard

## Scope and acceptance

The owner-requested exception to the static-site boundary is limited to
`/admin/analytics`. Public pages retain static rendering. Implementation uses
server components, scoped authentication, live read-only provider queries and
no database, snapshots or public analytics endpoints. Success means blocked
anonymous access, safe unavailable states, accurate provider reporting windows,
country-only location and passing the full repository validation baseline.

## Configuration and authentication

Copy `web/.env.example` to `web/.env.local` for local use, or set the same keys
in Vercel project environment settings and redeploy. Never commit real values.
Use HTTPS in deployment. Local HTTP is for loopback development only.

- `ADMIN_ANALYTICS_USERNAME`: owner login, without a colon.
- `ADMIN_ANALYTICS_PASSWORD`: unique random password, at least 32 characters.
- `VERCEL_TOKEN`: access token authorized for the project.
- `VERCEL_PROJECT_ID`: project ID from Vercel project settings.
- `VERCEL_TEAM_ID`: required for team-owned projects; omit for personal projects.
- `GITHUB_TOKEN`: fine-grained token scoped to this repository with
  **Administration: read**; its owner must have repository push/write access.
- `GITHUB_OWNER`, `GITHUB_REPO`: repository owner and name, separately.

HTTP Basic authentication uses the browser's native prompt. There are no auth
cookies or client-side tokens. Missing/weak auth configuration fails closed.
Next.js Proxy challenges requests; the server page checks credentials again
before any provider call. Comparisons use constant-length SHA-256 digests and
timing-safe comparison. Responses disable caching, indexing, framing and referrer
disclosure. Browser credentials can remain cached: close the browser/private
window when finished; rotate the environment password and redeploy to revoke it.
Use a strong password and Vercel Firewall rate limiting on this route for an
internet-facing deployment. This intentionally has no multi-user account system.

## Sources and reporting

The authenticated server loads Vercel's official visits aggregate API and GitHub's
four traffic endpoints with `cache: no-store`, timeouts and fixed upstream hosts.
Only normalized allowlisted fields render. No raw API error body is displayed.
Each source can fail independently; unavailable metrics show a dash, never zero.

Vercel: visitors, page views, daily visitors/page views, top paths, referrer
hostnames and country aggregates. The range is 7, 14 or 30 UTC calendar days,
including today's partial day. Production data only. Period visitors come from
an unbroken production-environment aggregate, never a sum of daily uniques.
Plan/reporting-window restrictions show an unavailable state; longer history
cannot be manufactured. Tables show at most ten returned groups plus provider
Others. Visitor counts across groups/days are not additive.

GitHub: views, unique visitors, clones, unique cloners, daily traffic, top
referrers and popular paths. GitHub provides only the trailing **14 days** and
up to ten referrers/paths. This range is independent of the website selector.
Totals are returned directly, not recalculated unique users. No historical
snapshots are stored. Counts may update at different times upstream.

## Enabling Vercel Web Analytics

Enable Analytics in the Vercel project's Analytics tab, provide the project/team
identifiers and token above, and verify API access for your account/plan. The
root layout includes the official `Analytics` component from
`@vercel/analytics/next`. Enable Web Analytics, then deploy this version and visit
public pages to begin collection; historical traffic is not backfilled. No
collector credentials or `NEXT_PUBLIC_` secrets are required. No custom events,
Speed Insights, tracking cookies, session replay or application IP collection
are added. The private dashboard and authentication are unchanged.

Vercel uses a daily visitor hash and documents geography including region/city
in its standard collection. The SDK does not provide a country-only storage
setting: this dashboard queries and displays country aggregates only. Provider
storage must not be described as country-only. Account access and live collection
remain to be confirmed after deployment; provider credentials are absent locally.

References: [Vercel API guide](https://vercel.com/docs/analytics/web-analytics-api),
[aggregate API](https://vercel.com/docs/rest-api/web-analytics/aggregates-page-views),
[Vercel setup](https://vercel.com/docs/analytics/quickstart),
[Vercel privacy](https://vercel.com/docs/analytics/privacy-policy),
[GitHub traffic API](https://docs.github.com/en/rest/metrics/traffic).

## Privacy and local verification

The application does not explicitly collect, store, log or display raw visitor
IPs. Country codes are the only accepted dashboard location dimension; city,
region, coordinates, user agents and arbitrary extra report fields are discarded.
Vercel's standard collector behavior is described above. IP-like labels are removed,
paths drop queries/fragments, and referrers are hostname/text labels only.
No snapshots, cookies, session replay, cross-site tracking or third-party sources
are added. Hosting/access-log retention remains a separate platform setting;
do not enable request-header logging containing Authorization.

After configuring auth: `cd web; npm.cmd run dev`, then visit
`http://localhost:3000/admin/analytics`. Missing provider keys deliberately show
configuration instructions. `npm.cmd run test:admin` uses fixtures;
`npm.cmd run test:smoke` starts a dedicated production server on port 3100 with
test-only auth and blank provider credentials. CI needs no production secrets.

Local acceptance on 2026-10-29: 210 pipeline tests, all static data validators,
172 data tests, 10 admin tests, lint, production build and all 24 Chromium smoke
tests passed. The build preserves 454 public static pages; only the admin page
is dynamic. Live provider authorization and account reporting availability were
not tested because local credentials are absent. No commit, push or PR created.

Collector follow-up acceptance on 2026-10-29: `@vercel/analytics` 2.0.1 installed;
210 pipeline tests, all data validators, 172 data tests, 10 admin tests, lint,
production build and 24 Chromium smoke tests passed. The exact set of 454
prerendered routes is unchanged. Browser inspection confirmed the deferred
Next.js SDK script and queued page view with a stubbed hosted script and no
cookies. Browser bundles contain no private auth/provider configuration. Admin
implementation files and the pre-existing `next-env.d.ts` bytes are unchanged.
The sandboxed browser run completed its assertions but stalled in server
shutdown; the rerun with Windows process permissions exited successfully.
The known public-reader `NoFallbackError` diagnostic recurred with passing
assertions. Actual hosted intake and live provider data remain unverified until
Web Analytics is enabled, this version is deployed and credentials are configured.
