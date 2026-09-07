/**
 * Template Profile and Export Request Contracts.
 * Mirrors document_contracts.py.
 */

export interface TemplateField {
  field_id: string;
  label: string;
  value_type: string;
  required: boolean;
  page?: number | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  token?: string | null;
  max_chars?: number | null;
  font_size?: number;
}

export interface TemplateProfile {
  template_id: string;
  name: string;
  source: string;
  version: string;
  format: string;
  asset_path?: string | null;
  approved: boolean;
  fields: TemplateField[];
}

export interface ExportRequest {
  format: string;
  template: TemplateProfile;
  values: Record<string, string>;
  revision_id?: string | null;
  allow_draft?: boolean;
}
