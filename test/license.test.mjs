import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, sign, webcrypto } from "node:crypto";
import { resolve } from "node:path";
import { runInContext, createContext } from "node:vm";
import test from "node:test";

const values = {};
const managedValues = {};
const { publicKey: testPublicKey, privateKey: testPrivateKey } =
  generateKeyPairSync("ed25519");
const chrome = {
  storage: {
    local: {
      async get(key) {
        return { [key]: values[key] };
      },
      async set(update) {
        Object.assign(values, update);
      },
      async remove(key) {
        delete values[key];
      }
    },
    managed: {
      async get(key) {
        return { [key]: managedValues[key] };
      }
    }
  }
};

const context = createContext({
  __CONSOLE_PASTE_TEST_PUBLIC_KEY__: testPublicKey
    .export({ type: "spki", format: "der" })
    .toString("base64"),
  atob,
  chrome,
  crypto: webcrypto,
  TextDecoder,
  TextEncoder
});
runInContext(readFileSync(resolve("license.js"), "utf8"), context);
const licensing = context.Licensing;

function createLicense(plan, licenseId, expiresAt) {
  const payload = {
    version: 1,
    plan,
    licenseId,
    ...(expiresAt ? { expiresAt } : {})
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(null, Buffer.from(encoded), testPrivateKey).toString("base64url")}`;
}

test("defaults to the free plan", async () => {
  assert.equal((await licensing.getEntitlement()).plan, "free");
});

test("activates a signed pro license", async () => {
  const entitlement = await licensing.activate(createLicense("pro", "TEST-PRO-1"));
  assert.equal(entitlement.plan, "pro");
  assert.equal((await licensing.getEntitlement()).licenseId, "TEST-PRO-1");
});

test("rejects a modified license", async () => {
  const license = createLicense("enterprise", "TEST-ENT-1");
  await assert.rejects(() => licensing.activate(`${license}x`), /Signatur/);
});

test("rejects an expired license", async () => {
  const expired = createLicense("pro", "TEST-OLD-1", "2020-01-01T00:00:00Z");
  await assert.rejects(() => licensing.activate(expired), /abgelaufen/);
});

test("prefers an enterprise policy license", async () => {
  managedValues.enterpriseLicenseKey = createLicense("enterprise", "TEST-ENT-2");
  const entitlement = await licensing.getEntitlement();
  assert.equal(entitlement.plan, "enterprise");
  assert.equal(entitlement.source, "enterprise-policy");
});
