// ===========================================================
// reputation.ts - pure helpers for hirer reputation maths
// ===========================================================
// Pulled out of HirerController so it can be unit-tested
// directly (HD test 3 - "contextual" unit test for the average
// reputation calculation, covering the edge cases:
//   * zero ratings   -> null  (so the UI can show "not yet rated")
//   * single rating  -> that exact value
//   * many ratings   -> arithmetic mean, rounded to 1 decimal
// ===========================================================

// Compute the average of a list of vendor-given reputation
// ratings (0..5). Returns null when there is nothing to average,
// so the page can distinguish "no rating yet" from a real 0.
export function computeAverageReputation(ratings: number[]): number | null {
  // Only ratings that are real numbers above 0 count. A vendor
  // who hasn't rated yet has a 0/null/undefined; including those
  // would drag the average down for no reason.
  const valid = ratings.filter(
    (r) => typeof r === "number" && Number.isFinite(r) && r > 0,
  );

  if (valid.length === 0) return null;

  const sum = valid.reduce((total, r) => total + r, 0);
  // Round to 1 decimal place ("4.7", not "4.6666666...").
  return parseFloat((sum / valid.length).toFixed(1));
}
