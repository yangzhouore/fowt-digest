# Chinese content compatibility audit

Date: 2026-11-10. Branch: `fix/chinese-content-coverage`.
Starting point: `aa56db5`; the declined homepage redesign is not included.

## Requested outcome and boundaries

Chinese mode should work across the website, including explanatory content,
Project profiles, Industry guides and company descriptions, Digital & AI evidence,
About, Methodology and interface labels. Engineering news and Research paper
content retain their original language. Project/organisation names, identifiers,
source links and original citation titles remain identifiable in their original
form. The existing English view, filters, navigation and styling remain usable.

Translations are stored presentation copy under `web/app/i18n/`. Authoritative
JSON, pipeline stages, classification, scoring and publication records are not
rewritten. The website has no runtime translation service or new dependency.

## Audit and implementation

- A rendered text inventory covered 72 routes: ten main/guide entry pages,
  every one of the 48 Project profiles and all 14 Digital & AI evidence readers.
  Text inside disclosure panels and option labels was included. Separate browser
  checks cover Engineering/Research entry pages and record/candidate interfaces.
- Missing Chinese reading text is stored separately in `content-zh.json`;
  fixed record/candidate interface labels use `interface-zh.json`. Existing
  bilingual content continues to use its existing fields and language provider.
- Translation-service drafts were generated during maintenance from public
  website copy, with protected names and uncertainty phrases. Terminology and
  representative technical passages were reviewed and corrected locally. This
  is not a claim that original publishers issued Chinese translations or that
  a new technical/source audit was performed.
- Corrections include project-progress terminology, consent/licensing,
  turbine/floater and supply-award language, and preserving unverified design/FID
  boundaries. A historical service term is explicitly not assumed still active.
- A unit-value scan flagged three equivalent presentations (Chinese unit words
  adjacent to project names and “more than 80 km”); these were inspected rather
  than treated as changed source values.
- Server copy is localized at each server component's render boundary, before
  RSC streaming. Client components localize their own rendered trees using the
  existing language state. No DOM text replacement is used.
- Render helpers preserve keys, callbacks, filter values, URLs, IDs and explicit
  original-content exclusions. Citation text stays original; fixed actions such
  as “Open DOI” can translate independently.
- Digital & AI region options now have explicit canonical values. Translating
  the label therefore cannot change the value used by the filter.
- UK inline text, company/project relationship scope, public-evidence findings
  and review history are covered. Country-guide organisation headings retain
  original names; translated claim-scope notes are labelled as reading copies.

The final pre-interface audit found no remaining translated narrative key still
rendered in English outside the intentional news/paper exclusions and proper
names/citations. English acronyms, units, names and original sources are expected;
the site does not claim that every visible token becomes Chinese.

## Validation

Final acceptance passed:

```text
python -m pytest pipeline/tests -> 270 passed
npm.cmd run validate:data -> passed
npm.cmd run test:data -> 179 passed
npm.cmd run lint -> passed
npm.cmd run build -> passed, 472 prerendered routes
npm.cmd run test:smoke -> 35 passed
Industry guide data checks -> 62 passed
Industry guide browser checks -> 12 passed
git diff --check -> passed
```

The pipeline check used the installed Python 3.14.5 interpreter with normal
Windows temporary-directory permissions. Browser screenshots of the Chinese
Digital evidence reader and Project evidence panels were visually inspected;
the guide suite additionally checks bounded mobile table scrolling.
Source-data/pipeline and original-homepage diff checks passed, and the owner's
`next-env.d.ts` matches its initial byte snapshot.

New regression checks cover
controlled values and callbacks, stable React keys, retained source content,
uncertainty labels, dictionary markers, all current Project assessments and
Digital evidence narratives, state preservation on language changes, candidate
labels and mobile Chinese/dark presentation.

The owner requested commit, push and a review PR after local acceptance. Leave
the PR open for owner acceptance; merge and deployment are not included.
The owner's pre-existing
`web/next-env.d.ts` change must remain byte-identical to its starting snapshot.

## Maintenance

New or edited reader-facing prose needs a reviewed Chinese entry or an explicit
existing bilingual field. Unknown text falls back to English rather than using
runtime translation or inventing missing text. Canonical record values and
filter option values must not be translated. Run the content-coverage tests and
browser checks when adding or changing displayed content.
