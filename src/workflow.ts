import { animate, type AnimationPlaybackControls } from "motion";
import { ribbonPaths, ribbonSvg, type RibbonVariant } from "./artwork";

type Point = readonly [number, number];
type Workflow = {
  /** Choice label, ribbon composition and description travel together. */
  choice: string;
  ribbon: RibbonVariant;
  description: string;
  detail: string;
  nodes: readonly string[];
  points: readonly Point[];
};

const workflows: readonly Workflow[] = [
  {
    choice: "Training",
    ribbon: "loop",
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
    choice: "Automation",
    ribbon: "route",
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
    choice: "Product value",
    ribbon: "combine",
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
];

function renderWorkflow() {
  const workflow = workflows[0];
  return `<div class="workflow">
    <div class="diagram-heading"><span>Business expertise, connected.</span><span class="diagram-dot" aria-hidden="true"></span></div>
    <div class="workflow-art" role="img" aria-label="${workflow.description}">
      ${ribbonSvg(workflow.ribbon, { className: "workflow-ribbons" })}
      <div class="workflow-center" aria-hidden="true"><span>Human<br><strong>direction.</strong></span></div>
      ${workflow.nodes.map((text, index) => `<span class="workflow-node" aria-hidden="true" style="--node-x:${workflow.points[index][0]}%;--node-y:${workflow.points[index][1]}%"><i></i><span>${text}</span></span>`).join("")}
    </div>
    <div class="workflow-choices" role="group" aria-label="Explore the illustrative workflow">${workflows.map((state, index) => `<button type="button" data-workflow="${index}" aria-pressed="${index === 0}">${state.choice}</button>`).join("")}</div>
    <p class="workflow-detail" aria-live="polite">${workflow.detail}</p>
    <p class="diagram-caption">Explore an illustration of the possibilities.</p>
  </div>`;
}

/**
 * Renders the illustration into `root` and drives its three states: one complete
 * still composition per choice, animated when motion is welcome.
 */
export function mountWorkflow(
  root: HTMLElement,
  options: { motionPreference: MediaQueryList },
) {
  const { motionPreference } = options;
  root.innerHTML = renderWorkflow();
  const art = root.querySelector<HTMLElement>(".workflow-art")!;
  const svg = art.querySelector<SVGSVGElement>("svg")!;
  const nodes = [...art.querySelectorAll<HTMLElement>(".workflow-node")];
  const buttons = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-workflow]"),
  ];
  const detail = root.querySelector<HTMLElement>(".workflow-detail")!;
  let active = 0;
  let tweens: AnimationPlaybackControls[] = [];

  function stopTweens() {
    tweens.forEach((tween) => tween.stop());
    tweens = [];
  }

  function place(node: HTMLElement, [x, y]: Point) {
    node.style.setProperty("--node-x", `${x}%`);
    node.style.setProperty("--node-y", `${y}%`);
  }

  /** The complete still composition of one state, with no tween left running. */
  function settle(index = active) {
    stopTweens();
    svg.innerHTML = ribbonPaths(workflows[index].ribbon);
    nodes.forEach((node, i) => place(node, workflows[index].points[i]));
  }

  function select(index: number) {
    if (index === active) return;
    const previous = workflows[active];
    const next = workflows[index];
    active = index;
    stopTweens();
    svg.innerHTML = ribbonPaths(workflows[index].ribbon);
    art.setAttribute("aria-label", next.description);
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    detail.textContent = next.detail;
    nodes.forEach((node, i) => {
      node.querySelector("span")!.textContent = next.nodes[i];
      place(node, previous.points[i]);
    });
    if (motionPreference.matches) {
      settle(index);
      return;
    }
    tweens.push(
      animate(0, 1, {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        onUpdate(progress) {
          if (active !== index) return;
          nodes.forEach((node, i) => {
            const [fromX, fromY] = previous.points[i];
            const [toX, toY] = next.points[i];
            place(node, [
              fromX + (toX - fromX) * progress,
              fromY + (toY - fromY) * progress,
            ]);
          });
        },
        onComplete() {
          if (active !== index) return;
          nodes.forEach((node, i) => place(node, next.points[i]));
        },
      }),
    );
    tweens.push(
      animate(
        svg.querySelectorAll("path"),
        { pathLength: [0, 1] },
        {
          duration: 0.75,
          ease: "easeInOut",
          onComplete() {
            // The draw is finished, so swapping in the still composition cannot
            // be seen; it leaves no drawing state behind for the next choice.
            if (active === index && !motionPreference.matches)
              svg.innerHTML = ribbonPaths(workflows[index].ribbon);
          },
        },
      ),
    );
  }

  const handlers = buttons.map((button, index) => {
    const handler = () => select(index);
    button.addEventListener("click", handler);
    return handler;
  });
  const preferenceChanged = () => {
    if (motionPreference.matches) settle();
  };
  motionPreference.addEventListener("change", preferenceChanged);
  return () => {
    stopTweens();
    buttons.forEach((button, i) =>
      button.removeEventListener("click", handlers[i]),
    );
    motionPreference.removeEventListener("change", preferenceChanged);
  };
}
