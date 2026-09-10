import { NextResponse } from "next/server";
import { extractLayoutText } from "../../../../../lib/imports/extract-pdf-text";
import { parseAhsaaPdfText } from "../../../../../lib/imports/ahsaa-pdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a PDF to import." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF imports are supported." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const text = await extractLayoutText(bytes);
  const rows = parseAhsaaPdfText(text);

  const finalCount = rows.filter((row) => row.status === "final").length;
  const reviewCount = rows.filter((row) => row.status === "review").length;
  const suspendedCount = rows.filter((row) => row.status === "suspended").length;

  return NextResponse.json({
    fileName: file.name,
    rows,
    summary: { total: rows.length, final: finalCount, review: reviewCount, suspended: suspendedCount },
  });
}
