// reputation.ts - pure helper for computing a hirer's average reputation rating.
// Returns the arithmetic mean of vendor-given reputation ratings (0..5), rounded to
// 1 decimal place. Returns null when there are no valid ratings so the UI can show
// "Not yet rated" instead of a misleading 0.0.
export function computeAverageReputation(ratings: number[]): number | null {
  // Zero and non-finite values represent unrated events; exclude them from the average.
  const valid = ratings.filter(
    (r) => typeof r === "number" && Number.isFinite(r) && r > 0,
  );

  if (valid.length === 0) return null;

  const sum = valid.reduce((total, r) => total + r, 0);
  return parseFloat((sum / valid.length).toFixed(1));
}
