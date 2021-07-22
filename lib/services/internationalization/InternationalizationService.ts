import i18next from "i18next";
import I18nLanguageDetector from "i18next-browser-languagedetector";
import I18nHttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { ILogger } from "../logger/makeLogger";

export const PossibleLanguages = [
  "en",
  "es",
  "eo",
  "pt-BR",
  "fr",
  "gl",
  "ru",
  "de",
  "it",
  "pl",
  "dev",
] as const;

export type IPossibleLanguages = typeof PossibleLanguages[number];

export const PossibleLanguagesNames: Record<IPossibleLanguages, string> = {
  "en": "English",
  "es": "Español",
  "eo": "Esperanto",
  "pt-BR": "Português Brasileiro",
  "fr": "Français",
  "gl": "Galego",
  "ru": "Русский",
  "de": "Deutsch",
  "it": "Italiano",
  "pl": "Polski",
  "dev": "Development",
};

export async function InternationalizationService(logger: ILogger) {
  const i18n = i18next;

  await i18n
    .use(I18nLanguageDetector)
    .use(initReactI18next)
    .use(I18nHttpApi)
    .init({
      supportedLngs: [...PossibleLanguages],
      fallbackLng: "en",
      debug: false,
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
    });
  logger.setTag("language", i18n.language);
  logger.info(`I18n:onDetect:${i18n.language}`, {
    // tags: { language: i18n.language, languages: i18n.languages },
  });
}
