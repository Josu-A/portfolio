import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { rename, rmdir } from "node:fs/promises";

import { defaultLocale, localeCodes, localeMetadata } from "./src/i18n/config";

export default defineConfig({
    fonts: [
        {
            cssVariable: "--font-ibm-plex-sans",
            fallbacks: ["sans-serif"],
            name: "IBM Plex Sans",
            provider: fontProviders.fontsource(),
            styles: ["normal"],
            subsets: ["latin"],
            weights: [400, 500, 700],
        },
        {
            cssVariable: "--font-fraunces",
            fallbacks: ["serif"],
            name: "Fraunces",
            provider: fontProviders.fontsource(),
            styles: ["normal"],
            subsets: ["latin"],
            weights: [400],
        },
        {
            cssVariable: "--font-noto-sans-mono",
            fallbacks: ["monospace"],
            name: "Noto Sans Mono",
            provider: fontProviders.fontsource(),
            styles: ["normal"],
            subsets: ["latin"],
            weights: [400],
        },
    ],
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
        {
            // Cloudflare serves the nearest 404.html, but Astro emits
            // nested 404 pages as <locale>/404/index.html.
            hooks: {
                "astro:build:done": async ({ dir }) => {
                    await Promise.all(
                        localeCodes.map(async (locale) => {
                            const pageDir = new URL(`${locale}/404/`, dir);
                            await rename(
                                new URL("index.html", pageDir),
                                new URL(`${locale}/404.html`, dir),
                            );
                            await rmdir(pageDir);
                        }),
                    );
                },
            },
            name: "localized-404-pages",
        },
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
