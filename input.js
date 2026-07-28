(function initializeConsoleInput(global) {
  function isDirectCharacter(character) {
    return /[\p{L}\p{N}\s]/u.test(character);
  }

  function buildOperations(input) {
    const operations = [];
    let directText = "";

    const flushDirectText = () => {
      if (!directText) return;
      operations.push({ type: "text", value: directText });
      directText = "";
    };

    for (const character of String(input)) {
      if (isDirectCharacter(character)) {
        directText += character;
        continue;
      }

      flushDirectText();
      operations.push({ type: "unicode", codePoint: character.codePointAt(0) });
    }

    flushDirectText();
    return operations;
  }

  global.ConsoleInput = Object.freeze({ buildOperations });
})(globalThis);
