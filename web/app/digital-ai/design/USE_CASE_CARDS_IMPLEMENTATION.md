# Digital & AI practical cards: implementation and acceptance

Date: 2026-10-23. Branch: `feat/digital-ai-use-case-cards`.
Base: merged main `963e891`. Design accepted by the user on 2026-10-23:
"OK now you can implement it".

## Delivered behaviour

All ten existing lifecycle application choices now open a practical card:
problem and typical user -> inputs -> method -> output -> human decision ->
principal limitation -> documented example or explicit evidence gap.

One selected card is rendered. On desktop it spans the map below the six stages;
at 760px and below it follows the selected stage in reading order. Selecting an
application retains button focus and announces the new card title. Native
disclosures expose additional limitations and supporting examples, and reset
when the application changes. No forced scrolling or motion was introduced.

English and Simplified Chinese explanatory copy are static. Original Signal
titles, publishers, dates, maturity and URLs are read from existing records.
Publication, stored access and card-source-review dates have separate labels.
Recorded maturity remains attached to the dated example, not an application.

## Content and source review

All roles, input categories, methods, outputs and human decisions are labelled
illustrative. They are educational examples, not claims about a project's private
procedures. Each factual example statement references a specific existing Signal
and one of its source IDs in `web/data/digital-ai/use-cases.json`.

Public sources reviewed on 2026-10-23:

| Existing source ID | Supporting public material | Claim boundary |
| --- | --- | --- |
| `src-nowrdc-airu-wrf` | NOWRDC project synopsis and target outcomes | Physics/AI forecasting goals; not proof of autonomous dispatch or bankable resource assessment |
| `src-ecmwf-dtwo-2026` | ECMWF weather/modelling progress article | Reported modelling work; not a completed commercial forecasting service |
| `src-pnnl-ace-fwicc-news` | PNNL ACE-FWICC announcement, offshore-wind paragraphs | Research links environmental, turbine and grid models; screening procedure remains illustrative |
| `src-fraunhofer-flexiwind` | Fraunhofer IWES challenge/solution sections | Virtual control evaluation; not approved autonomous field control |
| `src-fem-subsee-4d` | SUBSEE 4D objective, achievements and outputs | Mooring-monitoring/model/ML tools; no inferred sensor inventory or failure-diagnosis accuracy |
| `src-arpae-digifloat` | Official ARPA-E project description, accessible through its indexed entry | Planned digital representation; intended benefits remain aims |
| `src-fem-dionysos` | DIONYSOS objective and achievements; original URL redirects to the current project page | Sensor/simulation fatigue monitoring and anomaly work |
| `src-cec-nextwind` | California Energy Commission public report abstract | Digital-twin/monitoring context; not validation of a failure-prediction workflow |
| `src-inesc-atlantis-robots` | INESC TEC demonstration announcement | Robotic visual/thermal inspection tests; expected savings not measured results |
| `src-esa-saturnx` | ESA service objectives and integration challenges | Drone-service concept; AI integration remains a stated challenge |
| `src-nowrdc-blade-ai` | NOWRDC project synopsis | Development of drone/CV/AI methods; no inferred achieved detection performance |

`src-eproa-project` could not be rechecked: its public page was unavailable to the
research tool, including alternate URL attempts. Its existing association is
retained as **Stored context · source not rechecked**, with no new review date.
The cable card explicitly says that validated cable diagnosis is not established.
Manufacturing vision and installation planning retain empty evidence sets, with
the message that no supporting example is recorded in this collection.

The source IDs resolve to URLs in the unchanged `signals.json`. No papers,
paywalled full texts or private documents were used. No Signal, metadata,
maturity or supplier/project relationship was added or rewritten.

## Validation evidence

Final local application code and tests passed:

```text
Python 3.14.5: python -m pytest pipeline/tests -> 210 passed
npm.cmd run validate:data -> passed
npm.cmd run test:data -> 151 passed
npm.cmd run lint -> passed, no errors
npm.cmd run build -> passed, 431 static pages
npm.cmd run test:smoke -> 14 passed (26.5 seconds)
git diff --check -> passed
```

Python used the installed executable and a task-specific temporary directory,
removed after the run. The three new content tests run within existing data CI.
Four Digital & AI browser journeys run within the existing browser-smoke job;
they cover all ten choices, provenance and empty states, keyboard/focus/disclosure
behaviour, English/Chinese at 390px, overflow, runtime/console errors, and existing
Power AI and topic/maturity/region filtering. The ten existing regression journeys
also passed. CI configuration and dependencies were unchanged.

The first browser attempt found an overly exact test locator for the existing
filter's accessible name. The corrected locator uses the combobox role and label
prefix. No filter implementation change was needed. Windows restricted process
cleanup left the first test server running; it was identified and stopped, and
the successful suite ran with normal process permissions.

Four screenshots were generated and visually inspected in ignored
`web/test-results/`: desktop English light/dark and mobile Chinese light/dark.
Text and evidence blocks remained readable and within their containers.

Diff review confirmed unchanged original Digital & AI Signals and adapter,
Projects, Industry, Engineering/Research datasets, pipeline and paper routes.
The changes are Digital & AI presentation/content/tests and milestone handover
documentation. Recommendations 2 and 3 remain deferred.

## Delivery gate

Leave the feature PR open for manual merge. Record the preview and CI results for
the PR's exact final commit in its description; local results alone do not claim
remote CI success. No merge or production deployment is performed by this task.
