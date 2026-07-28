import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInThisContext } from "node:vm";

runInThisContext(readFileSync("input.js", "utf8"));

test("keeps ordinary text and line breaks on the fast WebMKS string channel", () => {
  assert.deepEqual(ConsoleInput.buildOperations("Text äöü 123\nWeiter"), [
    { type: "text", value: "Text äöü 123\nWeiter" }
  ]);
});

test("maps the reported PowerShell failures to German keyboard combinations", () => {
  assert.deepEqual(ConsoleInput.buildOperations("#=\\`"), [
    { type: "keys", keyCodes: [220] },
    { type: "keys", keyCodes: [16, 48] },
    { type: "keys", keyCodes: [17, 18, 189] },
    { type: "keys", keyCodes: [16, 187] },
    { type: "keys", keyCodes: [32] }
  ]);
});

test("maps the complete PowerShell ASCII punctuation set", () => {
  const punctuation = "!\"$%&/()=?\\{}[]@~+*#'<>|,;.:-_`^";
  const operations = ConsoleInput.buildOperations(punctuation);

  assert.equal(operations.every((operation) => operation.type === "keys"), true);
  assert.equal(
    operations.some((operation) => operation.keyCodes.join(",") === "17,18,189"),
    true,
    "backslash must use AltGr+ß"
  );
  assert.equal(
    operations.some((operation) => operation.keyCodes.join(",") === "16,48"),
    true,
    "equals must use Shift+0"
  );
});

test("keeps unsupported Unicode characters intact for WebMKS string input", () => {
  assert.deepEqual(ConsoleInput.buildOperations("🔐"), [
    { type: "text", value: "🔐" }
  ]);
});

test("keeps the original WebMKS input path for automatic or US layouts", () => {
  assert.deepEqual(ConsoleInput.buildOperations("# = \\", "auto"), [
    { type: "text", value: "# = \\" }
  ]);
});
