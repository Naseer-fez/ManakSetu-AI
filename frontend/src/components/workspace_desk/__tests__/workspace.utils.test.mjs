import test from "node:test";
import assert from "node:assert";
import {
  formatFileSize,
  countWords,
  filterFindings,
  generateAiPromptForFinding,
  getStatusLabel,
} from "../workspace.utils.ts";

test("formatFileSize formats bytes, KB, and MB accurately", () => {
  assert.strictEqual(formatFileSize(0), "0 B");
  assert.strictEqual(formatFileSize(512), "512 B");
  assert.strictEqual(formatFileSize(1024), "1.0 KB");
  assert.strictEqual(formatFileSize(1048576), "1.0 MB");
  assert.strictEqual(formatFileSize(2500000), "2.4 MB");
});

test("countWords returns correct word counts for strings", () => {
  assert.strictEqual(countWords(""), 0);
  assert.strictEqual(countWords("   "), 0);
  assert.strictEqual(countWords("Tender specification document"), 3);
  assert.strictEqual(countWords("  Multiple   spaces   between words  "), 4);
});

test("filterFindings filters by status or returns all", () => {
  const sample = [
    { id: "1", status: "critical", resolution: "pending", clauseLocation: "1.1", explanation: "", suggestedCorrection: "", category: "" },
    { id: "2", status: "warning", resolution: "pending", clauseLocation: "1.2", explanation: "", suggestedCorrection: "", category: "" },
    { id: "3", status: "passed", resolution: "pending", clauseLocation: "1.3", explanation: "", suggestedCorrection: "", category: "" },
  ];

  assert.strictEqual(filterFindings(sample, "all").length, 3);
  const criticalOnly = filterFindings(sample, "critical");
  assert.strictEqual(criticalOnly.length, 1);
  assert.strictEqual(criticalOnly[0].id, "1");

  const warningOnly = filterFindings(sample, "warning");
  assert.strictEqual(warningOnly.length, 1);
  assert.strictEqual(warningOnly[0].id, "2");
});

test("generateAiPromptForFinding formats prompt with clause and explanation", () => {
  const finding = {
    id: "f1",
    clauseLocation: "Clause 3.2",
    status: "critical",
    resolution: "pending",
    explanation: "Missing statutory license reference",
    suggestedCorrection: "Add license requirement",
    category: "QCO",
  };

  const prompt = generateAiPromptForFinding(finding);
  assert.ok(prompt.includes("Clause 3.2"));
  assert.ok(prompt.includes("Missing statutory license reference"));
  assert.ok(prompt.includes("redraft this tender clause"));
});

test("getStatusLabel returns proper display titles", () => {
  assert.strictEqual(getStatusLabel("critical"), "Critical");
  assert.strictEqual(getStatusLabel("warning"), "Warning");
  assert.strictEqual(getStatusLabel("passed"), "Passed");
  assert.strictEqual(getStatusLabel("needs_verification"), "Needs Verification");
});
