import type { ImageMetadata } from "astro";

const imageFiles = import.meta.glob<ImageMetadata>(
    "../images/projects/*.{jpg,jpeg,png,webp,avif}",
    {
        eager: true,
        import: "default",
    },
);

export const projectImages = Object.entries(imageFiles).reduce<
    Record<string, ImageMetadata>
>((images, [filePath, image]) => {
    const fileName = filePath.split("/").pop();

    if (!fileName) {
        throw new Error(`Invalid project image path: ${filePath}`);
    }

    const imageKey = fileName.replace(/\.[^.]+$/, "");

    if (images[imageKey]) {
        throw new Error(`Duplicate project image key: ${imageKey}`);
    }

    images[imageKey] = image;

    return images;
}, {});
