# Digital & AI: practical use-case cards

Date: 2026-10-23. Status: design accepted; implementation authorised.
Design branch: `docs/digital-ai-use-case-cards-plan`.
Implementation branch: `feat/digital-ai-use-case-cards`.
User acceptance: "OK now you can implement it" (2026-10-23).

## 1. Objective

Help a technically literate reader answer: **What problem does this application
address, what goes in, what comes out, and what decision can a person make?**

The current lifecycle map has ten application areas. Its selected detail gives
a short flow, a benefit label and external evidence links. This MVP replaces that
detail with a practical explanation. It remains a static editorial briefing.

Success means a reader can describe the application and its evidence boundary
without opening a paper or having access to private project documentation.

## 2. Scope and sequencing

In scope:

- One consistent card pattern for all ten existing application areas.
- Problem, illustrative user role, inputs, method, output, human decision,
  evidence and limitations.
- Clear separation between documented examples and explanatory workflows.
- Short definitions distinguishing machine learning, physics simulation,
  monitoring, optimisation and robotics where relevant.
- English and Simplified Chinese editorial copy, accessible selection and a
  readable desktop/mobile layout.
- Source publisher, original source link, recorded example maturity and dates
  within the card's evidence section.

Deferred: a full internal evidence reader, new detail routes, new Signals,
wind-to-compute pathway comparisons, lifecycle-stage reordering, company/project
integration, other product sections, papers, private documents and live tools.
The existing evidence drawer and its filtering remain available.

This is recommendation 1 only. Recommendations 2 and 3 require separate designs.

## 3. Reading experience

Retain the existing six-stage map and ten application choices. Selecting an
application reveals one card. Replace generic benefit promises in this detail
with the specific intended use and its limitations.

Desktop: retain the map, followed by one full-width selected card. Use columns
inside the card where space allows. Mobile: place the single selected card after
the selected stage so users do not have to pass every later stage to reach it.
Keep the card once in the DOM; do not duplicate hidden interactive content.

```text
OFFSHORE-WIND LIFECYCLE
[Develop] [Design] [Manufacture] [Install] [Operate] [Connect]
                                         [Digital Twin selected]

Mooring condition assessment                       Operate
Illustrative workflow | Simulation + monitoring + ML

Problem: Which mooring behaviour needs investigation?
Typical user: Asset-integrity engineer

INPUTS                 METHOD                   OUTPUT
Model + monitoring --> Compare/predict       --> Condition flag
                                                |
                                                v
HUMAN DECISION: Review the evidence; decide whether to inspect

Limit: A flag is not a confirmed failure diagnosis.

Documented example: SUBSEE 4D
What the public source establishes: [short specific statement]
Recorded maturity: Pilot / Demonstration | Record period: 2020-2023
Publisher + original source | Stored access date: 2026-08-24
[More about inputs, evidence and limitations]
```

This is a structural wireframe, not a claim about SUBSEE 4D's actual operating
procedure. Source-supported facts and illustrative guidance get separate labels.

Always visible: title, problem/user, compact input-method-output flow, human
decision, principal limitation, and a concise documented-example summary or
explicit empty state. Additional inputs, limitations and other linked examples
can use a native disclosure. Aim for about 120-180 English words before expansion;
Chinese copy should convey the same meaning without a rigid word-count target.

Selection uses real buttons with pressed state and a controlled-card reference.
Keep focus on the selected button; announce the changed card title briefly rather
than reading the entire card. No forced scrolling on each selection. On narrow
screens, the card follows its selected stage in reading order. Keyboard, focus
visibility, disclosure state and reduced-motion behaviour require browser review.

## 4. Content contract

| Field | Reader question | Evidence rule |
| --- | --- | --- |
| Problem | What engineering task is difficult? | Explanatory framing, explicitly illustrative unless sourced |
| Typical user | Who might use the output? | Role example; never imply a named project's internal organisation |
| Inputs | What data might be required? | Input categories; actual sensor/training requirements unknown unless disclosed |
| Method | Where do AI and other tools enter? | Explain the method; do not treat simulation or robotics as automatically AI |
| Output | What does the tool return? | Forecast, estimate, flag or candidate plan; no invented performance numbers |
| Human decision | What action can this inform? | Illustrative decision support; no implied approval or autonomous safety authority |
| Documented example | What has actually been reported? | Specific claim linked to existing Signal/source IDs |
| Limitations | What cannot be concluded? | State evidence gaps; distinguish general cautions from reported project limitations |
| Provenance | How old and specific is the evidence? | Preserve recorded maturity, event/period and stored source-access date |

Use three visible distinctions: **Documented example**, **Illustrative workflow**,
and **Not disclosed in the reviewed source**. Do not use a numeric confidence score
or assign an overall maturity to an application area.

English labels have fixed Chinese equivalents, for example: Problem / 问题,
Typical inputs / 典型输入, Method / 方法, Output / 输出, Human decision / 人工决策,
Documented example / 已有公开案例, Illustrative workflow / 示意工作流程,
Limitations / 局限与未知项. Preserve proper nouns and original source titles.

## 5. Proposed coverage of the ten areas

All workflows below are proposed explanatory examples, not claims that a linked
project implements every step. Recheck the public source before writing each
documented-example statement. A shared link does not validate every application.

| Existing area | Proposed practical question and decision | Existing evidence starting point | Boundary to show |
| --- | --- | --- | --- |
| AI Forecasting: site/metocean | Which weather/resource scenarios need further assessment? Analyst compares forecasts before choosing study assumptions. | AIRU-WRF; ECMWF DTWO | Forecasting context does not prove a bankable site assessment. |
| AI Engineering | Which candidate responses deserve detailed simulation? Engineer selects cases for further checking. | ACE-FWICC | Research aims are not a validated commercial design tool. |
| AI Vision | Which fabrication images need quality review? Inspector checks a flagged area. | None recorded | Illustrative only; no supporting example recorded in this collection. |
| AI Planning | Which weather/logistics options should planners compare? Marine planner reviews a candidate schedule. | None recorded | Illustrative only; no supporting example recorded; a suggested plan is not operational authorisation. |
| Smart Control | Which control strategy should be evaluated? Controls engineer compares performance and load tradeoffs. | FlexiWind | Distinguish virtual evaluation from approved field control. |
| Digital Twin | Which model/monitoring discrepancies need investigation? Integrity engineer reviews flags. | DigiFloat; DIONYSOS; SUBSEE 4D | A model estimate or anomaly is not confirmed damage. |
| Predictive AI | Which condition trend should receive maintenance attention? Reliability engineer checks evidence before scheduling. | NEXTWIND; EPROA | Anomaly detection does not establish remaining life or a repair date. |
| Autonomy | Which inspection observations require follow-up? Inspection engineer reviews captured evidence. | ATLANTIS; SATURNX; UMass Lowell | Robotic data capture, AI interpretation and repair are different capabilities. |
| Smart Monitoring: cable/electrical | Which condition indication warrants electrical/subsea review? Engineer checks the signal and inspection options. | EPROA | Verify cable-specific support; broader O&M evidence must be labelled contextual if it does not establish cable capability. |
| AI Forecasting: grid | What generation uncertainty should an operator plan around? Operator compares forecast scenarios. | AIRU-WRF; FlexiWind | Forecasting/control context does not demonstrate autonomous grid dispatch or market trading. |

For the two empty areas, use exactly the collection-qualified message above,
not an assertion that the technology does not exist elsewhere. Retain original
Signal IDs and relationships; do not add records to make the map look complete.

## 6. Three worked examples for design review

These examples establish the editorial pattern. Detailed operating workflows are
illustrative; only the separately attributed example statements are project facts.

### A. AI Engineering: compare candidate responses

- Problem/user: an engineer needs to choose which scenarios deserve more detailed
  analysis.
- Illustrative inputs: engineering model outputs and environmental scenarios.
- Illustrative method/output: an ML-assisted model estimates responses for
  comparison; shortlisted cases receive further engineering checks.
- Human decision: select cases to investigate, rather than approve a design from
  the prediction alone.
- Documented example: PNNL's 2023 ACE-FWICC announcement describes connecting
  environmental, turbine and grid modelling using AI/ML. It describes a research
  effort, not completed commercial validation. [PNNL source](https://www.pnnl.gov/news-media/enhanced-geothermal-offshore-wind-energy-gain-earthshot-support-pnnl).
- Limits: no verified training-set specification, achieved accuracy, speedup or
  certification conclusion is established here. The candidate-screening workflow
  is explanatory, not a documented ACE-FWICC delivery procedure.
- Existing references: `ace-fwicc-sciml-floating-wind-system` /
  `src-pnnl-ace-fwicc-news`; recorded maturity `research_concept`.

### B. Digital Twin: investigate mooring condition

- Problem/user: an integrity engineer needs evidence to prioritise investigation
  of subsea behaviour.
- Illustrative inputs: a numerical asset model, monitoring observations and
  environmental context; actual sensor requirements need project-specific review.
- Illustrative method/output: compare observations with model predictions and
  generate a condition flag with supporting context.
- Human decision: assess data quality and the indication before deciding whether
  further inspection is justified.
- Documented example: SUBSEE 4D reports mooring-monitoring software, numerical
  modelling, a sensor-deployment strategy and ML anomaly tools. Its stated project
  period is 2020-2023. [France Energies Marines source](https://www.france-energies-marines.org/en/rd-project/subsee-4d/).
- Limits: this does not establish a specific sensor inventory, damage-detection
  accuracy, operator response procedure or automatic shutdown capability.
- Existing references: `subsee-4d-floating-wind-mooring-digital-twin` /
  `src-fem-subsee-4d`; recorded maturity `pilot_demonstration`.

### C. Autonomy: gather inspection evidence

- Problem/user: an inspection engineer needs observations of offshore assets.
- Illustrative inputs: inspection scope, asset locations, access conditions and
  captured imagery; these are planning categories, not ATLANTIS specifications.
- Illustrative method/output: robotic inspection gathers images or mapped
  observations for review. Add an AI interpretation step only where sourced.
- Human decision: review the observations and decide on follow-up inspection or
  maintenance planning.
- Documented example: INESC TEC reported ATLANTIS robotic inspection tests at
  WindFloat Atlantic in November 2023, including visual and thermographic work.
  [INESC TEC source](https://www.inesctec.pt/en/press-releases/portuguese-team-successfully-tests-autonomous-robots-to-inspect-floating-offshore-wind-farms).
- Limits: a demonstration does not establish routine autonomous repair or measured
  fleet-wide savings. Expected savings must not be presented as achieved results.
- Existing references: `atlantis-autonomous-robots-windfloat-atlantic` /
  `src-inesc-atlantis-robots`; recorded maturity `pilot_demonstration`.

The three public pages above were reviewed for this design on 2026-10-23.
That date does not replace the Signals' stored source-access dates (2026-08-24),
change their maturity or imply a current project-status audit.

## 7. Implementation boundary after approval

Proposed changes are confined to the Digital & AI view, its independently owned
static explanatory content/styles and focused tests. Keep `signals.json` and its
adapter contract intact. Store bilingual card content separately, keyed by the
existing application ID, with explicit Signal/source references for factual
example statements and a basis flag for illustrative text.

No runtime content generation, source fetching, API, database or translation.
Do not change shared visual rules. Use Digital & AI scoped styles. Reuse the
existing evidence records without duplicating their maturity or source metadata.

Delivery sequence after design acceptance:

1. Audit linked public sources and draft all ten cards against this contract.
   Record unresolved support as contextual evidence or unknown; do not fill gaps.
2. Implement the card and responsive selection behaviour in Digital & AI only.
3. Check bilingual copy, factual claim-to-source links and all ten selected states.
4. Run validation, inspect the diff, and record results and remaining limitations.
5. Follow the agreed delivery workflow: commits when authorised, open PR with
   preview and final-head CI evidence; leave merging to the user.

## 8. Acceptance and validation harness

- All ten areas answer the eight content questions in section 4; required fields
  and bilingual copy are checked for completeness.
- Every factual example resolves to valid existing Signal/source IDs. Review the
  specific supporting passage manually; ID validity alone is not evidence.
- The two unsupported areas have explicit empty states. Context-only evidence
  cannot be displayed as proof of a specific deployment.
- Original 14 Signals, source metadata and maturity values are unchanged. No
  invented performance numbers, project relationships or private-data claims.
- Desktop and 390px mobile, light/dark, English/Chinese: readable flow, no horizontal
  overflow, clear selected state, one card and no duplicate IDs.
- Keyboard selection and disclosures work; selected content is nearby, focus is
  preserved and state changes have a concise accessible announcement.
- Existing Power AI choices and evidence topic/maturity/region filtering still
  work. Other product areas and source-backed paper records are unaffected.
- Focused content tests check coverage, reference resolution and empty states;
  browser tests check selection, mobile placement and bilingual interaction.
- Run the full repository baseline after implementation: Python pipeline tests,
  `validate:data`, `test:data`, lint, build and `git diff --check`; run browser smoke
  and the focused Digital & AI journeys. Record exact results on the final head.
  All required PR CI jobs must pass before delivery is reported ready.

For this design-only change, check document scope, links/references and whitespace.
Application tests/build/browser runs are deferred because no application is changed.

## 9. Design self-review and acceptance gate

| Risk | Design response | Remaining review |
| --- | --- | --- |
| Ten cards become a textbook | One selected card; short essentials; secondary disclosure | Check first three cards on mobile before finishing layout |
| Generic workflow mistaken for project evidence | Separate labelled blocks and field-level provenance | Manual review of every factual sentence |
| Monitoring/robotics advertised as AI | Explain method components; no automatic AI label | Audit each public example |
| Historical maturity reads as current status | Label recorded maturity and retain dates | Verify no claim of a 2026 operational audit |
| Broad O&M source overclaims cable capability | Context-only label or explicit evidence gap | Check EPROA's actual public scope |
| Mobile card movement disrupts navigation | One card, preserved button focus, concise announcement | Keyboard and mobile browser checks |

Proposed approval covers: ten cards, this content contract, the evidence boundary,
and the responsive layout. It does not approve recommendations 2/3 or additional
Signals. The user accepted this design and authorised implementation on
2026-10-23. Implementation validation is recorded separately.
