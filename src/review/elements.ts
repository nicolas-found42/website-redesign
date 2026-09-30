/** The vocabulary shared by target capture and hosted validation. */
const kinds = {
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
} as const;

export type ElementKind =
  | (typeof kinds)[keyof typeof kinds]
  | "Heading"
  | "Site header"
  | "Site footer"
  | "Area";
export const elementNames: ElementKind[] = [
  ...new Set(Object.values(kinds)),
  "Heading",
  "Site header",
  "Site footer",
  "Area",
];
export const kindForTag = (tag: string): ElementKind =>
  Object.hasOwn(kinds, tag) ? kinds[tag as keyof typeof kinds] : "Area";
