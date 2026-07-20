# Privacy Policy — Console Paste for vSphere

Last updated: July 20, 2026

Console Paste for vSphere processes the text that a user explicitly chooses to
read from the local clipboard and send to an active VMware vSphere HTML5 web
console.

## Data processing

- Clipboard text is read only after the user explicitly selects the
  **Zwischenablage lesen** button and is processed locally in the Chrome
  extension.
- Clipboard text is not stored after the extension popup closes.
- Clipboard text is not transmitted to the developer or any third party.
- The extension does not use analytics, advertising, tracking, cookies, or
  telemetry.
- The extension does not collect browsing history.
- The active page URL is checked locally only to confirm that the user opened
  an HTTPS page with the `/ui/webconsole.html` path.

## Local storage

The extension can store a signed Pro license locally in Chrome storage. The
license contains a plan name, a license identifier, an issue date, and
optionally an expiration date. It does not need to contain a name, email
address, clipboard content, vCenter address, VM name, VM identifier, or
authentication information.

Enterprise administrators can distribute the same type of signed license
through Chrome managed storage. License verification is performed locally
using a public cryptographic key.

## Data sharing and sale

The extension does not send, share, or sell user data. User data is not used
for advertising, creditworthiness, or any purpose unrelated to typing
user-reviewed text into the active vSphere web console.

## Permissions

- `activeTab`: limits page access to the tab on which the user invokes the
  extension.
- `clipboardRead`: reads text only after the user clicks the clipboard button.
- `scripting`: invokes the WebMKS input method in the active console page after
  the user confirms the text.
- `storage`: stores the optional signed license and supports enterprise-managed
  license distribution.

## Security

Text is passed only to the HTTPS vSphere console selected by the user. Users
should review text before sending it because line breaks are interpreted as
Enter and can execute commands inside a virtual machine.

## Changes

Material changes to these practices will be documented here and disclosed in
the Chrome Web Store listing before they take effect.

## Contact

Privacy, support, and license requests can be sent to:

info@heyder-net.de

Requests can also be opened at:
https://github.com/heydemar/vsphere-web-console-paste/issues

The use of information received from Chrome APIs adheres to the Chrome Web
Store User Data Policy, including the Limited Use requirements.
