const textInput = document.querySelector("#text");
const pasteButton = document.querySelector("#paste");
const clipboardButton = document.querySelector("#clipboard");
const targetLabel = document.querySelector("#target");
const statusLabel = document.querySelector("#status");
const layoutSelect = document.querySelector("#layout");
const delaySelect = document.querySelector("#delay");

let activeTab;

function isConsoleUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.pathname === "/ui/webconsole.html";
  } catch {
    return false;
  }
}

function setStatus(message, isError = false) {
  statusLabel.textContent = message;
  statusLabel.classList.toggle("error", isError);
}

async function readClipboard() {
  try {
    textInput.value = await navigator.clipboard.readText();
    setStatus(textInput.value ? "Zwischenablage übernommen." : "Die Zwischenablage ist leer.");
    textInput.focus();
  } catch {
    setStatus("Chrome hat den Zugriff auf die Zwischenablage verweigert.", true);
  }
}

async function initialize() {
  [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const valid = activeTab && isConsoleUrl(activeTab.url);
  pasteButton.disabled = !valid;
  targetLabel.textContent = valid
    ? new URL(activeTab.url).hostname
    : "Kein vSphere-Webkonsolenfenster aktiv";

  const saved = await chrome.storage.local.get(["layout", "delay"]);
  if (saved.layout) layoutSelect.value = saved.layout;
  if (saved.delay) delaySelect.value = String(saved.delay);

  await readClipboard();
}

clipboardButton.addEventListener("click", readClipboard);

pasteButton.addEventListener("click", async () => {
  if (!textInput.value) {
    setStatus("Bitte zuerst Text eingeben.", true);
    return;
  }

  pasteButton.disabled = true;
  setStatus("Eingabe läuft – Konsolenfenster nicht bedienen …");

  const layout = layoutSelect.value;
  const delay = Number(delaySelect.value);
  await chrome.storage.local.set({ layout, delay });

  try {
    const response = await chrome.runtime.sendMessage({
      type: "TYPE_IN_CONSOLE",
      tabId: activeTab.id,
      text: textInput.value.replace(/\r\n/g, "\n"),
      layout,
      delay
    });

    if (!response?.ok) throw new Error(response?.error || "Unbekannter Fehler");
    setStatus(`${response.count} Zeichen übertragen.`);
    textInput.value = "";
  } catch (error) {
    setStatus(`Fehler: ${error.message}`, true);
  } finally {
    pasteButton.disabled = false;
  }
});

initialize().catch((error) => setStatus(`Fehler: ${error.message}`, true));
