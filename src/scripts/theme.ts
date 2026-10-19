const themes = ["system", "light", "dark"] as const;
type Theme = (typeof themes)[number];

const isTheme = (value: null | string): value is Theme =>
    value !== null && themes.includes(value as Theme);

const getStoredTheme = (): Theme => {
    const storedTheme = localStorage.getItem("theme");

    return isTheme(storedTheme) ? storedTheme : "system";
};

const applyTheme = (theme: Theme = getStoredTheme()) => {
    document.documentElement.dataset.theme = theme;
};

const initializedMenus = new WeakSet<HTMLElement>();
const initializedNavigationMenus = new WeakSet<HTMLElement>();
const desktopNavigationQuery = window.matchMedia("(min-width: 40rem)");
let navigationBreakpointListenerAdded = false;

const supportsThemeMenu = () =>
    "popover" in HTMLElement.prototype &&
    CSS.supports("anchor-name: --theme-menu-button");

const setupThemeFallback = () => {
    const themeButton = document.querySelector("#theme-menu-button");
    const themeMenu = document.querySelector("#theme-menu");
    const themeSelect = document.querySelector("#theme-select");

    if (
        !(themeButton instanceof HTMLElement) ||
        !(themeMenu instanceof HTMLElement) ||
        !(themeSelect instanceof HTMLSelectElement)
    ) {
        return;
    }

    themeButton.classList.add("hidden");
    themeMenu.classList.add("hidden");
    themeSelect.classList.remove("hidden");
    themeSelect.value = getStoredTheme();
    const themeLabel = themeButton.dataset.themeLabel;

    if (!themeLabel) {
        return;
    }

    themeSelect.setAttribute("aria-label", themeLabel);
    themeSelect.addEventListener("change", () => {
        localStorage.setItem("theme", themeSelect.value);
        applyTheme();
    });
};

const setupThemeMenu = () => {
    if (!supportsThemeMenu()) {
        setupThemeFallback();
        return;
    }

    const themeButton = document.querySelector("#theme-menu-button");
    const themeMenu = document.querySelector("#theme-menu");

    if (
        !(themeButton instanceof HTMLButtonElement) ||
        !(themeMenu instanceof HTMLElement)
    ) {
        return;
    }

    const selectedTheme = getStoredTheme();
    const themeLabel = themeButton.dataset.themeLabel;
    const selectedThemeLabel = themeMenu.querySelector<HTMLElement>(
        `[data-theme-option="${selectedTheme}"]`,
    )?.dataset.themeName;

    if (!themeLabel || !selectedThemeLabel) {
        return;
    }

    themeButton.setAttribute(
        "aria-label",
        `${themeLabel}: ${selectedThemeLabel}`,
    );
    themeMenu
        .querySelectorAll<HTMLElement>("[data-theme-option]")
        .forEach((option) => {
            option.setAttribute(
                "aria-checked",
                String(
                    option.getAttribute("data-theme-option") === selectedTheme,
                ),
            );
        });
    if (!initializedMenus.has(themeMenu)) {
        initializedMenus.add(themeMenu);
        themeMenu.addEventListener("toggle", () => {
            const isOpen = themeMenu.matches(":popover-open");

            themeButton.setAttribute("aria-expanded", String(isOpen));
            if (isOpen) {
                themeMenu
                    .querySelector<HTMLElement>("[data-theme-option]")
                    ?.focus();
            }
        });
    }
    document
        .querySelectorAll<HTMLElement>("[data-theme-icon]")
        .forEach((icon) => {
            icon.classList.toggle(
                "hidden",
                icon.getAttribute("data-theme-icon") !== selectedTheme,
            );
        });
};

const setupMobileNavigation = () => {
    const navigationButton = document.querySelector("#mobile-nav-button");
    const navigationMenu = document.querySelector("#mobile-nav-menu");

    if (
        !(navigationButton instanceof HTMLButtonElement) ||
        !(navigationMenu instanceof HTMLElement) ||
        initializedNavigationMenus.has(navigationMenu)
    ) {
        return;
    }

    initializedNavigationMenus.add(navigationMenu);
    const openLabel = navigationButton.dataset.openLabel;
    const closeLabel = navigationButton.dataset.closeLabel;

    if (!openLabel || !closeLabel) {
        return;
    }
    const getFocusableElements = () =>
        Array.from(
            navigationMenu.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        );

    navigationMenu.addEventListener("toggle", () => {
        const isOpen = navigationMenu.matches(":popover-open");

        navigationButton.setAttribute("aria-expanded", String(isOpen));
        navigationButton.setAttribute(
            "aria-label",
            isOpen ? closeLabel : openLabel,
        );
        document.body.classList.toggle("overflow-hidden", isOpen);

        if (isOpen) {
            getFocusableElements()[0]?.focus();
        } else {
            navigationButton.focus();
        }
    });

    navigationMenu.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") {
            return;
        }

        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) {
            event.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements.at(-1);

        if (!lastElement) {
            return;
        }

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    if (!navigationBreakpointListenerAdded) {
        navigationBreakpointListenerAdded = true;
        desktopNavigationQuery.addEventListener("change", () => {
            const currentNavigationMenu =
                document.querySelector<HTMLElement>("#mobile-nav-menu");
            if (
                desktopNavigationQuery.matches &&
                currentNavigationMenu?.matches(":popover-open")
            ) {
                currentNavigationMenu.hidePopover();
            }
        });
    }
};

document.addEventListener("astro:page-load", () => {
    applyTheme();
    setupThemeMenu();
    setupMobileNavigation();
});

document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    const option = target.closest("[data-theme-option]");

    if (!(option instanceof HTMLElement)) {
        return;
    }

    const theme = option.dataset.themeOption ?? null;

    if (!isTheme(theme)) {
        return;
    }

    localStorage.setItem("theme", theme);
    applyTheme();
    setupThemeMenu();
    document.querySelector<HTMLElement>("#theme-menu")?.hidePopover();
});

document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    const localeLink = target.closest<HTMLAnchorElement>("[data-locale]");

    if (!localeLink) {
        return;
    }

    const locale = localeLink.dataset.locale;

    if (locale) {
        localStorage.setItem("locale", locale);
    }
});
