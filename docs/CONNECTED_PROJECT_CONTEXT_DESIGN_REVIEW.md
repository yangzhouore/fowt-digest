# Connected Project Context: design review

Date: 2026-10-22.
Design: [CONNECTED_PROJECT_CONTEXT_MVP.md](CONNECTED_PROJECT_CONTEXT_MVP.md).
Base: `e88d325e5ed8fad6088b0cb287c8ad574d5ea102`.

Review type: implementation-agent self-review, not independent peer review or
user acceptance. Result at design time: ready for user review. The user accepted
the documented scope on 2026-10-22 ("yes please continue"); implementation may proceed.

## Existing implementation inspected

- Current entry/status docs and the merged PR #41 milestone.
- `docs/PRODUCT_VISION.md`: separate authoritative datasets and static presentation.
- Project/Engineering adapters and Industry catalogue types.
- Standard, Green Volt and fallback project layouts; expanded overview roles.
- Engineering item rendering and Industry's repeated company/category rendering.
- The six proposed Engineering items and their retained source text.
- Existing npm validation commands and all three CI jobs.

Observed baseline: 48 projects, 228 project-company role records, 92 non-null
Industry company associations across 30 company IDs, and 100 published
Engineering items. The six launch candidates cover four projects. These are
repository observations, not a fresh industry/source audit.

The Industry view renders 61 company cards for 47 distinct companies. Every
currently linked company ID has a rendered destination; duplicate occurrences
make canonical-anchor handling necessary.

## Findings and resolutions

| Finding | Design resolution |
|---|---|
| Recommendation No. 6 could expand into papers, search or a knowledge graph | Scope the first increment to Project/Engineering/Industry navigation; preserve paper data/pages |
| Shared companies or platform topics could produce false project links | Explicit curated association, retained source excerpt, known project identity and manual focus check |
| A mere project-name occurrence can be incidental | Necessary textual support plus manual confirmation of project-specific coverage; broad-sector articles are not automatic seeds |
| Linking old coverage could look like a current status update | Show source/edition dates and archival notice; preserve all assessment/review data |
| Engineering cards lack item-level destinations | Stable ID-based anchors on the existing edition pages |
| Industry repeats companies in several categories | One canonical anchor per company, unique per-occurrence disclosure IDs |
| Generic company roles could become implied procurement/delivery | Use exact existing role IDs, preserve recorded scopes/status and provenance |
| Green Volt lacks catalog-linked company relationships | Keep nulls unlinked; demonstrate Engineering navigation independently |
| Two handwritten directions would drift | Derive reverse links from the same mapping or accepted relationship records |
| Most projects have no selected Engineering story in the seed | Explicit empty states; no padded or inferred coverage |
| Date and source strings could drift after content maintenance | Resolve presentation from existing adapters and fail stale references/excerpts |
| Prior Windows test artifacts interfered with lint/browser cleanup | Keep pytest temporary output outside web and document environment-only adjustments |

## Scope controls

- No factual update or fresh project assessment is included.
- Link-review dates are editorial mapping metadata, not public-source inspection
  dates or assessment-review dates.
- A company backlink means an existing relationship record is present; it does
  not imply the same role exists on other projects or that current contracts exist.
- Research linkage is deferred explicitly; no paper applicability claims enter
  through the navigation layer.
- Six seeds are proposed from stored selected records only. The implementation
  must retain a record-by-record audit and expose any unsupported seed.
- No automatic dataset synchronization, collection, inference or ranking is added.

## User acceptance record

Accepted on 2026-10-22: Projects <-> Engineering coverage and
Projects <-> Industry entries, all 48 profiles with conservative empty states,
six initial Engineering associations and all existing valid company-ID roles.
The final delivery process remains full validation, final-head CI verification,
preview and an open PR for manual merge.

## Design-phase verification

- Started from a clean `main` at the recorded merged PR #41 base; created the
  dedicated feature branch before editing.
- Confirmed all six proposed seed projects, registered editions, selected item
  IDs, accepted names/aliases and supporting retained source text.
- Confirmed all 92 existing company-ID role records resolve to companies that
  are actually rendered in the Industry map.
- Confirmed both design documents exist and inspected the entry/status changes.
- `git diff --check` passed; only the two new design documents and their
  start/status pointers changed.
- No implementation, application/data changes, commits, pushes or PR creation
  occurred in this phase. Full tests/build/CI have not run for this proposed
  MVP; they are mandatory after accepted implementation.
