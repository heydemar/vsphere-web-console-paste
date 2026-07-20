import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = resolve(root, "dist", "extension");
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));

if (manifest.manifest_version !== 3) throw new Error("Manifest V3 is required.");
if (manifest.permissions?.includes("debugger")) {
  throw new Error("Store builds must not request the debugger permission.");
}
if (manifest.permissions?.some((permission) => permission === "<all_urls>")) {
  throw new Error("Store builds must not request <all_urls>.");
}

rmSync(resolve(root, "dist"), { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const path of [
  "manifest.json",
  "managed-storage-schema.json",
  "license.js",
  "service-worker.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "icons"
]) {
  cpSync(resolve(root, path), resolve(output, path), { recursive: true });
}

console.log(`Validated store package ${manifest.version} in dist/extension`);
