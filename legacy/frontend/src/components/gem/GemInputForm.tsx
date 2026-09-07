import { type FC } from 'react';
import { GemBidValidationRequest } from '@/types';
import { MotionButton } from '@/components/primitives/MotionButton';

interface GemInputFormProps {
  formData: GemBidValidationRequest;
  onChange: (data: GemBidValidationRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const GemInputForm: FC<GemInputFormProps> = ({ formData, onChange, onSubmit, isLoading }) => {
  const handleChange = (field: keyof GemBidValidationRequest, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">Bid ID</label>
          <input
            type="text"
            value={formData.bid_id}
            onChange={(e) => handleChange('bid_id', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-ruby outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Category Name</label>
          <input
            type="text"
            value={formData.category_name}
            onChange={(e) => handleChange('category_name', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-ruby outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Product Title</label>
        <input
          type="text"
          value={formData.product_title}
          onChange={(e) => handleChange('product_title', e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-ruby outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Buyer Specifications</label>
        <textarea
          value={formData.buyer_specifications}
          onChange={(e) => handleChange('buyer_specifications', e.target.value)}
          rows={6}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-ruby outline-none resize-none"
        />
      </div>
      <MotionButton variant="ruby" onClick={onSubmit} isLoading={isLoading}>
        Validate Bid
      </MotionButton>
    </div>
  );
};
