# Freelance Proposal Workflow — Dummy Data

This directory contains realistic, fictional test fixtures for a workflow that compares incoming freelance job posts with past projects and team capacity.

## Sources

- `Company Portfolio/` — 10 project documents. Every document uses the six required fields and a specific technology list.
- `Proposals/Proposals.csv` — Google Sheets–ready UTF-8 CSV with the exact requested ten-column header and 15 scenario rows.

All names, clients, results, budgets, job posts, and staff references are fictional.

## Intentional matching scenarios

The following three projects provide a controlled overlap set for Next.js/React/Node/AWS matching:

- **Northstar SaaS Analytics Dashboard** — strong Next.js, React, TypeScript, Node.js, PostgreSQL, Redis, AWS overlap.
- **HarborField B2B Commerce Platform** — strong Next.js, React, TypeScript, Node.js, PostgreSQL, Redis, AWS, Stripe overlap.
- **LumiCart Marketplace Checkout Rebuild** — partial React, TypeScript, Node.js, AWS, Stripe overlap but MongoDB/Express rather than Next.js/PostgreSQL/Redis, making it a useful below-70% exclusion candidate for stricter job requirements.

Other documents allow positive and negative tests for React Native, Flutter, data engineering, ML integrations, DevOps, and PHP/Vue work.

## Proposal status coverage

The CSV contains:

- 6 rows with an empty `Proposal Status` for batch-limit tests.
- 3 `Draft` rows, each with completed proposal copy under 400 words and empty approval notes.
- 1 each of `No Match`, `No Capacity`, and `Tone Mismatch`, with empty draft text.
- 1 `Approved` row with approval notes.
- 1 `Needs Revision` row with actionable approval notes.
- 1 `Submitted` row with a submission date/time.

## Google Sheets import

Import `Proposals/Proposals.csv` as a comma-separated file. Quoted empty fields are intentional and represent truly blank cells that the workflow can detect. Date fields use `DD-MM-YYYY HH:MM` throughout. Project matches inside one cell use `; ` as the delimiter.

## Important test assertions

- The first six rows must remain blank in `Proposal Status`; do not substitute `Pending`.
- Rows marked `No Match`, `No Capacity`, or `Tone Mismatch` must retain empty `Proposal Draft Text`.
- Draft rows should remain below the 400-word limit.
- Job IDs use `PLATFORM-YYYYMMDD-NNN`, with unique daily sequences per platform.
