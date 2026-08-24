# M11 - Digital & AI Signals Design

## 1. Product Purpose

Digital & AI Signals should track source-backed developments at the intersection
of floating offshore wind, offshore wind infrastructure, energy engineering and
applied digital systems.

The section must not become a generic AI news feed. Every future signal must
state its direct connection to offshore wind, wind-energy infrastructure, or a
closely relevant engineering or energy-system workflow.

## 2. User Value

Readers should quickly understand which digital and AI developments may matter
for FOWT engineering, operations, projects, supply chains and grid integration.
The value is not volume; it is filtering noisy AI claims into credible,
traceable, sector-relevant signals.

## 3. Inclusion / Exclusion Rules

Include a signal only when it has:

- a clear offshore wind, floating wind, wind-energy infrastructure, grid, port,
  inspection, engineering, or energy-systems connection;
- a source-backed factual event, research output, deployment, partnership,
  standard, funding decision, pilot, product release, or infrastructure decision;
- enough provenance to identify source, date, publisher and claim boundary.

Exclude:

- generic AI product launches with no wind or energy-infrastructure link;
- data-centre stories with no credible connection to renewable energy supply,
  grid flexibility, offshore wind procurement, or energy infrastructure;
- vendor marketing claims that cannot be tied to a deployment, pilot, technical
  method, customer, project, standard, or source-backed use case;
- stock, financial, opinion, podcast-only, social-media-only, or unsourced items;
- inferred relationships between companies, projects and technologies.

## 4. Topic Taxonomy

The initial taxonomy is accepted with tighter boundaries:

- AI for Engineering: AI or machine-learning methods used in design,
  simulation, reliability, loads, siting, control, forecasting, or analysis.
- Digital Twin: asset, project, grid, port, vessel, or system twins that support
  engineering decisions, operations, monitoring, or lifecycle management.
- Autonomous O&M / Robotics: autonomous inspection, subsea robotics, drones,
  condition monitoring, defect detection, remote operations and repair support.
- Industrial Software / Digital Engineering: engineering platforms, simulation,
  PLM, CAD/CAE, data integration, cybersecurity or industrial data systems used
  in wind-energy infrastructure.
- Smart Grid / Forecasting: wind forecasting, grid integration, flexibility,
  storage coordination, power-market operations and transmission-relevant
  digital systems.
- AI Infrastructure / Data Centres: data-centre and compute-infrastructure
  signals only when linked to offshore wind procurement, renewable energy
  matching, grid capacity, curtailment, flexibility, siting, or energy-system
  impacts.

## 5. Source Strategy

Prefer authoritative and primary sources:

- government, regulators, seabed authorities, grid operators and system
  operators;
- standards, certification, classification and technical bodies;
- offshore wind developers, project owners, utilities and transmission owners;
- turbine OEMs, floating-platform companies and major supply-chain suppliers;
- ports, fabrication yards, installation contractors and vessel operators;
- industrial software, robotics, sensor, forecasting and grid-technology
  vendors when a claim is tied to a concrete sector use case;
- universities, labs, peer-reviewed research and trusted preprint/dataset
  records when technically relevant;
- industry associations and reputable offshore wind, energy and engineering
  trade press for discovery and secondary confirmation.

Commercial intelligence databases may be used only for discovery or
cross-checking unless reuse rights are explicit.

## 6. Minimal Signal Data Model

Minimum useful fields:

- `id` / `slug`
- `title`
- `date`
- `topic`
- `maturity`
- `country` / `region` when supported
- `connectionToFowt`
- `shortDescription`
- `organizations`
- `relatedProjectIds`
- `relatedCompanyIds`
- `technologyTags`
- `evidenceType`
- `sourceIds`
- `status`
- `notes`

Optional fields should remain `null` or absent when unsupported. The data model
must allow source-level, relationship-level and field-level provenance where a
fact is not supported by the main source alone.

## 7. Maturity Model

Use a restrained maturity model:

- Research / Concept
- Prototype
- Pilot / Demonstration
- Commercial Deployment
- Operational / Scaling
- Paused / Cancelled / Superseded
- Unknown

Maturity must follow source evidence. Do not upgrade a vendor claim to
commercial deployment without evidence of actual customer or asset use.

## 8. Proposed `/digital-ai` UX

Future UX should be a static editorial index, not a dashboard.

The first screen should communicate "Digital & AI Signals" and the boundary:
applied digital, AI and automation developments relevant to offshore wind and
energy infrastructure. Items should be compact, with topic, maturity, date,
source, region and a one-line FOWT connection.

Useful first filters:

- topic
- maturity
- region
- organization type

Detail pages are optional for the MVP. If added later, a detail page should
prioritize source-backed identity, sector connection, technical significance,
organizations, related projects or companies, maturity and provenance.

## 9. Relationship With Existing Product Areas

- Engineering: operational, project, construction, supply-chain and technology
  news may cross-reference Digital & AI when the digital element is material.
- Research: academic AI, digital twin and control papers remain Research items;
  Digital & AI may surface applied significance without duplicating paper pages.
- Industry: future signals may reference existing company IDs, but should not
  modify the Industry Map or imply company involvement without source evidence.
- Projects: future signals may reference project IDs when a digital deployment
  is tied to a verified project, without changing Projects data automatically.

## 10. MVP Scope

The first implementation should be static and small:

- a curated, source-backed signal dataset;
- a `/digital-ai` index;
- lightweight filters;
- provenance links;
- no automatic collection;
- no scoring model unless a deterministic, documented need emerges.

The current M11A task is design only and should add no data or application code.

## 11. Risks

- Generic AI hype overwhelms sector relevance.
- Vendor claims overstate maturity.
- AI infrastructure and data-centre coverage drifts away from wind and grid
  infrastructure.
- Signals duplicate Engineering or Research instead of connecting them.
- Provenance becomes too thin for company, project or technology relationships.
- Commercial database restrictions limit reusable discovery.
- Rapidly changing upstream pages make source persistence difficult.

## 12. Acceptance Criteria

A future Digital & AI MVP should be accepted only if:

- every item has a clear offshore wind, wind-energy infrastructure, or directly
  relevant engineering/energy-system connection;
- every important fact is source-backed;
- unknown fields remain unknown instead of inferred;
- taxonomy and maturity values are controlled;
- the UX stays static, readable and editorial;
- Engineering, Research, Industry and Projects remain independent product areas;
- no backend, database, AI summary layer, scheduler, scraper or CMS is added.

## 13. Out Of Scope

- Generic AI news
- Automatic collection or scheduled updates
- AI-written summaries or subjective AI scoring
- Backend, database, CMS or API routes
- Navigation changes during design
- Changes to Engineering, Research, Industry, Projects or Homepage UX
- Project/company deep integration
- Maps, GIS, financial data or market dashboards
