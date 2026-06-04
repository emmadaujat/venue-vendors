// useHirerCompliance.ts - hooks for fetching compliance documents and credibility scores for hirers.
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { Booking } from "@/types";
import { ComplianceDocument } from "@/types";

export function useHirerCompliance(hirerID: number) {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [credibilityScore, setCredibilityScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

// Fetches credibility scores for all unique hirers in a bookings list.
// Returns a map of hirerID -> credibilityScore, avoiding hook-in-loop patterns.
export function useAllHirersCompliance(bookings: Booking[]) {
  const [credibilityMap, setCredibilityMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    const uniqueHirerIds = [...new Set(bookings.map((b) => b.application.hirer.userID))];

    async function fetchAllScores() {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          uniqueHirerIds.map((id) =>
            vendorApi.getHirerCompliance(id).then((data) => ({
              id,
              score: data.credibilityScore,
            })),
          ),
        );

        const map: Record<string, number> = {};
        results.forEach(({ id, score }) => {
          map[id] = score;
        });

        setCredibilityMap(map);
      } catch (err) {
        console.error("Failed to load hirer compliance scores", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllScores();
  }, [bookings]);

  return { credibilityMap, isLoading };
}
