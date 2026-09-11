import {
  ArrowUpRight,
  ArrowDown,
  Menu,
  BookOpen,
  ScanLine,
  SlidersHorizontal,
  createElement,
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
export function icon(name: keyof typeof icons) {
  return createElement(icons[name] as IconNode, {
    "aria-hidden": "true",
    focusable: "false",
    class: "icon",
    "stroke-width": 1.6,
  }).outerHTML;
}
