# Weekly review draft: 12-18 October 2026

Prepared with `skills/fowt-paper/SKILL.md` and `skills/fowt-news/SKILL.md`. Work remains uncommitted on `content/weekly-2026-10-18`; no push, PR or production publication is authorized for this task.

## Research - partial collection

The existing deterministic OpenAlex pipeline was run twice for the exact week. Both attempts returned 201 raw records, deduplicated to 84 candidates: 16 Relevant, 15 Possibly Relevant and 53 Not Relevant. Five pages succeeded; two continuation pages returned HTTP 401. Three keyword queries completed and two were partial. The configured collection cap was also reached. No credentials, API behavior, scoring weights or ranking rules were changed to work around the errors.

The five selected records are the first eligible outputs under unchanged `research_selection_score_v1`, with all metadata and abstracts preserved from the pipeline. The saved pool is retained from this current collection, not a reconstruction claimed to reproduce an original historical pool. Candidate count and rank describe only the successfully obtained subset, not complete weekly coverage. Missing pages and indexing lag could affect the selection. The existing candidate-page note visibly states this limitation.

| Rank | Research output | Publication date | Score |
|---|---|---|---|
| 1 | [Safety evaluation of large-scale floating wind turbines under extreme typhoon-wave conditions](https://doi.org/10.1016/j.oceaneng.2026.128717) | 2026-10-14 | 92 |
| 2 | [Experimental assessment of engineering models with CFD derived heave hydrodynamic coefficients for a shallow draft barge-type floating wind turbine](https://doi.org/10.1016/j.oceaneng.2026.128595) | 2026-10-15 | 90 |
| 3 | [Data-Driven Surrogate-Model for Real-Time Loads Prediction in Floating Wind Farms](https://arxiv.org/abs/2610.18264) | 2026-10-13 | 90 |
| 4 | [Quantifying the motion–fatigue trade-off in low-frequency surge of semi-submersible floating offshore wind turbines via energy-to-stiffness scaling](https://doi.org/10.1016/j.oceaneng.2026.128800) | 2026-10-17 | 89 |
| 5 | [Effects of wind-wave misalignment on motion responses of a floating wind turbine with a shared-anchor mooring system](https://doi.org/10.21278/brod78104) | 2026-10-14 | 87 |

One selected output is an arXiv preprint; its repository venue remains explicit. No journal status or peer review is inferred. `checkedResultCount` is 84. The website digest is copied byte-for-byte from the pipeline publication artifact after setting this count.

## Engineering

All 42 approved registry domains were searched for the weekly window. Live indexes, individual pages and primary follow-ups were reviewed where the discovery results justified them. Results are a bounded manual review, not an exhaustive global scrape.

Retained reviewed inventory: 14 source records; 10 in-window; 8 eligible floating-wind factual records; 4 duplicate reports removed; 4 independent candidates. Seven registry discovery sources have retained review records, including exclusions; 35 have no verified weekly record retained. This does not establish publisher inactivity.

Only four independent developments passed date, relevance and source-scope review. All four are selected under unchanged `engineering_selection_score_v1` and the existing diversity layer; no fifth item is added merely to fill the limit. Three use primary announcements. France AO10 uses dated trade reporting plus the older official CRE tender page. Primary follow-ups outside the registry are linked to their original registry discovery sources, not counted as extra registry attempts.

| Rank | Highlight | Publisher | Score |
|---|---|---|---|
| 1 | [Tokyo Gas secures ClassNK design approval for 15 MW WindFloat TC](https://www.tokyo-gas.co.jp/news/press/20261013-01.html) | Tokyo Gas | 41 |
| 2 | [UK report assesses castings and forgings demand across offshore wind](https://owgp.org.uk/insights/news/new-report-reveals-14-billion-opportunity-for-uk-castings-and-forgings-in-offshore-wind) | Offshore Wind Growth Partnership | 37 |
| 3 | [Celtic Freeport approves seed funding for floating-wind port infrastructure](https://www.celticfreeport.wales/the-celtic-freeport-approves-seed-capital-investment/) | Celtic Freeport | 33 |
| 4 | [France closes AO10 bid window, including about 5 GW of floating wind](https://www.offshorewind.biz/2026/10/15/bidding-period-closes-for-10-gw-french-offshore-wind-tender) | offshoreWIND.biz | 19 |

### Scope and exclusion decisions

- Tokyo Gas announced the AiP on 13 October; Principle Power and Energy Global covered it on 15 October. One event is counted. Design approval is distinct from an installed turbine, project order or full project certification.
- CRE confirms the AO10 submission phase is closed and the deadline was 12 October at noon. Its original 20 May publication date is preserved in supporting provenance. Tender closure does not establish bidder identities, winners or FID.
- Celtic Freeport total funding covers four projects, including general business units. Floating-related port allocations are identified separately. Grant conditions and funding arrangements remain outstanding.
- OWGP headline estimates cover the wider offshore-wind sector, including floating applications. They are not presented as floating-only orders or guaranteed market value. The news release and resource page give different employment estimates, so no jobs figure is reproduced.
- The Wind Systems connection article is supplier-authored commentary without an independently established new weekly milestone; it is excluded from the event pool. Bellrock coverage is actually dated 14 September.
- Bretagne Ocean Power and the reviewed DNV announcement are dated 8 October and 7 October respectively, outside the weekly window. Floating nuclear technology is excluded from FOWT coverage.
- The Carbon Trust IMRCI invitation is dated 2 October, despite a 16 October clarification deadline. It is outside the window and the tender has restrictive reuse conditions; no tender body is retained.
- ClassNK direct-site access failed, but the Tokyo Gas and Principle Power primary announcements independently establish the AiP event.

## Validation

- Pipeline pytest: 210 passed.
- Static data validation: passed.
- Website data / selection tests: 88 passed, including Research ordering/selection consistency and regenerated Engineering scores.
- ESLint and production build passed: 427 static pages.
- Chromium smoke suite: 4 passed in 19.0 seconds.
- Homepage, both new editions, both candidate pages and all five new paper detail routes returned HTTP 200. The new Research candidate page contains the partial-collection warning.
- `git diff --check` passed.
- Local preview: http://127.0.0.1:3001/

## Change boundary

Three new JSON files, registration in the three existing adapters, the existing retained-week/count test fixture and this audit only. No prior editions, research metadata, Project / Industry / Digital & AI datasets, application behavior, source registry, scoring model, dependencies or architecture were changed.
