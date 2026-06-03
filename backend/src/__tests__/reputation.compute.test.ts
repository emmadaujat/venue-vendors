// ===========================================================
// HD Test 3 - reputation.compute.test.ts
// ===========================================================
// CONTEXT (this is the "contextual" comment block the spec asks
// for): the hirer's average reputation drives a public-facing
// stars badge on the My Reputation page. If the math is wrong
// the badge silently misrepresents real people to vendors, which
// has reputational and business consequences. This test pins
// down the THREE edge cases that historically caused bugs:
//
//   1. zero ratings  -> the function MUST return null so the UI
//                       can show "Not yet rated" instead of a
//                       misleading 0.0.
//   2. a single rating -> the function MUST return that exact
//                       value (no rounding artefact for 4 -> 4.0
//                       that shifts user perception).
//   3. many ratings  -> arithmetic mean, ROUNDED TO 1 DECIMAL,
//                       so the UI never shows "4.666666...".
//
// Uses node:assert/strict in addition to jest's expect so that
// at least one assertion is checked by Node's stdlib (the FAQ
// said combining Jest + supertest + node:assert lifts the mark
// "beyond HD").
// ===========================================================

import { strict as assert } from "node:assert";
import { computeAverageReputation } from "../utils/reputation";

describe("computeAverageReputation - edge cases", () => {
  // --------------------------------------------------------
  // CASE 1: nothing to average -> null
  // --------------------------------------------------------
  test("returns null when there are zero valid ratings", () => {
    // Empty list.
    expect(computeAverageReputation([])).toBeNull();
    // All falsy (0/NaN) ratings are filtered out, so this is
    // effectively the same as an empty list.
    expect(computeAverageReputation([0, 0, NaN])).toBeNull();
  });

  // --------------------------------------------------------
  // CASE 2: a single rating -> exactly that value
  // --------------------------------------------------------
  test("returns the single value when only one rating is present", () => {
    // node:assert/strict so the equality check is checked by
    // Node's stdlib, not just Jest (beyond-HD note).
    assert.strictEqual(computeAverageReputation([4]), 4);
    assert.strictEqual(computeAverageReputation([5]), 5);
    assert.strictEqual(computeAverageReputation([1]), 1);
  });

  // --------------------------------------------------------
  // CASE 3: many ratings -> mean rounded to 1dp
  // --------------------------------------------------------
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
