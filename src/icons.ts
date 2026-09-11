import {
  ArrowUpRight,
  ArrowDown,
  Menu,
  BookOpen,
  ScanLine,
  SlidersHorizontal,
  type IconNode,
} from "lucide";

const icons = {
  arrow: ArrowUpRight,
  down: ArrowDown,
  menu: Menu,
  book: BookOpen,
  scan: ScanLine,
  prompts: SlidersHorizontal,
};

const shell = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 1.6,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false",
  class: "icon",
};

// Serialized here rather than built through a DOM, so page markup stays a pure
// string that a test process can render without a browser.
const markup = (attributes: Record<string, string | number | undefined>) =>
  Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join("");

export function icon(name: keyof typeof icons) {
  const paths = (icons[name] as IconNode)
    .map(([tag, attributes]) => `<${tag}${markup(attributes)}/>`)
    .join("");
  return `<svg${markup(shell)}>${paths}</svg>`;
}

/** Link arrow, rendered once for every module that closes a call to action. */
export const arrow = icon("arrow");
