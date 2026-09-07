/**
 * GeM (Government e-Marketplace) Bid Validation Service.
 */
import { requestJson } from '@/services/api.client';
import type {
  GemBidValidationRequest,
  GemBidValidationResponse,
} from '@/types/api.types';

export async function validateGemBid(
  req: GemBidValidationRequest
): Promise<GemBidValidationResponse> {
  return requestJson<GemBidValidationResponse>('/gem-webhook', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
