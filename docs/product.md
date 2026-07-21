# Historical Note

This document is preserved as early project context. It is not the current status, roadmap, or resume source. For current work, read START_HERE.md, PROJECT_STATUS.md, PROJECT_HANDOVER.md, docs/PRODUCT_VISION.md, and docs/UX_ROADMAP.md.

# Product Definition

## Purpose

FOWT Research Digest is a weekly editorial website for floating offshore wind turbine research. It helps researchers and engineers quickly understand what was published, why it matters, and what limitations should be considered.

## Audience

The primary audience is technical: offshore wind researchers, engineers, PhD students, and project teams tracking academic and conference literature. The product should assume domain familiarity but avoid unnecessary jargon in summaries.

## MVP Scope

The MVP includes:

- a homepage introducing the latest digest;
- one weekly edition page;
- individual paper pages;
- an archive page;
- a methodology page;
- local structured data used by the early MVP.

The MVP excludes authentication, accounts, comments, payments, personalised recommendations, databases, API servers, autonomous publication, MCP servers, production AI agents, and automated ingestion.

## Content Model

Each paper entry should preserve:

- title;
- authors;
- publication source;
- publication date;
- DOI or original source URL;
- paper type: journal paper, conference paper, or preprint;
- analysis level;
- categories;
- score;
- summary;
- limitations.

Local data should be clearly identified by source. Do not invent real paper metadata or research findings.

## Core User Flow

Users should be able to land on the homepage, open the latest weekly digest, scan numbered paper entries, choose a relevant paper, read its detail page, and return to either the edition or archive.

## Success Criteria

The MVP succeeds if a technical reader can scan one weekly edition in a few minutes, identify relevant papers, understand why each item was included, and trace every claim back to visible paper metadata.
