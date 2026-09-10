import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Extract text while preserving table rows as closely as practical. We group
 * PDF text items by their Y coordinate, then sort each row left-to-right.
 * This works well for the AHSAA weekly schedule PDF because the source is a
 * real text table rather than a scanned image.
 */
export async function extractLayoutText(buffer: Uint8Array): Promise<string> {
  const pdf = await getDocument({ data: buffer, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map<number, Array<{ x: number; text: string }>>();

    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      // Nearby glyph baselines can differ slightly, so bucket to 1.5pt.
      const bucket = Math.round(y / 1.5) * 1.5;
      const row = rows.get(bucket) ?? [];
      row.push({ x, text: item.str.trim() });
      rows.set(bucket, row);
    }

    const pageLines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((item) => item.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);

    pages.push(pageLines.join("\n"));
  }

  return pages.join("\n");
}
