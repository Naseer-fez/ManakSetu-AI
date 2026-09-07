export interface RadiantSearchComposerProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: (query: string, division: string) => void;
  division?: string;
  onDivisionChange?: (division: string) => void;
  placeholder?: string;
  suggestion?: string;
  isLoading?: boolean;
  className?: string;
}
