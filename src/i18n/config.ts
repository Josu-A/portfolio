export const localeCodes = ["es", "en", "eu"] as const;

export type Locale = (typeof localeCodes)[number];

export const defaultLocale = localeCodes[0];

export const localeMetadata: Record<
    Locale,
    { openGraph: string; sitemap: string }
> = {
    en: { openGraph: "en_US", sitemap: "en" },
    es: { openGraph: "es_ES", sitemap: "es" },
    eu: { openGraph: "eu_ES", sitemap: "eu" },
};

const localePrefixPattern = new RegExp(`^/(${localeCodes.join("|")})(?=/|$)`);

export const stripLocalePrefix = (pathname: string): string =>
    pathname.replace(localePrefixPattern, "");
