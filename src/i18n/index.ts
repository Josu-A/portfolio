import i18next, { type TFunction } from "i18next";

import { defaultLocale, type Locale, localeCodes } from "./config";

export { localeCodes, localeCodes as locales };
export { defaultLocale, stripLocalePrefix } from "./config";
export type { Locale } from "./config";

const translationFiles = import.meta.glob<Record<string, unknown>>(
    "./locales/*/*.json",
    {
        eager: true,
        import: "default",
    },
);

const isLocale = (value: string): value is Locale =>
    localeCodes.includes(value as Locale);

const resources = Object.entries(translationFiles).reduce<
    Record<Locale, Record<string, Record<string, unknown>>>
>(
    (allResources, [filePath, translation]) => {
        const match = filePath.match(/^\.\/locales\/([^/]+)\/([^/]+)\.json$/);

        if (!match) {
            throw new Error(`Invalid translation file path: ${filePath}`);
        }

        const [, locale, namespace] = match;

        if (!isLocale(locale)) {
            throw new Error(`Unsupported translation locale: ${locale}`);
        }

        if (allResources[locale][namespace]) {
            throw new Error(
                `Duplicate translation namespace: ${locale}/${namespace}`,
            );
        }

        allResources[locale][namespace] = translation;

        return allResources;
    },
    Object.fromEntries(localeCodes.map((locale) => [locale, {}])) as Record<
        Locale,
        Record<string, Record<string, unknown>>
    >,
);

const instance = i18next.createInstance();
await instance.init({
    fallbackLng: defaultLocale,
    interpolation: {
        escapeValue: false,
    },
    resources,
});

export const getTranslator = (locale: Locale, namespace: string): TFunction =>
    instance.getFixedT(locale, namespace);
