import type { Target } from "./model";
const clean = (text: string) => text.replace(/\s+/g, " ").trim();

/** `Heading “Who Found42 helps”`, short enough for a list or a label. */
export function targetLabel(target: Pick<Target, "element" | "text">) {
  const line = clean(target.text);
  const text = line.length > 60 ? `${line.slice(0, 57)}…` : line;
  return text ? `${target.element} “${text}”` : target.element;
}

export const screenName = ({ width }: Target["viewport"]) =>
  width < 768 ? "phone" : width < 1024 ? "tablet" : "desktop";

/** Plain display context; the stored section identifier stays unchanged. */
export const sectionGloss = (section: string) =>
  section === "Page opening"
    ? "Top of the page"
    : section.replace(/[-_]+/g, " ");
