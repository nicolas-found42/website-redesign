import { animate, type AnimationPlaybackControls } from "motion";

const states = [
  {
    description:
      "Training illustration: a work task, useful prompts and human review support putting AI into practice.",
    detail: "Give people the skills to apply AI to their own work.",
    nodes: [
      "Your work task",
      "Useful prompts",
      "Human review",
      "Put into practice",
    ],
    points: [
      [17, 20],
      [81, 19],
      [81, 80],
      [18, 80],
    ],
  },
  {
    description:
      "Automation illustration: connect sales, operations and finance through a shared workflow with human direction.",
    detail: "Connect tasks into workflows your team can use.",
    nodes: ["Sales", "Operations", "Finance", "Shared workflow"],
    points: [
      [17, 20],
      [82, 30],
      [17, 66],
      [81, 84],
    ],
  },
  {
    description:
      "Product illustration: combine business expertise, product context and AI capabilities in a customer workflow.",
    detail: "Turn business expertise into new product value.",
    nodes: [
      "Your expertise",
      "Product context",
      "AI capabilities",
      "Customer workflow",
    ],
    points: [
      [18, 19],
      [81, 19],
      [18, 80],
      [81, 80],
    ],
  },
] as const;

// Original line artwork: three complete still compositions, never a results dashboard.
export function ribbonPaths(state: number, count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const n = (i - (count - 1) / 2) * 4;
    const shapes = [
      `M102 ${86 + n} C105 ${245 + n} 500 ${240 - n} 486 ${82 + n} C474 ${-10 + n} 225 ${75 - n} ${300 + n} 218 C${375 + n} 367 532 ${387 - n} 486 ${344 + n} C400 ${269 + n} 80 ${232 - n} 108 ${344 + n} C150 ${487 + n} 431 ${362 - n} ${300 + n} 218 C${169 + n} 75 100 ${-35 + n} 102 ${86 + n}`,
      `M102 ${86 + n} H${404 + n} Q${492 + n} ${86 + n} ${492 + n} 129 Q${492 + n} ${172 - n} ${405 + n} ${172 - n} H${196 - n} Q${102 - n} ${172 - n} ${102 - n} 284 Q${102 - n} ${361 + n} ${196 - n} ${361 + n} H486`,
      `M108 ${82 + n} C${130 + n} ${182 + n} ${265 + n} ${185 - n} 486 ${344 + n} M486 ${82 + n} C${490 + n} ${210 + n} ${340 - n} ${240 + n} 108 ${344 + n} M108 ${82 + n} C${107 - n} ${354 - n} ${297 + n} ${420 - n} 486 ${344 + n}`,
    ];
    return `<path d="${shapes[state]}"/>`;
  }).join("");
}
export function motif(state = 0, className = "") {
  return `<svg class="ribbon-motif ${className}" viewBox="0 0 600 430" fill="none" aria-hidden="true" focusable="false">${ribbonPaths(state)}</svg>`;
}
export function workflowMarkup() {
  const state = states[0];
  return `<div class="workflow">
    <div class="diagram-heading"><span>Business expertise, connected.</span><span class="diagram-dot" aria-hidden="true"></span></div>
    <div class="workflow-art" role="img" aria-label="${state.description}">
      <svg class="workflow-ribbons" viewBox="0 0 600 430" fill="none" aria-hidden="true" focusable="false">${ribbonPaths(0)}</svg>
      <div class="workflow-center" aria-hidden="true"><span>Human<br><strong>direction.</strong></span></div>
      ${state.nodes.map((text, i) => `<span class="workflow-node" aria-hidden="true" style="left:${state.points[i][0]}%;top:${state.points[i][1]}%"><i></i><span>${text}</span></span>`).join("")}
    </div>
    <div class="workflow-choices" role="group" aria-label="Explore the illustrative workflow">${["Training", "Automation", "Product value"].map((label, i) => `<button type="button" data-workflow="${i}" aria-pressed="${i === 0}">${label}</button>`).join("")}</div>
    <p class="workflow-detail" aria-live="polite">${state.detail}</p>
    <p class="diagram-caption">Explore an illustration of the possibilities.</p>
  </div>`;
}
export function mountWorkflow(preference: MediaQueryList) {
  const art = document.querySelector<HTMLElement>(".workflow-art")!;
  const svg = art.querySelector<SVGSVGElement>("svg")!;
  const nodes = [...art.querySelectorAll<HTMLElement>(".workflow-node")];
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-workflow]"),
  ];
  let active = 0;
  let generation = 0;
  let animations: AnimationPlaybackControls[] = [];
  function settle() {
    generation++;
    animations.forEach((animation) => animation.stop());
    animations = [];
    nodes.forEach((node, i) => {
      node.style.left = `${states[active].points[i][0]}%`;
      node.style.top = `${states[active].points[i][1]}%`;
    });
    // Replace the paths so queued SVG updates cannot touch the settled drawing.
    svg.innerHTML = ribbonPaths(active);
  }
  function select(index: number) {
    if (index === active) return;
    const previous = states[active];
    settle();
    const transitionGeneration = generation;
    active = index;
    const state = states[index];
    art.setAttribute("aria-label", state.description);
    svg.innerHTML = ribbonPaths(index);
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    document.querySelector(".workflow-detail")!.textContent = state.detail;
    nodes.forEach((node, i) => {
      node.querySelector("span")!.textContent = state.nodes[i];
      const position = {
        left: `${state.points[i][0]}%`,
        top: `${state.points[i][1]}%`,
      };
      if (preference.matches) Object.assign(node.style, position);
    });
    if (!preference.matches) {
      animations.push(
        animate(0, 1, {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          onUpdate(progress) {
            if (generation !== transitionGeneration) return;
            nodes.forEach((node, i) => {
              node.style.left = `${previous.points[i][0] + (state.points[i][0] - previous.points[i][0]) * progress}%`;
              node.style.top = `${previous.points[i][1] + (state.points[i][1] - previous.points[i][1]) * progress}%`;
            });
          },
        }),
      );
      animations.push(
        animate(
          svg.querySelectorAll("path"),
          { pathLength: [0, 1] },
          { duration: 0.75, ease: "easeInOut" },
        ),
      );
    }
  }
  const handlers = buttons.map((button, index) => {
    const handler = () => select(index);
    button.addEventListener("click", handler);
    return handler;
  });
  const preferenceChanged = () => {
    if (preference.matches) settle();
  };
  preference.addEventListener("change", preferenceChanged);
  return () => {
    settle();
    buttons.forEach((button, i) =>
      button.removeEventListener("click", handlers[i]),
    );
    preference.removeEventListener("change", preferenceChanged);
  };
}
