# Design System v1.7

Floating Wind Digest is a weekly intelligence publication. The visual character
is clean, technical, editorial, premium, quiet, and evidence-led. Use hierarchy,
legible metadata, and accessible navigation to make source-backed work easier
to read and verify.

## Tokens

| Token | Light | Dark |
| --- | --- | --- |
| Canvas | `#F8FAFC` | `#0F172A` |
| Surface | `#FFFFFF` | `#172338` |
| Ink | `#0F172A` | `#F1F5F9` |
| Accent | `#2563EB` | `#93C5FD` |
| Muted | `#64748B` | `#A8B6CA` |
| Border | `#E2E8F0` | `#34445B` |
| Selected | `#DBEAFE` | `#233F66` |

Use an **8px spacing base**, **12px radius**, **1px borders**, and **150–200ms**
transitions for interaction states. Honor reduced-motion preferences. Use Ink
for normal text on Selected. Border is for quiet separators. Use a stronger
boundary wherever a control depends on it for identification. Text and
meaningful controls must meet applicable WCAG AA contrast.

Use local Geist or Inter when available and a system sans-serif fallback.
Support Simplified Chinese with local CJK fallbacks including PingFang SC and
Microsoft YaHei. No external font request is required. Allow both languages to
wrap without clipping or truncating meaningful labels and headlines.

## Shell and navigation

- Keep the wordmark, small floating-wind mark, language controls, and
  Preferences in the top bar. The desktop Search entry links to `/search`.
  Search remains in both the sidebar and mobile menu. Theme changes apply to
  the complete shell and content.
- Keep Briefing, Explore, Search, and Subscribe in the primary navigation.
  Projects, Companies, Industry, and Digital & AI form the Explore group.
- At wide widths use the sidebar. Below 960px use one non-modal navigation
  disclosure. Reassess this breakpoint if the reading column or utility controls
  no longer fit. Check 320px, 390px, both sides of the breakpoint, and desktop.
- Use the Selected surface for route-family membership. Use `aria-current="page"`
  only for a link whose destination is the current page.
- Keep one main landmark per route, real links, visible keyboard focus, and a
  single document scroll. The mobile menu closes after link activation and
  returns focus to its trigger when dismissed with Escape.
- The footer provides Engineering and Research archives, Methodology, and
  About. Keep specialist content within its existing reading widths.

## Content surfaces

Prefer readable lists, headings, and quiet dividers. Use a Surface with a
border for a lead or grouped content when it clarifies hierarchy. Preserve
original headlines, metadata, and citations when localizing surrounding UI.
Avoid decorative gradients, glassmorphism, excessive shadows, decorative
animation, generic SaaS dashboard widgets, fake actions, and arbitrary colors.

## Editorial images

The homepage masthead presents the briefing title, date range, and edition
counts. Verified editorial imagery belongs within the Engineering Lead Story.

Images require reviewed provenance. Attach an approved image to an exact
canonical item or entity. Record what it depicts, the original source, credit,
reuse terms, and descriptive English and Simplified Chinese alt text. Keep
image credit separate from the story citation. Prefer optimized committed local
assets with known dimensions and responsive loading. Use a stable frame, and
crop only when the crop preserves essential context.

Without a verified image, use a complete text-first presentation. Exclude
scraped images, AI depictions of actual events, and unsourced stock used as
evidence. The homepage registry lives in `web/app/editorial-images.ts` and
keys each record by edition slug and briefing item ID. Commit approved
derivatives under `web/public/editorial/`. The first selected Engineering item
remains the lead regardless of image availability.
