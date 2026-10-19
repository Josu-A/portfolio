import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { defaultLocale, localeCodes, localeMetadata } from "./src/i18n/config";

export default defineConfig({
    i18n: {
        defaultLocale,
        locales: [...localeCodes],
        routing: {
            prefixDefaultLocale: true,
        },
    },
    integrations: [
        sitemap({
            i18n: {
                defaultLocale,
                locales: Object.fromEntries(
                    localeCodes.map((locale) => [
                        locale,
                        localeMetadata[locale].sitemap,
                    ]),
                ),
            },
        }),
        mdx(),
    ],
    prefetch: {
        defaultStrategy: "hover",
        prefetchAll: true,
    },
    site: "https://aguijos.dev",
    vite: {
        plugins: [tailwindcss()],
    },
});
