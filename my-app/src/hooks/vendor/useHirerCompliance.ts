import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { Booking } from "@/types";
import { ComplianceDocument } from "@/types";

// ===========================================================
// useHirerCompliance.ts
// Fetches compliance documents and credibility score for a
// specific hirer across all document types.
// Used on the vendor's hirer profile detail page to display
// the hirer's credibility score and uploaded documents.
// ===========================================================
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

// ===========================================================
// useAllHirersCompliance.ts
// Fetches credibility scores for all unique hirers in a
// bookings list. Returns a map of hirerID -> credibilityScore
// so the dashboard booking history table can show a score
// per row without calling hooks inside a loop.
// ===========================================================
export function useAllHirersCompliance(bookings: Booking[]) {
  // Map of hirerID (as string) -> credibilityScore number
  const [credibilityMap, setCredibilityMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Wait until bookings are loaded before fetching
    if (!bookings || bookings.length === 0) return;

    // Get unique hirer IDs from the bookings list
    const uniqueHirerIds = [...new Set(bookings.map((b) => b.application.hirer.userID))];

    async function fetchAllScores() {
      setIsLoading(true);
      try {
        // Fetch compliance for each unique hirer in parallel
        const results = await Promise.all(
          uniqueHirerIds.map((id) =>
            vendorApi.getHirerCompliance(id).then((data) => ({
              id,
              score: data.credibilityScore,
            })),
          ),
        );

        // Build the map: { "42": 80, "7": 60, ... }
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
