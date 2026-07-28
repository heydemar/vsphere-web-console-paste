importScripts("license.js", "input.js");

const FREE_CHARACTER_LIMIT = 6;

function isConsoleUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname === "/ui/webconsole.html";
  } catch {
    return false;
  }
}

async function sendDirectly(tabId, text) {
  const operations = ConsoleInput.buildOperations(text);
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [operations],
    func: (inputOperations) => {
      const isClient = (value) =>
        value &&
        typeof value === "object" &&
        typeof value.sendInputString === "function";

      const candidates = [];
      const add = (value) => {
        if (isClient(value) && !candidates.includes(value)) candidates.push(value);
      };

      for (const name of ["wmks", "webmks", "wmksInstance", "webMks"]) {
        try {
          add(window[name]);
        } catch {
          // Ignore protected or lazy globals.
        }
      }

      try {
        if (window.jQuery) {
          const elements = document.querySelectorAll(
            "canvas, [id*='wmks' i], [class*='wmks' i], [id*='console' i]"
          );
          for (const element of elements) {
            const data = window.jQuery(element).data();
            add(data);
            if (data && typeof data === "object") {
              for (const value of Object.values(data)) add(value);
            }
          }
        }
      } catch {
        // A direct global may still be available.
      }

      for (const name of Object.getOwnPropertyNames(window)) {
        if (candidates.length) break;
        if (!/wmks|console/i.test(name)) continue;
        try {
          const value = window[name];
          add(value);
          if (value && typeof value === "object") {
            for (const nested of Object.values(value)) add(nested);
          }
        } catch {
          // Cross-origin and lazy properties can throw.
        }
      }

      if (!candidates.length) {
        return {
          ok: false,
          error: "Diese vCenter-Ausgabe stellt den WebMKS-Direktkanal nicht bereit."
        };
      }

      try {
        const client = candidates[0];
        for (const operation of inputOperations) {
          if (operation.type === "unicode" && typeof client.sendKeyCodes === "function") {
            client.sendKeyCodes([-operation.codePoint]);
          } else if (operation.type === "unicode") {
            client.sendInputString(String.fromCodePoint(operation.codePoint));
          } else {
            client.sendInputString(operation.value);
          }
        }
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "WebMKS hat die Texteingabe abgelehnt."
        };
      }
    }
  });

  return result || { ok: false, error: "WebMKS hat kein Ergebnis zurückgegeben." };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.type === "GET_ENTITLEMENT") {
      return { ok: true, entitlement: await Licensing.getEntitlement() };
    }

    if (message.type === "ACTIVATE_LICENSE") {
      const entitlement = await Licensing.activate(message.licenseKey);
      return { ok: true, entitlement };
    }

    if (message.type === "DEACTIVATE_LICENSE") {
      await Licensing.deactivate();
      return { ok: true, entitlement: await Licensing.getEntitlement() };
    }

    if (message.type !== "TYPE_IN_CONSOLE") return undefined;

    const tab = await chrome.tabs.get(message.tabId);
    if (!isConsoleUrl(tab.url)) {
      throw new Error("Der aktive Tab ist keine vSphere-Webkonsole.");
    }

    const text = String(message.text || "").replace(/\r\n/g, "\n");
    if (!text) throw new Error("Es wurde kein Text übergeben.");

    const entitlement = await Licensing.getEntitlement();
    if (entitlement.plan === "free" && [...text].length > FREE_CHARACTER_LIMIT) {
      throw new Error(`Free unterstützt maximal ${FREE_CHARACTER_LIMIT} Zeichen pro Übertragung.`);
    }

    const result = await sendDirectly(message.tabId, text);
    if (!result.ok) throw new Error(result.error);

    return {
      ok: true,
      count: [...text].length,
      mode: "direct",
      plan: entitlement.plan
    };
  })()
    .then((result) => sendResponse(result))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
