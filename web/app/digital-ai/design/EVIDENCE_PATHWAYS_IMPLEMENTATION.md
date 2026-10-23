# Digital & AI evidence reader and comparison: acceptance record

Date: 2026-10-23. Branch: `feat/digital-ai-evidence-pathways`.
Base: main `b409213`. The user authorised recommendations 2 and 3 without a
further implementation approval gate. Design/self-review was recorded first in
`EVIDENCE_PATHWAYS_MVP.md`.

## Delivered

Recommendation 2: all 14 existing Signals have static internal reading pages at
`/digital-ai/signals/[slug]`. Practical cards, pathway context and the existing
evidence drawer link to them; original-source links remain separate. Readers
show the unchanged record summary, offshore-wind connection, stored editorial
relevance, maturity, organisations/tags, evidence type and source provenance.
Unknown publication dates remain unrecorded, and event/period labels are not
inferred from sorting dates. Controlled identifiers are spaced for readability.

Public-source notes are separate from editorial relevance and illustrative
workflow cautions. The pages explicitly state that they do not provide full
papers or private project documentation. EPROA retains its earlier unavailable
source caveat. Existing source-note review dates are preserved. New CORDIS/IEA
notes have their own source references and review dates, not new project status.

Related reading links select the exact application/pathway on return, using
validated hash IDs. Returning to all evidence opens the existing drawer. The
drawer summary is bilingual and zero-result filters have a clear/reset action.

Recommendation 3: the four pathways now explain an illustrative physical route,
possible procurement arrangement, continuity question, infrastructure checks and
evidence boundary. Evidence-coverage labels replace broad readiness badges. The
flexible-load option is explicitly allowed to overlap with siting options.

A semantic comparison table is available in a native disclosure. Its labelled
scroll region supports keyboard horizontal scrolling at 390px, with sticky row
headings; the page itself does not overflow. No cost/efficiency rankings, named
contracts or integrated-system deployments were invented.

## Source review

Existing source URLs remain in unchanged `signals.json`:

- `src-iea-energy-ai`: reviewed the public **Energy supply for AI** chapter,
  especially physical versus contractual mix and renewable procurement. The new
  text uses system context, not a dedicated FOWT/AI contract or a load-flexibility
  deployment claim.
- `src-fraunhofer-flexiwind`: reviewed the project challenge/solution sections.
  Its virtual control work supports only wind-control context, not compute or
  storage integration.
- `src-cordis-dtwo`: reviewed the public project objective concerning a federated
  simulation/data architecture. Objectives remain distinct from operational proof.

These three pages were reviewed on 2026-10-23. Other reader notes reuse the source
review already recorded in the practical-card milestone; no fresh whole-dataset
status audit is implied. Coastal/offshore pathway evidence sets remain empty.

## Final local validation

```text
Python 3.14.5: python -m pytest pipeline/tests -> 210 passed
npm.cmd run validate:data -> passed
npm.cmd run test:data -> 155 passed
npm.cmd run lint -> passed, no errors or warnings
npm.cmd run build -> passed
Static prerender manifest -> 445 routes, including all 14 Signal routes
npm.cmd run test:smoke -> 17 passed (32.2 seconds)
git diff --check -> passed
Protected-record diff -> unchanged
```

Python used the installed executable and a task-specific ignored test directory,
removed afterwards. Data CI now exercises the real static route and reader for
all 14 records, English/Chinese source boundaries, unknown slugs, note provenance,
and pathway content/reference completeness. Browser CI includes seven Digital &
AI journeys and the ten existing cross-site regression journeys. It covers all
ten cards, all four pathways, links from all three reader entry surfaces, exact
return selections, 404, keyboard disclosure/focus, horizontal table scrolling,
mobile Chinese/dark mode, filter reset and browser runtime/console errors.

The deliberately unknown slug returns 404; Next.js logs `NoFallbackError` for
that request. It does not affect the passing HTTP assertion or create a browser
runtime error. Theme controls retain the existing per-page header behaviour;
theme persistence across new routes is not added. Filter values are not encoded
in return URLs.

Four new screenshots were visually inspected in ignored `web/test-results/`:
English desktop reader and comparison, Chinese mobile/dark reader and comparison.
The existing practical-card screenshots/regression checks also remain available.

Original Signals, adapter and use-case data, papers, pipeline, Projects, Industry
and Engineering/Research data are unchanged. No dependencies, shared styling or
CI workflow changes were required. Root handover docs record the merged cards and
current feature separately. The final PR description records exact-head CI and
preview status. Leave merging to the user.
