import { routeFromPath } from "../paths";

/**
 * What a piece of feedback points at, recorded so whoever acts on it can find
 * the exact element again: by selector while the markup holds, and by page,
 * section and text once it has moved.
 */
export interface Target {
  /** Path under the site, e.g. `/services/`. */
  page: string;
  pageName: string;
  section: string;
  /** What kind of thing it is: Heading, Paragraph, Image… */
  element: string;
  selector: string;
  /** The words it showed, or an image's description. */
  text: string;
  /** Choices the page was showing, e.g. `C-Level selected`. */
  state: string[];
  viewport: { width: number; height: number };
}

/** Things a reviewer means when they click inside them. */
const pointable =
  "h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,caption,legend,label,a,button,summary,img,picture,video,input,select,textarea,th,td";
const sections = "section, .site-header, .site-footer, dialog";

export const clean = (text: string | null | undefined) =>
  (text ?? "").replace(/\s+/g, " ").trim();
/** Like `clean`, but the lines the reader sees stay separate lines. */
const cleanLines = (text: string | null | undefined) =>
  (text ?? "").split("\n").map(clean).filter(Boolean).join("\n");

/** A drawing is one thing to a reviewer, however many shapes it is made of. */
function outermostSvg(el: Element) {
  let svg = el.closest("svg");
  while (svg?.parentElement?.closest("svg"))
    svg = svg.parentElement.closest("svg");
  return svg;
}

/** The element a click on `el` most likely means. */
export function snap(el: Element): Element {
  return outermostSvg(el) ?? el.closest(pointable) ?? el;
}

/**
 * The next enclosing element that is visibly bigger, skipping wrappers that
 * only repeat their child's box. Stops at the page's own bands.
 */
export function widen(el: Element): Element | undefined {
  const box = el.getBoundingClientRect();
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (node.matches("main, body, #app")) return undefined;
    const next = node.getBoundingClientRect();
    if (
      Math.abs(next.width - box.width) > 2 ||
      Math.abs(next.height - box.height) > 2
    )
      return node;
  }
  return undefined;
}

export function elementKind(el: Element) {
  const tag = el.localName;
  if (/^h[1-6]$/.test(tag)) return "Heading";
  if (el.matches(".site-header")) return "Site header";
  if (el.matches(".site-footer")) return "Site footer";
  const kinds: Record<string, string> = {
    p: "Paragraph",
    li: "List item",
    dt: "Term",
    dd: "Description",
    blockquote: "Quote",
    figcaption: "Caption",
    caption: "Caption",
    legend: "Form heading",
    label: "Form label",
    a: "Link",
    button: "Button",
    summary: "Button",
    img: "Image",
    picture: "Image",
    video: "Video",
    svg: "Illustration",
    figure: "Figure",
    input: "Form field",
    select: "Form field",
    textarea: "Form field",
    th: "Table heading",
    td: "Table cell",
    section: "Section",
    nav: "Navigation",
    article: "Card",
    ul: "List",
    ol: "List",
    dl: "List",
    form: "Form",
    dialog: "Dialog",
  };
  return kinds[tag] ?? "Area";
}

/** Kinds whose words are the thing a reviewer would reword. */
export const isTextKind = (kind: string) =>
  [
    "Heading",
    "Paragraph",
    "List item",
    "Term",
    "Description",
    "Quote",
    "Caption",
    "Form heading",
    "Form label",
    "Link",
    "Button",
    "Table heading",
    "Table cell",
  ].includes(kind);
export const isMediaKind = (kind: string) =>
  ["Image", "Video", "Illustration", "Figure"].includes(kind);

/** The words a reviewer sees in `el`, or what a picture shows. */
export function visibleText(el: Element) {
  if (el instanceof HTMLImageElement) return clean(el.alt);
  if (el.localName === "svg")
    return clean(
      el.getAttribute("aria-label") ??
        el.querySelector("title")?.textContent ??
        el.textContent,
    );
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  )
    return clean(
      el.labels?.[0]?.innerText ?? el.getAttribute("placeholder") ?? "",
    );
  return cleanLines((el as HTMLElement).innerText ?? el.textContent);
}

export function sectionOf(el: Element) {
  return el.closest(sections);
}

export function sectionName(section: Element | null) {
  if (!section) return "Page";
  if (section.matches(".site-header")) return "Site header";
  if (section.matches(".site-footer")) return "Site footer";
  const labelledBy = section.getAttribute("aria-labelledby");
  const named =
    (labelledBy && document.getElementById(labelledBy)) ||
    section.querySelector("h1, h2, h3");
  // Named by the page's own title, a band is the page's opening.
  if (named?.localName === "h1") return "Page opening";
  return (
    clean((named as HTMLElement | null)?.innerText) ||
    clean(section.getAttribute("aria-label")) ||
    section.id ||
    "Unnamed section"
  );
}

/** The page's own bands, in order, for "move it above…" choices. */
export function pageSections() {
  return [...document.querySelectorAll(sections)]
    .filter(
      (el) => !el.parentElement?.closest(sections) && el.localName !== "dialog",
    )
    .map((el) => ({ name: sectionName(el), selector: selectorFor(el) }));
}

/** A selector that finds `el` again, anchored at the nearest unique id. */
export function selectorFor(el: Element) {
  const parts: string[] = [];
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (
      node.id &&
      document.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1
    ) {
      parts.unshift(`#${CSS.escape(node.id)}`);
      break;
    }
    if (node === document.body) {
      parts.unshift("body");
      break;
    }
    const same = node.parentElement
      ? [...node.parentElement.children].filter(
          (sibling) => sibling.localName === node.localName,
        )
      : [];
    parts.unshift(
      same.length > 1
        ? `${node.localName}:nth-of-type(${same.indexOf(node) + 1})`
        : node.localName,
    );
  }
  return parts.join(" > ");
}

export function resolve(selector: string) {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

/** What the section was showing: a selected tab, a pressed choice, an open panel. */
function visibleState(section: Element | null) {
  if (!section) return [];
  const chosen = section.querySelectorAll(
    '[aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], [aria-current="step"], [aria-current="true"]',
  );
  const open = section.querySelectorAll("details[open] > summary");
  const named = (els: NodeListOf<Element>, state: string) =>
    [...els]
      .map((el) => clean(visibleText(el)).slice(0, 60))
      .filter(Boolean)
      .map((name) => `${name} ${state}`);
  return [...named(chosen, "selected"), ...named(open, "open")];
}

const pageName = (route: string) =>
  route === "" ? "Home" : clean(document.title.split("|")[0]) || route;

/** This page's path under the site, e.g. `/services/`. */
export function currentPage() {
  const route = routeFromPath(location.pathname);
  return route ? `/${route}/` : "/";
}

export function describe(el: Element): Target {
  const route = routeFromPath(location.pathname);
  const section = sectionOf(el);
  return {
    page: currentPage(),
    pageName: pageName(route),
    section: sectionName(section),
    element: elementKind(el),
    selector: selectorFor(el),
    text: visibleText(el).slice(0, 4000),
    state: visibleState(section),
    viewport: { width: innerWidth, height: innerHeight },
  };
}

/** `Heading “Who Found42 helps”`, short enough for a list or a label. */
export function targetLabel(target: Pick<Target, "element" | "text">) {
  const line = clean(target.text);
  const text = line.length > 60 ? `${line.slice(0, 57)}…` : line;
  return text ? `${target.element} “${text}”` : target.element;
}

export const screenName = ({ width }: Target["viewport"]) =>
  width < 768 ? "phone" : width < 1024 ? "tablet" : "desktop";
