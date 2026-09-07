import { type FC, useEffect, useState, useRef } from 'react';
import { explainStandardStream } from '@/services/standards.service';
import { RefreshCw } from 'lucide-react';
import { MotionButton } from '@/components/primitives/MotionButton';

interface ExplanationStreamProps {
  isCode: string;
  context: string;
}

export const ExplanationStream: FC<ExplanationStreamProps> = ({ isCode, context }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setExplanation('');
    try {
      await explainStandardStream(isCode, context, (chunk) => {
        setExplanation((prev) => prev + chunk);
      });
    } catch (e) {
      // ignore aborts
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isCode]);

  return (
    <div className="bg-surface rounded-xl p-4 border border-border mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-text-primary">AI Explanation</h4>
        <MotionButton
          variant="ghost"
          size="icon"
          onClick={startStream}
          isLoading={isLoading}
        >
          <RefreshCw className="w-4 h-4 text-text-secondary" />
        </MotionButton>
      </div>
      <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
        {explanation}
        {isLoading && <span className="inline-block w-2 h-4 ml-1 bg-text-primary animate-pulse" />}
      </div>
    </div>
  );
};
