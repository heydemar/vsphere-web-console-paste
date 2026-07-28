(function initializeConsoleInput(global) {
  const SHIFT = 16;
  const CTRL = 17;
  const ALT = 18;

  // WebMKS converts sendInputString() through the detected browser layout, but
  // loses modifiers for several German punctuation keys. Send those keys as
  // explicit German keyboard combinations instead.
  const GERMAN_KEY_CODES = new Map([
    ["!", [[SHIFT, 49]]],
    ['"', [[SHIFT, 50]]],
    ["§", [[SHIFT, 51]]],
    ["$", [[SHIFT, 52]]],
    ["%", [[SHIFT, 53]]],
    ["&", [[SHIFT, 54]]],
    ["/", [[SHIFT, 55]]],
    ["(", [[SHIFT, 56]]],
    [")", [[SHIFT, 57]]],
    ["=", [[SHIFT, 48]]],
    ["?", [[SHIFT, 189]]],
    ["\\", [[CTRL, ALT, 189]]],
    ["{", [[CTRL, ALT, 55]]],
    ["[", [[CTRL, ALT, 56]]],
    ["]", [[CTRL, ALT, 57]]],
    ["}", [[CTRL, ALT, 48]]],
    ["@", [[CTRL, ALT, 81]]],
    ["€", [[CTRL, ALT, 69]]],
    ["~", [[CTRL, ALT, 221]]],
    ["+", [[221]]],
    ["*", [[SHIFT, 221]]],
    ["#", [[220]]],
    ["'", [[SHIFT, 220]]],
    ["<", [[226]]],
    [">", [[SHIFT, 226]]],
    ["|", [[CTRL, ALT, 226]]],
    [",", [[188]]],
    [";", [[SHIFT, 188]]],
    [".", [[190]]],
    [":", [[SHIFT, 190]]],
    ["-", [[191]]],
    ["_", [[SHIFT, 191]]],
    // These are dead keys on a German layout. Space commits the literal mark.
    ["`", [[SHIFT, 187], [32]]],
    ["´", [[187], [32]]],
    ["^", [[192], [32]]],
    ["°", [[SHIFT, 192]]]
  ]);

  function buildOperations(input, keyboardLayout = "de") {
    if (keyboardLayout !== "de") {
      return [{ type: "text", value: String(input) }];
    }

    const operations = [];
    let directText = "";

    const flushDirectText = () => {
      if (!directText) return;
      operations.push({ type: "text", value: directText });
      directText = "";
    };

    for (const character of String(input)) {
      const combinations = GERMAN_KEY_CODES.get(character);
      if (!combinations) {
        directText += character;
        continue;
      }

      flushDirectText();
      for (const keyCodes of combinations) {
        operations.push({ type: "keys", keyCodes });
      }
    }

    flushDirectText();
    return operations;
  }

  global.ConsoleInput = Object.freeze({ buildOperations });
})(globalThis);
