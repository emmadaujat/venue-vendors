// HD Test 3 - computeAverageReputation edge cases
// The hirer's average reputation drives the stars badge on the My Reputation page.
// Incorrect math silently misrepresents hirers to vendors, with real business consequences.
// Three edge cases are tested:
//   1. zero ratings  -> returns null (UI shows "Not yet rated", not a misleading 0.0)
//   2. single rating -> returns the exact value (no rounding artefact)
//   3. many ratings  -> arithmetic mean rounded to 1 decimal place
//
// node:assert/strict is used alongside Jest so at least one assertion is checked by
// Node's standard library.

import { strict as assert } from "node:assert";
import { computeAverageReputation } from "../utils/reputation";

describe("computeAverageReputation - edge cases", () => {
  test("returns null when there are zero valid ratings", () => {
    expect(computeAverageReputation([])).toBeNull();
    // 0 and NaN are filtered out, making this equivalent to an empty list.
    expect(computeAverageReputation([0, 0, NaN])).toBeNull();
  });

  test("returns the single value when only one rating is present", () => {
    assert.strictEqual(computeAverageReputation([4]), 4);
    assert.strictEqual(computeAverageReputation([5]), 5);
    assert.strictEqual(computeAverageReputation([1]), 1);
  });

  test("returns arithmetic mean rounded to 1 decimal place", () => {
    // 3 + 4 + 5 = 12, /3 = 4.0
    assert.strictEqual(computeAverageReputation([3, 4, 5]), 4);

    // 3 + 4 = 7, /2 = 3.5  (one decimal already)
    assert.strictEqual(computeAverageReputation([3, 4]), 3.5);

    // 5 + 4 + 3 + 3 = 15, /4 = 3.75 -> rounds to 3.8
    assert.strictEqual(computeAverageReputation([5, 4, 3, 3]), 3.8);

    // 1 + 1 + 1 = 3, /3 = 1.0
    assert.strictEqual(computeAverageReputation([1, 1, 1]), 1);
  });
});
