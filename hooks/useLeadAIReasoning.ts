import { useState } from "react";
import type { LeadAIReasoning } from "@/lib/types/leads";

export function useLeadAIReasoning() {
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState<LeadAIReasoning | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchReasoning(leadId: string) {
    try {
      setLoading(true);
      setError(null);
      setReasoning(null); // Reset previous reasoning

      const res = await fetch(`/api/admin/leads/${leadId}/ai-thoughts`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load AI reasoning' }));
        throw new Error(errorData.error || 'Failed to load AI reasoning');
      }

      const json = await res.json();
      setReasoning(json.thoughts || json.reasoning);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unknown error occurred while fetching AI reasoning");
    } finally {
      setLoading(false);
    }
  }

  return { loading, reasoning, error, fetchReasoning };
}
