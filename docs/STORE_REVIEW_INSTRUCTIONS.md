# Chrome Web Store review instructions

## Supported test page

The extension is designed for a separate VMware vSphere 8 HTML5 console window:

`https://<vcenter-host>/ui/webconsole.html?...`

A working vSphere console is required to exercise the final transfer because
WebMKS is provided by vCenter.

## Public reviewer demo

After GitHub Pages is enabled for this repository, open:

`https://heydemar.github.io/vsphere-web-console-paste/ui/webconsole.html`

The page simulates only WebMKS's documented `sendInputString()` method and is
not connected to a VM.

1. Open the reviewer demo.
2. Open the extension popup.
3. Enter `Hello!`.
4. Select **In VM eingeben**.
5. Confirm that the text appears after the demo prompt.
6. Enter 7 characters and confirm that Free prevents the transfer.

## Review with vSphere

1. Open a VM in a separate vSphere 8 web console.
2. Open the extension.
3. Enter `Hello!`.
4. Select **In VM eingeben**.
5. Confirm that the text appears in the VM console.
6. Enter 7 characters and confirm that Free prevents the transfer.

## Security notes

- There is no `debugger` permission.
- There are no host permissions and no `<all_urls>` access.
- `activeTab` grants access only after the user clicks the extension.
- The code invokes WebMKS's `sendInputString()` method in the active page.
- There are no network requests, analytics, ads, or remotely hosted code.
- License verification is offline and uses Ed25519 signatures.
