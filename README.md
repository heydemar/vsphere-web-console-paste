# vSphere Web Console Paste

Chrome extension that types clipboard text into the VMware vSphere 8 HTML5 web
console. It is intended for the separate `/ui/webconsole.html` console window.

VMware deliberately does not expose guest clipboard sharing in WebMKS. This
extension therefore converts text to keyboard events; it does not enable a
shared clipboard and cannot copy text out of a VM.

## Current status

This is an early proof of concept. Test it with non-sensitive text before using
it for administrative commands. German and US keyboard layouts are supported.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this repository folder.
5. Open a vSphere VM in a separate web console window.
6. Open the extension, check the text and select **Type into VM**.

Chrome warns about the debugger permission. The extension uses the Chrome
debugging protocol only while text is being typed into the active console tab,
then immediately detaches. No clipboard contents are stored.

## Safety

- The extension runs only after its toolbar button is clicked.
- It validates that the active page uses HTTPS and the exact
  `/ui/webconsole.html` path.
- It requests `activeTab` instead of permanent access to vCenter hosts.
- Clipboard text is kept only in the extension popup and cleared after a
  successful transfer.
- Newlines are sent as Enter and can execute commands. Review text before
  sending it.

## Limitations

- Text input only; no files or guest-to-client clipboard.
- Keyboard handling can vary with the guest OS, browser and vSphere build.
- Unsupported characters stop the transfer with an error.
- A different keyboard layout in the guest produces incorrect characters.

## License

MIT
