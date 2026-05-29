// ===========================================================
// useHirerCompliance.ts
// Fetches compliance documents and credibility score for a
// specific hirer across all document types.
// Used on the vendor's hirer profile detail page to display
// the hirer's credibility score and uploaded documents.
// ===========================================================
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { ComplianceDocument } from "@/types";

export function useHirerCompliance(hirerID: number) {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [credibilityScore, setCredibilityScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if hirerID is not yet available or invalid
    if (!hirerID || isNaN(hirerID)) return;

    async function fetchCompliance() {
      try {
        setIsLoading(true);
        const data = await vendorApi.getHirerCompliance(hirerID);
        setDocuments(data.documents);
        setCredibilityScore(data.credibilityScore);
      } catch (err) {
        setError("Failed to load compliance documents");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompliance();
  }, [hirerID]);

  return { documents, credibilityScore, isLoading, error };
}
