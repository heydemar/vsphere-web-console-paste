import { createPrivateKey, sign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argumentsList = process.argv.slice(2);
const outputIndex = argumentsList.indexOf("--out");
const outputPath = outputIndex >= 0 ? argumentsList.splice(outputIndex, 2)[1] : null;
const [plan, licenseId, expiresAt] = argumentsList;

if (!["pro", "enterprise"].includes(plan) || !licenseId) {
  console.error(
    "Usage: node scripts/create-license.mjs <pro|enterprise> <license-id> [expires-at] [--out <file>]"
  );
  process.exit(1);
}
if (outputIndex >= 0 && !outputPath) {
  console.error("--out requires a file path");
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
const license = `${encodedPayload}.${signature}`;

if (outputPath) {
  writeFileSync(resolve(root, outputPath), `${license}\n`, {
    encoding: "utf8",
    mode: 0o600,
    flag: "wx"
  });
  console.log(`License written to ${outputPath}`);
} else {
  console.log(license);
}
