# M9 FOWT Industry Map Design Review

## 1. Product Purpose

Create a static `/industry` page that helps engineers and researchers understand
who owns, builds, installs, connects, and assures floating offshore wind projects.
The page is an editorial value-chain map, not a supplier directory or investment
page.

## 2. Client / Supplier Distinction

Separate project-side clients from delivery-side suppliers:

- Project Side / Clients: developers, project owners, utilities, and consortia
  that originate, finance, own, or operate floating wind projects.
- Delivery / Supply Chain: companies and organisations that provide turbines,
  floating platforms, moorings, cables, substations, EPCI, installation,
  certification, grid technology, and engineering tools.

Companies may appear in more than one delivery role when their public record
supports multiple roles.

## 3. Final Value-Chain Taxonomy

Use a five-stage FOWT flow:

1. Develop & Own - Developers / Project Owners / Utilities
2. Build The Floating System - Wind Turbine OEM; Floating Foundation / Platform
3. Secure & Connect - Mooring & Anchoring; Dynamic / Export Cable; Offshore Electrical / Substation
4. Install & Deliver - EPCI / Subsea Engineering; Marine Installation / Vessels
5. Enable & Assure - Grid Technology; Certification / Assurance; Engineering / Simulation / Software

This avoids upstream/midstream/downstream language because FOWT delivery is a
project and marine-systems chain, not a hydrocarbon commodity chain.

## 4. Company-Role Model

The static model should contain:

- company ID and display name;
- country or region;
- company type;
- one or more value-chain role IDs;
- short factual FOWT relevance description;
- official website URL;
- representative verified floating-wind involvement;
- source URL for that involvement.

Stage/category records reference companies by role membership rather than owning
company records.

## 5. Initial Company-Selection Principles

Initial universe should be curated, not exhaustive:

- prefer official company/project pages and recognised public bodies;
- include companies with direct floating-wind project, technology, or delivery
  relevance;
- cover the whole value chain rather than maximising one category;
- avoid stock-market, valuation, market-cap, or financial framing;
- exclude companies where floating-wind relevance is weak or unverifiable.

## 6. Initial Curated Company Universe

Target 30-50 organisations across the chain. Initial set:

- Developers/owners: Equinor, RWE, EDF Renewables, Ocean Winds, Iberdrola / ScottishPower, Copenhagen Infrastructure Partners, Vattenfall, TotalEnergies, Shell, Mainstream Renewable Power, Corio Generation, Green Investment Group.
- Turbine OEMs: Vestas, Siemens Gamesa, GE Vernova, Mingyang, Goldwind.
- Floating platforms: Principle Power, BW Ideol, Saitec Offshore Technologies, Stiesdal Offshore, Ocergy, Hexicon, Technip Energies, SBM Offshore.
- Mooring and anchors: Delmar Systems, Vryhof, Acteon, Bridon-Bekaert, Vicinay Marine.
- Cable/electrical/substation/grid: Prysmian, Nexans, JDR Cable Systems, NKT, Hellenic Cables, Hitachi Energy, Siemens Energy, GE Vernova Grid Solutions.
- EPCI/installation: Subsea7 / Seaway7, Saipem, Boskalis, DEME, Jan De Nul, Heerema Marine Contractors, DOF.
- Enable/assure/software: DNV, ABS, Bureau Veritas, Lloyd's Register, Ramboll, Wood Thilsted, COWI, Orcina, NREL OpenFAST.

## 7. Data Model

Keep M9 data separate under `web/data/industry/` with a small TypeScript module:

- `industryStages`: ordered stage/category taxonomy;
- `industryCompanies`: curated company records;
- helper functions that validate role references and expose companies by role.

No backend, API route, CMS, scraper, or automatic discovery is added.

## 8. `/industry` UX Structure

Page structure:

- intro section framing the map as “who delivers floating wind”;
- compact reading key distinguishing clients and suppliers;
- top-to-bottom value-chain map with numbered stages and directional arrows;
- category blocks inside each stage;
- company cards/names secondary to the stage and technical category;
- short data-boundary note.

Desktop should show a strong full-chain vertical map with balanced category
groups. Mobile should naturally preserve the top-to-bottom story.

## 9. Future Project-Company Relationship Model

Future versions can add project records with role links:

```text
Project -> Developer -> Turbine OEM -> Floating Platform -> Mooring -> Cable -> Installation Contractor -> Grid / Electrical
```

M9 does not build a project database. It only keeps company roles stable enough
for future project-role references.

## 10. Relationship With Weekly And Research

The site should communicate three knowledge dimensions:

- Engineering / Weekly: what happened in current engineering briefings;
- Industry: who builds and delivers floating wind;
- Research: what is being studied through deterministic digest output.

Add `Industry` to primary navigation without renaming routes or changing existing
Engineering, Research, Archive, Methodology, or About behavior.

## 11. Explicit Out Of Scope

M9 does not add:

- share prices, market cap, investment data, financial APIs, or real-time data;
- supplier search, filters, company detail pages, logo wall, table, dashboard,
  Sankey, or network graph;
- project database or historical project backfill;
- backend, database, CMS, API routes, scraping, automatic company discovery;
- Research Pipeline or Engineering Briefing generation changes;
- deployment or CI/CD changes.

## 12. Acceptance Criteria

M9 passes when:

- `/industry` clearly explains the FOWT value chain;
- clients and delivery suppliers are visually distinct;
- technical categories are credible and readable;
- companies can appear in multiple roles;
- 30-50 meaningful organisations are represented with source-backed relevance;
- the page feels editorial and engineering-focused, not like a supplier database;
- desktop and mobile layouts are understandable;
- existing Engineering, Research, Archive, Search, Methodology, and About areas
  remain unchanged;
- full accepted validation passes.
