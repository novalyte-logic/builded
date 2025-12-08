export interface LeadAIReasoning {
  leadId: string;
  conversionProbability: number; // 0–1, e.g. 0.72
  horizonDays: number;           // e.g. 30
  confidence: number;            // 0–1, e.g. 0.88
  rationale: string;             // multi-paragraph explanation
  keySignals: string[];          // positive signals
  riskFactors: string[];         // negative / caution signals
  recommendedActions: string[];  // specific next steps
}
