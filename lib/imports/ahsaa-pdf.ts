import { cleanSchoolName } from "../school-names";
import type { ParsedScoreRow } from "./types";

const DATE = "(?<date>\\d{2}-\\d{2}-\\d{4})";
const TIME = "(?<time>\\d{1,2}:\\d{2}\\s+(?:AM|PM))";
const CLASS = "(?:Double AA|Single A|[1-7]A)";
const REGION = "R[-=]\\d+";

const normalizeClass = (value?: string) => {
  if (!value) return undefined;
  if (/^Double AA$/i.test(value)) return "AA";
  if (/^Single A$/i.test(value)) return "A";
  return value.toUpperCase();
};

const normalizeRegion = (value?: string) => value?.toUpperCase().replace("=", "-");

/**
 * Parse layout-preserving text extracted from the weekly AHSAA football PDF.
 *
 * The weekly PDF is a table. A normal row has:
 * date, time, home, class, region, home score, visitor, class, region, visitor score.
 * Some non-region games omit region values, and interrupted games may have no
 * scores plus a note. Anything we cannot safely identify is staged for review.
 */
export function parseAhsaaPdfText(text: string): ParsedScoreRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const rows: ParsedScoreRow[] = [];

  const fullRegionGame = new RegExp(
    `^${DATE}\\s+${TIME}\\s+(?<home>.+?)\\s+(?<homeClass>${CLASS})\\s+(?<homeRegion>${REGION})\\s+(?<homeScore>\\d{1,3})\\s+(?<visitor>.+?)\\s+(?<visitorClass>${CLASS})\\s+(?<visitorRegion>${REGION})\\s+(?<visitorScore>\\d{1,3})(?:\\s+(?<note>.*))?$`,
    "i",
  );

  const regionGameWithoutScores = new RegExp(
    `^${DATE}\\s+${TIME}\\s+(?<home>.+?)\\s+(?<homeClass>${CLASS})\\s+(?<homeRegion>${REGION})\\s+(?<visitor>.+?)\\s+(?<visitorClass>${CLASS})\\s+(?<visitorRegion>${REGION})(?:\\s+(?<note>.*))?$`,
    "i",
  );

  const nonRegionGame = new RegExp(
    `^${DATE}(?:\\s+${TIME})?\\s+(?<home>.+?)\\s+(?<homeClass>${CLASS})?\\s*(?<homeScore>\\d{1,3})\\s+(?<visitor>.+?)\\s+(?<visitorClass>${CLASS})?\\s*(?<visitorScore>\\d{1,3})(?:\\s+(?<note>.*))?$`,
    "i",
  );

  for (const line of lines) {
    if (/^(THURSDAY|FRIDAY|SATURDAY|DATE\s+TIME|AHSAA\s+WEEK|OTHER\s+|AHSAA WOTM)/i.test(line)) continue;

    const region = line.match(fullRegionGame);
    if (region?.groups) {
      rows.push({
        sourceLine: line,
        date: region.groups.date,
        time: region.groups.time,
        homeSourceName: region.groups.home,
        homeDisplayName: cleanSchoolName(region.groups.home),
        homeClass: normalizeClass(region.groups.homeClass),
        homeRegion: normalizeRegion(region.groups.homeRegion),
        homeScore: Number(region.groups.homeScore),
        visitorSourceName: region.groups.visitor,
        visitorDisplayName: cleanSchoolName(region.groups.visitor),
        visitorClass: normalizeClass(region.groups.visitorClass),
        visitorRegion: normalizeRegion(region.groups.visitorRegion),
        visitorScore: Number(region.groups.visitorScore),
        status: "final",
      });
      continue;
    }

    const interrupted = line.match(regionGameWithoutScores);
    if (interrupted?.groups) {
      const note = interrupted.groups.note?.trim();
      rows.push({
        sourceLine: line,
        date: interrupted.groups.date,
        time: interrupted.groups.time,
        homeSourceName: interrupted.groups.home,
        homeDisplayName: cleanSchoolName(interrupted.groups.home),
        homeClass: normalizeClass(interrupted.groups.homeClass),
        homeRegion: normalizeRegion(interrupted.groups.homeRegion),
        visitorSourceName: interrupted.groups.visitor,
        visitorDisplayName: cleanSchoolName(interrupted.groups.visitor),
        visitorClass: normalizeClass(interrupted.groups.visitorClass),
        visitorRegion: normalizeRegion(interrupted.groups.visitorRegion),
        status: /SUSPEND/i.test(note ?? "") ? "suspended" : "scheduled",
        note,
      });
      continue;
    }

    // A small number of games in the PDF omit region metadata. Parse them only
    // when both scores are present; otherwise leave the row for human review.
    const nonRegion = line.match(nonRegionGame);
    if (nonRegion?.groups && nonRegion.groups.home && nonRegion.groups.visitor) {
      rows.push({
        sourceLine: line,
        date: nonRegion.groups.date,
        time: nonRegion.groups.time,
        homeSourceName: nonRegion.groups.home,
        homeDisplayName: cleanSchoolName(nonRegion.groups.home),
        homeClass: normalizeClass(nonRegion.groups.homeClass),
        homeScore: Number(nonRegion.groups.homeScore),
        visitorSourceName: nonRegion.groups.visitor,
        visitorDisplayName: cleanSchoolName(nonRegion.groups.visitor),
        visitorClass: normalizeClass(nonRegion.groups.visitorClass),
        visitorScore: Number(nonRegion.groups.visitorScore),
        status: "final",
      });
      continue;
    }

    if (/^\d{2}-\d{2}-\d{4}\b/.test(line)) {
      rows.push({
        sourceLine: line,
        date: line.slice(0, 10),
        homeSourceName: "",
        homeDisplayName: "",
        visitorSourceName: "",
        visitorDisplayName: "",
        status: "review",
        note: "Could not safely parse this PDF row; manual review required.",
      });
    }
  }

  return rows;
}
