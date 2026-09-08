/**
 * BIS Division abbreviation → full descriptive label and description mapping.
 * Add new divisions here — never hardcode in component files.
 */
export const DIVISION_META: Record<string, { label: string; desc: string }> = {
  All: { label: "All Standards", desc: "Show standards across all Bureau divisions" },
  ETD: { label: "Electrotechnical", desc: "Power, Cables, Switchgear & Electrical Safety" },
  CED: { label: "Civil Engineering", desc: "Building, Concrete, Structures & Construction" },
  MED: { label: "Mechanical Eng.", desc: "Machinery, Boilers, Piping, Pumps & Metals" },
  TXD: { label: "Textiles", desc: "Industrial, Protective & Technical Fabrics" },
  LITD: { label: "Electronics & IT", desc: "Hardware, Telecom, Software & Optics" },
  CHD: { label: "Chemical", desc: "Petrochemicals, Paints, Polymers & Fertilizers" },
  FAD: { label: "Food & Agri", desc: "Food Safety, Agricultural Processing & Dairy" },
  HMD: { label: "Hydraulics", desc: "Water Management & Irrigation Infrastructure" },
  PGD: { label: "Petroleum & Coal", desc: "Fuels, Lubricants & Coal Products" },
  PHITD: { label: "Metallurgy & IT", desc: "Physical, Metallurgical & Tech Systems" },
  SLTD: { label: "Lab Testing", desc: "Standardization & Testing Procedures" },
  BLTD: { label: "Building & Civil", desc: "Structural & Civil Engineering Systems" },
  AMD: { label: "Agri Machinery", desc: "Agricultural & Food Processing Equipment" },
};

/**
 * Returns clean division button label (e.g., "Electrotechnical", "Civil Engineering").
 */
export function getDivisionLabel(code: string): string {
  return DIVISION_META[code]?.label ?? code;
}

/**
 * Returns division description detailing what the division actually does.
 */
export function getDivisionDescription(code: string): string {
  return DIVISION_META[code]?.desc ?? `${code} Division Standards`;
}
