export interface StarterPrompt {
  label: string;
  query: string;
}

export const STARTER_PROMPTS: StarterPrompt[] = [
  { label: "Solar Modules QCO", query: "What are the mandatory QCO compliance standards for Solar PV modules?" },
  { label: "TMT Rebars (IS 1786)", query: "Summarize mandatory test methods and chemical parameters under IS 1786 for TMT bars." },
  { label: "GeM Clause Drafting", query: "Draft a GeM tender specification clause for HDPE pipes ensuring IS 4984 compliance." },
  { label: "IS 4984 vs IS 14885", query: "What is the relationship between IS 4984 and IS 14885?" },
];
