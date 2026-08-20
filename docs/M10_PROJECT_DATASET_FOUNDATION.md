# M10 Project Dataset Foundation

Status: M10B implementation report
Date: 2026-08-20

## Selected Golden Projects

The first production dataset contains 13 source-backed records:

- Hywind Scotland
- Hywind Tampen
- Kincardine Offshore Wind Farm
- WindFloat Atlantic
- Provence Grand Large
- Eolmed
- DemoSATH
- Pentland Floating Offshore Wind Farm
- Erebus Floating Wind Farm
- Gulf of Maine Floating Offshore Wind Research Array
- Goto Offshore Wind Farm
- Haiyou Guanlan
- WindFloat Pacific

This is a deliberately curated sample, not a global project inventory.

## Geographic And Lifecycle Coverage

Countries represented:

- United Kingdom
- Norway
- Portugal
- France
- Spain
- United States
- Japan
- China

Lifecycle coverage:

- Operational: Hywind Scotland, Hywind Tampen, Kincardine, WindFloat Atlantic,
  Provence Grand Large, Eolmed, DemoSATH, Goto Offshore Wind Farm, Haiyou
  Guanlan.
- Pre-construction: Pentland and Erebus.
- Lease/area awarded: Gulf of Maine research array.
- Cancelled/discontinued: WindFloat Pacific.

## Source Quality

The foundation uses 34 source records:

- Tier 1 government/regulator sources: BOEM, Welsh Government and Maine state
  sources.
- Tier 2 developer/project-owner sources: Equinor, WindFloat Atlantic, Provence
  Grand Large, EDF, Qair, BW Ideol, RWE, INPEX, Chubu Electric, CNOOC and
  Principle Power.
- Tier 3 supplier/contractor sources: Vestas, Siemens, Bourbon, Prysmian, SBM
  Offshore, Stiesdal and Offshore Oil Engineering Co.

No commercial database rows were copied or redistributed.

## Commonly Available Fields

The strongest fields across the sample are:

- project name and country;
- normalized lifecycle status;
- capacity;
- turbine count and turbine rating for multi-turbine European pilots;
- floating technology and broad platform type;
- distance offshore and water depth for operational/pilot projects;
- developer/owner relationship;
- major commissioning, first-power, consent, contract or lease events.

Coordinates were intentionally not added. They are not needed for M10B and would
require a separate GIS licensing and precision review.

## Common Missing Supply-Chain Roles

The most commonly missing verified roles are:

- mooring and anchoring suppliers for newer projects;
- export cable and offshore electrical scopes where announcements do not split
  dynamic/inter-array/export roles clearly;
- FEED and consultancy roles;
- vessel providers;
- certification and assurance bodies.

Missing suppliers are omitted rather than represented as placeholder companies.

## Company Identity Gaps

Existing M9 company IDs were reused where practical, including Equinor, RWE, EDF
Renewables, Ocean Winds, TotalEnergies, Vestas, Siemens Gamesa, Principle Power,
BW Ideol, Saitec Offshore, Stiesdal Offshore, SBM Offshore, Prysmian, JDR,
Vryhof, Subsea7/Seaway7, Bureau Veritas and CIP.

New or unresolved company identities discovered:

- Masdar
- Kvaerner / Aker Solutions
- Bourbon Subsea Services
- Qair
- RTE
- Blue Gem Wind
- Simply Blue Energy
- State of Maine
- Pine Tree Offshore Wind
- University of Maine
- Goto Floating Wind Farm LLC
- Toda Corporation
- INPEX
- CNOOC
- Offshore Oil Engineering Co., Ltd.

These should not automatically expand the Industry Map UI. M10C/M10E should
decide which belong in the shared company model.

## Provenance Lessons

- Project-level provenance is not enough. Turbine, platform, cable and
  ownership facts often come from different source tiers.
- Some official records use rounded capacities. Erebus is one example where
  "100 MW" and "7 x 14 MW" are both source-backed and should not fail strict
  arithmetic validation.
- Self-review can improve records before expansion. Goto initially left turbine
  count and floater supplier less specific, but the owner announcement supported
  8 x 2.1 MW units and Toda's hybrid spar role.
- Government status and developer status can lag each other. Normalized status
  should remain a conservative interpretation with source terminology preserved.
- Cancelled projects need both a historical developer source and an official
  regulator source to avoid treating a discontinued concept as active.

## Data-Model Changes From Real-World Testing

M10A's model held up with two small implementation choices:

- Optional facts are represented as `null` rather than string `UNKNOWN` in the
  machine-readable JSON. This keeps validation simple while preserving "we do not
  know" explicitly.
- The validation rule for capacity versus turbine count/rating allows small
  rounding differences instead of requiring exact multiplication.

## Recommendations For M10C

- Add a shared company identity layer before expanding records heavily.
- Prioritize Scotland, France, Norway, U.S. lease areas and South Korea only
  after source packs are assembled.
- Add a source-review note for every project whose status changed after 2025.
- Keep coordinates out until GIS licences and precision classes are accepted.
- Add project-level editorial summaries only after the source-backed data
  contract is stable.
