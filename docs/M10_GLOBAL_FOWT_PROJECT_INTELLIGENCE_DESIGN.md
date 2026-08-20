# M10 Global FOWT Project Intelligence Design

Status: M10A design and source audit
Date: 2026-08-20
Scope: design only. This is not the production project dataset.

## 1. Product Purpose

M10 should add Projects as a core knowledge entity for FOWT Digest:

> A curated, source-backed global dataset of known floating offshore wind projects.

The product should help answer where floating offshore wind projects are, what
stage they are at, which technologies they use, which companies participate, and
when those company relationships became public or effective. It must not claim
absolute global completeness. The correct product behaviour is to expose known,
verified records and show `UNKNOWN` where a fact is not supported.

Projects are the bridge between the current knowledge areas:

- Engineering: physical configuration, water depth, cables, moorings, floating
  platform and installation methods.
- Industry: developers, owners, OEMs, platform providers, suppliers and advisers.
- Research: technologies and operational questions linked to real assets.

## 2. Definition Of A FOWT Project

A FOWT project is a named offshore wind development, demonstration, pilot,
research lease, test deployment or commercial lease/project area where public
sources explicitly state that the wind turbine support system is floating or
that the area/project is designated for floating offshore wind.

Include:

- single-device prototypes connected to a grid or test site;
- pilot arrays and pre-commercial projects;
- commercial floating projects with seabed rights, consent, permits, auctions or
  public development status;
- historically important paused, cancelled, decommissioned or relinquished
  projects.

Exclude unless specifically needed as context:

- fixed-bottom offshore wind projects;
- generic offshore wind zones where floating technology is not identified;
- pure technology concepts without a named deployment site;
- company capability claims with no project relationship.

## 3. Global Coverage Strategy

Coverage should be curated in phases rather than loaded from one external
database. The first production dataset should prioritize jurisdictions with
strong public source coverage:

- Mature operational and pilot projects: Norway, Scotland/UK, Portugal, France,
  Spain, Japan and China.
- Large development pipelines: Scotland, Celtic Sea, France Mediterranean,
  Norway Utsira Nord, U.S. Pacific/Gulf of Maine, South Korea Ulsan.
- Emerging verified markets: Italy, Taiwan, Australia, Ireland and other markets
  only where an official/project source verifies floating status.

Each region should have a source pack before records are promoted:

- authoritative registry or seabed/government source for project identity/status;
- developer/project source for configuration and ownership;
- supplier announcements for supply-chain roles;
- regulator/planning records for consents, coordinates, environmental status and
  cable routes where available.

## 4. Source Hierarchy

Use this order when sources conflict:

1. Government, regulator, seabed authority, official planning or licence record.
2. Developer, project company or owner official source.
3. Supplier, contractor or partner official announcement.
4. Industry association, classification society or technical body.
5. Reputable offshore-wind trade press.

Trade press and commercial databases may support discovery, but facts should be
promoted only after validation against higher-tier sources where possible.

## 5. Candidate Authoritative Data Sources

Primary source candidates identified in this audit:

- Crown Estate Scotland current offshore wind projects and Scottish Government
  offshore wind annexes for Scottish status, capacity, leasing round and
  developers.
- The Crown Estate Round 5 pages, award notices and Marine Data Exchange for
  Celtic Sea project development areas and supporting documents.
- BOEM state activity pages, lease pages, executed leases and
  MarineCadastre.gov for U.S. lease areas, lease holders, maps and public-domain
  lease boundary GIS.
- French prefecture, DREAL, maritime planning and ministry pages for Provence
  Grand Large, EFGL, Eolmed and Mediterranean AO6/AO9/AO10 projects.
- Norway Energy Ministry, NVE cases and Equinor official project pages for
  Hywind and Utsira Nord.
- Portugal DGEG and WindFloat Atlantic official sources for WindFloat Demo and
  WindFloat Atlantic.
- Spain IDAE, BiMEP/Basque sources and project/developer sources for DemoSATH
  and PivotBuoy/X1 Wind.
- Italy MASE environmental assessment portal and project company sources for
  7Seas Med and Med Wind.
- Japan METI/MLIT announcements and project-owner sources for Goto City.
- South Korea project-company sources and, where available, government/licensing
  records for Ulsan projects such as MunmuBaram.
- China National Energy Administration, CNOOC, China Three Gorges and
  classification body sources for Chinese demonstrations.
- Taiwan Ministry of Economic Affairs sources for floating demonstration policy;
  add named projects only when project awards or permits are verified.
- Australia DCCEEW, Offshore Infrastructure Registrar and state pages for
  feasibility licences; treat as offshore wind unless a project source verifies
  floating technology.
- GWEC, WindEurope, RenewableUK and classification bodies as market context and
  cross-checking sources, not sole provenance for record facts.

Reference examples audited:

- Crown Estate Scotland current projects:
  https://www.crownestatescotland.com/scotlands-property/offshore-wind/current-projects
- Scottish Government offshore wind map annex, January 2026:
  https://www.gov.scot/publications/update-2020-offshore-wind-policy-statement-scotlands-offshore-wind-ambition-2/pages/4/
- The Crown Estate Round 5:
  https://www.thecrownestate.co.uk/our-business/marine/round-5
- BOEM California activities:
  https://www.boem.gov/renewable-energy/state-activities/california-activities
- BOEM Maine research lease:
  https://www.boem.gov/renewable-energy/state-activities/state-maine-research-lease
- BOEM lease boundary data catalogue:
  https://catalog.data.gov/dataset/offshore-wind-lease-outlines
- France PGL prefecture page:
  https://www.bouches-du-rhone.gouv.fr/Actions-de-l-Etat/Environnement-risques-naturels-et-technologiques/Transition-energetique-energies-renouvelables/Projet-Provence-Grand-Large-PGL
- Provence Grand Large project page:
  https://provencegrandlarge.fr/en/the-floating-offshore-park/discover-the-park/
- Portugal DGEG offshore wind:
  https://dgeg.gov.pt/en/vertical-areas/energy/energy-sustainability-division/offshore-wind-energy/offshore-wind-energy-implemented-in-portugal/
- WindFloat Atlantic project:
  https://windfloat-atlantic.com/the-wind-farm/
- Norway Utsira Nord:
  https://www.regjeringen.no/no/tema/energi/fornybar-energi/havvind/utsira-nord-/id3052997/
- NVE Utsira Nord project-area case:
  https://www.nve.no/konsesjon/konsesjonssaker/konsesjonssak?id=26078&type=A
- Equinor Hywind Scotland:
  https://www.equinor.com/energy/hywind-scotland
- Equinor Hywind Tampen:
  https://www.equinor.com/energy/hywind-tampen
- Japan METI Goto operation announcement:
  https://www.meti.go.jp/press/2025/01/20260105001/20260105001.html
- INPEX Goto City:
  https://www.inpex.com/english/business/project/goto-city.html
- MunmuBaram:
  https://www.munmubaram.com/
- Italy MASE 7Seas Med EIA portal:
  https://va.mite.gov.it/en-GB/Oggetti/Info/7273
- Med Wind:
  https://medwind.it/en/
- DemoSATH / Saitec:
  https://saitec-offshore.com/en/demosath-two-years-of-floating-offshore-wind-in-spain/
- DemoSATH / RWE:
  https://www.rwe.com/en/our-energy/discover-renewables/floating-offshore-wind/demosath/
- X1 Wind:
  https://www.x1wind.com/
- CNOOC Anlan:
  https://www.cnooc.com.cn/zxzx/gsxw/gsxw/202608/t20260807_122279.html
- China NEA Three Gorges floating unit:
  https://www.nea.gov.cn/2021-07/30/c_1310097503.htm
- China Huaneng Ruifeng:
  https://www.chng.com.cn/detail_jtyw/-/article/ccgb60va5Gwc/v/1314701.html
- GWEC Global Offshore Wind Report:
  https://www.gwec.net/reports/globaloffshorewindreport

## 6. Licensing And Reuse Considerations

Design assumptions:

- Facts are not copyrighted in many jurisdictions, but source wording, tables,
  maps, images and database selections may be protected. FOWT Digest should
  extract factual fields, write its own descriptions, and preserve attribution.
- Government open-data terms vary. BOEM lease boundary data is listed through
  data.gov with a U.S. public-domain label. Other government portals may still
  require attribution or impose no-warranty terms.
- GIS data requires separate checking. The Crown Estate Marine Data Exchange
  terms allow limited use of downloaded information and restrict redistribution
  and externally accessible GIS uses. Do not mirror MDE datasets or publish MDE
  GIS layers unless the specific dataset licence permits it.
- Commercial intelligence products such as 4C Offshore/TGS, RenewableUK
  EnergyPulse and similar databases should be treated as discovery and
  cross-checking tools only unless their contract explicitly permits reuse and
  redistribution. Do not copy their project database rows, derived selections or
  contract intelligence.
- Developer and supplier announcements can support factual extraction and
  citation. Avoid reproducing marketing text.
- Project maps, coordinates and lease polygons must carry source-specific
  licences and attribution. If rights are uncertain, store only a source URL and
  use approximate text location.

## 7. Project Data Model

Minimum useful project entity:

```ts
type Project = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  country: string;
  region: string;
  seaArea?: string | "UNKNOWN";
  locationDescription?: string | "UNKNOWN";
  coordinates?: {
    latitude: number;
    longitude: number;
    precision: "exact" | "centroid" | "approximate";
    sourceId: string;
  } | "UNKNOWN";
  sourceStatus: string;
  normalizedStatus: ProjectStatus;
  capacityMw?: number | "UNKNOWN";
  turbineCount?: number | "UNKNOWN";
  turbineRatingMw?: number | "UNKNOWN";
  waterDepthM?: string | "UNKNOWN";
  distanceOffshoreKm?: string | "UNKNOWN";
  expectedCod?: string | "UNKNOWN";
  actualCod?: string | "UNKNOWN";
  floatingTechnology?: string | "UNKNOWN";
  platformType?: PlatformType | "UNKNOWN";
  developerOwnerText?: string | "UNKNOWN";
  ownershipStructure?: OwnershipStake[] | "UNKNOWN";
  sourceIds: string[];
  factClaims: FactClaim[];
};
```

Recommended controlled `PlatformType` values:

- `spar`
- `semi_submersible`
- `barge`
- `tension_leg_platform`
- `twin_hull`
- `other`
- `unknown`

Do not make a field required only because it is useful. Capacity, turbine count,
technology, ownership and COD can remain `UNKNOWN`.

## 8. Project Status Taxonomy

Store source terminology and normalized status separately.

Normalized statuses:

- `concept_early_development`: named but no public lease/permit/consent.
- `lease_or_area_awarded`: seabed rights, lease, feasibility licence,
  development area or research lease awarded.
- `development`: active project development, surveys, public consultation,
  grid/planning work or permitting preparation.
- `consented`: key project consent or marine licence granted.
- `pre_construction`: consented and progressing financing, CfD, procurement or
  final design before construction.
- `under_construction`: fabrication, offshore installation, cable works or
  construction campaign started.
- `commissioning`: first power or commissioning but not full operation.
- `operational`: full operation/commercial operation or source equivalent.
- `paused`: formally paused, suspended or delayed with continuing rights.
- `cancelled`: cancelled, rescinded, abandoned or no longer being processed.
- `decommissioned`: removed or source states decommissioned/end of operation.

## 9. Company / Project / Role Relationship Model

Projects should connect to companies through relationship records, not through
free-text fields alone.

```ts
type ProjectCompanyRole = {
  id: string;
  projectId: string;
  companyId?: string;
  companyName: string;
  role: SupplyChainRole;
  roleDetail?: string;
  startDate?: string | "UNKNOWN";
  endDate?: string | "UNKNOWN";
  status: "active" | "past" | "announced" | "unknown";
  sourceStatusText?: string;
  sourceIds: string[];
  factClaims: FactClaim[];
};
```

Rules:

- Reuse M9 company IDs where the organisation already exists.
- Create new company entities only after a source-backed relationship requires
  them.
- A company may have multiple roles on one project.
- A project may have unknown suppliers.
- Do not infer a supplier from market position or technology ownership unless a
  source states the role on that project.

## 10. Supply-Chain Role Taxonomy

Initial controlled roles:

- `developer_owner`
- `wind_turbine_oem`
- `floating_platform_technology_provider`
- `platform_engineering`
- `fabrication`
- `mooring`
- `anchoring`
- `dynamic_cable`
- `inter_array_cable`
- `export_cable`
- `offshore_electrical`
- `grid_connection`
- `feed`
- `epci`
- `subsea_engineering`
- `marine_installation`
- `vessel_provider`
- `operations_maintenance`
- `engineering_consultancy`
- `certification_assurance`
- `research_public_body`
- `port_infrastructure`
- `other_verified_role`

Role records should allow role detail text because real announcements often use
mixed scopes such as "EPCI for floating foundation and mooring system" or
"dynamic cable pre-FEED".

## 11. Timeline Event Model

```ts
type ProjectTimelineEvent = {
  id: string;
  projectId: string;
  date: string;
  datePrecision: "day" | "month" | "year";
  eventType: TimelineEventType;
  title: string;
  description: string;
  companyIds: string[];
  sourceIds: string[];
  factClaims: FactClaim[];
};
```

Controlled event types:

- `lease_award`
- `area_award`
- `research_lease_award`
- `development_award`
- `consent_application`
- `consent`
- `marine_licence`
- `environmental_approval`
- `grid_connection_agreement`
- `subsidy_or_cfd_award`
- `fid`
- `technology_selection`
- `turbine_selection`
- `platform_selection`
- `feed_contract`
- `epci_contract`
- `cable_contract`
- `mooring_contract`
- `anchoring_contract`
- `fabrication_contract`
- `installation_contract`
- `construction_start`
- `platform_launch`
- `tow_out`
- `turbine_installation`
- `first_power`
- `commissioning`
- `commercial_operation`
- `project_pause`
- `project_cancellation`
- `lease_relinquishment`
- `decommissioning`
- `ownership_change`
- `other_verified_event`

Never create a timeline event from inference. If a source says a project is
operational but does not give the commissioning date, record status and leave
timeline date `UNKNOWN` until another source supports it.

## 12. Provenance Model

Provenance must be attached to facts and relationships, not only to projects.

```ts
type Source = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  sourceTier: 1 | 2 | 3 | 4 | 5;
  publishedDate?: string | "UNKNOWN";
  accessedDate: string;
  licenceNote?: string;
};

type FactClaim = {
  path: string;
  value: string | number | boolean;
  sourceId: string;
  quote?: string;
  note?: string;
  confidence: "high" | "medium" | "low";
};
```

Examples:

- `project.capacityMw = 25` from a project page.
- `project.normalizedStatus = operational` from a commissioning announcement.
- `projectCompanyRole.role = wind_turbine_oem` from a developer press release.
- `timeline.eventType = consent` from a regulator decision notice.

## 13. Handling Unknown / Incomplete Information

Use `UNKNOWN` when a fact cannot be sourced. Do not fill:

- exact coordinates from map screenshots;
- ownership percentages from unsourced summaries;
- platform technology from a company's normal product line;
- COD dates from expected construction schedules unless stated as expected;
- supplier roles from general framework agreements unless project-specific.

When sources conflict:

- preserve the original source values;
- choose the normalized value from the highest-tier and latest source;
- add a note explaining the conflict;
- avoid overwriting history. If a project moves from consented to under
  construction, retain the consent event.

## 14. Relationship With Existing Industry Map

M9 currently has `IndustryCompany` records with stable role IDs and
source-backed representative involvement. M10 should not duplicate those
companies in project data.

Future connection:

```text
IndustryCompany.id
  -> ProjectCompanyRole.companyId
  -> Project.id
  -> ProjectTechnology / ProjectTimelineEvent
```

Examples the model should support later:

- Principle Power -> projects using WindFloat technology.
- Prysmian -> verified projects where it supplied cable systems.
- Project -> developer -> turbine OEM -> platform provider -> mooring -> cable
  -> installation -> grid connection.

M10A does not modify the Industry Map. Later M10 work should add adapters or
shared identifiers only after the project dataset contract is accepted.

## 15. Future `/projects` UX

Do not implement in M10A. Future design target:

- `/projects`: dense project index with filters for region, country, lifecycle
  status, floating technology and developer. It should read as a curated
  technical directory, not a marketing landing page.
- `/projects/[slug]`: detail page ordered as:
  1. project identity and status;
  2. technical configuration;
  3. supply-chain ecosystem;
  4. source-backed timeline;
  5. sources and provenance.

A map can be added later, but only after GIS licensing and coordinate precision
rules are settled.

## 16. Proposed M10 Implementation Phases

- M10B: define static data contract and validators for projects, sources,
  company roles and timeline events. No UI.
- M10C: build a small seed dataset from high-confidence operational/pilot
  projects with fact-level provenance.
- M10D: add development/lease pipeline records for Scotland, Celtic Sea, France,
  Norway and the U.S. with conservative status mapping.
- M10E: add project-company relationship records and link to existing M9 company
  IDs where exact matches exist.
- M10F: add `/projects` and `/projects/[slug]` static pages.
- M10G: expand Asia-Pacific and emerging markets after source packs are reviewed.
- M10H: optional map/GIS work after licensing and geometry policy is accepted.

## 17. Acceptance Criteria

M10A passes when:

- this document defines a conservative Project entity and relationship model;
- source hierarchy and licensing risks are explicit;
- status, role, timeline and provenance taxonomies are proposed;
- unknown information handling prefers `UNKNOWN` over unsupported certainty;
- current Industry Map integration is described without modifying M9 data;
- future `/projects` UX is scoped but not implemented;
- a preliminary project landscape table estimates the project universe without
  claiming completeness;
- no application code or production project dataset is created.

## 18. Explicit Out Of Scope

M10A does not:

- implement `/projects` or `/projects/[slug]`;
- create production JSON/TypeScript project data;
- modify the Industry Map;
- add map rendering or GIS assets;
- scrape commercial databases;
- add backend services, APIs, schedulers, CMS, databases or automation;
- infer facts, suppliers, timelines or technology selections from unsourced
  assumptions.

## Preliminary Project Landscape Table

This table is a source-audit aid, not production data. It estimates the likely
project universe and highlights data-quality work. Capacities and statuses below
must be re-verified during production ingestion.

| Region | Project / area | Country | Lifecycle signal | Approx. capacity | Source availability | Data-quality notes |
| --- | --- | --- | --- | ---: | --- | --- |
| Europe | Hywind Demo | Norway | Operational / long-running demo | 2.3 MW | Developer | Historically important; verify current operating status and decommissioning plan. |
| Europe | Hywind Tampen | Norway | Operational | 94.6 MW | Developer, public funding sources | Strong technical source; powers oil and gas assets rather than public grid. |
| Europe | Utsira Nord project areas | Norway | Area/project awards and NVE cases | 1,500 MW area; 500 MW project cases | Government, NVE | Project names, ownership and areas need careful case-by-case modelling. |
| UK | Hywind Scotland | Scotland | Operational | 30 MW | Developer, Scottish Government | Strong operational and technical data. |
| UK | Kincardine | Scotland | Operational | 48-50 MW | Scottish Government, project sources | Verify exact installed capacity and ownership history. |
| UK | Pentland Floating Offshore Wind Farm | Scotland | Consented / pre-construction | up to 100 MW | Project, Marine Scotland docs | Strong consent documents; procurement roles likely separate. |
| UK | Green Volt | Scotland | Consented | 560 MW | Scottish Government | INTOG project; verify floating/offshore electrification details. |
| UK | Salamander | Scotland | Consented | 100 MW | Scottish Government | INTOG; supplier/technology roles need project sources. |
| UK | Buchan Offshore Wind | Scotland | In planning | 960 MW | Scottish Government | ScotWind floating; validate current project name and owners. |
| UK | MarramWind | Scotland | In planning | 3,000 MW | Scottish Government, developer | Large floating development; timeline likely evolving. |
| UK | Muir Mhor | Scotland | In planning | 1,005 MW | Scottish Government | Validate developer changes and project status. |
| UK | Ossian | Scotland | In planning | 3,610 MW | Scottish Government | Large floating project; strong leasing source. |
| UK | Arven | Scotland | Lease awarded | 2,300 MW | Scottish Government | Lease-stage; do not overstate certainty. |
| UK | Bellrock | Scotland | Lease awarded | 1,800 MW | Scottish Government | Validate developer identity and current status. |
| UK | Havbredey | Scotland | Lease awarded | 1,500 MW | Scottish Government | Validate ownership and status before ingestion. |
| UK | Stoura | Scotland | Lease awarded | 500 MW | Scottish Government | Floating lease-stage project. |
| UK | Stromar | Scotland | Lease awarded | 1,000 MW | Scottish Government | Floating lease-stage project. |
| UK | Talisk | Scotland | Lease awarded | 495 MW | Scottish Government | Floating lease-stage project. |
| UK | CampionWind | Scotland | Lease relinquished | 3,000 MW | Scottish Government | Important cancelled/relinquished record. |
| UK | Project Erebus | Wales | Consented / CfD awarded | 100 MW | Welsh Government, NRW | Strong government sources; schedule has shifted and must be checked. |
| UK | Celtic Sea Round 5 PDA 1/2/3 | Wales / England | Agreements for lease / direct award | up to 4,500 MW total | The Crown Estate, Find a Tender | Model as areas/projects only after award names are settled. |
| Europe | WindFloat Demo | Portugal | Decommissioned / completed demo | 2 MW | Portugal DGEG | Historically important; operation 2011-2016. |
| Europe | WindFloat Atlantic | Portugal | Operational | 25 MW | DGEG, project | Strong technical and timeline data. |
| Europe | Provence Grand Large | France | Operational | 25 MW | Prefecture, project, EDF | Strong technical, consent and commissioning data. |
| Europe | EFGL | France | Under construction / commissioning expected | 30 MW | French ministry/planning, project | Verify actual commissioning status before ingestion. |
| Europe | Eolmed | France | Under construction | 30 MW | French ministry/planning, developer | Verify construction and commissioning status. |
| Europe | AO6 Narbonnaise | France | Awarded / development | 250 MW | French government | Commercial floating project; exact project naming and winners need source pack. |
| Europe | AO6 Golfe de Fos | France | Awarded / development | 250 MW | French government | Commercial floating project; exact project naming and winners need source pack. |
| Europe | DemoSATH | Spain | Operational demo | 2 MW | IDAE, RWE, Saitec | Strong technical source; test-site project. |
| Europe | PivotBuoy / X30 | Spain | Completed prototype | part-scale | Developer | Treat as prototype, not wind farm; verify lifecycle endpoint. |
| Europe | 7Seas Med | Italy | Environmental assessment / early development | 250 MW | MASE portal, EU tender | Official EIA data exists; current status requires review. |
| Europe | Med Wind | Italy | Development / permitting target | multi-GW | Project company | Use official project data with caution; verify against MASE concessions/EIA. |
| North America | California lease OCS-P 0561 | U.S. | Lease awarded | UNKNOWN | BOEM | Floating lease area; record title changed after issuance. |
| North America | California lease OCS-P 0562 | U.S. | Lease awarded | UNKNOWN | BOEM | Floating lease area; company/project name needs normalization. |
| North America | California lease OCS-P 0563 | U.S. | Lease awarded | UNKNOWN | BOEM | Floating lease area; record title changed after issuance. |
| North America | California lease OCS-P 0564 / Golden State Wind | U.S. | Cancellation/rescission pending per settlement | UNKNOWN | BOEM | Important paused/cancelled risk record; track exact legal status. |
| North America | California lease OCS-P 0565 | U.S. | Lease awarded | UNKNOWN | BOEM | Floating lease area; project details likely sparse. |
| North America | Maine Research Array | U.S. | Research lease | up to 144 MW | BOEM | Good public source; project company/suppliers unknown. |
| North America | WindFloat Pacific | U.S. | No longer processed | UNKNOWN | BOEM | Historically important cancelled/non-processed Oregon pilot. |
| Asia-Pacific | Goto City Offshore Wind | Japan | Commercial operation | 16.8 MW | METI, INPEX | Strong government and owner sources. |
| Asia-Pacific | Fukushima floating demonstrators | Japan | Decommissioned / historical | multiple demos | Government/project sources needed | Important history; requires separate source pack before inclusion. |
| Asia-Pacific | MunmuBaram | South Korea | Development / approvals | 750 MW | Project company | Good project source; seek Korean government permit sources. |
| Asia-Pacific | Ulsan floating wind cluster | South Korea | Development cluster | approx. 6 GW target | Project/association sources | Do not create records without named project/developer evidence. |
| Asia-Pacific | Three Gorges Yinling / Yangjiang floating unit | China | Operational demo | 5.5 MW | NEA, CTG-related sources | Strong official signal; naming requires Chinese/English normalization. |
| Asia-Pacific | CNOOC Guanlan / Anlan floating unit | China | Operational demo | 7.25-16 MW class records | CNOOC | Separate projects/units carefully; verify names, COD and sites. |
| Asia-Pacific | Huaneng Ruifeng | China | Demonstration construction started | 17 MW unit | Huaneng | Demo record; verify project connection and completion status later. |
| Asia-Pacific | Taiwan floating demonstration programme | Taiwan | Programme / planned demos | UNKNOWN | MOEA | Do not add named projects until awards or permits are verified. |
| Asia-Pacific | Spinifex Offshore Wind Farm | Australia | Feasibility licence | 1 GW+ | Australian/Victorian government | Offshore wind verified; floating status should remain `UNKNOWN` unless sourced. |

Estimated initial universe:

- High-confidence operational/completed floating records: about 15-20 projects or
  prototype deployments globally.
- Development, consented and lease/area-awarded floating records: at least
  40-60 additional records, with Scotland, France, Norway, U.S. Pacific/Gulf of
  Maine and South Korea providing the largest near-term expansion.
- Data-quality challenge: commercial pipelines and public lease areas often
  expose different entities. A lease, project company, project name and future
  wind farm can be distinct records unless sources show they are the same.
