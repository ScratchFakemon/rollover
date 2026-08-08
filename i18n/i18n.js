window.i18n = class {
  constructor(localStorageKey = "") {
    this.availableLocales = ["en-US"];
    this.localStorageKey = localStorageKey;
    this.locale = null;
    this.i18n = null;
    this.listeners = [];
    this.changeLocale(localStorage.getItem(this.localStorageKey) ?? "en-US");
  }

  // Locale
  async changeLocale(newLocale = "en-US") {
    if (!this.availableLocales.includes(newLocale)) return;

    let response = await fetch(`i18n/${newLocale}.json`);
    this.i18n = await response.json();
    this.locale = newLocale;
    localStorage.setItem(this.localStorageKey, newLocale);

    this._fire("LOCALE_CHANGED", newLocale);
  }

  translate(translationKey = "", namespace = "strings", defaultValue = "") {
    let namespaceObject = this.i18n[namespace] ?? {};

    return namespaceObject[translationKey] ?? (defaultValue || translationKey);
  }

  // Event listeners
  _fire(event, ...data) {
    this.listeners.forEach(listener => {
      if (listener.event != event) return;

      listener.callback(...data);
    });
  }

  on(event, callback) {
    return this.addListener(event, callback);
  }

  addListener(event, callback) {
    let id = window.crypto.randomUUID();
    this.listeners.push({ event, callback, id });

    return id;
  }

  removeListener(id) {
    let idx = this.listeners.findIndex(el => el.id === id);
    if (idx < 0) return;

    delete this.listeners[idx];
  }
};
