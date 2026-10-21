import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { rename, rmdir } from "node:fs/promises";

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
