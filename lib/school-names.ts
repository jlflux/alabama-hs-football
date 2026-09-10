const TYPE_SUFFIXES = [
  /\s+H\.S\.$/i,
  /\s+HS$/i,
  /\s+High School$/i,
];

/**
 * Convert source-facing school labels into the clean public display name.
 *
 * We intentionally remove only high-school type markers. Words such as
 * Academy, Christian, Catholic, Charter and School can be meaningful parts of
 * a school's actual identity and are preserved.
 */
export function cleanSchoolName(sourceName: string): string {
  let name = sourceName.trim().replace(/\s+/g, " ");

  // Handle labels where HS appears before a city disambiguator.
  name = name
    .replace(/\s+H\.S\.(?=\s*[,\-])/gi, "")
    .replace(/\s+HS(?=\s*[,\-])/gi, "")
    .replace(/\s+High School(?=\s*[,\-])/gi, "");

  for (const suffix of TYPE_SUFFIXES) name = name.replace(suffix, "");

  return name.trim();
}

/**
 * Conservative matching key for imports. This is not a public display name.
 * Source aliases remain the long-term answer for ambiguous/irregular labels.
 */
export function schoolMatchKey(sourceName: string): string {
  return cleanSchoolName(sourceName)
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}
