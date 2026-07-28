import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInThisContext } from "node:vm";

runInThisContext(readFileSync("input.js", "utf8"));

test("sends letters, numbers, whitespace and line breaks through the fast text channel", () => {
  assert.deepEqual(ConsoleInput.buildOperations("Text äöü 123\nWeiter"), [
    { type: "text", value: "Text äöü 123\nWeiter" }
  ]);
});

test("sends PowerShell punctuation through explicit WebMKS Unicode key codes", () => {
  assert.deepEqual(ConsoleInput.buildOperations("# $a = \\\`x\""), [
    { type: "unicode", codePoint: 35 },
    { type: "text", value: " " },
    { type: "unicode", codePoint: 36 },
    { type: "text", value: "a " },
    { type: "unicode", codePoint: 61 },
    { type: "text", value: " " },
    { type: "unicode", codePoint: 92 },
    { type: "unicode", codePoint: 96 },
    { type: "text", value: "x" },
    { type: "unicode", codePoint: 34 }
  ]);
});

test("preserves supplementary Unicode characters as one code point", () => {
  assert.deepEqual(ConsoleInput.buildOperations("🔐"), [
    { type: "unicode", codePoint: 0x1f510 }
  ]);
});
