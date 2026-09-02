---
name: fowt-project-intelligence
description: Research and update source-backed floating offshore wind project status, milestone timeline, causal logic, risks, and next watchpoints.
---

# FOWT Project Intelligence

Use this skill to help readers quickly understand a floating offshore wind project's real progress, why it reached the current state, and what matters next.

Follow `AGENTS.md` for repository, Git, provenance, and validation rules.

## Core Goal

A strong project update should answer five questions:

1. What is the project?
2. Where is it now?
3. What major milestones got it here?
4. Why did the important changes happen?
5. What should we watch next?

Do not produce a press-release chronology. Build a project story around status, milestones, and cause-and-effect.

## Read First

Read only what is needed:

- `AGENTS.md`
- `web/data/projects/projects.json`
- the target project's existing data/page
- recent project-specific Engineering Briefing records when relevant

Use existing project schemas unless the task explicitly requires a schema change.

## Source Priority

Prefer sources in this order:

1. government, regulator, auction/CfD authority, seabed authority
2. project company, developer, owner, operator
3. named OEM, supplier, contractor, grid company, port, lender
4. certification body or industry association
5. reputable trade or financial press

Use secondary sources mainly for discovery, context, or when primary evidence is unavailable.

## Required Workflow

Use this sequence:

`identity -> current status -> material timeline -> turning point -> causal logic -> current gates -> watch next`

### 1. Establish identity

Confirm:

- project name and aliases
- location
- developer / owner
- capacity
- floating technology if verified
- current lifecycle status

Do not merge similarly named phases or projects.

### 2. Determine the current status first

Find the freshest reliable evidence before reconstructing history.

Use clear lifecycle language such as:

- development
- consented
- pre-construction / pre-FID
- FID reached
- under construction
- commissioning
- operational
- paused
- cancelled / stopped

For commercial-scale projects, explicitly state whether **FID / financial close has been reached** when this matters.

Consent, CfD, REC, FEED, surveys, preferred suppliers, or early contracts do not automatically mean the project is committed to construction.

### 3. Build only the material timeline

Include events that changed project maturity, economics, or execution confidence.

Typical milestones:

- lease / area award
- consent / environmental approval
- grid connection
- CfD / REC / PPA / auction award
- FEED
- turbine / floater selection
- major cable / mooring / EPCI / fabrication contract
- partner or ownership change
- anchor offtake agreement or withdrawal
- FID / financial close
- construction start
- first power / COD
- major delay, pause, support loss, cancellation

Minor survey notices should only appear when they provide useful evidence that the project is still active or that engineering uncertainty is being reduced.

## Source Rule

Every **major milestone** must have a source.

Every **important factual claim that changes the project assessment** must have a source.

Examples:

- CfD awarded -> source required
- consent granted -> source required
- FID reached / not reached -> source required when stated as fact
- offtaker withdrew -> source required
- project stopped -> source required
- turbine supplier selected -> source required

Prefer the strongest primary source available.

Do not invent dates, contract states, suppliers, capacity, COD, FID, or reasons for delay.

Use `UNKNOWN` when evidence is insufficient.

## Fact vs Inference

Keep these separate:

**Fact** = directly supported by a source.

**Inference** = interpretation built from one or more sourced facts.

**Open question** = plausible but not sufficiently supported.

Never turn an inference into a timeline fact.

When making an important inference, show the logic chain.

Use this pattern:

`Fact A + Fact B -> project implication -> current assessment`

Example:

`400 MW CfD secured + anchor industrial offtaker withdrew + FID still not reached -> revenue certainty remains partly intact but the original commercial structure weakened -> bankability risk increased.`

The facts in that chain must be sourced.

## Causal Analysis

For each major turning point, ask what mechanism changed.

### Revenue / offtake

Check:

- CfD / REC / PPA support
- supported MW versus total capacity
- anchor customers
- support withdrawal or failure to sign

### CAPEX / supply chain

Check:

- turbine availability and pricing
- floater serial fabrication
- cables, moorings, anchors
- installation and port requirements
- major supplier or procurement changes

### Financing / bankability

Check:

- FID / financial close
- project finance
- partner search
- explicit language such as `investable`, `bankable`, `commercially viable`, or `competitive return`

Useful logic:

`revenue certainty + credible CAPEX + financeable risk -> bankability -> FID`

Do not calculate IRR without source-backed inputs.

### Regulation / infrastructure

Check when relevant:

- permitting
- fisheries / compensation
- local-content rules
- security restrictions
- grid timing
- port readiness

### Sponsor strategy

Check whether developer portfolio changes, market exits, or capital reallocation also explain the project outcome.

Do not attribute a setback to one cause when evidence shows several interacting causes.

## Narrative Logic

Use this internal story structure:

`original project thesis`

`-> de-risking milestones`

`-> apparent route to construction`

`-> turning point`

`-> why it mattered`

`-> current status`

`-> next gating decisions`

A timeline tells the reader **what happened**.

The causal chain tells the reader **why the project is now in this state**.

Both are required for important projects.

## Current Assessment

Summarise the project in 1-3 sentences.

A useful assessment normally states:

- active / paused / cancelled / operating
- pre-FID or post-FID where relevant
- strongest positive evidence
- biggest unresolved risk

Example style:

`Active / Pre-FID. The project retains consent and government-backed revenue support, while recent engineering activity shows continued development. However, unresolved procurement and financing decisions mean construction is not yet committed.`

## Key Gates

For projects that have not reached construction, identify only the important remaining gates.

Usually 3-5 items, such as:

- FID / financial close
- turbine supply agreement
- floater / EPCI award
- cable contract
- replacement offtaker
- port commitment
- fabrication start
- support-contract execution

## Watch Next

End with 3-5 observable events that would materially change the assessment.

Do not use vague items such as `project progress`.

Prefer concrete signals:

- FID announced
- turbine contract signed
- support agreement executed
- fabrication begins
- first offshore installation
- revised COD announced

## Project Page Output

When the existing product structure allows it, organise project intelligence as:

1. **Snapshot** - identity, capacity, owners, location, status, FID/COD
2. **Current assessment** - where the project really stands now
3. **Timeline** - only material sourced milestones
4. **Why the project is here** - causal chain with sourced facts
5. **Key gates** - unresolved blockers or decisions
6. **Watch next** - next decision-changing signals
7. **Sources** - provenance for milestones and important conclusions

## Writing Style

Write for engineers, developers, investors, and informed industry readers.

Prefer:

- concrete dates
- concise project-stage language
- clear cause-and-effect
- explicit uncertainty
- precise contract status

Avoid:

- marketing language
- generic renewable-energy praise
- calling every event a milestone
- claiming a project is `on track` from old guidance
- treating technical feasibility as bankability
- treating an MoU or preferred bidder as a firm contract

## Update Existing Projects

When updating a project:

1. inspect the existing record and timeline;
2. establish the latest status independently;
3. add or update sources first;
4. correct stale current-state claims;
5. add only material milestones;
6. preserve valid historical events;
7. add causal interpretation only when supported by sourced facts;
8. identify current gates and watchpoints;
9. keep unresolved facts as `UNKNOWN`;
10. verify status, timeline, relationships, and sources agree.

Do not rewrite unrelated projects.

## Quality Gate

Before finishing, verify:

- current status reflects recent evidence;
- FID status is explicit when material;
- every major milestone has a source;
- every important inference shows a sourced logic chain;
- facts and interpretations are clearly separated;
- obsolete target dates are not presented as current;
- supplier / contract status is precise;
- the reader can understand the project state quickly;
- 3-5 meaningful watchpoints are identified.

Run the relevant validation required by `AGENTS.md` and report remaining uncertainties.
