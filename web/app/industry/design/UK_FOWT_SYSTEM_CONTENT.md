# UK floating wind: from materials to megawatt-hours

Accepted research/content draft. Evidence checked on **22 October 2026**.
The implemented Industry guide uses `web/data/industry/uk-system-guide.json`,
with additional terminology/funding clarification and explicit source-claim scopes.
This document preserves the numbered research outline; the page groups it into
five chapters and uses topic names for cross-references. Projects data is unchanged.

A floating wind farm is a physical machine, a development project and an
electricity business. Different organisations make each part work.

Read the labels carefully:

- **Confirmed role**: an institution's responsibility supported by official guidance.
- **Typical practice**: a common engineering or commercial arrangement, not a rule for every farm.
- **Project example**: a named, sourced arrangement; do not generalise it to other projects.
- **Changing arrangements**: reforms, proposals or new rules requiring dates and scope.
- **Engineering interpretation**: an explanatory dependency or failure mode, not a new project finding.

The electricity-system and market explanation below is about **Great Britain
(England, Scotland and Wales)**. “UK supply chain” includes organisations serving
UK projects and international suppliers; it does not mean everything is made in
the UK. Northern Ireland's electricity-market arrangements are outside this guide.

## 1. The complete chain: four maps, not one hierarchy

```text
INDUSTRIAL DELIVERY
Materials → Components → Subsystems → Engineered/manufactured packages
          → Installation and integration → Operating wind farm

PROJECT DEVELOPMENT
Rights + surveys + consent + design + grid + revenue + finance
          → Investment decision → Construction → Operation → Decommissioning

PERMISSIONS AND COORDINATION — alongside the delivery chain
Seabed manager · consenting authorities · environmental advisers
Government · Ofgem · NESO · industry codes

ELECTRICITY AND ITS MARKET — two separate flows
Physical: Wind farm → Network → Consumers
Money:    Buyers → Generator; LCCC ↔ Generator; Network users → Network revenue
```

**Typical practice / interpretation.** The table below describes normal customers
and risks, not a universal contract structure. A developer can buy directly or
through package contractors. EPCI means *engineer, procure, construct and install*;
using it transfers some delivery risk for a price, rather than eliminating risk.
[Procurement structures — BVG/ORE guide](https://guidetofloatingoffshorewind.com/procurement-structures/).

| Level | What it supplies next | Who normally pays whom | Main exposure | Examples / evidence |
|---|---|---|---|---|
| Materials | Steel products, copper/aluminium, concrete inputs, composite fibres/resins | Component maker pays materials processor; processor buys feedstock | Commodity price, energy cost, provenance, grade/quality | Tata Steel UK participates in a floating-platform steel R&D collaboration; that is not a commercial farm supply award. [Tata Steel](https://www.tatasteeluk.com/corporate/news/industrial-collaboration-to-develop-strip-steel-floating-offshore-wind-platforms) |
| Components | Fabricated plates, chain, rope, cable cores, connectors, blades, bearings | Subsystem supplier pays specialist manufacturer | Fatigue quality, defects, qualification, delivery slots | Bridon-Bekaert and Lankhorst supply mooring-line products; the line designer specifies the system. [Mooring lines guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-3-mooring-system/b-3-2-mooring-lines/) |
| Subsystems | Turbine electrical equipment, station keeping, dynamic cable assemblies | OEM or package lead pays subsystem suppliers | Compatibility, loads, thermal performance, certification evidence | Electrical component firms supply into turbine packages; OEM integration matters. [Turbine electrical guide](https://guidetofloatingoffshorewind.com/guide/t-wind-turbine/t-4-electrical-system/) |
| Packages | Designed turbine, floater, mooring spread, electrical network | Project company pays OEM/fabricator/package contractor | Design changes, warranties, fabrication rate, cost escalation | Principle Power supplies floating technology; fabricators and contractors build/deliver structures under the chosen scope. [Floater guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-2-floating-substructure/) |
| Integration / marine delivery | An installed, connected and tested system | Project company or package lead pays ports, installers and vessel contractors | Weather, vessel availability, damage, schedule interfaces | Boskalis documents transport/installation work at Kincardine. [Contractor case study](https://boskalis.com/media/jgldcrcn/kincardine.pdf) |
| Developer / project company | A permitted, financed generation business and coordinated contracts | Sponsors fund development/equity; lenders may fund construction; project company pays suppliers | Unbuilt-project losses, interface gaps, revenue and completion | A special-purpose vehicle (SPV) holds the project and contracts specialist work. [Development services guide](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-1-development-and-consenting-services/) |
| Transmission infrastructure | Available connection capacity between offshore generation and the wider grid | Under traditional generator-build OFTO arrangements, OFTO buys assessed assets; licensed revenue supports ownership/O&M | Cable failure, availability, asset transfer, repair | OFTO is a licensed asset owner, not the purchaser of generated electricity. [DESNZ OFTO explanation](https://www.gov.uk/government/calls-for-evidence/offshore-transmission-owner-ofto-regime/offshore-transmission-owner-regime-ofto-call-for-evidence-accessible-webpage) |
| Electricity system / market | Real-time balancing, network access and commercial settlement | Buyers pay generators; network charges and balancing/settlement cashflows follow separate rules | Forecast error, constraints, outages, price exposure | NESO balances; Elexon administers BSC settlement. [NESO BM](https://www.neso.energy/what-we-do/systems-operations/what-balancing-mechanism), [Elexon trading](https://www.elexon.co.uk/bsc/about/trading-electricty-market/) |
| Public coordination / regulation | Rights, permissions, licences, policy and consumer protection | Applicants may pay fees/rent; this is not an equipment-purchase tier | Environmental acceptability, statutory compliance, policy change | Seabed manager, consenting authority, Ofgem and DESNZ have different jobs. See jurisdiction and market sections below. |

## 2. The developer is the project integrator

**Typical practice.** The developer does not manufacture every item. It makes
separately designed packages deliver one buildable, operable business. Functions
may be internal, seconded, shared across a joint venture or outsourced; these are
responsibilities, not a mandatory organisation chart.

| Function group | Teams included | What they coordinate |
|---|---|---|
| Development and delivery control | Project development; project management / PMO (project management office) | Scope, programme, budget, decisions and change control |
| Integrated technical design | Engineering; turbine; floating structure; mooring; dynamic cables | Common loads, motion limits, interfaces and design basis |
| Electrical delivery | Electrical systems; grid connection | Array/export architecture, protection, compliance and connection works |
| Permission and people | Consenting/environment; fisheries/stakeholders; HSE (health, safety and environment) | Acceptable design envelope, consultation, safe design and safe work |
| Commercial commitments | Procurement/supply chain; commercial/CfD; project finance; legal/contracts | Prices, responsibilities, warranties, revenue, funding and contingencies |
| Build and handover | Construction; marine operations; commissioning | Port and vessel plans, installation, tests, energisation and handover |
| Long-term ownership | Operations and asset management | Availability, inspections, repair logistics, integrity and lifetime obligations |

The grouping above is our explanatory model. FEED is *front-end engineering and
design*: it develops the integrated design and procurement basis. Project
management links technical packages to budgets, construction and power-sales
arrangements. [Engineering/FEED guide](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-5-engineering-and-consultancy/),
[Project management guide](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-6-project-management/).

**Interpretation example.** A larger turbine can change floater loads, mooring
tension, cable excursions, crane requirements, consent dimensions and financing
costs. The technical team cannot approve it independently of the commercial,
consenting, port and operations teams. The developer needs one controlled
interface register and a way to assess changes across packages.

## 3. The lifecycle: chronological decisions, parallel work

This is a typical decision sequence, not a statutory checklist. Surveys,
consenting, grid, revenue and procurement overlap and may loop back. Early
reservations or enabling works can precede FID, with explicit risk acceptance.

| Stage / objective | Main technical activity | Main commercial activity | Authority or decision-maker | Gate to the next commitment |
|---|---|---|---|---|
| Seabed leasing: obtain development rights | Screen sites and constraints | Bid, option/agreement-for-lease terms | The Crown Estate or Crown Estate Scotland | Appropriate rights and conditions understood; no construction permission implied |
| Site investigation: characterise the site | Wind/waves/current, ecology, bathymetry, geophysics, soil samples | Commission surveys and data rights | Survey permissions and environmental authorities where needed | Adequate, quality-checked data for the next design/assessment stage |
| Concept selection: choose a feasible system | Turbine/floater/mooring/cable/layout options | Compare whole-life cost and deliverability | Developer, advisers; engage authorities early | Preferred concept and alternatives fit site, port and consent constraints |
| FEED: define an investable scope | Coupled loads, electrical studies, design interfaces | Tender basis, contracting strategy, risk allocation | Developer/package teams; independent assurance as selected | Design and cost sufficiently defined for bids and major decisions |
| Consenting: obtain lawful permissions | EIA, habitats assessment inputs, mitigation | Land/access agreements and consent conditions | Jurisdiction-specific authorities; see section 4 | Required decisions and an achievable condition-discharge plan |
| Grid connection: secure a workable export route | Connection design, studies, reinforcements | Connection offer, charges, securities and dates | NESO plus relevant TO/DNO | Applicable offer/connection obligations and delivery dependencies understood |
| Route to market: establish revenue | Yield and loss forecasts | CfD auction where pursued; power-sale/PPA terms | DESNZ policy, NESO allocation delivery, LCCC counterparty; commercial buyers | Credible revenue/offtake case; CfD is not the physical sale |
| Procurement: obtain deliverable contracts | Specifications, interfaces and qualification | Negotiate packages, reservations, liabilities and warranties | Project company and suppliers | Sufficiently robust price, scope, schedule and capacity commitments |
| Financing: fund the plan | Independent technical diligence and downside cases | Equity/debt terms, insurance and security | Investors/lenders and their advisers | Funding and conditions precedent sufficiently agreed |
| FID: authorise investment | Confirm design maturity and delivery plan | Approve risk-adjusted business case and capital | Sponsor/project-company investment governance | Investment authorised; unresolved conditions have owners and credible closure plans |
| Manufacturing: make qualified equipment | Detailed design, QA, fabrication, factory tests | Milestone payments and change control | Suppliers/project company; certifier as contracted | Accepted equipment and traceable quality evidence |
| Port integration: assemble the turbine/floater | Heavy lifts, ballast, interfaces, pre-commissioning | Berth/crane/wet-storage and logistics contracts | Port/harbour authorities and delivery team | Stable, tested unit and approved tow/hook-up readiness |
| Installation: secure/connect offshore | Anchors, moorings, cables, tow and hook-up | Vessel execution, weather risk, claims | Marine consent/harbour/safety bodies as applicable | Installed system and inspection/test evidence |
| Commissioning: prove functions | Protection, communications, electrical/mechanical tests | Acceptance, performance and handover terms | Asset parties and network compliance processes | Safe energisation permissions and completed required tests |
| Generation: export commercial output | Metering, dispatch/control and performance | Market/BSC registration, sales and CfD conditions | Network/market bodies; LCCC where relevant | Revenue operation under the applicable agreements |
| Operation: maintain safe availability | Monitor/inspect/repair turbine and subsea assets | O&M contracts, insurance, lifecycle reserves | Owner/operator and relevant regulators | Continuing integrity and compliance; not a one-time gate |
| Decommissioning: discharge end-of-life obligations | Removal/retention assessment, waste and monitoring | Cost provisions, security and contracts | DESNZ for England/Wales; Scottish arrangements separately | Approved programme, obligations and funding; plan starts during development |

Evidence for development workstreams: [environmental surveys](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-2-environmental-surveys/),
[resource/metocean](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-3-resource-and-metocean-assessment/),
[geological/hydrographical surveys](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-4-geological-and-hydrographical-surveys/).
Permission, connection, revenue, installation and end-of-life evidence is detailed
in sections 4, 11, 13 and 15–17. The exit gates are our engineering/commercial
interpretation, not claims that a regulator signs off every stage.

## 4. Who controls seabed rights and permissions?

**Confirmed distinction:** an option, agreement for lease or lease is a property/
development-rights agreement. Consent authorises specified activities under law.
Neither automatically supplies grid access, a CfD or financing.
[Crown Estate Scotland's explanation](https://www.crownestatescotland.com/news/foi-382scotwind-revenue).

| Jurisdiction | Seabed rights | Offshore authorisation | Onshore works and environmental advice |
|---|---|---|---|
| Scotland | Crown Estate Scotland manages relevant Scottish seabed rights | Scottish Ministers; MD-LOT processes relevant marine licences and section 36 consents | Onshore planning is a separate workstream through the relevant route/local authority; NatureScot/JNCC provide nature-conservation advice within their remits |
| England | The Crown Estate | For NSIPs, Planning Inspectorate examination and Secretary of State decision through a DCO; MMO determines relevant marine licences or administers deemed-licence functions | Onshore works may be within a DCO or need separate planning permission; Natural England and other bodies advise |
| Wales | The Crown Estate | NRW is the marine licensing authority on behalf of Welsh Ministers; generation consent may use devolved infrastructure consent or the reserved NSIP route, with transitional/project-specific treatment | PEDW/Welsh Ministers and local planning authorities have roles under the applicable route; NRW and JNCC provide environmental advice within their remits |

Scottish requirements are explained in [MD-LOT guidance, updated 29 September 2026](https://www.gov.scot/publications/marine-licensing-and-consenting-offshore-renewable-energy-projects/pages/licensing-and-consenting-requirements/).
Environmental advisers inform the decision; they are not interchangeable with the
seabed landlord or the consenting authority. [JNCC responsibilities](https://jncc.defra.gov.uk/our-work/ornithology-renewables/).

**Changing arrangements.** England's [MMO guidance, updated 3 August 2026](https://www.gov.uk/guidance/offshore-energy-generation-consents)
explicitly warns against choosing the consent route from capacity alone. Wales'
Significant Infrastructure Projects (SIP) regime commenced in December 2025;
current [SIP guidance](https://www.gov.wales/significant-infrastructure-projects-sip-what-submit-your-application)
includes provisions for deemed marine licences. The [UK NSIP guidance](https://www.gov.uk/guidance/nationally-significant-infrastructure-projects-development-consent-legislation)
explains reserved/devolved boundaries, including the 350 MW offshore-generation
boundary for Wales. Site location, cross-border infrastructure, directions and
transitional rules still matter. Do not reuse the 2023 Welsh flowchart as a
complete current decision tree.

## 5. From rotor to seabed

```text
Wind → blades + hub (rotor) → drivetrain / generator inside the nacelle
                            → power converter → transformer → cable
                    │
                  tower
                    │
                 floater
             ┌──────┴────────┐
        mooring lines    dynamic power cable
             │               │
           anchors        seabed cable/network
             │
        seabed / soil
```

**Typical physical functions.** Blades extract aerodynamic energy; the rotor
turns the drivetrain. The generator converts mechanical power into electrical
power. Designs may be geared or direct drive. The nacelle encloses major
machinery; the tower carries rotor/nacelle loads to the floater.
[US Department of Energy — first-principles explanation](https://www.energy.gov/cmei/systems/how-do-wind-turbines-work).

The floater supplies buoyancy/stability; moorings limit movement; anchors transmit
mooring loads into the soil. The seabed is a design input, not another manufactured
component. Cable and mooring geometry must leave room for motion and installation.
[Floating substructure guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-2-floating-substructure/),
[anchor guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-3-mooring-system/b-3-1-anchors/).

| Concept | How it stays stable | Consequences to examine, not universal rankings |
|---|---|---|
| Semi-submersible | Buoyancy distributed across separated columns/pontoons | Often compatible with quayside turbine integration; wide footprint, structural fabrication and port space matter; compliant moorings allow motion that cables must accommodate |
| Spar | A deep, slender, ballasted body lowers the centre of gravity | Large draft can constrain assembly/towing ports and require deep sheltered integration water; motions and station keeping still need site-specific analysis |
| TLP: tension-leg platform | Excess buoyancy is restrained by tensioned tendons | Can reduce some motions but introduces tendon/anchor uplift demands; stability during transport/installation may need temporary support; cable design still depends on actual response |

These are mechanism-based tradeoffs. Steel/concrete, fabrication method, water
depth, turbine size, port access and installation strategy can outweigh the
headline concept. There is no universally cheapest or most scalable winner.
[Floating technology guide](https://guidetofloatingoffshorewind.com/floating-technology/).

## 6. Follow the electricity: typical voltages and ownership

**Typical architecture, not every project's single-line diagram.** Voltage values
are examples, not requirements. Wind, rotor and landfall do not themselves have
an electrical voltage rating. Generator/converter arrangement and transformer
location depend on the turbine design.

| Section | Purpose / equipment | Typical voltage context | Owner/operator and engineering issue |
|---|---|---|---|
| Wind → rotor | Blades turn aerodynamic power into torque | Not electrical | Generation owner/OEM; variable wind, wakes and loads |
| Generator → converter | Generate electricity and control electrical output | Turbine-internal; guide examples 0.69–3.3 kV | Generation owner/OEM; cooling, fault response and controls |
| Turbine transformer | Match turbine voltage to array network | Example step-up to 66 kV | Generation asset; mass, access, insulation and replacement |
| Dynamic array cable | Bridge moving floater to network | Same nominal array voltage, often 66 kV | Normally generation system; bending/tension fatigue |
| Array cable network | Collect turbine strings/circuits | 66 kV common; older/larger/new designs differ | Generation system; circuit rating, losses, protection and outage exposure |
| Offshore substation, if used | Collect circuits, step up AC or convert to DC | HVAC example 66 → 220 kV | Often transmission-side under a traditional OFTO scope; heavy equipment and maintainability |
| Offshore export cable | Deliver bulk power towards shore | HVAC example 220 kV; HVDC uses its own design rating | Transmission-scope case: developer then OFTO; losses, cable charging for AC, repair |
| Landfall → onshore cable | Cross shore and continue inland | Usually export-circuit voltage until transformation | Cable-system owner; joints, civil works, access, heating and sensitive habitats |
| Onshore substation | Transform/filter/control, or convert DC back to AC | Grid interface may be 132/275/400 kV depending on location | Project/OFTO-side plant versus TO-side bay must be identified |
| Grid connection point | Defined electrical and contractual interface | As specified in connection agreement | Relevant asset parties; protection, metering and compliance |
| GB transmission | Move bulk power through the interconnected network | Commonly 275/400 kV; also 132 kV in Scotland | NGET / SSEN Transmission / SP Transmission; capacity and constraints |
| Distribution → consumers | Step down and deliver locally | Multiple lower-voltage levels; final supply depends on customer | DNOs then customer installations; local capacity and protection |

Sources: [turbine electrical examples](https://guidetofloatingoffshorewind.com/guide/t-wind-turbine/t-4-electrical-system/),
[array cable](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-1-cables/b-1-1-array-cable/),
[export cable](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-1-cables/b-1-2-export-cable/),
[onshore substation](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-5-onshore-substation/),
[National Grid network explanation](https://www.nationalgrid.com/stories/energy-explained/electricity-transmission-vs-electricity-distribution),
[SSEN network methodology](https://www.ssen-transmission.co.uk/globalassets/documents/a-network-for-net-zero/supporting-evidence/network-asset-risk-noms-methodology-.pdf).

**Important branches:** some smaller farms connect to distribution or export
without an offshore substation. Offshore oil-and-gas electrification can have a
different destination entirely. This diagram is not proof that every UK floating
project uses an OFTO or every consumer is reached through the same network path.

## 7. Why dynamic cables are a system problem

```text
Floater cable hang-off + bend control
      ↓ suspended/free-hanging length
      ↑ buoyancy-supported arch (lazy wave example)
      ↓ lower suspended section
Touchdown zone ↔ changing contact with seabed
      → static cable section / joint, where used → array network
```

**Typical practice.** The hang-off carries the cable into the floater; bend
control limits local curvature. Buoyancy modules shape the suspended cable so
motion is absorbed across a compliant configuration. Lazy wave is one solution,
not the only geometry. The touchdown zone is where contact with the seabed
changes as the system moves. A dynamic-to-static transition may be included;
some designs use longer dynamic lengths instead.
[Cable connection study — ORE Catapult](https://ore.catapult.org.uk/resource-hub/analysis-reports/cornwall-flow-accelerator-optimised-cable-connection-options-for-floating-offshore-wind),
[dynamic cable qualification report](https://ore.catapult.org.uk/wp-content/uploads/2022/10/Dynamic-Cable-Technology-Qualification-Oct-2022.pdf).

**Engineering interpretation:** floater motion changes the cable-end position;
mooring stiffness and pretension change the floater's excursion; cable geometry
then changes curvature, tension and seabed interaction. Design checks therefore
need compatible coupled response and load cases, including extreme conditions,
fatigue and relevant faults. Moorings are station-keeping equipment; the power
cable is not a substitute mooring line.
[Mooring-system response and cable excursion](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-3-mooring-system/).

## 8. Array and export architecture

**Typical practice.** Several turbines connect along a string; multiple strings
feed collection points. Network topology, protection and switching decide which
output is lost when a cable section fails. A dynamic section accommodates the
floater; static seabed sections carry power where motion requirements permit.
66 kV is a common array design point, not a law or a statement about every
installed project. [Array cable guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-1-cables/b-1-1-array-cable/).

HVAC means high-voltage alternating current. Longer AC cables introduce reactive
power/charging constraints. HVDC means high-voltage direct current: converters
add cost and complexity, but DC can suit long/high-capacity export. The choice
depends on capacity, distance, losses, network design and available equipment;
there is no single universal distance where DC becomes compulsory.
[HVAC system](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-4-offshore-substation/b-4-1-hvac-electrical-system/),
[HVDC system](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-4-offshore-substation/b-4-2-hvdc-electrical-system/).

Burial/protection needs route surveys and ground assessment. Crossings can need
agreements and engineered separation/protection. Installation includes laying,
pull-in, termination and testing; a laid cable is not yet a commissioned circuit.
[Offshore cable installation guide](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-2-offshore-cable-installation/).

## 9. What substations actually do

**Typical practice.** An offshore substation joins array circuits to export
circuits. Transformers change AC voltage; switchgear isolates equipment;
protection detects faults and trips the right equipment. Reactive-power equipment
helps manage AC network conditions. Control, communications, auxiliary power and
metering support operation. An HVDC design adds conversion equipment.
[Offshore substation guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-4-offshore-substation/).

The onshore substation conditions power for the connection point, with equipment
depending on AC/DC choice. It is distinct from the adjacent TO network plant,
even when physically close. [Onshore electrical system](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-5-onshore-substation/b-5-1-electrical-system/).

**Do not infer a floating substation from floating turbines.** Alternatives
include a fixed substation at a suitable location, direct export for a suitable
smaller scheme, or a project-specific connection to other offshore infrastructure.
The BVG/ORE reference case itself assumes a fixed substation.
[Reference-design assumptions](https://guidetofloatingoffshorewind.com/guide/1-2-assumptions-used-in-this-guide/).

## 10. OFTO: owning the offshore transmission connection

**Traditional generator-build model:**

```text
Developer builds generation + relevant transmission assets
              ↓
Ofgem assesses transfer value and runs competitive OFTO tender
              ↓
Selected licensed OFTO purchases relevant transmission assets
              ↓
OFTO owns/manages those assets under licence and revenue arrangements
```

Generation normally includes turbines and their collection system. The offshore
transmission scope commonly includes export connection infrastructure, relevant
substation equipment and onshore connection assets up to the agreed boundary.
The exact boundary follows licences, technical classification and asset-transfer
documents—not a universal line at the shoreline.
[DESNZ generator-build explanation](https://www.gov.uk/government/calls-for-evidence/offshore-transmission-owner-ofto-regime/offshore-transmission-owner-regime-ofto-call-for-evidence-accessible-webpage).

**Project example:** Greater Gabbard OFTO connects a fixed-bottom wind farm; its
published portfolio description identifies availability-based revenue and a
separate O&M operator. It illustrates the ownership business model, not a floating
wind award. [Equitix portfolio](https://equitix.com/portfolio/greater-gabbard-ofto/).

**Changing arrangements:** Ofgem's May 2026 early/late competition OFTO-build
consultation is listed as closed awaiting decision at this review. Coordinated
offshore networks may be procured and delivered differently from a single
developer-built radial cable. Do not present consultation proposals as final
rules or assume every future offshore asset is transferred the same way.
[Ofgem consultation and status](https://www.ofgem.gov.uk/consultation/ofto-build-early-and-late-competition-models).

## 11. Developer, OFTO, TO and NESO are different jobs

| Organisation | Owns / does | Does not imply |
|---|---|---|
| Developer / generation project company | Develops and owns/contracts the wind-farm business | Ownership of the whole GB grid |
| OFTO | Licensed owner of specified offshore transmission assets | Wind-farm ownership or a power-purchase contract |
| Onshore transmission owner (TO) | Builds, maintains and owns its physical transmission network | Dispatch/balancing of the whole GB system |
| NESO | Operates the GB electricity system, coordinates connections and plans system needs | Ownership of the transmission network or purchase of all electricity |

NGET covers England/Wales; SSEN Transmission covers northern Scotland; SP
Transmission covers central/southern Scotland. NESO works with these owners.
[National Grid connection roles](https://www.nationalgrid.com/electricity-transmission/connections/article/distribution-and-transmission-connections),
[NESO Scottish network boundaries](https://www.neso.energy/publications/electricity-ten-year-statement-etys/electricity-transmission-network-requirements/scottish-boundaries).

NESO balances supply/demand and uses response, reserve and the Balancing
Mechanism to maintain secure operation and frequency around 50 Hz. Constraints
mean power cannot always be moved from the available generator to demand.
[NESO control-centre explanation](https://www.neso.energy/what-we-do/systems-operations/what-does-electricity-national-control-centre-do).

**Changing arrangements:** connections reform assesses readiness and strategic
alignment. Gate 1 does not supply a confirmed connection date; eligible Gate 2
projects can secure dates/points/queue positions through the relevant process.
Even then, inspect the actual offer and reinforcement obligations.
[NESO evidence handbook](https://www.neso.energy/industry-information/connections-reform/evidence-handbook-and-other-g2wq-submission-resources).

## 12. Physical flow and financial flow

```text
PHYSICAL: Generator → interconnected network → demand

COMMERCIAL:
Power buyer / trader / supplier → Generator (market sale or PPA)
Generator ↔ LCCC (eligible CfD difference payment)
Market participants ↔ BSC settlement (contracted versus metered positions)
Network charging / regulated revenue (separate from buying the energy)
```

A PPA is a power purchase agreement. Generators sell power through market/
contract arrangements; a commercial buyer is not a dedicated physical route for
individual electrons. Forecasts inform sold volumes. Actual output may differ;
imbalance settlement accounts for the discrepancy under the Balancing and
Settlement Code (BSC), administered by Elexon. Settlement periods are half-hourly;
this does not mean the physical system balances only every half hour.
[Elexon trading/settlement explanation](https://www.elexon.co.uk/bsc/about/trading-electricty-market/).

NESO's Balancing Mechanism accepts changes in generation or demand to operate
the system in real time. Congestion may require output to be reduced in one area
and replaced elsewhere; curtailment payments depend on the applicable action and
arrangements. [NESO BM explanation](https://www.neso.energy/what-we-do/systems-operations/what-balancing-mechanism).

Negative wholesale prices can occur; they do not guarantee that every generator
continues to receive its CfD strike price. Current government guidance explains
negative day-ahead price restrictions on difference payments for contracts from
AR4 onward. Contract version and settlement rules matter.
[DESNZ market-design update](https://www.gov.uk/government/publications/reformed-national-pricing-rnp-delivery-plan/reformed-national-pricing-rnp-delivery-plan-accessible-webpage).

## 13. CfD: revenue stabilisation, not government power purchase

**Confirmed structure.** DESNZ sets scheme policy; NESO is the auction Delivery
Body; LCCC is the government-owned contract counterparty. The generator still
arranges physical power sales. CfD payments settle the eligible difference
between a strike price and a specified market reference price.
[DESNZ scheme](https://www.gov.uk/government/collections/contracts-for-difference),
[LCCC clarification on power sales](https://www.lowcarboncontracts.uk/documents/243/Introduction_to_the_Contracts_for_Difference_Scheme_QA_.pdf).

**Illustrative arithmetic only:** assume 1 eligible MWh, strike £100/MWh and a
realised sale price equal to the reference price. Ignore losses, fees, indexation
and payment exclusions solely for this example.

| Reference / assumed sale price | CfD settlement | Simplified combined revenue |
|---|---|---|
| £60/MWh | LCCC pays generator £40 | £60 + £40 = £100 |
| £140/MWh | Generator pays LCCC £40 | £140 − £40 = £100 |

If realised sales differ from the reference price, combined revenue differs too.
CfD reduces one revenue risk; wind resource, outages, negative-price exclusions,
imbalance costs and delivery obligations remain. Lower revenue uncertainty can
support investment, but a CfD is not a financing decision.
[LCCC mechanism presentation](https://www.lowcarboncontracts.uk/documents/203/Binary_Carbon_Webinar_-_9.7.2024.pdf).

**Changing contract terms:** DESNZ confirms 20-year CPI-indexed contracts from
AR7 for relevant wind/solar technologies, including floating offshore wind.
Do not describe all CfDs as 15-year contracts.
[DESNZ 2025 scheme update](https://www.gov.uk/government/publications/contracts-for-difference-and-capacity-market-scheme-update-2025/contracts-for-difference-and-capacity-market-scheme-update-2025-accessible-webpage).

**Dated award example:** DESNZ's 14 January 2026 AR7 results list Pentland
92.5 MW and Erebus 100 MW in the floating category. These are awarded capacities,
not proof of FID or operational generation, and not necessarily the whole
project's consent envelope. [Official AR7 results](https://assets.publishing.service.gov.uk/media/6966861de8c04eb2919f773a/contracts-for-difference-allocation-round-7-results-.pdf).

## 14. Financing and FID: can this technical design be funded?

**Typical practice / commercial interpretation.** Sponsors fund at-risk
development. Equity bears ownership risk; debt providers expect repayment and
test downside cashflows. Project finance relies substantially on the project and
its contracts/cashflows; balance-sheet funding uses the sponsor's wider capacity.
Not every project must use the same financing structure.

Before a major investment commitment, decision-makers normally seek sufficiently
mature consent/land rights, credible grid timing, deliverable technology,
contracted or understood CAPEX (capital expenditure), viable revenue/offtake,
construction and O&M plans, allocated interfaces, insurance and contingency.
Some conditions remain to be discharged after FID; maturity does not mean every
risk is gone. Contract packaging affects the risk retained by the developer.
[Procurement and financing tradeoffs](https://guidetofloatingoffshorewind.com/procurement-structures/).

**Project example:** Great British Energy describes early investment alongside
the National Wealth Fund and Scottish National Investment Bank in Pentland in
November 2025. Such investment supports development; it should not be relabelled
as completed construction finance or FID without further evidence.
[GBE investment announcement](https://www.gbe.gov.uk/blog/major-floating-offshore-wind-project-secures-backing-great-british-energy-national-wealth-fund).

## 15. Ports and manufacturing: the production line meets the sea

```text
Floater manufacture / assembly → quayside or wet storage
→ tower → nacelle → blades → pre-commissioning
→ wet storage as needed → tow-out
```

**Typical sequence for a suitable integrated-tow design.** Assembly can use
landside heavy cranes or other engineered lifting arrangements. Component
delivery, structural completion, lifting, ballast control and tests must be
coordinated. Spars and TLPs can require different integration/transport solutions.
[Floating turbine assembly guide](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-5-floating-offshore-wind-turbine-assembly/).

Port suitability is a bundle: crane capacity/reach, quay bearing pressure, water
depth and tides, unobstructed tow route, laydown area, wet storage/moorings,
workforce and repeatable throughput. A large quay alone is insufficient. A
manufacturing port, integration port, marshalling port and O&M base need not be
the same place. [Construction-port guide](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-8-construction-port/).

**UK examples, not reserved project ports:** DESNZ announced support for
Cromarty Firth port expansion in March 2025. In March 2026, government announced
up to £64 million for Port Talbot design/engineering work. Neither announcement
alone proves all future capacity is built or allocated.
[Cromarty Firth](https://www.gov.uk/government/news/government-unlocks-floating-offshore-wind-with-major-investment-for-scottish-port),
[Port Talbot](https://www.gov.uk/government/news/64-million-for-port-talbot-offshore-wind-hub-in-the-celtic-sea).
Haventus describes Ardersier's energy-transition facility and phased development.
Use phase-specific evidence when discussing available facilities.
[Ardersier developer](https://www.haventus.com/port-page/ardersier-energy-transition-facility/).

## 16. Offshore installation: two work fronts converge

```text
OFFSHORE: survey / route clearance
            ├→ anchors → mooring pre-installation / tests ───┐
            └→ cable / substation works as designed ────────┤
PORT:     assembly → tests → tow-out ────────────────────────┤
                                                           ↓
        mooring hook-up → dynamic cable hook-up
        → electrical commissioning → authorised energisation
```

This is typical logic, not a fixed vessel schedule. Anchor-handling vessels,
tugs, cable-lay vessels, ROVs (remotely operated underwater vehicles), survey
vessels and specialist technicians serve different tasks. The chosen anchors,
cables and platform determine installation equipment and sequence.
[Mooring pre-installation](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-4-anchor-and-mooring-pre-installation/),
[turbine installation](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-6-floating-offshore-wind-turbine-installation/).

**Interpretation:** tow-out is only ready when site readiness, port release,
weather windows, safe tow route, mooring/cable connection and contingency plans
align. Installing the turbine before a usable export system risks stranded
generation. Weather windows need duration and sea-state suitability, not just a
single wind-speed limit. [Installation overview](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/).

## 17. O&M and end of life

**Typical operating chain.** SCADA (*supervisory control and data acquisition*)
and condition monitoring identify performance changes and faults. Turbine service
is only one workstream: inspect floater structure, corrosion protection, marine
growth, moorings, anchors and dynamic cables; use subsea inspection/ROVs and
plan repair vessels, spares and access. Different asset owners can have separate
responsibilities and service contracts.
[O&M overview](https://guidetofloatingoffshorewind.com/guide/o-operations-and-maintenance/),
[maintenance guide](https://guidetofloatingoffshorewind.com/guide/o-operations-and-maintenance/o-2-maintenance/).

**Floating-specific issue:** a major component replacement may be done offshore
or by disconnecting and towing to port. Neither strategy is automatic: safe
disconnection/reconnection, standby mooring/cable arrangements, suitable draft,
port/crane slots and downtime must be considered. Principle Power reports both
in-situ and tow-to-port major exchanges at Kincardine.
[Kincardine operator/technology account](https://www.principlepower.com/projects/kincardine-offshore-wind-farm),
[major repair guide](https://guidetofloatingoffshorewind.com/guide/o-operations-and-maintenance/o-3-major-repair/).

Decommissioning is a funded lifecycle obligation, not a surprise at the end.
England/Wales and Scotland have separate guidance. Removal, any justified
retention, monitoring and financial security follow the approved programme and
applicable requirements. Do not promise that every anchor/cable is always removed.
[DESNZ England/Wales guidance](https://www.gov.uk/government/publications/decommissioning-offshore-renewable-energy-installations),
[Scottish guidance](https://www.gov.scot/publications/offshore-renewable-energy-decommissioning-guidance-scottish-waters/documents/).

## 18. UK geography: opportunity is not installed capacity

Evidence snapshot reviewed 22 October 2026; individual source dates remain visible.

| Cluster / example | Capacity and stage evidence | What the supply chain should ask |
|---|---|---|
| Scottish ScotWind and INTOG floating pipeline | Scottish Enterprise's Offshore Wind Scotland describes just over 23.5 GW after accounting for named lease returns; this is a development pipeline, not operating output | Which projects have achievable grid, consent and investment dates rather than only seabed rights? |
| East Scotland: Ossian | Developer describes up to 3.6 GW, SSE Renewables/Marubeni/CIP JV and an array application; its separate English-connection page says Lincolnshire work is paused following grid-design changes | How do revised export connections change packaging, procurement and manufacturing timing? |
| Shetland: Arven | Ocean Winds' UK portfolio lists 1.8 GW and says the additional 500 MW Arven South site is being handed back | How do distance, ports, grid and reduced project scope affect the addressable demand? |
| North Sea INTOG | Round includes innovation and targeted oil/gas electrification; Green Volt 560 MW is a named example. Culzean's 3 MW project entered a lease in March 2026 | Is power intended for offshore facilities, GB grid export, or both? What is actually contracted? |
| North/west Scottish waters | Scottish Government's January 2026 inventory identifies Havbredey 1.5 GW (Northland/ESB) and Talisk 495 MW among floating proposals | Which local/deepwater integration and logistics options fit the actual design? The January list is a dated baseline, not proof of unchanged ownership or stage today |
| Celtic Sea Round 5 | The Crown Estate's March 2026 update completes agreements for lease across three areas, up to 4.5 GW total: Gwynt Glas (EDF/ESB), Equinor and Ocean Winds | What consent/grid/revenue/port conditions stand between seabed rights and orders? |

Sources: [Scottish floating pipeline with lease-return notes](https://www.offshorewindscotland.org.uk/the-offshore-wind-market-in-scotland/floating-offshore-wind-in-scotland/),
[Ossian project](https://www.ossianwindfarm.com/),
[Ossian English connection update](https://www.ossianwindfarm.com/english-connection),
[Ocean Winds UK portfolio](https://www.oceanwinds.com/uk/),
[Crown Estate Scotland INTOG updates](https://www.crownestatescotland.com/scotlands-property/offshore-wind/intog-leasing-round),
[dated Scottish inventory](https://www.gov.scot/publications/update-2020-offshore-wind-policy-statement-scotlands-offshore-wind-ambition-2/pages/4/),
[Round 5 final agreement announcement](https://www.thecrownestate.co.uk/news/final-site-progressing-for-round-5),
[Welsh Government confirmation of all three developers](https://www.gov.wales/written-statement-offshore-wind-action-plan-update).

**Discrepancy example:** Arven's individual Ocean Winds and Mainstream pages
still describe 2.3 GW while Ocean Winds' UK portfolio describes 1.8 GW and the
500 MW return. Show the scope difference and sources; do not quietly add both
sites to a “current” total.
[Ocean Winds project page](https://www.oceanwinds.com/projects/arven/),
[Mainstream project page](https://www.mainstreamrp.com/markets-projects/europe/united-kingdom/arven-scotwind-wind-farm/).

## 19. A practical organisation map

These are representative roles, not an approved bidder list or guaranteed UK
content. International experience is labelled as such. Capability does not prove
a contract award. Existing international company cards remain useful references.

| Role | Examples and actual contribution | Evidence / UK relevance boundary |
|---|---|---|
| Developers / project companies | Equinor; Ocean Winds; SSE Renewables and partners integrate projects and procurement | Specific UK examples are in section 18; ownership is project-specific |
| Turbine OEMs | Siemens Gamesa and Vestas supply turbine systems and service capability | Floating-project supplier guide identifies experience; do not infer selection for future UK farms. [Supplier guide](https://guidetofloatingoffshorewind.com/supply-chain/) |
| Platform technology | Principle Power designs WindFloat technology and supports operating assets | Kincardine is a documented UK example. [Project account](https://www.principlepower.com/projects/kincardine-offshore-wind-farm) |
| Materials / fabrication | Tata Steel UK, Marine Power Systems and Ledwood participate in a steel/platform innovation collaboration | R&D participation, not an awarded Round 5 fabrication package. [Collaboration](https://www.tatasteeluk.com/corporate/news/industrial-collaboration-to-develop-strip-steel-floating-offshore-wind-platforms) |
| Mooring-line products | Bridon-Bekaert; Lankhorst: rope/line products specified by mooring designers | Representative product role; no specific UK farm award asserted. [Mooring-line guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-3-mooring-system/b-3-2-mooring-lines/) |
| Anchors | Bruce Anchor; Delmar Vryhof; Subsea Micropiles: anchor technologies/design capability | Anchor choice depends on soil/load; a study contract is not installed hardware. [Anchor guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-3-mooring-system/b-3-1-anchors/) |
| Dynamic cable manufacture | JDR; Nexans: cable systems for floating applications | Qualification must match voltage, fatigue duty and accessories; do not treat every cable product as dynamic-qualified. [Cable guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-1-cables/) |
| Static / export cables | Prysmian; NKT; Nexans; Sumitomo Electric | Sumitomo announced a Nigg factory opening ceremony on 19 October 2026. The announcement is not proof of a particular UK floating export-cable award or completed qualification. [Sumitomo](https://sumitomoelectric.com/press/2026/10/prs044) |
| Electrical equipment | Hitachi Energy; Siemens Energy: transformers, switchgear/conversion-system packages | Representative electrical-system suppliers; contract scope and current product offerings need project procurement evidence. [Onshore electrical guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-5-onshore-substation/b-5-1-electrical-system/) |
| Offshore substations | Electrical-system suppliers plus structural yards and integrators supply different parts | A substation is a package, not one universal supplier; the turbine floater supplier need not supply it. [Substation guide](https://guidetofloatingoffshorewind.com/guide/b-balance-of-plant/b-4-offshore-substation/) |
| Engineering consultancy | Xodus; Kent; Arup; Mott MacDonald: design, analysis and package integration services | Guide lists capabilities; a consultancy role does not establish construction scope. [Engineering guide](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-5-engineering-and-consultancy/) |
| Certification / assurance | DNV provides floating wind certification services | Independent assurance of specified scope; not the marine consenting authority. [DNV service](https://www.dnv.com/services/renewables-certification/certification-of-floating-wind-energy/) |
| EPCI lead contractors | Boskalis; Subsea 7; Saipem: combinations of engineering and marine delivery | Packages vary; do not assume one contractor covers the whole project. [Installation guide](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/) |
| Marine / cable contractors | DEME; DeepOcean; Van Oord: installation-related capability | Cable lay, burial, protection and testing are separately scoped. [Cable installation guide](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-2-offshore-cable-installation/) |
| Survey organisations | Fugro; Gardline; Ocean Infinity: relevant survey/data services | Geotechnical/geophysical and ecological surveys answer different questions. [Environmental survey guide](https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-2-environmental-surveys/) |
| Vessels and marine logistics | Tugs, anchor handlers, CLVs and ROV spreads are task-specific assets supplied/chartered by marine firms | Vessel availability must match equipment/workability; company name alone is insufficient. [Mooring installation guide](https://guidetofloatingoffshorewind.com/guide/i-installation-and-commissioning/i-4-anchor-and-mooring-pre-installation/) |
| Ports | Port of Cromarty Firth; ABP Port Talbot; Haventus Ardersier | Different development phases and services; see sourced status in section 15 |
| O&M | Generation owners, OEM service teams and specialist subsea/floater providers | Principle Power describes UK Kincardine services and repair experience. [Kincardine](https://www.principlepower.com/projects/kincardine-offshore-wind-farm) |
| OFTO investors / operators | Equitix portfolio vehicles; specialist O&M operators | Greater Gabbard example demonstrates asset ownership versus service operation. [OFTO example](https://equitix.com/portfolio/greater-gabbard-ofto/) |
| Transmission owners | NGET; SSEN Transmission; SP Transmission | Physical network assets and connection delivery; see section 11 |
| Seabed / consenting / regulation | The Crown Estate; Crown Estate Scotland; MD-LOT; MMO; NRW; Ofgem; DESNZ | Different powers and jurisdictions; see sections 4 and 10–13 |
| System and market institutions | NESO; Elexon; LCCC | System operation/planning, BSC settlement and CfD counterparty respectively |
| Research / skills / testing | ORE Catapult; universities and industry collaborations | Catapult's FOW Centre of Excellence and FLOWIC support technology/commercial development, not consent approval. [ORE Catapult](https://ore.catapult.org.uk/products-services/floating-offshore-wind) |

## 20. Interfaces: where individually good packages can fail together

**Engineering interpretation, not findings about named projects:**

| Interface | What teams must agree | What can go wrong |
|---|---|---|
| Turbine ↔ floater | Loads, controls, mass, tower interface, access | Unacceptable motions/accelerations or control interaction |
| Floater ↔ mooring | Fairleads, restoring behaviour, excursions, failures | Excess drift, connector overload or poor access |
| Floater ↔ dynamic cable | Hang-off, motion envelope, bend limits, pull-in | Fatigue, over-bending, excess tension or difficult repair |
| Mooring ↔ seabed | Soil model, load direction, cyclic capacity | Inadequate holding capacity or impractical installation |
| Cable ↔ seabed | Route, burial/protection, mobility, crossings | Exposure, abrasion, free spans or third-party damage |
| Array ↔ substation | Voltage, protection, ratings, earthing, control | Fault discrimination or rating mismatch |
| Offshore network ↔ OFTO | Asset boundary, test records, warranties, access | Transfer delay or unowned responsibility |
| OFTO ↔ onshore TO | Protection, availability, switching and interfaces | Export unavailable despite a functioning wind farm |
| Developer ↔ NESO/network owners | Connection terms, compliance, reinforcement timing | Commissioned asset with unusable/delayed export |
| Developer ↔ authorities/stakeholders | Design envelope, evidence, mitigation, conditions | Redesign or consent-condition delay |
| Developer ↔ ports/installers | Draft, dimensions, throughput, tow windows | Units queue at port or vessels wait offshore |
| Developer ↔ financiers | Downside case, risk allocation, reserves, conditions | Finance cannot close despite technical feasibility |

Basis: integrated engineering and project-management practice described in the
technical references above. These failure modes are our synthesis. They are
questions to investigate, not scored risk assessments or allegations.

## 21. Bottlenecks: evidenced pressure, not a universal shortage score

| Constraint | Evidence supports | What must still be checked for an individual project |
|---|---|---|
| Grid | NESO is reforming queue allocation around readiness and system need | Actual offer, reinforcement dependency, liabilities and dates—not a historic queue position |
| Port / manufacturing scale | Government's 2026 supply-chain study describes limited established floating production capacity and candidate integration ports | Operational phase, available slots, design-specific draft/lift limits and throughput |
| Steel / fabrication | Study highlights heavy-plate constraints and differences between steelmaking and fabrication capacity | Required product grade/thickness, weld/QA capability and reserved production |
| Mooring / anchors | Technical guides show design/soil/material dependencies and high-volume system requirements | Qualified suppliers, manufacturing slots, tests and installation spread; do not assert a quantified UK-wide shortage without data |
| Dynamic cables / skills | ORE Catapult's workforce study identifies capability/training needs across the cable lifecycle | Qualified voltage/fatigue envelope, accessories, factory capacity and competent technicians |
| Cable / installation vessels | Installation practice requires specialised equipment and suitable weather windows | Actual charter commitments, simultaneous regional demand and repair contingency; no unsupported fleet-shortage number |
| Finance / bankability | Public development investment and contract-risk choices show that technology readiness alone is insufficient | Bankable scope, revenue, capital cost, downside cover and closure conditions |
| Consent / environment | Authorities require impact assessments; advisers must be engaged early | Birds, mammals, benthic habitat, fisheries, cumulative impacts, mitigation and conditions |
| Localisation | CES publishes supply-chain development statements and an outlook dashboard | Distinguish ambition/commitment/outlook from realised spend and delivered UK content |

Sources: [NESO reform](https://www.neso.energy/industry-information/connections/connections-reform),
[DESNZ-commissioned 2026 supply-chain study](https://assets.publishing.service.gov.uk/media/69ef36b020a498c16734afcc/UK-renewables-deployment-supply-chain-readiness-study-2026-update.pdf),
[ORE Catapult dynamic-cable capability study](https://ore.catapult.org.uk/resource-hub/analysis-reports/supply-chain-capability-requirements-for-uk-floating-offshore-wind-farms),
[environmental assessment/compensation guidance](https://www.gov.uk/government/publications/offshore-wind-compensating-for-environmental-harm/part-1-when-and-how-to-compensate-for-environmental-harm-offshore-wind),
[CES supply-chain dashboard and evidence scope](https://crownestatescotland.com/supply-chain-information).
Other rows are explicitly bounded engineering/commercial interpretations from
the referenced system and procurement explanations, not a ranked market forecast.

## 22. A mental model and fifteen useful questions

```text
SEABED RIGHTS + CONSENT + GRID + REVENUE + FINANCE
       + DELIVERABLE TECHNOLOGY + SUPPLY CHAIN + PORT / MARINE PLAN
                                  ↓
                    FINAL INVESTMENT DECISION
                                  ↓
                 MANUFACTURE → INTEGRATE → INSTALL
                                  ↓
                     COMMISSION → GENERATE
                                  ↓
                TRANSMIT / DISTRIBUTE → CUSTOMERS

Alongside: separate electricity sales, network charges, CfD and settlement
Throughout: safety, stakeholders, asset integrity, O&M and end-of-life funding
```

This is an explanatory framework, not a universal legal sequence. Operation is a
multi-decade responsibility; design life, lease duration and support-contract
duration are different quantities and must be checked for the particular asset.

1. Who holds the seabed rights, and what conditions attach to them?
2. Who owns the project company and who manages development?
3. Which offshore and onshore permissions exist, and what remains conditional?
4. What connection point, capacity and date does the current grid offer provide?
5. Where will the electricity physically go, and who buys it commercially?
6. Is there a CfD, for which capacity/round/terms, and does it cover the full project?
7. What turbine is specified, selected or merely assumed?
8. What floater concept fits the site and available ports?
9. What mooring/anchor design is supported by the soil and coupled-load evidence?
10. What cable system is qualified for the voltage, motion and fatigue duty?
11. Which ports and vessels are actually available or contracted?
12. How do integration, tow-out, hook-up and energisation fit together?
13. Which assets are generation, OFTO or TO assets, and where are the boundaries?
14. What evidence shows finance maturity/FID rather than development funding alone?
15. How will inspection, major repair, cable failure and decommissioning be funded and delivered?

## Publication audit still required after design acceptance

The sources above support the draft's named examples and bounded explanations.
Before rendering the guide, transfer claims into structured evidence records and
review the English and Chinese copy against them. Do not claim blanket currency
from a page crawl date; retain actual publication/update dates where available.
Check source conflicts and current regulatory status once more at publication.
No private papers or internal project documents were used.
