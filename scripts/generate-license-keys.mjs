import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const secretDirectory = resolve(root, ".secrets");
mkdirSync(secretDirectory, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
writeFileSync(
  resolve(secretDirectory, "license-private.pem"),
  privateKey.export({ type: "pkcs8", format: "pem" }),
  { mode: 0o600, flag: "wx" }
);
writeFileSync(
  resolve(secretDirectory, "license-public.pem"),
  publicKey.export({ type: "spki", format: "pem" }),
  { mode: 0o600, flag: "wx" }
);

const spki = publicKey.export({ type: "spki", format: "der" }).toString("base64");
console.log("Keep .secrets/license-private.pem offline and backed up.");
console.log(`PUBLIC_KEY_SPKI_BASE64=${spki}`);
