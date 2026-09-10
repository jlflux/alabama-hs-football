import { NextResponse } from "next/server";
import { extractLayoutText } from "../../../../../lib/imports/extract-pdf-text";
import { parseAhsaaPdfText } from "../../../../../lib/imports/ahsaa-pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const EXTRACT_TIMEOUT_MS = 20_000;

async function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("PDF extraction timed out.")), milliseconds);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a PDF to import." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF imports are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "This PDF is too large. Weekly score PDFs must be 5 MB or smaller." }, { status: 413 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = await withTimeout(extractLayoutText(bytes), EXTRACT_TIMEOUT_MS);

    if (!text.trim()) {
      return NextResponse.json({ error: "No text was found in this PDF. The weekly AHSAA file should contain selectable text." }, { status: 422 });
    }

    const rows = parseAhsaaPdfText(text);
    const finalCount = rows.filter((row) => row.status === "final").length;
    const reviewCount = rows.filter((row) => row.status === "review").length;
    const suspendedCount = rows.filter((row) => row.status === "suspended").length;

    return NextResponse.json({
      fileName: file.name,
      rows,
      summary: { total: rows.length, final: finalCount, review: reviewCount, suspended: suspendedCount },
    });
  } catch (error) {
    console.error("Score PDF preview failed", error);
    const message = error instanceof Error ? error.message : "Unknown PDF import error.";
    const timedOut = message.toLowerCase().includes("timed out");

    return NextResponse.json(
      {
        error: timedOut
          ? "The PDF parser took too long. Please retry once; if it repeats, the import parser needs attention."
          : `The PDF could not be read: ${message}`,
      },
      { status: timedOut ? 504 : 500 },
    );
  }
}
