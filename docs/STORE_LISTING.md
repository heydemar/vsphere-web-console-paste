# Chrome Web Store listing draft

## Name

Console Paste for vSphere

## Short description

Type reviewed clipboard text into a VMware vSphere HTML5 web console.

## Detailed description

Console Paste for vSphere helps administrators enter text into a separate
vSphere HTML5 web console when normal clipboard sharing is unavailable.

The extension shows the clipboard text before anything is sent. After the user
confirms, it passes the text to the active WebMKS console using WebMKS's input
API.

Free:

- Up to 6 characters per transfer
- Local clipboard processing
- No account, analytics, advertising, or telemetry

Pro and Enterprise:

- Unlimited characters per transfer
- Offline signed license verification
- Enterprise license distribution through Chrome managed storage
- Licenses are currently issued manually on request through
  `info@heyder-net.de`

Important:

- Text input only; no file transfer and no copying out of the VM
- Line breaks are sent as Enter and may execute commands
- Intended for separate HTTPS vSphere console windows whose path is
  `/ui/webconsole.html`
- Not developed, endorsed, or supported by VMware or Broadcom

## License requests

Pro and Enterprise licenses are currently issued manually. Users can request
pricing and license terms by emailing `info@heyder-net.de`. Google is not the
seller and does not process the transaction.

## Single purpose

Send user-reviewed clipboard text as keyboard input to the active VMware
vSphere HTML5 web console.

## Permission justifications

### activeTab

Grants temporary access only to the console tab where the user opens the
extension. Permanent vCenter host access is not requested.

### clipboardRead

Reads text from the local clipboard only after the user explicitly selects the
clipboard button. The text is displayed for review and is not stored or
transmitted to the developer.

### scripting

Calls the WebMKS `sendInputString()` method inside the active console page after
the user confirms the text. It is not used on background tabs or unrelated
sites.

### storage

Stores an optional signed Pro license locally and reads an optional signed
Enterprise license from Chrome managed storage. Clipboard text, vCenter
addresses, VM identifiers, and credentials are not stored.

## Data-use declaration

The extension handles user-provided clipboard text and the active console URL
locally. It does not collect or transmit either. Select the applicable
user-provided content and website-content disclosures in the dashboard and
state that all processing remains local.

Privacy policy:
https://github.com/heydemar/vsphere-web-console-paste/blob/codex/initial-extension/docs/PRIVACY_POLICY.md

## Category

Developer Tools

## Language

German initially; an English UI should be added before worldwide distribution.
