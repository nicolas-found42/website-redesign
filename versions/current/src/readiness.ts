import {
  MAX_TOTAL,
  readinessAreas,
  readinessRoutes,
  readinessStages,
  scorecardQuestions,
} from "./readiness-content";
export { scorecardQuestions } from "./readiness-content";
export const readinessLevel = (pct: number): "low" | "mid" | "high" =>
  pct <= 40 ? "low" : pct <= 80 ? "mid" : "high";
export const readinessRoleGroup = (role: string) =>
  role === "Founder or executive"
    ? "exec"
    : [
          "Sales or business development",
          "Marketing",
          "Revenue operations",
          "Strategy and operations",
        ].includes(role)
      ? "gtm"
      : "other";
/** Answers are option indexes, never their points. P1 remains unscored. */
export function scorecardResult(answers: readonly number[], role = "") {
  if (
    answers.length !== scorecardQuestions.length ||
    scorecardQuestions.some(
      (q, i) => !Number.isInteger(answers[i]) || !q.opts[answers[i]],
    )
  )
    throw new RangeError(
      "Complete all 18 questions before generating the report.",
    );
  const points = (i: number) =>
    scorecardQuestions[i].opts[answers[i]].points ?? 0;
  const maximum = (i: number) =>
    Math.max(...scorecardQuestions[i].opts.map((o) => o.points ?? 0));
  const areas = readinessAreas.map((area, index) => {
    const indexes = scorecardQuestions.flatMap((q, i) =>
      q.cat === index ? [i] : [],
    );
    const got = indexes.reduce((sum, i) => sum + points(i), 0);
    const max = indexes.reduce((sum, i) => sum + maximum(i), 0);
    const pct = Math.round((got / max) * 100);
    const level = readinessLevel(pct);
    return {
      ...area,
      got,
      max,
      pct,
      level,
      recommendation: area.advice[level],
    };
  });
  const total = areas.reduce((sum, a) => sum + a.got, 0);
  const pct = Math.round((total / MAX_TOTAL) * 100);
  const stageKey = pct <= 40 ? "found" : pct <= 80 ? "build" : "scale";
  const wins = scorecardQuestions
    .map((q, i) => ({
      q,
      i,
      points: points(i),
      max: maximum(i),
      answer: q.opts[answers[i]].label,
    }))
    .filter(({ q, points, max }) => q.cat !== null && points < max)
    .sort(
      (a, b) =>
        a.points / a.max - b.points / b.max ||
        Number(b.q.cat === 3) - Number(a.q.cat === 3) ||
        a.i - b.i,
    )
    .slice(0, 3);
  const warnings: { title: string; body: string }[] = [];
  if (points(1) <= 1)
    warnings.push({
      title: "Get approved access first",
      body: "You're using a personal account or don't have an approved AI tool. Customer and company information shouldn't go into personal AI accounts, so ask your company for an approved tool before you build workflows on it.",
    });
  if (areas[3].pct <= 40)
    warnings.push({
      title: "Fix safeguards before you build more",
      body: `Your testing and safeguards score is ${areas[3].pct}%. Start with the free Failure Mode Playbook and a simple habit: check facts against the source before anything leaves you.`,
    });
  const assistant = scorecardQuestions[0].opts[answers[0]].label;
  const toolNote =
    assistant === "Claude"
      ? ""
      : `You mostly use ${assistant}. Our skills and courses are taught in Claude, and the habits in this report apply to any assistant.`;
  return {
    total,
    pct,
    stageKey,
    stage: readinessStages[stageKey],
    areas,
    wins,
    warnings,
    toolNote,
    route: readinessRoutes[stageKey][readinessRoleGroup(role)],
    answers: scorecardQuestions.map((q, i) => ({
      question: q.text,
      answer: q.opts[answers[i]].label,
      points: q.cat === null ? null : points(i),
      max: q.cat === null ? null : maximum(i),
    })),
  };
}
export type ReadinessReport = ReturnType<typeof scorecardResult>;
