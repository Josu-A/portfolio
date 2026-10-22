const themes = ["system", "light", "dark"] as const;
type Theme = (typeof themes)[number];

const isTheme = (value: null | string): value is Theme =>
    value !== null && themes.includes(value as Theme);

const readStorage = (key: string): null | string => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStorage = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // localStorage blocked; nothing to do.
    }
};

let chosenTheme: null | Theme = null;

const saveTheme = (theme: Theme) => {
    chosenTheme = theme;
    writeStorage("theme", theme);
};

const getStoredTheme = (): Theme => {
    const storedTheme = chosenTheme ?? readStorage("theme");

    return isTheme(storedTheme) ? storedTheme : "system";
};

const applyTheme = (theme: Theme = getStoredTheme()) => {
    document.documentElement.dataset.theme = theme;
};

const initializedMenus = new WeakSet<HTMLElement>();

const restoreFocusOnClose = (menu: HTMLElement, button: HTMLElement) => {
    const focused = document.activeElement;

    if (focused === document.body || menu.contains(focused)) {
        button.focus();
    }
};
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
        if (isTheme(themeSelect.value)) {
            saveTheme(themeSelect.value);
        }
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
                "aria-pressed",
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
            } else {
                restoreFocusOnClose(themeMenu, themeButton);
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

const setupLanguageMenu = () => {
    const languageButton = document.querySelector("#language-menu-button");
    const languageMenu = document.querySelector("#language-menu");

    if (
        !(languageButton instanceof HTMLButtonElement) ||
        !(languageMenu instanceof HTMLElement) ||
        initializedMenus.has(languageMenu)
    ) {
        return;
    }

    initializedMenus.add(languageMenu);
    languageMenu.addEventListener("toggle", () => {
        const isOpen = languageMenu.matches(":popover-open");

        languageButton.setAttribute("aria-expanded", String(isOpen));
        if (!isOpen) {
            restoreFocusOnClose(languageMenu, languageButton);
        }
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
    navigationMenu.addEventListener("toggle", () => {
        const isOpen = navigationMenu.matches(":popover-open");

        navigationButton.setAttribute("aria-expanded", String(isOpen));
        navigationButton.setAttribute(
            "aria-label",
            isOpen ? closeLabel : openLabel,
        );
        document.body.classList.toggle("overflow-hidden", isOpen);
        document
            .querySelectorAll<HTMLElement>("[data-inert-behind-menu]")
            .forEach((element) => {
                element.inert = isOpen;
            });

        if (isOpen) {
            navigationMenu.querySelector<HTMLElement>("a[href]")?.focus();
        } else {
            navigationButton.focus();
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

document.addEventListener("astro:after-swap", () => applyTheme());

document.addEventListener("astro:page-load", () => {
    applyTheme();
    setupThemeMenu();
    setupLanguageMenu();
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

    saveTheme(theme);
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
        writeStorage("locale", locale);
    }
});
