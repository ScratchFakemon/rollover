window.onload = async () => {
  const inputTypes = {};
  inputTypes[window.ConfigTypes.Boolean] = "checkbox";
  inputTypes[window.ConfigTypes.Number] = "number";
  inputTypes[window.ConfigTypes.Color] = "color";

  const Interpreter = new window.Rollover();
  const Translation = new window.i18n(`${location.host}/i18n-locale`);

  let inputArea = document.getElementById("inputArea");
  let notices = document.getElementById("notices");
  let samples = document.getElementById("samples");
  let configOptions = document.getElementById("configurationOptions");
  let languageSelector = document.getElementById("languageSelector");
  let stringToRolloverInput = document.getElementById("stringToRollover");
  let stringToRolloverResult = document.getElementById("stringToRolloverResult");

  const yesNo = value => {
    switch (value) {
      case "yes":
      case "true":
      case "on":
      case "1":
      case 1:
        return true;
      case "no":
      case "false":
      case "off":
      case "0":
      case 0:
        return false;
      default:
        return value;
    }
  }

  const parsable = (value, type) => {
    switch (type) {
      case (window.ConfigTypes.Boolean):
      case (window.ConfigTypes.String):
        return true;
      case (window.ConfigTypes.Number):
        return !Number.isNaN(Number(value));
      case (window.ConfigTypes.Color):
        return true;
        //return value.startsWith("rgb") || value.startsWith("#");
      case (window.ConfigTypes.Array):
      case (window.ConfigTypes.Object):
        try {
          let parse = JSON.parse(value);
          return yesNo(Array.isArray(parse) ^ type == window.ConfigTypes.Object);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  const parseInput = (value, type) => {
    switch (type) {
      case (window.ConfigTypes.Boolean):
        return yesNo(value);
      case (window.ConfigTypes.String):
        return value.toString();
      case (window.ConfigTypes.Number):
        return Number(value);
      case (window.ConfigTypes.Color):
        return value;
      case (window.ConfigTypes.Array):
      case (window.ConfigTypes.Object):
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      default:
        return null;
    }
  }

  const formatText = (text = "", ...data) => {
    let result = "";
    let index = -1;
    let token = "";

    let escaped = false;
    let signaled = false;

    while (true) {
      index++;
      if (index >= text.length) break;

      let char = text.charAt(index);

      if (escaped) {
        result += char;
        continue;
      }

      if (signaled) {
        if ("0123456789".includes(char)) {
          token += char;
          continue;
        }

        result += data[Number(token) - 1] ?? "";
        result += char;

        token = "";
        signaled = false;

        continue;
      }

      switch (char) {
        case "\\":
          escaped = true;
          break;
        case "%":
          signaled = true;
          token = "";
          break;
        default:
          result += char;
          break;
      }
    }

    if (signaled || token.length > 0) {
      result += data[Number(token) - 1] ?? "";
    }

    return result;
  }

  window.Samples.forEach((sample, index) => {
    let oby = sample.originallyBy ?? [];
    let mby = sample.modifiedBy ?? [];

    let option = document.createElement("option");
    option.value = index.toString();
    option.setAttribute(
      "data-i18n",
      `Sample name (${oby.length}+${mby.length})`
    );

    option.setAttribute("data-i18n-format", JSON.stringify([
      sample.name, oby[0], oby[1], oby[2], mby[0], mby[1], mby[2]
    ]));

    samples.append(option);
  });

  window.Configuration.forEach((option, index) => {
    let div = document.createElement("div");

    let label = document.createElement("label");
    label.setAttribute("for", `configuration-option-${index}`);
    label.setAttribute("data-i18n-cfg", option.name);

    let labelDangerous = document.createElement("label");
    if (option.dangerous) {
      labelDangerous.setAttribute("for", `configuration-option-${index}`);
      labelDangerous.setAttribute("data-i18n-cfg", "(DANGEROUS)");
    }

    let sp = option.path.split(".");

    let input = document.createElement("input");
    input.setAttribute("id", `configuration-option-${index}`);
    input.setAttribute("type", inputTypes[option.type] || "string");
    input.oninput = () => {
      if (parsable(input.value, option.type)) {
        Interpreter.configuration[sp[0]][sp[1]] = parseInput(input.value, option.type);
        input.removeAttribute("invalid");
      } else {
        input.setAttribute("invalid", "");
      }
    }

    input.style.marginLeft = "0.5%";
    if ([window.ConfigTypes.Array, window.ConfigTypes.Object].includes(option.type))
      input.style.width = "40%";
    input.value = option.type == window.ConfigTypes.Boolean ?
      `o${(option.default || false) ? 'ff' : 'n'}` : option.default || "";

    let desc = document.createElement("span");
    desc.style.fontSize = "small";
    desc.setAttribute("data-i18n-cfg", option.description);

    div.append(label);
    if (option.dangerous)
      div.append(labelDangerous);
    div.append(input);
    div.append(document.createElement("br"));
    div.append(desc);
    div.append(document.createElement("br"));
    div.append(document.createElement("br"));

    configOptions.append(div);
  });

  Translation.availableLocales.forEach(async locale => {
    let json = {};

    try {
      let response = await fetch(`i18n/${locale}.json`);
      json = await response.json();
    } catch {
      return;
    }

    let option = document.createElement("option");
    option.value = locale;
    option.innerText =
      json.metadata.localeNameNative ||
      json.metadata.localeName ||
      json.metadata.languageNativeName ||
      json.metadata.languageName ||
      locale;

    languageSelector.append(option);
  })

  function updateText() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
      let translation = Translation.translate(element.getAttribute("data-i18n"));
      let format = element.getAttribute("data-i18n-format") ?? "[]";

      try {
        format = JSON.parse(format);
      } catch {
        format = [];
      }

      if (format.length) translation = formatText(translation, ...format);

      switch (element.tagName) {
        case "TEXTAREA":
          element.setAttribute("placeholder", translation);
          break;
        default:
          element.innerHTML = translation;
          break;
      }
    });

    document.querySelectorAll("[data-i18n-cfg]").forEach(element => {
      let translation = Translation.translate(element.getAttribute("data-i18n-cfg"), "configuration");

      switch (element.tagName) {
        case "INPUT":
          element.setAttribute("placeholder", translation);
          break;
        default:
          element.innerHTML = translation;
          break;
      }
    });
  }

  Translation.on("LOCALE_CHANGED", updateText);

  languageSelector.value = Translation.locale;
  languageSelector.oninput = () => {
    Translation.changeLocale(languageSelector.value);
  }

  window.updateInput = function () {
    inputArea.innerText = window.Samples[Number(samples.value)].content;
  }

  window.runFromInput = async function () {
    Interpreter.reset();
    await Interpreter.runProgram(inputArea.value);

    let finalState = Translation.translate("Final state:");

    notices.innerHTML = `${Interpreter.output.join("")}<br/><span>${finalState} ${JSON.stringify(Interpreter.cells)}</span>`;
  }

  window.stringToRollover = function () {
    stringToRolloverResult.innerText =
      Interpreter.stringToRollover(stringToRolloverInput.value.toString());
  }

  document.onkeydown = (key) => {
    if (key.key === "Enter") {
      window.runFromInput();
    }
  };
}
