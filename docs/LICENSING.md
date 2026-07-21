# Licensing operations

Free allows 6 Unicode characters per transfer. Pro and Enterprise remove that
limit after an Ed25519-signed license is activated.

## Private key

The private key is stored locally at:

`.secrets/license-private.pem`

It is intentionally excluded from Git. Back it up in an encrypted password
manager or secrets vault. Losing it means that new licenses cannot be issued
for extension builds containing the corresponding public key. Publishing it
would allow anyone to create valid licenses.

## Create a license

```bash
node scripts/create-license.mjs pro PRO-000001
node scripts/create-license.mjs enterprise ENT-000001 2027-12-31T23:59:59Z
```

The resulting one-line token can be pasted into the extension. The optional
date is an ISO expiration date.

## Enterprise deployment

Administrators can provide the signed token through the managed storage
property:

`enterpriseLicenseKey`

The browser validates the signature locally and gives managed licenses priority
over locally activated Pro licenses.

## Payment provider

No payment provider is connected yet. Pricing, checkout, invoicing, refunds,
tax handling, automated license issuance, revocation, and customer identity
must be decided before licenses are sold.

The current offline token is suitable for pilots and manually issued licenses.
License requests are directed to `info@heyder-net.de`.
At larger scale, add a minimal HTTPS licensing service that returns signed
tokens. Clipboard text, console URLs, VM data, and credentials must never be
sent to that service.
