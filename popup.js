const FREE_CHARACTER_LIMIT = 6;

const elements = {
  text: document.querySelector("#text"),
  paste: document.querySelector("#paste"),
  clipboard: document.querySelector("#clipboard"),
  target: document.querySelector("#target"),
  status: document.querySelector("#status"),
  counter: document.querySelector("#counter"),
  keyboardLayout: document.querySelector("#keyboard-layout"),
  plan: document.querySelector("#plan"),
  licensePanel: document.querySelector("#license-panel"),
  licenseKey: document.querySelector("#license-key"),
  activate: document.querySelector("#activate"),
  deactivate: document.querySelector("#deactivate")
};

let activeTab;
let entitlement = { plan: "free" };
let validConsole = false;
let busy = false;

function characterCount(value) {
  return [...value].length;
}

function isConsoleUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname === "/ui/webconsole.html";
  } catch {
    return false;
  }
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function render() {
  const count = characterCount(elements.text.value);
  const isFree = entitlement.plan === "free";
  const overLimit = isFree && count > FREE_CHARACTER_LIMIT;

  elements.plan.textContent = entitlement.plan.toUpperCase();
  elements.plan.dataset.plan = entitlement.plan;
  elements.counter.textContent = isFree ? `${count} / ${FREE_CHARACTER_LIMIT}` : `${count} · unbegrenzt`;
  elements.counter.classList.toggle("over-limit", overLimit);
  elements.paste.disabled = busy || !validConsole || count === 0 || overLimit;
  elements.deactivate.hidden = isFree || entitlement.source === "enterprise-policy";

  if (overLimit) {
    setStatus(`Free erlaubt ${FREE_CHARACTER_LIMIT} Zeichen pro Übertragung.`, true);
  } else if (elements.status.textContent.startsWith("Free erlaubt")) {
    setStatus("");
  }
}

async function refreshEntitlement() {
  const response = await chrome.runtime.sendMessage({ type: "GET_ENTITLEMENT" });
  if (!response?.ok) throw new Error(response?.error || "Lizenzstatus nicht verfügbar.");
  entitlement = response.entitlement;
  render();
}

async function readClipboard() {
  try {
    elements.text.value = await navigator.clipboard.readText();
    setStatus(elements.text.value ? "Zwischenablage übernommen." : "Die Zwischenablage ist leer.");
    elements.text.focus();
    render();
  } catch {
    setStatus("Chrome hat den Zugriff auf die Zwischenablage verweigert.", true);
  }
}

async function initialize() {
  [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  validConsole = Boolean(activeTab && isConsoleUrl(activeTab.url));
  elements.target.textContent = validConsole
    ? new URL(activeTab.url).hostname
    : "Kein vSphere-Webkonsolenfenster aktiv";

  const { keyboardLayout = "de-DE" } = await chrome.storage.local.get("keyboardLayout");
  elements.keyboardLayout.value = keyboardLayout;
  await refreshEntitlement();
  elements.text.focus();
}

elements.text.addEventListener("input", render);
elements.clipboard.addEventListener("click", readClipboard);
elements.keyboardLayout.addEventListener("change", () => {
  chrome.storage.local.set({ keyboardLayout: elements.keyboardLayout.value });
});

elements.paste.addEventListener("click", async () => {
  busy = true;
  render();
  setStatus("Text wird direkt an WebMKS übergeben …");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "TYPE_IN_CONSOLE",
      tabId: activeTab.id,
      text: elements.text.value,
      keyboardLayout: elements.keyboardLayout.value
    });
    if (!response?.ok) throw new Error(response?.error || "Unbekannter Fehler");

    setStatus(`${response.count} Zeichen übertragen · ${response.plan.toUpperCase()}`);
    elements.text.value = "";
  } catch (error) {
    setStatus(`Fehler: ${error.message}`, true);
  } finally {
    busy = false;
    render();
  }
});

elements.activate.addEventListener("click", async () => {
  const licenseKey = elements.licenseKey.value.trim();
  if (!licenseKey) {
    setStatus("Bitte einen Lizenzcode eingeben.", true);
    return;
  }

  elements.activate.disabled = true;
  try {
    const response = await chrome.runtime.sendMessage({
      type: "ACTIVATE_LICENSE",
      licenseKey
    });
    if (!response?.ok) throw new Error(response?.error || "Aktivierung fehlgeschlagen.");

    entitlement = response.entitlement;
    elements.licenseKey.value = "";
    elements.licensePanel.open = false;
    setStatus(`${entitlement.plan.toUpperCase()} wurde aktiviert.`);
    render();
  } catch (error) {
    setStatus(`Lizenzfehler: ${error.message}`, true);
  } finally {
    elements.activate.disabled = false;
  }
});

elements.deactivate.addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({ type: "DEACTIVATE_LICENSE" });
  if (!response?.ok) {
    setStatus(response?.error || "Lizenz konnte nicht entfernt werden.", true);
    return;
  }
  entitlement = response.entitlement;
  setStatus("Die lokale Lizenz wurde entfernt.");
  render();
});

initialize().catch((error) => setStatus(`Fehler: ${error.message}`, true));
