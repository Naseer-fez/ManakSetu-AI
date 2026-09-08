import test from "node:test";
import assert from "node:assert";
import {
  clampDocPct,
  clampAiPct,
  rebalancePanels,
} from "../workspace_desk_resize.utils.ts";

test("clampDocPct limits document percentage when AI is closed", () => {
  assert.strictEqual(clampDocPct(10, false, 0), 20); // Min bound 20%
  assert.strictEqual(clampDocPct(50, false, 0), 50);
  assert.strictEqual(clampDocPct(90, false, 0), 80); // Max bound 80%
});

test("clampDocPct limits document percentage when AI is open", () => {
  // If AI is 30%, maxDoc should leave at least 20% for findings: 100 - 30 - 20 = 50%
  assert.strictEqual(clampDocPct(10, true, 30), 18); // Min bound 18%
  assert.strictEqual(clampDocPct(40, true, 30), 40);
  assert.strictEqual(clampDocPct(70, true, 30), 50); // Max bound clamped to 50%
});

test("clampAiPct limits AI percentage bounds", () => {
  assert.strictEqual(clampAiPct(10), 18); // Min bound 18%
  assert.strictEqual(clampAiPct(30), 30);
  assert.strictEqual(clampAiPct(65), 50); // Max bound 50%
});

test("rebalancePanels redistributes remaining width smoothly", () => {
  const { docPct, findingsPct } = rebalancePanels(33, 37, 30);
  assert.strictEqual(docPct + findingsPct, 70);
  assert.ok(docPct >= 18);
  assert.ok(findingsPct >= 18);
});
