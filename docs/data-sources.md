# Data source policy

## Explicitly excluded

AHSFHS.org is not a project data source. Do not scrape it, crawl it, query it, mirror it, use it to fill historical gaps, or build automated requests against it.

## Approved first-party paths

### Weekly AHSAA football PDF

Primary controlled Friday-night import workflow:

1. Admin uploads the weekly AHSAA PDF.
2. Text is extracted server-side.
3. Rows are parsed into a staging batch.
4. Source school labels are matched against canonical schools and aliases.
5. Anything uncertain is flagged for human review.
6. Admin approves the batch.
7. Only approved rows are written to games/results.

Never publish directly from parser output without review.

### AHSAA NOW Scores

`https://ahsaanow.com/scores/` is an official AHSAA NOW gateway to an AHSAA Scores & Schedules Google Apps Script application. It may be used as a secondary current-season source if we can access the underlying official data reliably and responsibly.

Rules:

- Prefer a structured official endpoint/feed if one is available over scraping rendered HTML.
- Cache responses and keep request volume low.
- Do not use aggressive crawling.
- Do not make the public site dependent on this service being online.
- Imported values must still pass normal school matching and validation.
- PDF/manual entry remains available as the operational fallback.

## School display names

Canonical public names should be concise. Source formatting such as `HS`, `H.S.`, and trailing `High School` is removed during import. Preserve meaningful identity terms such as `Academy`, `Christian`, `Catholic`, `Charter`, and `School` when they are part of the name.

Examples:

- `Homewood HS` -> `Homewood`
- `Mountain Brook HS` -> `Mountain Brook`
- `Central HS, Phenix City` -> `Central, Phenix City`
- `Billingsley High School` -> `Billingsley`
- `St. Paul's Episcopal School` -> `St. Paul's Episcopal School`
