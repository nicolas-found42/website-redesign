import { mountInteractions } from "./interactions";
import { siteFooter, siteHeader } from "./homepage/chrome";
import { hero } from "./homepage/hero";
import { resourcesSection } from "./homepage/resources";
import { servicesSection } from "./homepage/services";
import { audiencesSection } from "./homepage/audiences";
import { credibilitySection } from "./homepage/credibility";
import { mountSystem } from "./system";
import { masterSchematic } from "./schematic";
import { mountServices } from "./homepage/services-behaviour";
import { mountAudiences } from "./homepage/audiences-behaviour";
import { mountReveals } from "./reveal";
import { mountSmoothScroll } from "./scroll";
import type { PageMotion } from "./motion-preference";

/**
 * Every band the homepage shows, with each context's copy and markup owned by
 * its own renderer. Callers and tests read the page through this function.
 */
export function renderHomepage() {
  return `${siteHeader()}
<main id="main">
${hero()}
${resourcesSection()}
${audiencesSection()}
${servicesSection({ allServicesLink: true })}
${credibilitySection()}
</main>
${siteFooter()}`;
}

/**
 * Renders the page into `root` and returns a disposer that releases every
 * listener, observation and animation the page added.
 */
export function mountHomepage(
  root: HTMLElement,
  options: { motionPreference: PageMotion },
) {
  return mountPage(root, renderHomepage(), options);
}

export function mountPage(
  root: HTMLElement,
  markup: string,
  options: { motionPreference: PageMotion },
) {
  const { motionPreference } = options;
  root.innerHTML = markup;

  const disposers: (() => void)[] = [mountInteractions(root)];
  root.querySelectorAll<HTMLAnchorElement>("#navigation a").forEach((link) => {
    if (
      link.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")
    )
      link.setAttribute("aria-current", "page");
  });

  /* ── Navigation ── */
  const menu = root.querySelector<HTMLButtonElement>(".menu-toggle")!;
  const nav = root.querySelector<HTMLElement>("#navigation")!;
  const menuLabel = menu.querySelector(".menu-toggle-label");
  /** The toggle says what pressing it will do, so the open panel shows its way out. */
  const setMenu = (open: boolean) => {
    menu.setAttribute("aria-expanded", String(open));
    if (menuLabel) menuLabel.textContent = open ? "Close menu" : "Menu";
    nav.classList.toggle("is-open", open);
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.removeProperty("overflow");
  };
  const closeMenu = () => setMenu(false);
  const toggleMenu = () =>
    setMenu(menu.getAttribute("aria-expanded") !== "true");
  const followLink = (event: Event) => {
    const link = (event.target as HTMLElement).closest("a");
    if (!link) return;
    const wasOpen = menu.getAttribute("aria-expanded") === "true";
    closeMenu();
    if (wasOpen && link.hash && link.pathname === location.pathname) {
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
    if (event.key === "Escape")
      root
        .querySelectorAll<HTMLDetailsElement>(".industry-menu[open]")
        .forEach((el) => {
          el.open = false;
          el.querySelector("summary")?.focus();
        });
    if (event.key === "Tab" && menu.getAttribute("aria-expanded") === "true") {
      const controls = [
        menu,
        ...nav.querySelectorAll<HTMLElement>("a, button, summary"),
      ].filter((el) => el.getClientRects().length);
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
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
  /**
   * On a wide screen the industries list is a dropdown laid over the page, so
   * it closes once the visitor is done with it: a press elsewhere, or focus
   * moving on. In the narrow menu it is an inline list and stays as chosen.
   */
  const industries = root.querySelector<HTMLDetailsElement>(".industry-menu");
  const closeIndustriesOnPress = (event: Event) => {
    if (
      wide.matches &&
      industries?.open &&
      !industries.contains(event.target as Node)
    )
      industries.open = false;
  };
  const closeIndustriesOnLeave = (event: FocusEvent) => {
    if (
      wide.matches &&
      industries?.open &&
      !industries.contains(event.relatedTarget as Node | null)
    )
      industries.open = false;
  };
  menu.addEventListener("click", toggleMenu);
  nav.addEventListener("click", followLink);
  document.addEventListener("keydown", closeOnEscape);
  document.addEventListener("pointerdown", closeIndustriesOnPress);
  industries?.addEventListener("focusout", closeIndustriesOnLeave);
  wide.addEventListener("change", closeWhenWide);
  disposers.push(() => {
    menu.removeEventListener("click", toggleMenu);
    nav.removeEventListener("click", followLink);
    document.removeEventListener("keydown", closeOnEscape);
    document.removeEventListener("pointerdown", closeIndustriesOnPress);
    industries?.removeEventListener("focusout", closeIndustriesOnLeave);
    wide.removeEventListener("change", closeWhenWide);
    document.body.style.removeProperty("overflow");
  });

  /**
   * The header takes its paper once the opening spread is behind it. Read on
   * scroll rather than observed: a page that opens at an anchor, or jumps there
   * before its first frame, takes the opening from below the viewport to above
   * it without it ever intersecting, and an observer would never report it.
   */
  const header = root.querySelector<HTMLElement>(".site-header")!;
  const sentinel = root.querySelector<HTMLElement>(".page-opening, .hero-rail");
  const readLift = () => {
    if (sentinel)
      header.classList.toggle(
        "is-lifted",
        sentinel.getBoundingClientRect().top < 0,
      );
  };
  addEventListener("scroll", readLift, { passive: true });
  addEventListener("resize", readLift);
  readLift();
  disposers.push(() => {
    removeEventListener("scroll", readLift);
    removeEventListener("resize", readLift);
  });

  /**
   * Anything that rides under the header needs its height, which wraps with
   * the text size rather than following a breakpoint.
   */
  const measureHeader = new ResizeObserver(() =>
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`,
    ),
  );
  measureHeader.observe(header);
  disposers.push(() => {
    measureHeader.disconnect();
    document.documentElement.style.removeProperty("--header-height");
  });

  /**
   * The header takes the ground of whichever band is behind it. Measured on
   * scroll against the header's own box, because the bands change height with
   * the viewport and a precomputed observer margin would drift.
   */
  const grounds = [...root.querySelectorAll<HTMLElement>("[data-ground]")];
  let ground = "";
  const readGround = () => {
    const line = header.getBoundingClientRect().bottom - 2;
    const behind = grounds.find((band) => {
      const box = band.getBoundingClientRect();
      return box.top <= line && box.bottom >= line;
    });
    const next = behind?.dataset.ground ?? "";
    if (next === ground) return;
    header.classList.toggle("is-over-ink", next === "ink");
    header.classList.toggle("is-over-red", next === "red");
    ground = next;
  };
  addEventListener("scroll", readGround, { passive: true });
  addEventListener("resize", readGround);
  readGround();
  disposers.push(() => {
    removeEventListener("scroll", readGround);
    removeEventListener("resize", readGround);
  });

  /* ── The opening drawing ── */
  const heroHost = root.querySelector<HTMLElement>(".hero-art")!;
  const heroSystem = heroHost
    ? mountSystem(heroHost, {
        motionPreference,
        compositions: [masterSchematic],
        live: true,
      })
    : null;
  if (heroSystem) disposers.push(heroSystem.dispose);

  /* ── Pausing the page's motion (WCAG 2.2.2) ── */
  const toggle = root.querySelector<HTMLButtonElement>("[data-motion-toggle]")!;
  const label = toggle?.querySelector("span:last-child")!;
  const syncToggle = () => {
    if (!toggle || !label) return;
    toggle.setAttribute("aria-pressed", String(motionPreference.byVisitor));
    label.textContent = motionPreference.byVisitor
      ? "Resume motion"
      : "Pause motion";
  };
  const onToggle = () => {
    motionPreference.setPaused(!motionPreference.byVisitor);
    syncToggle();
  };
  toggle?.addEventListener("click", onToggle);
  motionPreference.addEventListener("change", syncToggle);
  syncToggle();
  disposers.push(() => {
    toggle?.removeEventListener("click", onToggle);
    motionPreference.removeEventListener("change", syncToggle);
  });

  /* ── The scroll-linked services sequence ── */
  if (root.querySelector(".services-art"))
    disposers.push(mountServices(root, { motionPreference }));

  /* ── The audience gallery and any scene drawn on its own ── */
  if (root.querySelector("[data-scene-host]"))
    disposers.push(mountAudiences(root, { motionPreference }));

  /* ── Page-wide entrances and scroll feel ── */
  disposers.push(mountReveals(root, { motionPreference }));
  disposers.push(mountSmoothScroll({ motionPreference }));

  return () => disposers.forEach((dispose) => dispose());
}
