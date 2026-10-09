import { jsPDF } from "jspdf";
import { sitePath } from "./paths";
import { reportOffer, scoreMethod } from "./readiness-view";
import type { ReadinessReport } from "./readiness";
/** Plain PDF text only: no HTML input, screenshots, external requests or servers. Fonts are bundled locally. */
export async function downloadReadinessPdf(
  report: ReadinessReport,
  name: string,
  role: string,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: "Found42 AI Readiness Report",
    author: "Found42",
    subject: "Your AI readiness, recommendations and answers",
  });
  let y = 22;
  const clean = (text: string) =>
    Array.from(text)
      .filter((character) => {
        const code = character.codePointAt(0)!;
        return (code >= 32 && code !== 127) || character === "\n";
      })
      .join("");
  for (const style of ["Regular", "Bold"] as const) {
    const response = await fetch(
      sitePath(`assets/fonts/NotoSans-${style}.ttf`),
    );
    if (!response.ok) throw new Error("The PDF font could not load.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    doc.addFileToVFS(`NotoSans-${style}.ttf`, btoa(binary));
    doc.addFont(
      `NotoSans-${style}.ttf`,
      "NotoSans",
      style === "Bold" ? "bold" : "normal",
    );
  }
  const write = (text: string, kind: "heading" | "body" = "body") => {
    const size = kind === "heading" ? 13 : 10.5;
    const lineHeight = kind === "heading" ? 6.5 : 5;
    doc.setFont("NotoSans", kind === "heading" ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(32, 33, 31);
    const lines = doc.splitTextToSize(clean(text), 170) as string[];
    if (y + lines.length * lineHeight + (kind === "heading" ? 12 : 0) > 274) {
      doc.addPage();
      y = 22;
    }
    for (const line of lines) {
      if (y + lineHeight > 274) {
        doc.addPage();
        y = 22;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    }
    y += kind === "heading" ? 3 : 2;
  };
  const writeBlock = (
    entries: [string, "heading" | "body"][],
    sectionTitle?: string,
  ) => {
    if (sectionTitle) entries = [[sectionTitle, "heading"], ...entries];
    const height = entries.reduce((total, [text, kind]) => {
      doc.setFont("NotoSans", kind === "heading" ? "bold" : "normal");
      doc.setFontSize(kind === "heading" ? 13 : 10.5);
      return (
        total +
        (doc.splitTextToSize(clean(text), 170) as string[]).length *
          (kind === "heading" ? 6.5 : 5) +
        (kind === "heading" ? 3 : 2)
      );
    }, 0);
    if (y + height + 12 > 274) {
      doc.addPage();
      y = 22;
    }
    for (const [text, kind] of entries) write(text, kind);
  };
  const canonicalLink = (href: string) =>
    href.startsWith("https://")
      ? href
      : new URL(
          href.slice(sitePath().length),
          "https://nicolas-found42.github.io/website-redesign/",
        ).href;
  write("Found42 AI Readiness Report", "heading");
  write(
    name ? `${name}, here is where you stand` : "Here is where you stand",
    "heading",
  );
  if (role) write(`Your role: ${role}`);
  write(
    `${report.pct}% - Stage ${report.stage.n} of 3: ${report.stage.name}`,
    "heading",
  );
  write(`${report.total} of 51 points`);
  write("Foundations: 0-40%. Ready to build: 41-80%. Ready to scale: 81-100%.");
  write(report.stage.text);
  for (const warning of report.warnings) {
    writeBlock([
      [warning.title, "heading"],
      [warning.body, "body"],
    ]);
  }
  if (report.toolNote) write(report.toolNote);
  for (const [i, area] of report.areas.entries())
    writeBlock(
      [
        [
          `${area.name}: ${area.pct}% · ${{ low: "Needs work", mid: "Developing", high: "Strong" }[area.level]} (${area.got} of ${area.max} points)`,
          "heading",
        ],
        [area.recommendation, "body"],
      ],
      i === 0 ? "Your five areas" : undefined,
    );
  if (report.wins.length) {
    for (const [i, win] of report.wins.entries()) {
      writeBlock(
        [
          [win.q.text, "heading"],
          [`You answered: ${win.answer}. ${win.q.low ?? ""}`, "body"],
          [win.q.fix ?? "", "body"],
        ],
        i === 0 ? "Your quickest wins" : undefined,
      );
    }
  }
  for (const [i, key] of report.route.entries()) {
    const offer = reportOffer(key);
    writeBlock(
      [
        [offer.title, "heading"],
        [offer.body, "body"],
      ],
      i === 0 ? "Your recommended next step" : undefined,
    );
    for (const item of offer.list) write(`- ${item}`);
    if (offer.note) write(offer.note);
    write(`${offer.label}: ${canonicalLink(offer.href)}`);
  }
  writeBlock([
    ["Scoring method", "heading"],
    [scoreMethod, "body"],
    [
      "A starting point for a conversation, not an audit or certification. This PDF was generated locally; nothing was sent to Found42.",
      "body",
    ],
  ]);
  for (const [i, answer] of report.answers.entries())
    writeBlock(
      [
        [`${i + 1}. ${answer.question}`, "heading"],
        [answer.answer, "body"],
        [
          answer.points === null
            ? "Context only - not scored"
            : `${answer.points} / ${answer.max} points`,
          "body",
        ],
      ],
      i === 0 ? "All your answers" : undefined,
    );
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Found42 | AI Readiness Report | ${page} of ${doc.getNumberOfPages()}`,
      20,
      286,
    );
  }
  doc.save("Found42-AI-Readiness-Report.pdf");
}
