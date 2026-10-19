export const localeCodes = ["es", "en", "eu"] as const;

export type Locale = (typeof localeCodes)[number];

export const defaultLocale = localeCodes[0];

export const localeMetadata: Record<Locale, { sitemap: string }> = {
    en: { sitemap: "en-US" },
    es: { sitemap: "es-ES" },
    eu: { sitemap: "eu-ES" },
};

const localePrefixPattern = new RegExp(`^/(${localeCodes.join("|")})(?=/|$)`);

export const stripLocalePrefix = (pathname: string): string =>
    pathname.replace(localePrefixPattern, "");
