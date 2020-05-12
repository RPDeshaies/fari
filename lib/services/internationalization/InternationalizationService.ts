import i18next, { i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { devTranslation } from "./locales/devTranslation";
import { enTranslation } from "./locales/enTranslation";
import { ptTranslation } from "./locales/ptTranslation";

export class InternationalizationService {
  public i18next: i18n = undefined;

  constructor() {
    this.i18next = i18next;
    this.init();
  }

  private async init() {
    await i18next.use(initReactI18next).init({
      resources: {
        en: {
          translation: enTranslation,
        },
        pt: {
          translation: ptTranslation,
        },
        dev: {
          translation: devTranslation,
        },
      },
      lng: "en",
      fallbackLng: "en",
      debug: true,
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
    });
  }
}
