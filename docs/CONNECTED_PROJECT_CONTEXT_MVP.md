# Connected Project Context MVP

Status: accepted by the user on 2026-10-22; implementation in progress.

Acceptance: user replied "yes please continue" to the documented objectives,
design, self-review and scope. No scope changes were requested.

Prepared: 2026-10-22.
Branch: `feat/connected-project-context-mvp`.
Base: `e88d325e5ed8fad6088b0cb287c8ad574d5ea102` (merged PR #41).

Design self-review: [CONNECTED_PROJECT_CONTEXT_DESIGN_REVIEW.md](CONNECTED_PROJECT_CONTEXT_DESIGN_REVIEW.md).

## 1. Objective

Implement the first increment of recommendation No. 6: help readers connect
related information across existing sections without assembling every connection
through separate searches.

A reader should be able to:

1. Move from a project to a specific, dated Engineering item about that project,
   and return to its profile.
2. Move from a recorded project participant to its existing Industry entry,
   then discover other project records for that same company.
3. Understand why a link exists and retain the distinction between historical
   coverage, a recorded supplier role, and the current project assessment.

## 2. Scope and assumptions

This increment connects Projects, Engineering and Industry. Papers, Research
data and pages remain unchanged, preserving the user's earlier instruction.
Research-topic reading paths can be a later explicitly approved scope; this MVP
does not imply that a project uses a paper's methods.

Include:

- All 48 project profiles, with honest empty states where no Engineering link is curated.
- Six initial project-specific Engineering associations across four projects,
  subject to a final record-by-record linkage audit during implementation.
- Bidirectional project/company navigation using every valid existing non-null
  `industryCompanyId` relationship: currently 92 role records across 30 company IDs.
- Stable Engineering item anchors and unique Industry company anchors.
- English / Simplified Chinese fixed UI, mobile and Light/Dark compatibility.
- Validation and browser coverage within the existing accepted CI commands.

Exclude:

- New papers, paper summaries, research interpretation or paper-page edits.
- Factual updates to Projects, public-evidence review records, Engineering
  editions, Industry company records, Digital & AI, or the research pipeline.
- New supplier-role inference, manual filling of currently null company IDs,
  new project assessments, or changes to review dates/FID/readiness.
- A global search engine, topic hub, new company-detail routes, maps, accounts,
  backend, AI writing, semantic matching, scoring, collection or automatic updates.
- General company news, policy or technology similarities presented as evidence
  of a project-specific relationship.
- A redesign of the homepage, navigation or existing archive search.

Tradeoff: initial Engineering coverage will be small. Existing records support
a useful four-project demonstration without inventing links for all 48 projects.
Company navigation is broader because explicit accepted company IDs already exist.

## 3. Evidence policy

### Projects and Engineering

A curated association requires:

1. An existing project and an existing published Engineering item in a registered edition.
2. A retained source record belonging to that item.
3. A short exact excerpt from its stored `sourceText` that identifies the project
   by its canonical name or an accepted alias, allowing case differences.
4. Manual confirmation that the item covers that specific project's event,
   activity or operating context. A passing name mention alone is insufficient.

The excerpt is a stored source-record extract, not a claimed verbatim quote
from a publication. Label it accordingly. Do not inspect private documents or
claim a fresh inspection of original publications merely to add navigation.

No runtime name/keyword matching may create relationships. Names, aliases,
company overlap, topic tags and scoring `projectGroup` values may help manual
discovery only. Shared company or platform technology does not prove that an
item is about a particular project, phase or lease area.

Link only published items, not candidate-pool-only material. A link does not
add the Engineering record to the project's authoritative evidence matrix or
update project facts, timeline, FID, readiness or assessment review dates.

### Projects and Industry

Use the existing project relationship's exact `industryCompanyId`. Do not infer
an ID from name similarity, a corporate group, company website, technology,
FEED activity or an Engineering article. Keep null IDs unlinked.

Retain every relevant relationship's role, status and evidence scope. A past
role stays historical; a selected technology stays selected. Industry placement
does not imply a new manufacturing contract, delivery or endorsement.

## 4. Reader-facing design

### Project detail: Engineering coverage

Add one compact section after `What to watch next` and before the material
timeline. Use the same component in standard and Green Volt variants; support
the fallback profile without intelligence.

```text
Engineering coverage
Published coverage may predate the current assessment.

[Stored Engineering title]
Source date: [date] · Briefing week: [week]
Project-specific coverage · [Publisher]
[Read Engineering item]   [Why this link?]
```

- Use original titles and source/edition dates; create no new news summaries.
- Show up to three records initially, newest supporting-source publication date
  first, then edition date and item ID as deterministic tie-breakers. This is
  chronological navigation, not a new relevance/importance ranking.
- Put further records behind `Show all linked coverage (N)`; no silent truncation.
- `Why this link?` reveals the fixed association type, supporting stored excerpt,
  publisher and original source link. Avoid exposing internal IDs or JSON paths.
- An empty project section says `No project-specific Engineering coverage linked`.
  It does not say no news or activity exists.
- Preserve the current assessment-review strip, public-evidence matrix and
  distinction between source dates and assessment dates from PR #41.

### Engineering item: linked project

- Add a stable ID to each published item: `item-${briefingItemId}`.
- Add `Project context` links below its existing explanation/source area only
  when curated associations exist. Use the project's canonical name and link
  directly to the profile.
- Links are bidirectional from the same mapping. Do not maintain a second
  handwritten reverse dataset.
- Keep the item text, source, category, selection scores and ordering unchanged.
- Give the hash-targeted item a restrained highlight and suitable scroll margin.

### Project participants: Industry navigation

- For a participant with a valid existing company ID, add an `Industry entry`
  link beside the recorded role, including the expanded overview's Verified
  Project Roles and all three project-detail variants.
- Keep company names, external source links, selection/contract scope and
  current/historical labels intact. Do not turn every company name into a new link.
- A null company ID receives no Industry link and no fabricated match.
- Green Volt has no currently catalog-linked company roles; its new Engineering
  link must not manufacture an Industry match for Flotation Energy or Worley.

### Industry entry: linked project records

- Add a canonical `company-${companyId}` anchor to the first rendered occurrence
  of each company in the existing map. Companies can appear in several categories;
  later occurrences must not reuse the same HTML ID.
- Project links land at that visible company summary; the reader can expand it.
  Do not require a new company page or runtime data collection.
- Within company details, show `Project records (N)` with project names and
  role/status context derived from the existing relationship records.
- Group by project, retain all supported roles/scopes, and sort project names
  alphabetically. Show three projects then an accessible expansion for the rest.
- Provide the same contextual project list in repeated category appearances,
  with unique disclosure/label IDs for each occurrence.
- Existing external company website/source links remain available.
- Missing relationships mean `No linked project records`, not no sector involvement.

### Language, accessibility and layout

Translate fixed labels, link-type explanations and empty-state notices. Keep
source titles/excerpts, proper names and factual role details in their original
language unless explicit translations already exist. Preserve independent language
and theme controls. New disclosures and links must work by keyboard; long names
and excerpts must wrap at mobile widths. No new dense index column is added.

## 5. Initial curated Engineering links

These are proposed launch records found in committed selected content. The
implementation linkage audit must confirm each exact source excerpt and identity.

| Project ID | Edition | Published Engineering item ID |
|---|---|---|
| `eolmed` | 2025-12-14 | `eng-item-2025-12-14-01` |
| `efgl` | 2026-05-10 | `eng-item-2026-05-10-01` |
| `efgl` | 2026-07-19 | `eng-item-2026-07-19-01` |
| `efgl` | 2026-07-19 | `eng-item-2026-07-19-02` |
| `green-volt` | 2026-07-26 | `eng-item-2026-07-26-05` |
| `pentland-floating-offshore-wind-farm` | 2026-10-11 | `eng-item-2026-10-11-pentland-anchor-engineering` |

All other project/Engineering associations remain absent initially. Do not pad
coverage. Adding further links belongs to explicit source-backed curation.
Reject a proposed seed if its record cannot support it, and report the acceptance
shortfall rather than silently replacing it or changing original content.

## 6. Data and architecture

Add `web/data/context/project-engineering-links.json` with schema version
`project-engineering-links.v1` and a `links` array. Each record contains:

| Field | Contract |
|---|---|
| `id` | Unique stable association ID |
| `projectId` | Exact existing project ID |
| `editionSlug` | Registered Engineering edition |
| `briefingItemId` | Published item in that edition |
| `basis.type` | Only `project_specific_coverage` in this MVP |
| `basis.sourceRecordId` | Source record explicitly referenced by that item |
| `basis.storedExcerpt` | Non-empty short exact substring of retained source text |
| `basis.projectMention` | Canonical project name or accepted alias, matched case-insensitively inside the excerpt |
| `mappingReviewedOn` | Actual manual linkage-review date; never an assessment-review date |

Resolve original titles, dates and publisher from existing adapters. Do not
copy titles/summaries into the mapping or store arbitrary navigation URLs.
Derive routes and reverse links deterministically from validated IDs.

For project/company navigation, derive both directions from existing
`projectCompanyRelationships` and the company catalogue. Add no competing
company-role graph or new relationship facts. Dedupe display by project while
retaining all of that company's relationship scopes and source references.

Keep dependency direction one-way: the navigation resolver consumes existing
adapters/datasets; authoritative adapters do not import the resolver. Avoid
circular dependencies or bundling entire datasets into client-only controls.

## 7. Acceptance criteria and harness

| ID | Required outcome | Verification |
|---|---|---|
| AC1 | Papers/Research, pipeline and all authoritative datasets, including public-evidence reviews, are unchanged | Compare protected paths/hashes against the recorded base |
| AC2 | Six audited Engineering links resolve for the four proposed projects, with honest empty states elsewhere | Mapping validator, linkage audit and rendered pages |
| AC3 | Missing/duplicate IDs, wrong edition/item/source, unsupported basis, altered excerpt, unknown alias and invalid/future mapping dates fail validation | Negative validator fixtures |
| AC4 | Automatic name/topic/company matching creates no associations; reverse links come from the same records | Resolver tests with false-positive and unlinked fixtures |
| AC5 | All existing valid company-ID roles support both directions; null IDs remain unlinked; historical/selected scopes remain intact | Relationship/role regression cases and complete baseline comparison |
| AC6 | Engineering item and company anchors are unique and point to visible targets despite repeated company categories | Rendered DOM tests and browser navigation |
| AC7 | Dates and linked coverage do not change current assessments or claim recency/completeness | Adapter/record comparison and editorial review |
| AC8 | EN/Chinese, keyboard, mobile, long names, empty states, multi-role companies and Light/Dark work | Browser tests and desktop/mobile visual review |
| AC9 | Full accepted validation plus browser smoke passes locally and all applicable CI passes on the final PR head | Command logs, head SHA and check URLs |
| AC10 | Final PR is left open for the user to merge manually | PR state and clean working-tree verification |

Add tests to existing `validate:data` / `test:data` commands. Browser tests must
follow Project -> exact Engineering item -> Project and Project role -> Industry
entry -> other recorded project, including duplicate-company anchor handling.
Check link targets without depending on third-party source availability.

Full implementation validation:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
npm.cmd run test:smoke
cd ..
git diff --check
git status --short
```

On this Windows environment, use the installed Python executable if the alias
fails and place pytest temporary output outside `web/` so ESLint, TypeScript and
Playwright do not scan/delete those fixtures. Use separate writable browser output
if needed; record exact commands and permission constraints. Do not weaken CI.

## 8. Delivery gates

1. Draft objectives/design and self-review: documentation phase only.
2. Obtain explicit user design acceptance and record any scope adjustments.
3. Implement mappings, links, anchors and validation; audit all six seeds and
   role-preserving company navigation without rewriting underlying records.
4. Run acceptance checks, visual review, scope/diff inspection and fix failures.
5. Commit focused changes, push the feature branch and create the final PR.
6. Verify all applicable CI on the final head, provide the preview link and
   evidence log, and leave the PR unmerged for the user.

Do not treat the request to start the next MVP as acceptance of this newly
proposed design. Implementation starts only after the user accepts the scope.
