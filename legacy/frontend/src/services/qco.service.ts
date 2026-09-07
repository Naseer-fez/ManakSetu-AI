/**
 * Quality Control Orders (QCO) and Knowledge Graph API Service.
 */
import { requestJson } from '@/services/api.client';
import type { MandatoryQCO, GraphData } from '@/types/models.types';

export async function fetchQcoList(): Promise<Record<string, MandatoryQCO>> {
  return requestJson<Record<string, MandatoryQCO>>('/qco-list');
}

export async function fetchKnowledgeGraph(maxNodes: number = 500): Promise<GraphData> {
  const params = new URLSearchParams({ max_nodes: String(maxNodes) });
  return requestJson<GraphData>(`/graph?${params.toString()}`);
}

export async function getQcoForStandard(isCode: string): Promise<MandatoryQCO | null> {
  const list = await fetchQcoList();
  return list[isCode] ?? null;
}
