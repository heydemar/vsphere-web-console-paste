# Console Paste for vSphere

A privacy-focused Chrome extension that types reviewed clipboard text into a
VMware vSphere 8 HTML5 web console.

The extension uses WebMKS's own `sendInputString()` API. It does not enable
shared clipboard access, copy text out of a VM, transfer files, or use Chrome's
debugger permission.

## Plans

- **Free:** up to 12 Unicode characters per transfer
- **Pro:** unlimited characters with an offline signed license
- **Enterprise:** unlimited characters and managed Chrome policy deployment

Pricing and public license sales are not enabled yet.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this repository folder.
5. Open a vSphere VM in a separate web console window.
6. Open the extension, review the text and select **In VM eingeben**.

## Development

Use Node.js 20 or newer.

```bash
npm test
npm run build
```

The build command rejects the package if it contains the `debugger` permission
or `<all_urls>` access, then writes the reviewed extension files to
`dist/extension`.

## Privacy and store preparation

- [Privacy policy](docs/PRIVACY_POLICY.md)
- [Store listing draft](docs/STORE_LISTING.md)
- [Reviewer instructions](docs/STORE_REVIEW_INSTRUCTIONS.md)
- [Licensing operations](docs/LICENSING.md)

## Trademark notice

VMware and vSphere are trademarks of their respective owners. This project is
not affiliated with, endorsed by, or supported by VMware or Broadcom.

## License

MIT
