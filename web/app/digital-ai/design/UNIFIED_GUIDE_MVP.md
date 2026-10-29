# Digital & AI: one coherent guide

Date: 2026-10-27. Base: merged main `bb3b06a` (PR #50).
Branch: `feat/digital-ai-unified-guide`.

The user authorizes reviewing, removing or adjusting previous Digital & AI
presentation so that the wider AI × Energy guide and earlier wind content form
one structured, logically clear experience. This replaces the earlier design's
requirement to retain a separate lifecycle-map presentation.

## Review findings

- Seven energy fields and ten lifecycle choices form competing entry points.
- Generic field explanations and detailed wind workflows are separated by a
  second overview; the practical examples feel like a different product.
- Old chapter numbers restart at 01/02/03 after the new introduction.
- The wind evidence catalogue appears before developments/future, while broader
  source provenance sits after them; their relationship is unclear.
- News and scenarios have sources but no explicit route back to explanatory
  topics, so the reader must reconstruct those connections.

## Outcome and plan

Use one six-chapter reading sequence and one page navigation:

1. Understand: three relationships, two flow diagrams and optional glossary.
2. Apply AI: seven-field selector with reader/developer perspective. Existing
   practical cards sit immediately after the selected explanation, grouped as
   weather (forecasting), wind project work (design, fabrication, installation,
   control, maintenance, inspection), grid planning, and floating systems
   (moorings/cables). Other fields retain wider context and explicit supply links.
3. Supply computing: four existing illustrative pathways with a transition from
   the same field questions; retain procurement/continuity/evidence distinctions.
4. Read developments: existing dated items with explicit related-topic links.
5. Investigate futures: existing conditional scenarios with links back to the
   relevant topic/supply option. No new predictions or claims.
6. Check evidence: wind Signal readers/filter catalogue and energy-context source
   registry together, with clear labels for the two independent collections.

Remove the standalone lifecycle-map UI and obsolete duplicated navigation/copy.
Keep ten useful workflow records and fourteen reader routes; the user permits
content removal, but deleting provenance would not improve coherence. Do not
rewrite the accepted source facts, update access dates, merge evidence records or
invent deployments. Static presentation mappings mean related reading only.

## Implementation and tradeoffs

One parent controller owns field/workflow selection. All ten workflows belong to
exactly one field; controls use practical task titles rather than AI labels.
Only the selected field's examples render, reducing simultaneous choices.
Existing `#application-*`, `#pathway-*`, `#energy-*` and evidence-return links must
still select the correct state and scroll to reachable content. One field should
never show another field's stale workflow. Keep keyboard focus, bilingual copy,
mobile layout and the current visual palette.

Separate context, scenario and source records remain authoritative. This task
reuses their accepted evidence; it does not claim a fresh external source audit.
No new dependencies, research collection, runtime AI or unrelated-section edits.

## Acceptance

- Exactly one ordered chapter navigation; no competing lifecycle map or restarted
  section numbering. Evidence follows developments and conditional futures.
- All seven topics and ten mapped practical examples reachable; task selection
  stays in the selected topic; explicit context-only gaps remain honest.
- Developments and future scenarios link to relevant explanation/supply contexts.
- Every legacy reader return/deep link opens the matching topic/workflow/pathway;
  evidence return opens the correct catalogue. Browser back/forward works.
- Source data stays unchanged. Test explicit mappings and actual rendered chapter
  order; adapt browser journeys to the unified reading flow without weakening
  existing evidence, keyboard, source-boundary or 404 assertions.
- Full baseline plus shared browser suite; inspect desktop/mobile English/Chinese
  and light/dark screenshots, focus and overflow. Update handover/implementation
  docs. Deliver an open review PR; no merge or deployment.
