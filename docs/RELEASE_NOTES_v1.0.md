# FOWT Digest MVP v1.0

## Overview

MVP v1.0 delivers the completed deterministic Python pipeline for collecting and processing Floating Offshore Wind Turbine research into weekly digest data products.

The release covers the pipeline from OpenAlex collection through weekly digest assembly and orchestration. The website remains separate and is not connected to pipeline outputs in this release.

## Completed Features

- OpenAlex collection
- Metadata normalisation
- Deterministic deduplication
- FOWT relevance classification
- Ranking and selection
- Weekly digest assembly
- Pipeline orchestration

## Engineering Quality

- Deterministic pipeline stages with explicit input validation
- File-contract architecture using local JSON run outputs
- Stage isolation with clear module ownership
- Thin orchestration over accepted stage APIs
- Standard-library runtime pipeline implementation
- Focused tests for deterministic behavior, validation, failure paths, rollback, and orchestration
- Latest verified validation: `193 passed, 0 failed`

## Known Limitations

MVP v1.0 intentionally does not include:

- Website integration with pipeline outputs
- Database
- AI writing
- AI review
- Automated publication
- Scheduling

## Next Milestone

Development will continue with Website MVP.
