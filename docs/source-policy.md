# Source policy

## Excluded source

AHSFHS.org is intentionally excluded from this project. Do not scrape it, crawl it, query it, mirror it, or use it as a historical backfill source.

## Current approved source strategy

1. Admin-uploaded AHSAA weekly football PDFs are the primary Friday-night ingest path.
2. Manual score/game entry is always available.
3. AHSAA NOW may be used as a secondary official current-season source if its underlying AHSAA Scores & Schedules service can be accessed reliably and responsibly.
4. Prefer structured first-party data over scraping rendered pages.
5. Cache external responses and keep request volume low.
6. Never make public pages depend on an external source being online in real time.
7. External data must be matched against canonical schools and validated before becoming permanent.
