import { siteFooter, siteHeader } from "./homepage/chrome";
import { hero } from "./homepage/hero";
import { resourcesSection } from "./homepage/resources";
import { servicesSection } from "./homepage/services";
import { credibilitySection } from "./homepage/credibility";
import { inquirySection } from "./homepage/inquiry";
import { mountWorkflow } from "./workflow";

/**
 * Every band the homepage shows, with each context's copy and markup owned by
 * its own renderer. Callers and tests read the page through this function.
 */
export function renderHomepage() {
  return `${siteHeader()}
<main id="main">
${hero()}
${resourcesSection()}
${servicesSection()}
${credibilitySection()}
${inquirySection()}
</main>
${siteFooter()}`;
}

/**
 * Renders the page into `root` and returns a disposer that releases every
 * listener and observation the page added.
 */
export function mountHomepage(
  root: HTMLElement,
  options: { motionPreference: MediaQueryList },
) {
  const { motionPreference } = options;
  root.innerHTML = renderHomepage();

  const menu = root.querySelector<HTMLButtonElement>(".menu-toggle")!;
  const nav = root.querySelector<HTMLElement>("#navigation")!;
  const closeMenu = () => {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };
  const toggleMenu = () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  const followLink = (event: Event) => {
    const link = (event.target as HTMLElement).closest("a");
    if (!link) return;
    const wasOpen = menu.getAttribute("aria-expanded") === "true";
    closeMenu();
    if (wasOpen && link.hash) {
      event.preventDefault();
      history.pushState(null, "", link.hash);
      document.querySelector(link.hash)?.scrollIntoView();
      const heading = document.querySelector<HTMLElement>(
        `${link.hash} h2, ${link.hash} h3`,
      );
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    }
  };
  const closeOnEscape = (event: KeyboardEvent) => {
    if (
      event.key === "Escape" &&
      menu.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menu.focus();
    }
  };
  const wide = matchMedia("(min-width: 961px)");
  const closeWhenWide = () => closeMenu();
  menu.addEventListener("click", toggleMenu);
  nav.addEventListener("click", followLink);
  document.addEventListener("keydown", closeOnEscape);
  wide.addEventListener("change", closeWhenWide);

  const illustration = root.querySelector<HTMLElement>("[data-illustration]")!;
  const disposeWorkflow = mountWorkflow(illustration, { motionPreference });

  // Entrances enhance visible content; nothing depends on an animation finishing.
  const entranceObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!motionPreference.matches)
          entry.target.animate(
            [{ transform: "translateY(12px)" }, { transform: "translateY(0)" }],
            { duration: 450, easing: "ease-out" },
          );
        entranceObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.12 },
  );
  root
    .querySelectorAll(".reveal")
    .forEach((element) => entranceObserver.observe(element));
  const cancelMovement = () => {
    if (motionPreference.matches)
      root.getAnimations().forEach((animation) => animation.cancel());
  };
  motionPreference.addEventListener("change", cancelMovement);

  return () => {
    disposeWorkflow();
    entranceObserver.disconnect();
    motionPreference.removeEventListener("change", cancelMovement);
    menu.removeEventListener("click", toggleMenu);
    nav.removeEventListener("click", followLink);
    document.removeEventListener("keydown", closeOnEscape);
    wide.removeEventListener("change", closeWhenWide);
  };
}
