# UK Floating Wind System Guide — objectives, design and review

Status: accepted by the user on 22 October 2026; implemented with local acceptance.
Acceptance: "you can now implement it, please make sure the logics are clear and pricise."
Delivery evidence: [UK_FOWT_SYSTEM_IMPLEMENTATION.md](UK_FOWT_SYSTEM_IMPLEMENTATION.md).
Final-head CI and preview are recorded in the feature PR; merge remains manual.
Prepared: 22 October 2026. Branch: `feat/uk-industry-system-guide`.
Base: `2e3a0cc`. Companion: [researched content draft](UK_FOWT_SYSTEM_CONTENT.md).

## Outcome

A technically literate newcomer can explain how a UK floating wind project is
developed, built and operated, and can separately trace its equipment, permissions,
electricity and money. They can identify the organisation responsible for an
interface and ask what evidence supports a project claim.

This follows the user's established sequence: clear objectives, design,
design review, acceptance, implementation, validation and an open PR for manual
merge. This research/design stage does not change the current website.

## Review of the current section

Reviewed `web/app/industry/page.tsx`, its Industry data contract and company
catalogue, and the connected-context navigation introduced in PR #42.

What works:

- Existing visual language is restrained and readable.
- Turbine, platform, mooring and cable roles are separated.
- Company disclosures provide sources and source-backed project backlinks.
- Existing company IDs support links arriving from Projects.

What needs to change:

- The developer-first sequence does not teach the bottom-up industrial chain.
- The physical diagram stops before explaining the complete electricity path.
- Regulators, seabed managers, system operation and settlement are missing from
  the main explanation. These are different responsibilities, not supplier tiers.
- Developer functions, stage dependencies, finance and revenue are unexplained.
- The catalogue is international. A listed organisation is not automatically a
  UK manufacturer or a contracted supplier to a UK project.
- A global external map does not explain Scotland versus the Celtic Sea.
- Company counts and role counts describe catalogue coverage, not proof of
  complete UK supply-chain coverage.

## Editorial position

Proposed title: **UK floating wind: from materials to megawatt-hours**.

Opening sentence: “A floating wind farm is a physical machine, a development
project and an electricity business. Different organisations make each part work.”

Four lenses remain distinct:

| Lens | Arrows mean | Reader's question |
|---|---|---|
| Build the asset | Material, equipment or service delivery | Who supplies what, to whom? |
| Develop the project | Workstream dependencies and decision gates | What must be ready before investment and construction? |
| Obtain rights and permissions | Land rights, applications, decisions and obligations | Who can authorise which activity, in which jurisdiction? |
| Deliver and sell electricity | Separate physical flow and commercial settlement | Where does the power go, and who pays whom? |

Government and regulators are shown as a coordination/permission layer alongside
the chain, not as the final customer above the grid. The developer is the project
integrator; NESO is the GB system operator/planner. Neither role substitutes for
the other. The power-market explanation explicitly covers Great Britain;
Northern Ireland's separate market is outside this increment.

## Proposed page layout

```text
INDUSTRY MAP                       UK focus · evidence reviewed [date]
UK floating wind: from materials to megawatt-hours
[Build the asset] [Develop a project] [Power & money] [UK actors] [Risks]

BOTTOM-UP INDUSTRIAL MAP
Materials → Components → Subsystems → Packages → Installation → Project
                                                     └→ Grid interface
Alongside: seabed manager / consent authorities / Ofgem / NESO / market bodies
Choose a level → purpose | output | customer/payment | risk | examples | sources

01 HOW THE MACHINE WORKS
Rotor-to-seabed cutaway · three platform concepts · coupled cable/mooring view

02 HOW A PROJECT BECOMES BUILDABLE
Parallel lifecycle lanes → FID gate → manufacture / ports / installation / O&M
Developer interface desk · Scotland / England / Wales responsibility table

03 FOLLOW 1 MWh
Physical power route, with illustrative voltages and ownership boundaries
Separate money route · OFTO / TO / NESO / Elexon role comparison
Worked CfD example, assumptions visible

04 WHO DOES THE WORK IN THE UK
Scotland / Celtic Sea evidence snapshot · ports · role-based company cards
Capability / announced plan / project contract labels, with dated sources
[Existing international company reference catalogue and its stable anchors]

05 WHERE PROJECTS GET STUCK
Interfaces · evidence-backed constraints · 15 project-analysis questions
Remember: rights + consent + grid + revenue + finance + deliverable design

Sources and evidence boundaries · optional external global-map link
```

This is one Industry page with anchor navigation and progressive disclosures,
not 22 equally weighted blocks of open text. Each chapter has a short visible
explanation; tables and detail sit one level deeper. Use HTML/SVG diagrams with
equivalent text, no stock imagery or unreviewable graph animation.

The 1 MWh walkthrough is illustrative: it does not claim tracing individual
electrons, a lossless physical system or identical reference and realised prices.
No live market data or trading calculator is required.

## Coverage of the user's 22 topics

| User topics | Placement and required content |
|---|---|
| 1 | Opening map: nine levels, four chains, deliverable/payer/risk/examples at every level |
| 2 | Chapter 2: all requested developer functions, grouped by decisions and interfaces |
| 3 | Chapter 2: all 17 lifecycle stages with technical/commercial work, authority and exit gate |
| 4 | Chapter 2: seabed rights versus permission; three jurisdiction rows and environmental advisers |
| 5 | Chapter 1: rotor-to-seabed anatomy and semi-submersible/spar/TLP tradeoffs |
| 6 | Chapter 3: complete wind-to-consumer route, voltage examples and ownership boundaries |
| 7 | Chapter 1: labelled dynamic cable and floater/mooring/cable coupling |
| 8–9 | Chapters 1/3: array/export architectures, optional substations, AC/DC and asset boundaries |
| 10–11 | Chapter 3: traditional OFTO example, current reform, three TOs and NESO |
| 12–13 | Chapter 3: physical versus financial flows, settlement, BM and worked CfD example |
| 14 | Chapter 2: development capital, financing, bankability and FID maturity |
| 15–17 | Chapter 2: port integration, installation branches and long-term O&M |
| 18 | Chapter 4: dated Scotland/Celtic Sea zones and selected project examples |
| 19 | Chapter 4: practical role-based supplier/institution map, not an undifferentiated logo wall |
| 20–21 | Chapter 5: interface failure modes, constraints and bounded evidence assessments |
| 22 | Chapter 5: concise mental model and 15 analysis questions |

## Evidence and company-card design

Use visible labels: **Confirmed role**, **Typical practice**, **Project example**,
**Changing arrangements** and **Engineering interpretation**. The last label is
for our explanation of dependencies, not a newly discovered project fact.

Every current capacity, ownership, project stage, institution responsibility and
market-rule statement needs an adjacent source. Store source title, publisher,
URL, document/publication date when available, review date, jurisdiction and the
specific supported claim. A review date does not make old evidence current.

Company cards answer:

1. What does this organisation deliver?
2. Who is its normal customer, and where does it connect to the system?
3. Is the evidence about capability, a facility plan or an awarded project scope?
4. Is it UK-based, UK-active, or an international supplier with relevant experience?
5. What dated source supports that description?

Do not attach a UK project to a company from shared technology or name overlap.
Do not label a planned factory as producing qualified cables. Conflicting source
figures remain attributed and dated; unsupported totals and supplier awards are
omitted. The draft records examples requiring special care.

## Scope and architecture

Only Industry-owned files may change:

- `web/app/industry/`: page, local components, scoped CSS module, design/evidence
  documents and Industry-specific browser acceptance tests.
- `web/data/industry/`: new independent guide content/source records and local
  validation tests. Preserve existing catalogue IDs and exports.

No edits to shared global CSS, shared header/navigation, Projects, Engineering,
Research, Digital & AI, pipeline, root status documents, package scripts or CI.
New guide styles use an Industry-owned, prefixed style module. Existing
`company-${companyId}` destinations and project-record context must still work.

The independent guide is not imported by the existing company-catalogue module,
so Projects cannot accidentally acquire the new guide in its module graph. The
old catalogue remains an explicitly international reference below the UK guide.
No new backend, APIs, CMS, runtime collection, translation or search service.

## Acceptance harness

| Gate | Measurable acceptance |
|---|---|
| A | User reviews this design and researched content before reader-facing implementation |
| B | All 22 requested topics have identifiable page coverage; all 17 lifecycle stages have the specified fields |
| C | Every current claim and organisation card resolves to a reviewed primary source; hypothetical numbers are marked illustrative |
| D | No claim that lease = consent, CfD = physical buyer, NESO = TO, or all floating farms = floating substation / OFTO / transmission connection |
| E | Arrays, export circuits and generator voltage are distinguished; 66 kV is typical, not compulsory; AC/DC choice has no universal distance cutoff |
| F | Historic/announced/capability/contract states remain distinct; conflicting sources are exposed rather than silently reconciled |
| G | Existing 47 canonical company targets and project backlinks remain unique and functional |
| H | Keyboard access, readable diagrams/tables at 390px, English/Chinese fixed copy, light/dark, no page-wide horizontal overflow |
| I | Git diff contains only Industry-owned paths; full accepted local baseline and browser journeys pass |
| J | Focused commits and final PR; all applicable CI verified on final head, merge remains manual |

Industry-specific validation will check schemas, IDs, references, source URLs,
dates, allowed evidence labels, numerical units, section coverage and source-free
claims. Tests exercise meaningful failure cases, not prose snapshots. Run these
through direct commands within Industry-owned paths, preserving shared scripts;
the existing lint/build and all existing regression tests also remain required.
This means no claim of new data-validator CI coverage unless the existing CI
actually discovers those tests. Source quality and regulatory interpretation
remain manual review responsibilities.

## Design self-review

| Risk | Resolution / remaining review |
|---|---|
| A textbook overwhelms the current page | Five chapters, short visible summaries, diagram-led navigation and expandable detail |
| One arrow falsely implies authority, ownership or payment | Separate physical, contract, permission and payment arrow semantics |
| Strict chronological lifecycle is misleading | Parallel development/consent/grid/revenue lanes, converging at investment gates |
| Generic guide contains obsolete UK regulation | Use current authority guidance for legal/market statements; technical guide only for engineering practice |
| UK focus silently rewrites Projects | Independent Industry evidence; no existing project data updates |
| New layout breaks deep links | Keep canonical catalogue anchors, unique repeated IDs and the existing project context component |
| Source disagreement is hidden | Explicit discrepancy notes; no single current aggregate drawn from incompatible snapshots |
| Chinese copy changes factual meaning | Translate fixed explanations against accepted English; preserve proper names and exact figures with sources |
| No company at a tier means no UK capability | State the map is representative; distinguish unverified coverage from absence of capability |

Original design self-review: the structure was suitable for implementation after
user acceptance. The content draft provided the starting point; source/evidence
audit was required before publication. Implementation acceptance and the scoped
style-module choice are documented in the delivery evidence linked above.
