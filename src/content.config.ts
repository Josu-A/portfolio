import { file } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

// Language-independent project data; titles and descriptions live in
// src/i18n/locales/<locale>/projects.json under items.<id>.
const projects = defineCollection({
    loader: file("src/data/projects.json"),
    schema: ({ image }) =>
        z.object({
            image: image().optional(),
            link: z.url().optional(),
            order: z.number(),
            technologies: z.string(),
        }),
});

export const collections = { projects };
