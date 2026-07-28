import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));

test("uses Manifest V3 with narrowly scoped permissions", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(
    [...manifest.permissions].sort(),
    ["activeTab", "clipboardRead", "scripting", "storage"].sort()
  );
  assert.equal(manifest.host_permissions, undefined);
});

test("contains every declared extension asset", () => {
  const files = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    manifest.storage.managed_schema,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon)
  ];
  for (const file of files) {
    assert.equal(existsSync(file), true, `Missing declared asset: ${file}`);
  }
});

test("sets the official WebMKS keyboard layout before text input", () => {
  const worker = readFileSync("service-worker.js", "utf8");
  assert.match(worker, /setOption\("keyboardLayoutId", selectedKeyboardLayout\)/);
  assert.match(worker, /sendInputString\(input\)/);
  assert.doesNotMatch(worker, /sendKeyCodes/);
});

test("does not load remotely hosted scripts", () => {
  const html = readFileSync("popup.html", "utf8");
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
});

test("enforces the Free limit in the service worker", () => {
  const worker = readFileSync("service-worker.js", "utf8");
  assert.match(worker, /FREE_CHARACTER_LIMIT = 6/);
  assert.match(worker, /entitlement\.plan === "free"/);
});
