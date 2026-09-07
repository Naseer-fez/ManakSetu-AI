/**
 * BIS Division abbreviation → full descriptive name mapping.
 * Add new divisions here — never hardcode in component files.
 */
export const DIVISION_NAMES: Record<string, string> = {
  All: "All Divisions",
  ETD: "Electrotechnical Division",
  CED: "Civil Engineering Division",
  MED: "Mechanical Engineering Division",
  TXD: "Textile Division",
  LITD: "Light Industrial & Instruments Division",
  CHD: "Chemical Division",
  FAD: "Food & Agriculture Division",
  HMD: "Hydraulics & Water Management Division",
  PGD: "Petroleum, Coal & Related Products Division",
  PHITD: "Physical, Metallurgical & Information Technology Division",
  SLTD: "Standardization & Laboratory Testing Division",
  BLTD: "Building, Civil & Structural Engineering Division",
  AMD: "Agricultural & Food Engineering Division",
};

/**
 * Returns the full division name for a given code.
 * Falls back to the code itself if not found.
 */
export function getDivisionLabel(code: string): string {
  return DIVISION_NAMES[code] ?? code;
}
