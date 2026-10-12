# Weekly publication audit: 5-11 October 2026

Skills: `skills/fowt-paper/SKILL.md` and `skills/fowt-news/SKILL.md`. Both editions cover the same completed publication window. No scoring model, weights, source registry, UI, project dataset or architecture changed.

## Research

The accepted pipeline collected 210 raw records, deduplicated them to 105 candidates, classified 19 Relevant / 18 Possibly Relevant / 68 Not Relevant, then selected five using `research_selection_score_v1`. Four keyword queries and seven pages succeeded, with no request failures. The configured collection cap was reached; coverage is bounded and indexing can lag. This is a retained pool from the current collection, not a reconstructed original historical pool.

Two selected outputs are supporting datasets hosted on Zenodo. They remain eligible under the existing workflow and are not relabelled as journal papers. No paper metadata, abstracts, conclusions, scores or selection decisions were rewritten. `checkedResultCount` is the actual deduplicated candidate count.

| Rank | Research output | Date | Score |
|---|---|---|---|
| 1 | [Supporting data for Mooring-Controlled Modal Interaction and Tower Degradation Observability in Floating Wind Turbines](https://doi.org/10.5281/zenodo.23262915) | 2026-10-09 | 95 |
| 2 | [Vibration control of floating offshore wind turbines using optimally designed negative stiffness absorbers](https://doi.org/10.1016/j.engstruct.2026.123867) | 2026-10-06 | 92 |
| 3 | [An empirical framework for predicting the design towing resistance for floating wind turbines with application on the design of towing system](https://doi.org/10.1016/j.oceaneng.2026.128569) | 2026-10-05 | 91 |
| 4 | [Supporting Data for "Multi-Objective Optimization of Bend–Twist Coupled Blades for Passive Load Alleviation in a Large Floating Wind Turbine"](https://doi.org/10.5281/zenodo.23164035) | 2026-10-05 | 91 |
| 5 | [CFD-based hybrid-fidelity aero-hydro-servo-elastic-mooring analysis for upscaling floating offshore wind turbines to 22 MW](https://doi.org/10.1016/j.oceaneng.2026.128422) | 2026-10-05 | 91 |

## Engineering

Discovery used exact-window domain searches across all 42 approved registry entries, followed by live-page primary verification. Search hits, snippets and out-of-window background pages are not represented as exhaustive publisher collection.

Retained review inventory: 27 source records; 25 dated in-window; 22 floating-relevant records; 13 duplicate/repeated-event reports removed; 9 independent candidates; five highlights selected by the unchanged `engineering_selection_score_v1` and diversity layer.

6 registry discovery sources produced retained records; 36 yielded no verified weekly item retained in this bounded review. A no-candidate outcome does not establish that no eligible story exists. Primary verification pages outside the registry are follow-ups to approved-source discoveries, not extra registry attempts. Eight candidate events use primary sources. Utsira Nord retains dated trade reporting supported by independently checked government budget text.

| Rank | Selected highlight | Primary publisher | Score |
|---|---|---|---|
| 1 | [SCGM and TFI Marine partner on SeaSpring mooring technology](https://www.scgm.co.jp/newsrelease/2026/10/%E6%B5%AE%E4%BD%93%E5%BC%8F%E6%B4%8B%E4%B8%8A%E9%A2%A8%E5%8A%9B%E7%99%BA%E9%9B%BB%E5%90%91%E3%81%91%E4%BF%82%E7%95%99%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%96%B0%E6%8A%80%E8%A1%93%E3%82%92%E6%8B%85/) | Sumitomo Corporation Global Metals | 46 |
| 2 | [GWEC sets out floating-wind commercialisation action plan](https://www.gwec.net/news/floating-wind-initiative-sets-out-industry-plan-for-accelerating-commercial-scale-projects) | Global Wind Energy Council | 42 |
| 3 | [Pentland collaboration targets anchor engineering and seabed investigation](https://subseamicropiles.com/2026/10/subsea-micropiles-secures-agreement-with-pentland-floating-offshore-wind-farm/) | Subsea Micropiles | 41 |
| 4 | [EnergyPulse reports 382 MW of operational floating offshore wind](https://www.renewableuk.com/energypulse/reports/energypulse-floating-offshore-wind-pipeline-report-october-2026/) | RenewableUK | 32 |
| 5 | [ORE Catapult publishes floating-wind cost reduction methodology](https://ore.catapult.org.uk/media-centre/press-releases/landmark-new-study-sets-out-scope-and-method-to-cut-costs-in-floating-offshore-wind) | ORE Catapult | 31 |

All five selected highlights have separate publishers and events; no higher-ranked item was displaced by a duplicate-group diversity rule. Unselected verified candidates remain visible on the candidate page: Buchan foundation certification, EMEC DeepWind funding, France Energies Marines R&D and Utsira Nord support terms.

### Chronology, scope and coverage boundaries

- Pentland: 5 October publication describes an agreement signed 28 September. Anchor engineering and site investigation are not presented as a final anchor supply award.
- Montrose investment: official announcement dated 28 September; a 5 October trade repeat is background, not a new weekly candidate.
- Equinor Celtic Sea scoping team: official index dated 2 October; a 5 October trade repeat is background, not a new weekly candidate.
- Neretek BC90, German auction sites and the UMass marine-energy pathway were excluded because no new floating-specific engineering development was verified.
- France Energies Marines: the live press index and 7 October 2026 PDF resolve a stale search snippet that initially omitted the new release. Planned R&D is not presented as completed results.
- RenewableUK: only the public EnergyPulse summary is retained; the member-only report is not copied. GWEC and RenewableUK operational totals differ and retain their respective attribution.
- Utsira Nord: government budget section 8.2 verifies the risk/payment terms. The document is formally approved 25 September; an independent in-window primary publication date was not verified. The candidate uses the 9 October trade report, with the government verification URL preserved in audit notes.
- Worldwide briefing items use the existing `Unspecified` region presentation label. No region taxonomy extension was introduced.

## Validation and release

- Pipeline suite: 210 passed.
- Static data validation: passed.
- Website data / selection tests: 88 passed, including regenerated Engineering scores and Research rank/selection consistency.
- ESLint passed; production build passed with 418 static pages; Chromium smoke: 4 passed in 17.2 seconds.
- `git diff --check` passed.
- Local collector artifacts remain under ignored `pipeline/data/`; committed editions contain source provenance, selection evidence, diagnostics and candidate records.
- Production publication follows Git integration from merged main; a feature-branch PR is not itself a production release.
