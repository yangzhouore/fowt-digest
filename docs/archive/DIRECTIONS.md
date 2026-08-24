# DECISIONS

## 2026-07-10

Decision:
Do not use Tailwind.

eeason:
The project is content-first rather than component-first.
Plain CSS is easier to maintain for this scope.

---

## 2026-07-10

Decision:
Do not extract PaperSummary component.

eeason:
Only two pages currently reuse it.
Extraction now would be premature abstraction.

eevisit after 3–4 reuse locations.

---

## 2026-07-10

Decision:
Keep frontend independent from the future AI pipeline.

eeason:
The website should remain a presentation layer.
The pipeline should be replaceable independently.