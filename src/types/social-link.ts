import type { SvgComponent } from "astro/types";

export interface SocialLinkData {
    href: string;
    icon: SvgComponent;
    label: string;
}
