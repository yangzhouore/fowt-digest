# Digital & AI unified guide: review and implementation

Started: 2026-10-27. Final validation: 2026-10-29.
Base: main `bb3b06a` (merged PR #50).
Branch: `feat/digital-ai-unified-guide`.
Scope and review findings: `UNIFIED_GUIDE_MVP.md`.

## Review outcome

The previous page stacked the broader AI × Energy guide in front of the original
wind application map. Two selectors and restarted section numbers left the reader
to connect the material. This change uses one sequence:

| Chapter | Reader question | How earlier and newer material connect |
| --- | --- | --- |
| 01 Understand | How do AI and energy affect each other? | Three relationships and two diagrams provide the shared foundation; glossary moves here. |
| 02 Apply AI | What task could a tool support? | Seven topics lead directly into the ten existing practical workflows. Reader/developer guidance and detailed examples share the same context. |
| 03 Supply computing | How could wind help supply a computing load? | A transition reverses the question from AI-for-energy to energy-for-AI. The four existing supply comparisons retain their assumptions and limits. |
| 04 Developments | What changed, and what does it mean? | Existing dated items link back to relevant topics rather than forming an isolated news list. |
| 05 Future | What could happen, under what conditions? | Existing conditional scenarios link to practical topics and relevant supply comparisons. |
| 06 Evidence | What supports what I just read? | The fourteen workflow/supply records and ten energy-system sources sit together, with their independent scopes and dates preserved. |

The standalone lifecycle map and its competing AI labels are removed. Task
buttons use the actual workflow titles. The useful underlying records remain;
deleting source evidence would not resolve the presentation problem.

## Explicit reading mappings

`guide-structure.ts` defines presentation-only mappings. Every workflow appears
once: weather → forecasting; wind project work → design screening, fabrication,
installation, control, condition trends and remote inspection; grids → generation
uncertainty; floating wind → mooring and cable condition.

Computing, hybrids and procurement retain system explanations and explicit
supply-context links where relevant. They do not borrow a wind example and imply
it demonstrates a different technology. Wind project work's fixed introduction
was adjusted to cover the mapped tasks; source-backed task records are unchanged.

Developments and scenario links mean related reading, not evidence of a deployed
integrated project. The original facts, dates, claims, scenarios and source
records are reused without a new external audit or updated source-access dates.

## State and navigation

`DigitalAiExperience` owns the field and workflow selection. Changing a field
selects its first task or clears the card for context-only fields. One workflow
card renders at a time. The language/perspective controls and native disclosures
retain their earlier behavior.

Legacy `#application-*` links select the parent field before rendering the task
anchor. Scrolling runs after that state is applied. `#energy-*`, `#pathway-*`,
the older application-section anchor and evidence-return links are retained.
Native anchors connect developments/scenarios to contexts; hash-change and
popstate listeners keep browser history in sync. They support browser
back/forward. A reader return opens the wind evidence catalogue inside the final
chapter. The energy-system provenance registry is separately labelled beside it.

## Validation

```text
python -m pytest pipeline/tests -> 210 passed
npm.cmd run validate:data -> passed
npm.cmd run test:data -> 174 passed
npm.cmd run lint -> passed
npm.cmd run build -> passed, 454 static pages
npm.cmd run test:smoke -> 25 passed
Focused desktop/mobile screenshot journeys -> 2 passed
Repeated deep-link/history journey -> 3 passed
git diff --check -> passed
Protected data/pipeline diff -> unchanged
```

Two new data tests check complete/non-duplicated mappings, valid news/scenario
destinations and actual bilingual page chapter order. Two new browser journeys
check the unified hierarchy, no stale task on topic changes, both evidence
collections, all ten legacy task deep links, contextual news links and browser
history. Existing assertions for evidence gaps, stored EPROA context, internal
readers, source URLs, keyboard controls, comparison scrolling, 404s and other
website areas remain. Workflow tests now navigate through their parent topic.

A final rerun exposed an intermittent first-fragment test failure: its trace
showed the requested fragment was absent from the resulting URL during initial
page hydration. The first deep-link test now enters from another route, matching
a reader return; subsequent task changes still exercise same-document fragments
and back/forward. No artificial delay, retry or weakened selection assertion was
added. Focused repeated verification and full-suite results are recorded here.

One later run reported approximately 1.7 days of elapsed time and ended with
timeouts in unchanged cross-site journeys. It was not accepted as a passing run;
final acceptance uses the fresh-server suite completed on 2026-10-29 instead.

Full topic-to-workflow screenshots were visually inspected in desktop English
and mobile Chinese, including expanded evidence. Existing browser journeys cover
light/dark themes and 390px overflow. Screenshots are local QA artifacts, not
golden-image comparisons. The known Next.js diagnostic for the deliberately
unknown reader route accompanies its expected HTTP 404; browser error assertions
pass.

## Remaining boundaries

No source-data changes, new engineering findings, research collection, runtime
AI, dependencies, API services or deployment automation are included. Unused
legacy global lifecycle styles are left in place to avoid unrelated shared-CSS
changes; that UI is no longer rendered. Industry-only acceptance was not rerun
because Industry is unchanged; the full baseline and shared cross-site browser
suite passed. Chromium checks do not certify all browser engines.

The final PR should remain open for manual review/merge. Local validation and
source provenance do not imply a passed remote CI/preview or a production deploy.
