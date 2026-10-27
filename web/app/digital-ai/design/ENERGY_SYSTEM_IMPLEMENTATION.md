# AI × Energy: implementation and source review

Date: 2026-10-27. Branch: `feat/ai-energy-explainer`. Base: main `580a83e`.
Scope and acceptance were recorded before implementation in `ENERGY_SYSTEM_MVP.md`.

## Delivered reading experience

`/digital-ai` now starts with AI × Energy and explains the wider system before
the offshore-wind examples. Three relationships separate electricity consumption,
AI-supported energy decisions and flexible computing. Two illustrative diagrams
separate the physical electricity route from the information/decision route.

A seven-field selector covers computing/efficiency, weather, wind assets,
solar/storage/hybrids, grids/flexible demand, floating wind and procurement.
Reader/developer controls switch between a question to ask and a workflow to
evaluate. These are illustrative suggestions, not operating procedures, product
recommendations or production control code. Each field states an evidence
boundary and links to primary sources. Related examples select the existing
wind application or pathway; `#energy-<field>` supports direct entry.

Six glossary entries explain training/inference, forecasts/decisions, digital
twins, demand response, power/energy and annual/hourly matching. Six selected
2026 developments have visible publication dates, claim categories, sources and
expandable significance/limits. A three-pathway future view identifies conditions
and observable signals, explicitly as editorial scenarios without deployment
dates or probabilities. These can coexist; offshore computing is not portrayed
as a necessary successor to land-based computing.

Fixed explanatory copy has explicit English/Chinese fields. Source titles,
publisher names and detailed review-scope notes retain their original English.
Style is local to a CSS module and uses existing paper/ink/accent variables.
No new dependencies or shared CSS changes were needed.

## Primary-source review

Ten public pages were opened and reviewed on 2026-10-27. Metadata, source URLs,
publication dates or explicit absence, review dates and supported scope are in
`web/data/digital-ai/energy-context.json`. Only these public materials support
the new explanations; no private operating records or full licensed reports
were assumed. Most copy is concise explanation and clearly labelled inference.

| Source ID | Material reviewed | Use and limit |
| --- | --- | --- |
| `iea-outlook` | IEA April 2026 report executive summary | Demand/efficiency context and a central projection for all data centres. Forecast assumptions remain visible. |
| `iea-supply` | IEA 2025 energy-supply chapter | Physical supply versus procurement; background, not current project news. Chapter publication date remains unrecorded. |
| `edna-flex` | IEA 4E EDNA July 2026 public summary | Flexibility strategies and barriers. The full report was not reviewed. |
| `google-flex` | Google March 2026 announcement | Attributed contractual flexibility; no measured fleet-wide delivery claim. |
| `microsoft-matching` | Microsoft February 2026 announcement | Attributed annual matching; no upgrade to hourly supply proof. |
| `ecmwf-aifs` | ECMWF May 2026 release | An operational forecast-system update, not marine operating approval. |
| `ecmwf-dtwo` | ECMWF April 2026 project update | Offshore modelling progress/planned integration, not universal deployment. |
| `nlr-hybrid` | NLR hybrid-energy research page | Hybrid modelling/control context. No dated publication or claim that optimization inherently uses AI. |
| `doe-ai` | DOE April 2024 technical opportunities page | Background on planning/forecasting, not a statement of current US policy. |
| `fem-subsee` | France Energies Marines SUBSEE 4D page | Dated project-period monitoring/ML context. No new fleet performance or project-status audit. |

The new context dataset is independent of the fourteen original Signals. New
source checks do not rewrite their original access dates, maturity, findings or
reader caveats. Existing coastal/offshore pathway evidence gaps remain explicit.
Corporate procurement and broader energy examples do not create Project or
Industry relationships in the authoritative datasets.

## Validation and regression design

`validate-energy-context.js` is called by the existing Digital & AI validation
command. It checks bilingual completeness, source references, dates, secure source
URLs, unique identities, development categories, reading-context links and the
conditional editorial basis of future scenarios. The existing data test command
adds seventeen positive, malformed-data and real-component rendering checks.

Three new browser journeys exercise all fields and both perspectives, keyboard
selection, related wind-example/hash navigation, dated developments, scenario
conditions, Chinese/dark 390px rendering, glossary and horizontal overflow.
The seventeen existing shared journeys protect application cards, fourteen
readers, four pathways, source caveats and other site areas.

The first browser run identified a same-page Next.js Link/hash interaction:
scrolling alone did not select the related wind application. Native same-page
anchors now activate the existing hash listeners. A separate new test locator
was made specific to the visible development category rather than hidden
explanatory copy. Both findings are covered by the final acceptance run.

Final local acceptance on 2026-10-27:

```text
python -m pytest pipeline/tests -> 210 passed
npm.cmd run validate:data -> passed (including the new context validator)
npm.cmd run test:data -> 172 passed
npm.cmd run lint -> passed
npm.cmd run build -> passed, 454 static pages
npm.cmd run test:smoke -> 20 passed (26.8 seconds)
Final overview screenshot capture / affected journeys -> 2 passed
git diff --check -> passed
Protected source-record diff -> unchanged
```

Four new overview/field screenshots were visually inspected in desktop/light and
390px Chinese/dark mode; the future view's mobile screenshot was also inspected.
They are local QA artifacts, not golden-image comparisons. The initial failures
were resolved before acceptance. The expected unknown-reader request still
returns 404 with the existing Next.js server `NoFallbackError` diagnostic;
browser runtime/console assertions pass.

No live source requests are needed by the website or test suite. Third-party
source availability is not an application regression criterion. The focused
Industry-only Node/browser suites were not rerun: this feature does not modify
Industry, and the full baseline/shared cross-site regression was run.

## Boundaries

Original Signals, use cases, pathways and reader notes are unchanged, as are
paper/pipeline, Engineering, Industry and Projects records. Research coverage
limits remain intact. No runtime AI, credentials, translation service, backend,
collector, scheduler, new pipeline stage or automatic publishing was added.
Existing theme behavior and original source-record language are preserved.

This is curated cross-field energy coverage, not every AI sector or a live news
feed. It is a qualitative framework for investigation, not a quantitative system
simulation, site feasibility assessment or performance guarantee. Browser checks
use Chromium rather than certifying every browser/device. Leave any PR open for
manual merge; local validation is separate from remote CI and preview status.
