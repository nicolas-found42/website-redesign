/** Decorative SVGs keep the seven approved label sequences in ordinary DOM text. */
const diagramMotifs = {
  hero: [
    '<circle cx="23" cy="23" r="5"/><circle cx="41" cy="23" r="5"/><path d="M13 45c0-8 5-13 10-13s10 5 10 13M31 45c0-8 5-13 10-13s10 5 10 13"/>',
    '<circle cx="32" cy="32" r="18"/><path d="m25 39 13-20-2 17-11 3ZM32 9v5m0 36v5M9 32h5m36 0h5"/>',
    '<rect x="18" y="12" width="28" height="40" rx="2"/><path d="M24 22h16M24 28h11m-11 8 5 5 11-13"/>',
  ],
  executives: [
    '<path d="M13 43c7-4 8-18 15-14s9-13 18-11 7 17 4 25H13Z"/><path d="M16 50h32"/>',
    '<path d="M18 17h28v30H18zM24 24h16M24 31h10m-10 7 4 4 10-10"/>',
    '<path d="M17 12h23l7 7v33H17zM40 12v8h8M23 28h18M23 35h18M23 42h12"/>',
    '<circle cx="32" cy="32" r="19"/><path d="m24 40 17-17M31 23h10v10"/>',
  ],
  contributors: [
    '<path d="M14 50V21l18-9 18 9v29H14ZM22 28h5m10 0h5M22 36h5m10 0h5M28 50V40h8v10"/>',
    '<path d="M14 22h27v29H14zM22 14h28v29M21 30h13M21 37h13m-13 7h8"/>',
    '<rect x="15" y="13" width="34" height="38" rx="2"/><path d="m22 31 6 6 14-15M22 44h20"/>',
    '<path d="M32 11c-12 8-20 18-20 29 0 8 8 13 20 13s20-5 20-13c0-11-8-21-20-29Z"/><path d="m24 36 6 6 12-15"/>',
  ],
  builders: [
    '<path d="M15 17h14c-3 5 0 9 4 9s7-4 4-9h12v13c-5-3-9 0-9 4s4 7 9 4v11H15V17Z"/>',
    '<circle cx="32" cy="32" r="19"/><path d="M13 32h38M32 13v38m-9-29 18 18m0-18L23 40"/>',
    '<path d="M18 18h28v28H18zM25 25l14 14m0-14L25 39M16 51h32"/>',
    '<path d="M13 21h17v22H13zM34 21h17v22H34zM30 32h4m-12 16h20"/>',
  ],
  workshops: [
    '<path d="M13 18h16l5 5h17v27H13zM18 30h27m-27 7h20"/>',
    '<circle cx="22" cy="23" r="5"/><circle cx="42" cy="23" r="5"/><path d="M11 45c0-8 5-13 11-13s11 5 11 13m0 0c0-8 4-13 9-13s11 5 11 13"/>',
    '<path d="M14 19h36v29H14zM21 28h6m10 0h6m-22 9 5 5 10-11"/>',
    '<path d="M17 13h30v39l-15-9-15 9V13ZM24 23h16M24 30h11"/>',
  ],
  workflows: [
    '<path d="M17 12h22l8 8v32H17zM39 12v9h8M23 29h18m-18 7h18m-18 7h11"/>',
    '<path d="M14 15h16v16H14zM34 15h16v16H34zM14 35h16v16H14zM34 35h16v16H34z"/>',
    '<circle cx="32" cy="32" r="20"/><path d="m21 32 7 7 15-17"/>',
    '<path d="M14 23h36v28H14zM14 23l18-11 18 11M23 36h18m-9-8v16"/>',
  ],
  automations: [
    '<circle cx="15" cy="18" r="5"/><circle cx="47" cy="18" r="5"/><circle cx="31" cy="46" r="5"/><path d="m20 18 22 0M18 23l10 18m16-18L34 41"/>',
    '<path d="M49 26a18 18 0 0 0-31-5l-5 6m0 0V16m0 11h11M15 38a18 18 0 0 0 31 5l5-6m0 0v11m0-11H40"/>',
    '<circle cx="32" cy="22" r="8"/><path d="M17 52c0-11 6-18 15-18s15 7 15 18M24 45l5 5 12-14"/>',
    '<path d="M16 12h24l8 8v32H16zM40 12v9h8M23 32h17m-17 7h17m-17 7h11"/>',
  ],
} as const;

type DiagramKind = keyof typeof diagramMotifs;

export const flow = (labels: readonly string[], kind: DiagramKind) =>
  `<div class="ah-flow" role="group" aria-label="${labels.join(" to ")}" style="--flow-count: ${labels.length}">${labels.map((label, index) => `<span class="ah-flow-step${index === labels.length - 1 ? " ah-flow-step--end" : ""}"><span class="ah-flow-glyph" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${diagramMotifs[kind][index]}</svg></span><span class="ah-flow-label">${label}</span></span>`).join("")}</div>`;
