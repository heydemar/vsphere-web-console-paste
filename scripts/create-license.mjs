import { createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [, , plan, licenseId, expiresAt] = process.argv;

if (!["pro", "enterprise"].includes(plan) || !licenseId) {
  console.error("Usage: node scripts/create-license.mjs <pro|enterprise> <license-id> [expires-at]");
  process.exit(1);
}
if (expiresAt && Number.isNaN(Date.parse(expiresAt))) {
  console.error("expires-at must be an ISO date, for example 2027-12-31T23:59:59Z");
  process.exit(1);
}

const payload = {
  version: 1,
  plan,
  licenseId,
  issuedAt: new Date().toISOString(),
  ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {})
};
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
const privateKey = createPrivateKey(
  readFileSync(resolve(root, ".secrets", "license-private.pem"))
);
const signature = sign(null, Buffer.from(encodedPayload), privateKey).toString("base64url");

console.log(`${encodedPayload}.${signature}`);
