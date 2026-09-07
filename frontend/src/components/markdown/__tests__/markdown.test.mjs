import test from "node:test";
import assert from "node:assert";
import { marked } from "marked";

test("Markdown parser parses headings correctly without raw markdown hashes", () => {
  const input = "### RULE\n## 5 ANSWER\n# BIS Standard";
  const tokens = marked.lexer(input);

  assert.strictEqual(tokens.length, 3);
  assert.strictEqual(tokens[0].type, "heading");
  assert.strictEqual(tokens[0].depth, 3);
  assert.strictEqual(tokens[0].text, "RULE");

  assert.strictEqual(tokens[1].type, "heading");
  assert.strictEqual(tokens[1].depth, 2);
  assert.strictEqual(tokens[1].text, "5 ANSWER");

  assert.strictEqual(tokens[2].type, "heading");
  assert.strictEqual(tokens[2].depth, 1);
  assert.strictEqual(tokens[2].text, "BIS Standard");
});

test("Markdown parser parses bold, italic, and inline code tokens", () => {
  const input = "**RESTful** API with *italicized* text and `status: 200` code.";
  const tokens = marked.lexer(input);

  assert.strictEqual(tokens[0].type, "paragraph");
  const inlineTokens = tokens[0].tokens;
  const strongTok = inlineTokens.find(t => t.type === "strong");
  const emTok = inlineTokens.find(t => t.type === "em");
  const codeTok = inlineTokens.find(t => t.type === "codespan");

  assert.ok(strongTok, "Should parse strong token");
  assert.strictEqual(strongTok.text, "RESTful");

  assert.ok(emTok, "Should parse em token");
  assert.strictEqual(emTok.text, "italicized");

  assert.ok(codeTok, "Should parse codespan token");
  assert.strictEqual(codeTok.text, "status: 200");
});

test("Markdown parser differentiates bullet and numbered lists", () => {
  const input = "- Bullet item 1\n- Bullet item 2\n\n1. Numbered item 1\n2. Numbered item 2";
  const tokens = marked.lexer(input);

  const bulletList = tokens.find(t => t.type === "list" && !t.ordered);
  const numberedList = tokens.find(t => t.type === "list" && t.ordered);

  assert.ok(bulletList, "Should find bullet list");
  assert.strictEqual(bulletList.items.length, 2);
  assert.strictEqual(bulletList.items[0].text, "Bullet item 1");

  assert.ok(numberedList, "Should find numbered list");
  assert.strictEqual(numberedList.items.length, 2);
  assert.strictEqual(numberedList.items[0].text, "Numbered item 1");
});

test("Markdown parser preserves code blocks with language and content", () => {
  const input = "```javascript\nconst app = express();\napp.get('/users', handler);\n```";
  const tokens = marked.lexer(input);

  assert.strictEqual(tokens[0].type, "code");
  assert.strictEqual(tokens[0].lang, "javascript");
  assert.strictEqual(tokens[0].text, "const app = express();\napp.get('/users', handler);");
});

test("Markdown parser parses tables into headers and rows", () => {
  const input = "| Parameter | Requirement |\n| --- | --- |\n| Yield Strength | 500 MPa |\n| Elongation | 14.5% |";
  const tokens = marked.lexer(input);

  const tableTok = tokens.find(t => t.type === "table");
  assert.ok(tableTok, "Should find table token");
  assert.strictEqual(tableTok.header.length, 2);
  assert.strictEqual(tableTok.header[0].text, "Parameter");
  assert.strictEqual(tableTok.rows.length, 2);
  assert.strictEqual(tableTok.rows[0][0].text, "Yield Strength");
  assert.strictEqual(tableTok.rows[0][1].text, "500 MPa");
});

test("Indian Standard badge regex detects standards accurately", () => {
  const tokenRegex = /(\b[A-Za-z0-9_\-]+\.md\b|\bIS\s\d+(?:[-:][A-Za-z0-9]+)?\b)/g;
  const sample = "Compliance with IS 1786 and IS 4984:1995 required per SPEC.md guidelines.";
  const matches = [...sample.matchAll(tokenRegex)].map(m => m[0]);

  assert.deepStrictEqual(matches, ["IS 1786", "IS 4984:1995", "SPEC.md"]);
});
