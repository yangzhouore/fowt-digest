---
name: fowt-project-intelligence
description: Audit and update source-backed floating offshore wind project intelligence, status, readiness gates, project story, and watchpoints.
---

# FOWT Project Intelligence

Use this skill to update a floating offshore wind project's real status, why it
reached that state, and what evidence would change the assessment next.

Follow `AGENTS.md` for repository, Git, provenance, and validation rules.

## Operating Boundary

- `pipeline/` owns deterministic research data production.
- `web/` owns static presentation and committed JSON consumption.
- Do not add services, databases, API routes, AI writing, translation services,
  schedulers, collection, scoring, or new pipeline stages.
- Update only the requested project unless the user explicitly asks for a batch.

## Read First

Read only what the task needs:

- `AGENTS.md`
- `web/data/projects/projects.json`
- the target project's current record, timeline, relationships, and sources
- `web/data/project-adapter.ts` and the project detail page only when data shape
  or presentation changes are needed
- recent project-specific Engineering Briefing records only when relevant

Do not read `docs/archive/` unless the user asks or ambiguity requires it.

## Workflow

Use this order:

`current state -> FID gate -> identity -> material timeline -> project story -> readiness -> watchpoints -> reader-facing output`

### 1. Current State First

Establish what the project is today before reconstructing history.

Confirm, with the freshest reliable evidence available:

- lifecycle state and whether construction is actually committed
- whether recent activity is only development, surveys, FEED, or procurement
- whether current sources contradict stale schedule or status claims

Consent, CfD/REC/PPA support, FEED, surveys, preferred suppliers, or schedule
claims do not prove construction commitment.

### 2. FID Is A Core Gate

Explicitly classify FID / financial close when material:

- `FID confirmed`
- `FID not verified`
- `FID not reached`
- `UNKNOWN`

Never infer FID from consent, CfD, offtake, FEED, surveys, supplier activity,
land access, procurement notices, or target COD. Use `UNKNOWN` where evidence is
insufficient.

### 3. Establish Identity

Confirm:

- name, aliases, location, sea area, developer / owner, and capacity
- turbine count/rating, floating technology, and platform type if verified
- current lifecycle status

Do not merge similarly named phases, lease areas, demonstrators, or commercial
projects.

### 4. Material Timeline

Keep only milestones that materially change project maturity, economics, or
execution confidence. Do not turn the timeline into a news feed.

Include events that affect:

- permitting
- revenue / offtake / support
- engineering
- procurement
- financing / FID
- execution
- ownership or commercial structure

Typical material milestones include lease or area award, consent, grid
connection, support award, PPA/offtake, FEED, major supplier/EPCI/fabrication
contracts, ownership change, FID/financial close, construction start, first
power/COD, major delay, support loss, pause, cancellation, or lease
relinquishment.

Minor surveys belong in the timeline only when they are the best current
evidence that a pre-FID project remains active or is reducing engineering
uncertainty.

## Source Discipline

Every major milestone and every factual claim that changes the assessment needs
a source.

Prefer, where available:

1. government, regulator, auction/CfD authority, grid/system authority
2. seabed authority
3. project owner, developer, operator, or project company
4. official supplier, contractor, lender, port, or certification announcement
5. industry association
6. reputable trade or financial press

Use trade press mainly for discovery, context, or clearly labelled reported
developments when primary evidence is unavailable.

Do not invent FID, financial close, COD, schedule certainty, capacity,
contracts, suppliers, economics, financing, delay reasons, or causal
explanations.

## Fact Vs Inference

Keep confirmed facts separate from editorial assessment.

- **Fact:** directly supported by source evidence.
- **Inference:** interpretation from sourced facts.
- **Open question:** plausible but not sufficiently supported.

Never turn an inference into a timeline fact or factual project field.

For important inference, show the logic chain:

`Fact A + Fact B -> implication -> current assessment`

Use `UNKNOWN` for insufficient evidence instead of filling gaps.

## Project Story

Reconstruct the story behind the current state:

`original thesis -> major de-risking -> turning point(s) -> current state`

Explain causal mechanisms only where the evidence supports them. Common
mechanisms include revenue certainty, offtake, support coverage versus total
capacity, supply chain availability, procurement maturity, financing
bankability, permitting, grid/port readiness, infrastructure constraints, and
sponsor strategy.

Do not attribute a setback to one cause when evidence shows several interacting
causes. Do not calculate returns without source-backed inputs.

## Readiness Gates

Assess only the meaningful gates for the project stage:

- Permitting
- Revenue
- Engineering
- Procurement
- Financing / FID
- Execution

Use qualitative states: `SECURED`, `ACTIVE`, `NOT VERIFIED`, `NOT STARTED`,
or `UNKNOWN`.

Never use artificial percentages, maturity scores, or confidence scores as a
reader-facing readiness metric.

## Data Model

Preserve the factual `Project` model.

- Use factual fields for identity, status, capacity, COD, technology,
  relationships, timeline events, and source-backed claims.
- Use optional `ProjectIntelligence` fields only when analytical content cannot
  be represented cleanly as factual project data.
- Do not overload factual fields with interpretation.
- Add schema or adapter extensions only when genuinely necessary, and keep them
  optional for other projects.

Useful optional intelligence fields include current assessment, FID status,
confirmed facts, editorial inferences, current gates, watchpoints, and unresolved
uncertainties.

## Reader-Facing Output

The schema should support the UX, not dictate a database-shaped page.

Preferred hierarchy: current status, project progress, where the project
stands, why the story changed, readiness, what to watch next, material
timeline, companies, sources / evidence.

A reader should understand within 5-10 seconds where the project is now, what
is secured, what is still missing, why it reached this state, and what could
change the assessment next.

Do not mechanically expose raw `confirmedFacts`, `editorialInferences`,
`currentGates`, or `watchpoints`; use them to shape a clear project page.

## Watchpoints

Identify 3-5 observable developments that would materially change the project
assessment.

A good watchpoint answers:

`What future evidence would cause us to update our view of this project?`

Prefer concrete signals such as FID announcement, financial close, support
contract execution, offtake agreement, lease progression, turbine/floater/cable/
mooring/EPCI award, fabrication start, construction start, first installation,
first power, revised COD, pause, cancellation, or lease relinquishment.

Avoid vague watchpoints such as `project progress`.

## Updating Existing Projects

When auditing an existing project, inspect current facts, timeline,
relationships, sources, and page rendering first. Then establish latest current
state independently, preserve still-valid information, replace stale claims,
strengthen weak provenance, update relationships only with evidence, add only
material milestones, separate fact from inference, use `UNKNOWN` for gaps, avoid
unnecessary schema/architecture/visual changes, and update only the requested
project unless explicitly asked to batch.

## Finish

Before reporting completion, verify:

`source -> fact -> assessment -> current state -> readiness -> watchpoints -> reader-facing presentation`

Check that current status reflects recent evidence; FID status is explicit when
material; the timeline has only material sourced milestones; important
inferences have sourced logic chains; facts and interpretations are separate;
obsolete targets are not presented as commitments; supplier and contract states
are precise; readiness uses qualitative gates, not scores; 3-5 meaningful
watchpoints are present; and relationships/sources agree with the assessment.

Run the relevant validation required by `AGENTS.md`, inspect `git diff` and
`git status`, and report remaining uncertainties.
