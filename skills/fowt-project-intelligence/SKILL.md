---
name: fowt-project-intelligence
description: Research, reconstruct, assess, update, or audit source-backed floating offshore wind project intelligence, including lifecycle status, timeline, bankability, commercial logic, technical configuration, supply-chain relationships, and forward watchpoints.
---

# FOWT Project Intelligence

Use this skill when creating or updating a project page, reviewing a project's current state, reconstructing why a project advanced or stalled, or auditing whether existing project content still reflects the latest evidence.

Follow `AGENTS.md` for repository, Git, scope, provenance, validation, and change-control rules.

This skill is not a generic news-summary workflow. Its job is to turn fragmented public evidence into a conservative, source-backed project state model and a clear causal narrative.

## Core Reader Question

Every project update should help a reader answer, in this order:

1. **What is this project?**
2. **Where is it now?**
3. **How did it get here?**
4. **Why did the latest change happen?**
5. **What still has to happen before the next lifecycle step?**
6. **What evidence would change the current assessment?**

Do not begin with a chronological dump of press releases.

## Read First

Read only as needed:

- `AGENTS.md`
- `docs/archive/M10_GLOBAL_FOWT_PROJECT_INTELLIGENCE_DESIGN.md` when project-model or taxonomy context is needed
- `web/data/projects/projects.json`
- the target project page/data entry
- relevant recent Engineering Briefing records if they contain project-specific developments

Preserve the existing project data contract unless the accepted task explicitly includes a schema change.

## Evidence Hierarchy

Prefer evidence in this order:

1. government, regulator, seabed authority, planning authority, auction/CfD authority
2. project company, developer, owner, operator
3. named OEM, supplier, contractor, lender, port, grid company
4. certification body, industry association, technical institution
5. reputable trade press or financial press
6. secondary commentary only for discovery or clearly labelled context

A lower-tier source may reveal a development first, but promote the underlying fact only when the evidence is sufficiently specific and credible.

Never use a commercial intelligence database as the sole provenance for a factual project record unless reuse is explicitly permitted.

## Research Workflow

Use this sequence:

project identity
-> current-state evidence
-> milestone reconstruction
-> commercial structure
-> technical and supply-chain state
-> contradiction check
-> causal analysis
-> risk / readiness assessment
-> forward watchpoints
-> project-page update

### 1. Establish project identity

Confirm before analysis:

- canonical project name and aliases
- country / region / sea area
- developer / owner structure
- stated capacity
- floating status and platform concept if publicly selected
- current official or highest-confidence lifecycle state

Do not let similarly named projects, phases, leases, or renamed developments merge into one record.

### 2. Determine the current state first

Find the freshest reliable evidence for the project's state before reconstructing history.

Distinguish carefully between:

- active development
- consented
- pre-construction / pre-FID
- FID reached
- under construction
- commissioning
- operational
- paused
- cancelled / stopped
- lease relinquished

Use the existing normalized status taxonomy where possible.

Do not describe a project as "moving toward construction" merely because it has consent, FEED, a lease, or an offtake award.

**FID / financial close is a critical boundary.**

For commercial-scale projects, explicitly separate:

- engineering readiness
- permitting readiness
- revenue / offtake readiness
- procurement readiness
- financing readiness
- construction commitment

### 3. Reconstruct milestone history

Build only source-backed milestones that materially changed project maturity or economics.

Typical events include:

- lease / area award
- licence / permit / consent application
- environmental approval
- grid connection
- subsidy / CfD / REC / PPA award
- FEED award
- turbine / platform selection
- cable / mooring / installation / fabrication contracts
- strategic partner or ownership change
- offtaker agreement or withdrawal
- financing / FID
- construction start
- first power / COD
- delay, pause, contract failure, support withdrawal, cancellation

Do not include every minor survey notice in the primary narrative. Use surveys as evidence of continuing project activity, engineering maturation, or route/site de-risking when relevant.

### 4. Separate facts from interpretation

Maintain three levels:

**Confirmed fact**
- directly stated by a suitable source

**Strong inference**
- supported by multiple facts and normal project-development logic

**Open question**
- plausible but not sufficiently evidenced

Never convert a strong inference into a timeline fact.

Examples:

- "The developer has not reached FID" can be a fact when stated by the developer or a reliable current source.
- "The project is likely struggling with returns" is an inference unless sources explicitly discuss economics, bankability, investability, CAPEX, financing, or returns.

## Causal Analysis Framework

For every material setback or acceleration, ask which mechanism changed.

### Revenue / offtake

Check:

- CfD, REC, PPA, auction support
- supported MW versus total project MW
- strike price / support price if public
- corporate or industrial offtakers
- merchant exposure
- support expiry, failure to sign, renegotiation, or withdrawal

Do not write "government support secured" as if that automatically means the project is bankable.

### CAPEX and supply chain

Check:

- turbine pricing and availability
- floater serial fabrication
- steel / concrete exposure
- dynamic and static cable scope
- mooring and anchors
- offshore substation / export system
- installation vessels and tow-out logistics
- port assembly / marshalling / wet storage
- local-content obligations

Ask whether the issue is technical feasibility or the cost/risk of industrialising the solution at project scale.

### Financing and bankability

Check for evidence around:

- FID / financial close
- project finance
- WACC / interest-rate pressure
- investor hurdle rate
- sponsor capital discipline
- partner search
- write-downs
- "investable", "bankable", "commercially viable", "competitive return" language

Use the conceptual relationship:

`revenue certainty + realistic CAPEX + financeable risk allocation -> bankability -> FID`

Do not compute an IRR unless source-backed inputs are available.

### Regulation and infrastructure

Check:

- permitting burden
- fisheries / stakeholder compensation
- seabed or sea-area charges
- local-content rules
- security / foreign-supplier restrictions
- grid connection timing
- transmission design
- port readiness

### Asset-life / integration logic

For projects tied to oil and gas electrification, hydrogen, islands, industrial loads, or other anchor customers, check whether the customer's own asset life and retrofit economics still support the original offtake case.

### Sponsor strategy

Check whether the apparent project problem coincides with broader developer actions such as:

- renewable portfolio retrenchment
- geographic exits
- capital reallocation
- partner search
- strategy reset

Do not blame a host market for a cancellation when corporate portfolio strategy is also material.

## Narrative Construction

The preferred project story is a causal chain, not a press-release chronology.

Use this structure internally:

**Original investment thesis**
-> **de-risking milestones**
-> **apparent route to construction**
-> **turning point**
-> **economic / technical / regulatory mechanism**
-> **current state**
-> **next gating decisions**

A good narrative explains why an apparently advanced project can still fail before FID.

### Example pattern

Do not write only:

`consent -> CfD -> FEED -> surveys`

Prefer:

`consent removed permitting risk -> CfD improved revenue certainty -> FEED and surveys reduced design uncertainty -> a key offtaker withdrew / procurement cost changed -> the investment case had to be reworked -> FID remains the gating milestone`

## Project Readiness Assessment

For development-stage commercial projects, assess these six dimensions separately:

- **Permitting**: unknown / weak / progressing / strong
- **Revenue / offtake**: unknown / weak / partial / strong
- **Engineering definition**: concept / pre-FEED / FEED / detailed design / construction-ready
- **Supply chain / procurement**: open / partially selected / substantially contracted
- **Financing**: unproven / progressing / FID-ready / committed
- **Execution evidence**: surveys / enabling works / fabrication / offshore construction / operation

Do not collapse all six dimensions into one unsupported numerical score.

If a concise editorial signal is useful, use conservative labels such as:

- `green`: construction/operation commitment is well evidenced
- `yellow`: active and materially de-risked but important gates remain
- `orange`: active but commercial, procurement, regulatory, or financing risk is elevated
- `red`: formally paused, stopped, cancelled, support lost without a credible replacement route, or rights relinquished

Treat this colour as editorial interpretation, never as a source fact.

## FID Rule

For large commercial FOWT projects, always answer explicitly:

- Has FID been reached?
- If not, what remains open?
- What evidence indicates the project is still actively progressing?
- What evidence indicates schedule or bankability pressure?

Consent, lease, CfD, FEED, surveys, preferred suppliers, and even some contracts do **not** substitute for FID.

## Schedule Analysis

Track target dates over time when sources make them available.

A change such as:

`2028 COD -> 2029 first power -> 2030 COD`

is an important signal of schedule erosion even when the project remains active.

Do not treat old target dates as current guidance. Preserve historical targets as timeline context and use the newest credible target for the current record.

## Supplier and Contract Analysis

Separate:

- selected technology
- preferred bidder
- FEED contractor
- framework / MoU
- conditional award
- firm supply contract
- EPCI contract
- fabrication start

Do not describe an MoU or preferred-bidder relationship as a final project award.

For turbines specifically, distinguish:

- reference turbine assumption
- shortlisted OEM
- preferred supplier
- signed turbine supply agreement

This distinction can materially change the FID assessment.

## Contradiction Check

Before updating the project:

- compare latest status with older project-page language
- compare capacity and phase definitions across sources
- compare official target dates with older press coverage
- check whether an offtaker, supplier, owner, or support mechanism has changed
- check whether "committed", "on track", "assessing", "paused", and "stopped" language changed over time

When evidence conflicts:

1. prefer the highest-tier current source for current state;
2. preserve the older state as history;
3. explain the transition rather than silently overwriting it;
4. use `UNKNOWN` where the conflict cannot be resolved.

## Project Page Content Pattern

When the existing data contract supports it, project content should read in this order:

### Snapshot

- project identity
- capacity
- developers / owners
- location / water depth
- current normalized status
- current target COD / first power
- FID state when material

### Current assessment

A short source-backed explanation of what stage the project is actually in and why that matters.

### Timeline

Use only material milestones. Each event should explain the maturity change, not merely repeat a headline.

### Why the project is here

Explain the causal mechanism behind the current state using confirmed evidence plus clearly separated inference.

### Technical and commercial gates

Highlight the unresolved issues that must close before the next stage.

### Supply chain

List only project-specific verified roles and distinguish FEED, preferred, selected, contracted, and active execution states.

### Watch next

Name 3-5 observable events that would materially change the assessment, for example:

- FID / financial close
- turbine supply agreement
- platform / floater EPCI award
- anchor offtake replacement
- export / array cable award
- fabrication start
- port commitment
- support-contract execution

## Writing Style

Write like project intelligence for engineers, developers, investors, and informed industry readers.

Prefer:

- concrete dates
- project-stage language
- cause-and-effect
- explicit uncertainty
- precise contract states
- compact technical explanation

Avoid:

- generic renewable-energy praise
- press-release language
- "major milestone" without explaining why it matters
- "on track" unless the latest evidence supports the schedule
- treating engineering progress as financial commitment
- unsupported claims that a technology "failed"

A technically buildable project can still be commercially non-bankable.

## Update Mode

When asked to update an existing project:

1. inspect the existing project record and timeline;
2. identify the latest material evidence since its last accessed/generated date;
3. establish the current state independently of the old narrative;
4. add new source records before changing factual claims;
5. update stale facts conservatively;
6. add material timeline events;
7. preserve historical milestones;
8. update company/project roles only with project-specific evidence;
9. keep unresolved facts as `UNKNOWN`;
10. verify that current status, timeline, sources, and relationships agree.

Do not rewrite unrelated projects during a single-project update.

## Batch Refresh Mode

When refreshing many existing projects, do not deeply research every project equally.

First triage projects into:

- operational / stable
- active development with recent evidence
- pre-FID / commercially exposed
- delayed / paused
- cancellation-risk / stopped

Prioritise deep review for projects with:

- new auction/CfD/REC outcomes
- missed support-contract deadlines
- FID delays
- supplier changes
- ownership changes
- offtaker withdrawal
- regulator decisions
- large schedule changes
- construction or first-power evidence

Record the refresh date and coverage gaps.

## Quality Gate

A project update is not complete until all of the following are true:

- current lifecycle state is supported by recent evidence;
- FID state is explicit when relevant;
- timeline events are factual and source-backed;
- causal analysis does not masquerade as fact;
- contract states are precise;
- current targets do not rely on obsolete dates;
- important contrary evidence has been checked;
- the reader can identify the next 3-5 decision-changing watchpoints;
- project data, timeline, supplier roles, and sources are internally consistent.

## Finish

Run validation required by `AGENTS.md` for the files changed.

Report:

- project(s) reviewed
- current lifecycle assessment
- material timeline changes
- stale claims corrected
- source additions
- unresolved uncertainties
- next watchpoints
- validation performed
