import { type FC } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export const LanguageSelector: FC<Props> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface border border-border text-text-primary rounded-md px-2 py-1 text-sm"
    >
      <option value="auto">Auto</option>
      <option value="en">English</option>
      <option value="hi">हिन्दी (Hindi)</option>
    </select>
  );
};
