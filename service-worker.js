const DEBUGGER_VERSION = "1.3";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function sendDirectly(tabId, text) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [text],
    func: (input) => {
      const isClient = (value) =>
        value &&
        typeof value === "object" &&
        typeof value.sendInputString === "function";

      const candidates = [];
      const addCandidate = (value) => {
        if (isClient(value) && !candidates.includes(value)) candidates.push(value);
      };

      // vCenter builds have exposed the active client under different names.
      for (const name of ["wmks", "webmks", "wmksInstance", "webMks"]) {
        try {
          addCandidate(window[name]);
        } catch {
          // Ignore protected or lazy global properties.
        }
      }

      // WebMKS SDK integrations commonly keep the instance in jQuery data.
      try {
        if (window.jQuery) {
          for (const element of document.querySelectorAll("canvas, [id*='wmks' i], [class*='wmks' i]")) {
            const data = window.jQuery(element).data();
            addCandidate(data);
            if (data && typeof data === "object") {
              for (const value of Object.values(data)) addCandidate(value);
            }
          }
        }
      } catch {
        // Continue with a shallow global scan.
      }

      // Last resort for minified vCenter builds that use a generated global name.
      for (const name of Object.getOwnPropertyNames(window)) {
        if (candidates.length) break;
        try {
          const value = window[name];
          addCandidate(value);
          if (
            value &&
            typeof value === "object" &&
            /wmks|console/i.test(name)
          ) {
            for (const nested of Object.values(value)) addCandidate(nested);
          }
        } catch {
          // Some Window properties throw when read across security boundaries.
        }
      }

      if (!candidates.length) {
        return { ok: false, reason: "WebMKS-Instanz nicht direkt erreichbar." };
      }

      candidates[0].sendInputString(input);
      return { ok: true };
    }
  });

  return result?.ok === true;
}

const digitCodes = {
  "0": ["Digit0", 48], "1": ["Digit1", 49], "2": ["Digit2", 50],
  "3": ["Digit3", 51], "4": ["Digit4", 52], "5": ["Digit5", 53],
  "6": ["Digit6", 54], "7": ["Digit7", 55], "8": ["Digit8", 56],
  "9": ["Digit9", 57]
};

const punctuation = {
  us: {
    " ": ["Space", 32], "-": ["Minus", 189], "_": ["Minus", 189, 8],
    "=": ["Equal", 187], "+": ["Equal", 187, 8], "[": ["BracketLeft", 219],
    "{": ["BracketLeft", 219, 8], "]": ["BracketRight", 221],
    "}": ["BracketRight", 221, 8], "\\": ["Backslash", 220],
    "|": ["Backslash", 220, 8], ";": ["Semicolon", 186], ":": ["Semicolon", 186, 8],
    "'": ["Quote", 222], "\"": ["Quote", 222, 8], ",": ["Comma", 188],
    "<": ["Comma", 188, 8], ".": ["Period", 190], ">": ["Period", 190, 8],
    "/": ["Slash", 191], "?": ["Slash", 191, 8], "`": ["Backquote", 192],
    "~": ["Backquote", 192, 8], "!": ["Digit1", 49, 8], "@": ["Digit2", 50, 8],
    "#": ["Digit3", 51, 8], "$": ["Digit4", 52, 8], "%": ["Digit5", 53, 8],
    "^": ["Digit6", 54, 8], "&": ["Digit7", 55, 8], "*": ["Digit8", 56, 8],
    "(": ["Digit9", 57, 8], ")": ["Digit0", 48, 8]
  },
  de: {
    " ": ["Space", 32], "-": ["Slash", 191], "_": ["Slash", 191, 8],
    "=": ["Digit0", 48, 8], "+": ["BracketRight", 221], "*": ["BracketRight", 221, 8],
    "#": ["Backslash", 220], "'": ["Backslash", 220, 8], ",": ["Comma", 188],
    ";": ["Comma", 188, 8], ".": ["Period", 190], ":": ["Period", 190, 8],
    "<": ["IntlBackslash", 226], ">": ["IntlBackslash", 226, 8],
    "!": ["Digit1", 49, 8], "\"": ["Digit2", 50, 8], "§": ["Digit3", 51, 8],
    "$": ["Digit4", 52, 8], "%": ["Digit5", 53, 8], "&": ["Digit6", 54, 8],
    "/": ["Digit7", 55, 8], "(": ["Digit8", 56, 8], ")": ["Digit9", 57, 8],
    "?": ["Minus", 189, 8], "ß": ["Minus", 189], "´": ["Equal", 187],
    "`": ["Equal", 187, 8], "ü": ["BracketLeft", 219], "Ü": ["BracketLeft", 219, 8],
    "ö": ["Semicolon", 186], "Ö": ["Semicolon", 186, 8],
    "ä": ["Quote", 222], "Ä": ["Quote", 222, 8],
    "@": ["KeyQ", 81, 3], "€": ["KeyE", 69, 3], "{": ["Digit7", 55, 3],
    "[": ["Digit8", 56, 3], "]": ["Digit9", 57, 3], "}": ["Digit0", 48, 3],
    "\\": ["Minus", 189, 3], "|": ["IntlBackslash", 226, 3],
    "~": ["BracketRight", 221, 3], "^": ["Backquote", 192]
  }
};

function keyForCharacter(character, layout) {
  if (character === "\n") return { key: "Enter", code: "Enter", vk: 13, modifiers: 0 };
  if (character === "\t") return { key: "Tab", code: "Tab", vk: 9, modifiers: 0 };

  if (/^[a-zA-Z]$/.test(character)) {
    const upper = character.toUpperCase();
    const physical = layout === "de" && (upper === "Y" || upper === "Z")
      ? (upper === "Y" ? "Z" : "Y")
      : upper;
    return {
      key: character,
      code: `Key${physical}`,
      vk: physical.charCodeAt(0),
      modifiers: character === upper ? 8 : 0
    };
  }

  if (digitCodes[character]) {
    const [code, vk] = digitCodes[character];
    return { key: character, code, vk, modifiers: 0 };
  }

  const mapping = punctuation[layout][character];
  if (!mapping) throw new Error(`Zeichen wird im Layout „${layout}“ nicht unterstützt: ${character}`);
  return { key: character, code: mapping[0], vk: mapping[1], modifiers: mapping[2] || 0 };
}

async function sendKey(debuggee, key) {
  const params = {
    key: key.key,
    code: key.code,
    windowsVirtualKeyCode: key.vk,
    nativeVirtualKeyCode: key.vk,
    modifiers: key.modifiers
  };
  await chrome.debugger.sendCommand(debuggee, "Input.dispatchKeyEvent", {
    ...params,
    type: "keyDown"
  });
  await chrome.debugger.sendCommand(debuggee, "Input.dispatchKeyEvent", {
    ...params,
    type: "keyUp"
  });
}

async function focusConsole(tabId) {
  const [{ result: point }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const candidates = [...document.querySelectorAll("canvas")].filter((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return rect.width > 200 && rect.height > 150;
      });
      const canvas = candidates.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  });

  if (!point) throw new Error("WebMKS-Konsolenfläche wurde nicht gefunden.");
  const debuggee = { tabId };
  await chrome.debugger.sendCommand(debuggee, "Input.dispatchMouseEvent", {
    type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1
  });
  await chrome.debugger.sendCommand(debuggee, "Input.dispatchMouseEvent", {
    type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "TYPE_IN_CONSOLE") return false;

  (async () => {
    const tab = await chrome.tabs.get(message.tabId);
    const url = new URL(tab.url);
    if (url.protocol !== "https:" || url.pathname !== "/ui/webconsole.html") {
      throw new Error("Der aktive Tab ist keine vSphere-Webkonsole.");
    }

    const debuggee = { tabId: message.tabId };
    let attached = false;
    try {
      if (await sendDirectly(message.tabId, message.text)) {
        return {
          ok: true,
          count: [...message.text].length,
          mode: "direct"
        };
      }

      await chrome.debugger.attach(debuggee, DEBUGGER_VERSION);
      attached = true;
      await focusConsole(message.tabId);
      await sleep(100);

      for (const character of message.text) {
        await sendKey(debuggee, keyForCharacter(character, message.layout));
        await sleep(message.delay);
      }
      return {
        ok: true,
        count: [...message.text].length,
        mode: "compatibility"
      };
    } finally {
      if (attached) await chrome.debugger.detach(debuggee).catch(() => {});
    }
  })()
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
