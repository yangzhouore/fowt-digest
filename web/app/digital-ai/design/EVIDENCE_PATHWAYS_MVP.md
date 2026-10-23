# Digital & AI: internal evidence reader and pathway comparison

Date: 2026-10-23. Base: main `b409213` (merged practical-card PR #46).
Branch: `feat/digital-ai-evidence-pathways`.
Authority: the user requested recommendations 2 and 3 and explicitly waived
another implementation approval gate. Leave the final PR open for manual merge.

## Objectives and success criteria

1. Read any of the existing 14 Signals inside the site: understand the stored
   finding, sector relevance, recorded maturity, provenance and claim boundaries
   before choosing to open an external source.
2. Compare four wind-to-compute pathways without mistaking a conceptual physical
   route, renewable procurement or component research for a deployed FOWT-AI system.

Keep static architecture, English/Chinese fixed copy, existing visual language,
the ten practical cards, authoritative records and unrelated product areas.
No new Signals, papers, project/company relationships, collection, backend,
runtime AI, automatic translation, prices, feasibility scores or savings claims.

## Design

### Recommendation 2: evidence reader

- Generate 14 static `/digital-ai/signals/[slug]` pages; unknown slugs return 404.
- Add internal reading links to practical cards, pathway evidence and the
  existing evidence drawer. Keep original-source links separately labelled.
- Show original record title, summary, sector connection, stored editorial
  relevance, evidence type, organisations, technology tags, geography and date.
- Label maturity as recorded for this dated example, not current audited status
  or an application-wide judgement. Do not interpret `sortDate` as publication.
- Show original source title/publisher, class, publication date or explicit
  unknown, stored access date and reuse note. Preserve original text and metadata.
- Reuse existing card source-review notes with their existing dates and EPROA
  availability caveat. New IEA/CORDIS notes have their own dated provenance.
  Source review does not upgrade maturity or update project status.
- State public-summary boundaries. Do not imply paper/full-text/private-document
  access. Separate explanatory workflows and stored editorial relevance from
  reported facts; no inferred project operating procedure.
- Related application/pathway links mean reading context, not proven deployment.
  Validated hash links select the exact application/pathway on return. Generic
  back-to-evidence opens the existing evidence drawer. No arbitrary URL targets.
- Localise fixed UI copy, including the evidence-drawer summary and empty state;
  keep original source-backed record text unless an explicit Chinese field exists.

### Recommendation 3: pathway comparison

Keep four choices, a selected explanation and a compact optional comparison table.
The table has semantic headings and a labelled horizontally scrollable container
on mobile; the page itself must not overflow.

```text
Power AI?
Physical supply and renewable procurement are different questions.
[Grid-connected land compute] [Coastal compute] [Offshore compute] [Flexible load]
    Selected pathway
    Illustrative physical route: wind -> connection -> compute
    Possible procurement arrangement (not a documented contract)
    Continuity / flexibility question
    Infrastructure and operating questions to resolve
    Evidence coverage and what it does not establish
    [Read supporting context inside this site]
[Compare all four pathways]
    Location | Physical route | Procurement | Continuity | Evidence coverage
```

Replace Established/Emerging/Experimental badges with evidence-coverage labels:
system context, no project example, or component context. These describe only
this collection. Coastal/offshore routes keep explicit empty states. IEA gives
electricity-supply/procurement context; FlexiWind gives wind-control context, not
proof of flexible compute/storage integration. Do not infer a named FOWT-powered
AI facility from either source. Compare questions and dependencies rather than
unsourced cost, efficiency, cooling or commercial-readiness rankings.

## Content and source boundaries

The 14 Signals and their adapter are unchanged. Keep new pathway explanatory copy
in independent static bilingual content with existing Signal/source references.
The IEA public energy-supply chapter explicitly separates physical and
contractual electricity mixes. Fraunhofer's FlexiWind page describes virtual
control evaluation. Both were rechecked on 2026-10-23. The CORDIS DTWO objective
was also rechecked for an evidence-reader note. No numerical findings are needed.
Other reader notes retain the practical-card source-review provenance, without
pretending all sources were re-audited in this MVP.

## Self-review and tradeoffs

Static detail routes give durable links, standard browser navigation and
server-rendered reading content without modal/focus-trap complexity. Fourteen
extra static pages are a small build cost. Original record text remains English
where no accepted Chinese version exists; label this boundary for Chinese readers.

Hash return links restore the chosen application/pathway, rather than inventing
source-to-project relationships. Filtered results are not embedded in URLs in
this MVP. Comparison uses bounded table scrolling to preserve row/column semantics
on mobile. Keyboard, focus, overflow and source-link distinctions require browser
checks. Evidence coverage labels avoid unsupported industry-wide maturity claims.

## Implementation and validation harness

1. Record this design/self-review before editing the app.
2. Implement the evidence reader and its internal navigation first.
3. Implement pathway content, selected detail and comparison.
4. Add meaningful content/reference/static-render tests to the existing data test
   command, and reader/navigation/comparison journeys to the existing browser suite.
5. Run the full baseline: pipeline tests, data validation/tests, lint, static build,
   browser smoke and diff checks. Review English/Chinese, 390px, light/dark,
   keyboard, deep links, 404s, runtime errors and screenshots.
6. Confirm protected Signals, papers and unrelated data are unchanged. Update the
   handover and implementation record. Commit/push, open a PR, verify exact-head CI
   and preview status, and leave manual merging to the user.

Acceptance requires all 14 reader routes, working internal links from all three
entry surfaces, source provenance without invented metadata, all four comparison
columns, explicit contextual/empty evidence states, and passing regression checks.
