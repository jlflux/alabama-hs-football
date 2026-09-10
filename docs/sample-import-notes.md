# Week 2 PDF parser notes

Sample reviewed: `2026 Football Week 2 - HS SKED WEEK 2 (2).pdf`.

The file contains six pages with meaningful extracted content (the PDF container also includes trailing blank pages). The table format is suitable for text extraction and does not require OCR.

Observed cases the importer must support:

- Standard region finals with date, time, home, class, region, score, visitor, class, region, score.
- Suspended games with no score and a free-text note.
- Non-region games where one or both region cells are empty.
- Occasional missing times/classification data.
- Source typos and inconsistent labels (for example `Gordo HSF`).
- Region typo `R=3`, which should normalize to `R-3`.
- Public display-name cleanup such as `Homewood HS` -> `Homewood`.

All imported rows remain staged until school matching is complete and the admin approves the batch.
