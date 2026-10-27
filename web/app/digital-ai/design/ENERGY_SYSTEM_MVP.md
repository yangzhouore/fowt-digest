# AI and energy: a clearer system explanation

Date: 2026-10-27. Base: main `580a83e`. Branch: `feat/ai-energy-explainer`.

## Requested outcome

The user finds Digital & AI difficult to understand and asks for broader research
beyond FOWT, clearer logic for users/developers, related developments, and a view
of how AI, wind and renewable energy could interact in the future. Implement a
static, bilingual explanation within the existing section. Preserve the site's
visual language, existing application/evidence reading paths and source records.

## Scope and reading order

1. Start with three relationships: energy powers AI; AI supports energy decisions;
   flexible computing can respond to the power system. Explain that a chatbot,
   an engineering prediction model and a digital twin are different things.
2. Explore seven connected fields: computing/efficiency, weather, wind operations,
   solar/storage/hybrids, grids, floating wind, and electricity procurement.
   Each choice shows mechanism, a reader question, an illustrative developer
   starting point, evidence limits and primary-source links.
3. Retain the ten offshore-wind application cards and four supply pathways as
   deeper examples, reached by clear page navigation.
4. Add a dated, manually curated selection of 2026 developments. Distinguish
   operational releases, company-reported contracts/matching, research progress
   and system analysis. Show what each does and does not establish.
5. Present three conditional future pathways with dependencies and observable
   signals. These are sourced editorial scenarios, without probability, promised
   deployment years or invented savings. FOWT is one possible supply/engineering
   context, not an inevitable home for AI servers.
6. Keep the original fourteen Signals and their internal readers unchanged.

## Evidence plan

Primary public sources reviewed on 2026-10-27: IEA's April 2026 Energy/AI update;
IEA 4E EDNA's July 2026 flexibility summary; ECMWF's May 2026 AIFS release and
April DTWO update; Google's March 2026 demand-response contracts; Microsoft's
February 2026 annual renewable-matching announcement; NLR hybrid research;
DOE's April 2024 AI-for-energy opportunities; France Energies Marines SUBSEE 4D;
and IEA's 2025 physical-versus-contractual supply explanation.

Keep an independent context dataset with source URL, publication date (or null),
review date, publisher, supported scope and access basis. The 2024/2025 and
undated sources are background, not new news. Company announcements remain
attributed claims. IEA demand is a projection of all data-centre electricity,
not AI-only usage or a FOWT market forecast. No live feeds or runtime research.

## Assumptions and tradeoffs

Use progressive disclosure and one selected field to avoid replacing a difficult
page with a wall of text. Fixed copy has explicit English/Chinese fields; source
titles and names retain their originals. Examples for developers describe a
workflow to evaluate, not ready-to-deploy control software. Keep humans and
engineering validation in the decision loop. No provider APIs or credentials
are needed: this website explains AI and does not run an AI application.

Broader coverage stays connected to energy and FOWT. Exclude a general AI news
feed, market prices, new paper metadata, automatic scoring/collection, platform
recommendations, speculative performance rankings and changes to other sections.

## Acceptance

- Seven selectable fields, usable by keyboard, with visible explanation and
  reader/developer guidance; all primary-source references resolve.
- A plain-language introduction and glossary distinguish training/inference,
  forecasts/digital twins, demand response and annual/hourly matching.
- Dated developments and future scenarios visibly separate facts, interpretation
  and unknowns. No automatic promotion of research to operational proof.
- Existing ten applications, four pathways, fourteen Signals/readers, source
  caveats and hash return navigation continue to work.
- English/Chinese, desktop and 390px, light/dark, focus, overflow, deep links,
  source links and browser errors checked. Full repository baseline and shared
  browser regression pass. Source data outside the new context stays unchanged.
- Update implementation/source-review documentation and handover after checks.
  Leave changes reviewable on the feature branch; no merge or deployment.
