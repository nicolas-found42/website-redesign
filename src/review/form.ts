import type { Change, FeedbackItem, Kind, Priority } from "./store";
import {
  clean,
  isMediaKind,
  isTextKind,
  targetLabel,
  type Target,
} from "./target";

export const esc = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

const kinds: [Kind, string, string][] = [
  ["wording", "Wording", "Change the exact words"],
  ["content", "Content", "Add, remove or replace information"],
  ["visual", "Visual", "How it looks: colour, type, images, spacing"],
  ["layout", "Layout", "Where things sit, their order and structure"],
];
const priorities: [Priority, string][] = [
  ["must", "Must change"],
  ["should", "Should change"],
  ["nice", "Nice to have"],
];

const field = (
  name: string,
  label: string,
  { hint = "", rows = 3, input = false, when = "" } = {},
) => `<div class="field"${when ? ` data-when="${when}"` : ""}>
  <label for="f-${name}">${label}</label>
  ${hint ? `<p class="hint" id="h-${name}">${hint}</p>` : ""}
  ${
    input
      ? `<input id="f-${name}" name="${name}" aria-describedby="${hint ? `h-${name} ` : ""}e-${name}">`
      : `<textarea id="f-${name}" name="${name}" rows="${rows}" aria-describedby="${hint ? `h-${name} ` : ""}e-${name}"></textarea>`
  }
  <p class="field-error" id="e-${name}"></p>
</div>`;

const choices = (
  name: string,
  legend: string,
  options: [string, string, string?][],
  className = "",
) => `<fieldset class="field ${className}" aria-describedby="e-${name}">
  <legend>${legend}</legend>
  <div class="choices">${options
    .map(
      ([value, label, hint]) =>
        `<label class="choice"><input type="radio" name="${name}" value="${value}"><span class="choice-name">${label}</span>${hint ? `<span class="choice-hint">${hint}</span>` : ""}</label>`,
    )
    .join("")}</div>
  <p class="field-error" id="e-${name}"></p>
</fieldset>`;

/**
 * The feedback form. Every kind of change asks for the specific answer that
 * kind is usually missing — the new words, the content itself, what it should
 * look like, where it should go — and every item asks why and how much it
 * matters.
 */
export function formMarkup({
  askName,
  sections,
}: {
  askName: boolean;
  sections: { name: string; selector: string }[];
}) {
  const sectionOptions = sections
    .map(
      ({ name, selector }) =>
        `<option value="${esc(selector)}">${esc(name)}</option>`,
    )
    .join("");
  return `<form class="feedback-form" novalidate>
  <div class="panel-head">
    <p class="eyebrow">Feedback on</p>
    <h2 id="form-title" data-target-name></h2>
    <p class="where" data-target-where></p>
    <div class="target-tools">
      <button type="button" class="chip" data-act="wider">Larger area</button>
      <button type="button" class="chip" data-act="narrower">Smaller area</button>
      <button type="button" class="chip" data-act="repick">Pick again</button>
    </div>
    <button type="button" class="close" data-act="close" aria-label="Close without saving">×</button>
  </div>
  <div class="panel-body">
    ${askName ? field("reviewer", "Your name", { input: true, hint: "So the team knows who to ask. You’re asked once." }) : ""}
    ${choices("kind", "What kind of change?", kinds, "kinds")}
    <p class="hint" data-no-text hidden>This has no words to change. For its text, choose Larger area or pick a heading or paragraph instead.</p>

    <div class="kind-fields" data-for="wording">
      <p class="label">Current text</p>
      <blockquote class="current" data-current></blockquote>
      ${field("proposed", "Change it to", { hint: "Edit it into exactly what it should say.", rows: 4 })}
    </div>

    <div class="kind-fields" data-for="content">
      ${choices("contentAction", "What should happen?", [
        ["add", "Add something"],
        ["remove", "Remove this"],
        ["replace", "Replace it"],
      ])}
      <div class="field" data-when="contentAction:add">
        <label for="f-contentPosition">Where should it go?</label>
        <select id="f-contentPosition" name="contentPosition">
          <option value="after">After this</option>
          <option value="before">Before this</option>
          <option value="inside">Inside this</option>
        </select>
      </div>
      ${field("contentDetail", "What exactly should be added?", {
        hint: "Write the content itself if you can, not a description of it.",
        rows: 4,
        when: "contentAction:add replace",
      })}
    </div>

    <div class="kind-fields" data-for="visual">
      ${field("visualProblem", "What looks wrong?", { hint: "Be specific: which colour, line, image, size or spacing." })}
      ${field("visualDesired", "What should it look or feel like instead?")}
      ${field("visualExample", "Example to follow (optional)", { input: true, hint: "A link, or a place on this site that already looks right." })}
    </div>

    <div class="kind-fields" data-for="layout">
      ${choices("layoutAction", "What should change?", [
        ["move", "Move it"],
        ["remove", "Remove it"],
        ["combine", "Combine it with another section"],
        ["reorder", "Change the order of what’s inside"],
        ["other", "Something else"],
      ])}
      <div class="field field-row" data-when="layoutAction:move combine">
        <div data-when="layoutAction:move">
          <label for="f-layoutPosition">Move it</label>
          <select id="f-layoutPosition" name="layoutPosition">
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <div>
          <label for="f-layoutRelative">Section</label>
          <select id="f-layoutRelative" name="layoutRelative">${sectionOptions}</select>
        </div>
      </div>
      ${field("layoutDetail", "What order should it be in?", { rows: 4, when: "layoutAction:reorder other" })}
      ${field("layoutNotes", "Anything else? (optional)", { when: "layoutAction:move remove combine" })}
    </div>

    <label class="check"><input type="checkbox" name="everywhere"> Change this everywhere it appears on the site</label>

    ${field("why", "Why?", { hint: "What should a visitor understand, feel or do differently?" })}
    ${choices("priority", "How important is it?", priorities, "priority")}
  </div>
  <div class="panel-foot">
    <button type="submit" class="primary">Save feedback</button>
    <button type="button" data-act="close">Cancel</button>
  </div>
</form>`;
}

const control = <T = HTMLInputElement>(form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as T | null;
const valueOf = (form: HTMLFormElement, name: string) =>
  (control<RadioNodeList | HTMLInputElement>(form, name)?.value ?? "").trim();
const setValue = (form: HTMLFormElement, name: string, value = "") => {
  const el = control<RadioNodeList | HTMLInputElement>(form, name);
  if (el) el.value = value;
};

/** Shows the fields the chosen kind and action need, and only those. */
export function syncForm(form: HTMLFormElement) {
  const kind = valueOf(form, "kind");
  form.querySelectorAll<HTMLElement>("[data-for]").forEach((el) => {
    el.hidden = el.dataset.for !== kind;
  });
  form.querySelectorAll<HTMLElement>("[data-when]").forEach((el) => {
    const [name, values] = el.dataset.when!.split(":");
    el.hidden = !values.split(" ").includes(valueOf(form, name));
  });
  const contentLabel = form.querySelector('label[for="f-contentDetail"]');
  if (contentLabel)
    contentLabel.textContent =
      valueOf(form, "contentAction") === "replace"
        ? "What exactly should replace it?"
        : "What exactly should be added?";
  const relativeLabel = form.querySelector('label[for="f-layoutRelative"]');
  if (relativeLabel)
    relativeLabel.textContent =
      valueOf(form, "layoutAction") === "combine"
        ? "Combine it with"
        : "Section";
  const layoutLabel = form.querySelector('label[for="f-layoutDetail"]');
  if (layoutLabel)
    layoutLabel.textContent =
      valueOf(form, "layoutAction") === "reorder"
        ? "What order should it be in?"
        : "What should change?";
}

const defaultKind = (target: Target): Kind | "" =>
  isTextKind(target.element) && target.text
    ? "wording"
    : isMediaKind(target.element)
      ? "visual"
      : target.element === "Section"
        ? "layout"
        : "";

/**
 * Points the form at `target`. Choices the reviewer already made stay; the
 * new text replaces the old only while the reviewer hasn't edited it.
 */
export function applyTarget(
  form: HTMLFormElement,
  target: Target,
  can: { widen: boolean; narrow: boolean; repick: boolean },
) {
  const previous = form.dataset.shownText ?? "";
  form.dataset.shownText = target.text;
  form.querySelector("[data-target-name]")!.textContent = targetLabel(target);
  form.querySelector("[data-target-where]")!.textContent =
    `${target.pageName} › ${target.section}`;
  form.querySelector("[data-current]")!.textContent = target.text;
  const proposed = control<HTMLTextAreaElement>(form, "proposed")!;
  if (!proposed.value || proposed.value === previous)
    proposed.value = target.text;

  const wording = form.querySelector<HTMLInputElement>(
    'input[name="kind"][value="wording"]',
  )!;
  wording.disabled = !target.text;
  if (wording.disabled && wording.checked) wording.checked = false;
  form.querySelector<HTMLElement>("[data-no-text]")!.hidden = !!target.text;
  if (!form.dataset.kindChosen) {
    const kind = defaultKind(target);
    form
      .querySelectorAll<HTMLInputElement>('input[name="kind"]')
      .forEach((radio) => (radio.checked = radio.value === kind));
  }

  const tools: [string, boolean][] = [
    ["wider", can.widen],
    ["narrower", can.narrow],
    ["repick", can.repick],
  ];
  for (const [act, enabled] of tools)
    form.querySelector<HTMLButtonElement>(`[data-act="${act}"]`)!.disabled =
      !enabled;
  syncForm(form);
}

/** Loads a saved item into the form for editing. */
export function fillForm(form: HTMLFormElement, item: FeedbackItem) {
  const { change } = item;
  form.dataset.kindChosen = "yes";
  setValue(form, "kind", change.kind);
  if (change.kind === "wording") setValue(form, "proposed", change.proposed);
  if (change.kind === "content") {
    setValue(form, "contentAction", change.action);
    setValue(form, "contentPosition", change.position ?? "after");
    setValue(form, "contentDetail", change.detail);
  }
  if (change.kind === "visual") {
    setValue(form, "visualProblem", change.problem);
    setValue(form, "visualDesired", change.desired);
    setValue(form, "visualExample", change.example);
  }
  if (change.kind === "layout") {
    setValue(form, "layoutAction", change.action);
    setValue(form, "layoutPosition", change.position ?? "above");
    if (change.relativeTo) {
      const select = control<HTMLSelectElement>(form, "layoutRelative")!;
      if (
        ![...select.options].some(
          (o) => o.value === change.relativeTo!.selector,
        )
      )
        select.add(
          new Option(change.relativeTo.name, change.relativeTo.selector),
        );
      select.value = change.relativeTo.selector;
    }
    setValue(
      form,
      change.action === "reorder" || change.action === "other"
        ? "layoutDetail"
        : "layoutNotes",
      change.detail,
    );
  }
  control(form, "everywhere")!.checked = item.everywhere;
  setValue(form, "why", item.why);
  setValue(form, "priority", item.priority);
  syncForm(form);
}

export interface FormValue {
  reviewer?: string;
  change: Change;
  everywhere: boolean;
  why: string;
  priority: Priority;
}

/**
 * Reads the form, or says what is missing. Errors name the field and say what
 * a specific answer looks like, since a vague one is what this tool replaces.
 */
export function readForm(
  form: HTMLFormElement,
  target: Target,
): { errors: [string, string][]; value?: FormValue } {
  const errors: [string, string][] = [];
  const need = (name: string, message: string) => {
    const value = valueOf(form, name);
    if (!value) errors.push([name, message]);
    return value;
  };
  const reviewer = control(form, "reviewer")
    ? need("reviewer", "Add your name.")
    : undefined;
  const kind = need("kind", "Choose what kind of change this is.") as Kind;
  let change: Change | undefined;
  if (kind === "wording") {
    const proposed = control<HTMLTextAreaElement>(
      form,
      "proposed",
    )!.value.trim();
    if (!proposed)
      errors.push(["proposed", "Write the text it should say instead."]);
    else if (clean(proposed) === clean(target.text))
      errors.push([
        "proposed",
        "This still matches the current text. Edit it into what it should say.",
      ]);
    change = { kind, current: target.text, proposed };
  }
  if (kind === "content") {
    const action = need("contentAction", "Choose add, remove or replace.") as
      "add" | "remove" | "replace";
    const detail =
      action === "add" || action === "replace"
        ? need(
            "contentDetail",
            action === "add"
              ? "Write what should be added."
              : "Write what should replace it.",
          )
        : "";
    change = {
      kind,
      action,
      detail,
      ...(action === "add"
        ? {
            position: valueOf(form, "contentPosition") as
              "before" | "after" | "inside",
          }
        : {}),
    };
  }
  if (kind === "visual")
    change = {
      kind,
      problem: need("visualProblem", "Say what looks wrong."),
      desired: need(
        "visualDesired",
        "Say what it should look or feel like instead.",
      ),
      example: valueOf(form, "visualExample"),
    };
  if (kind === "layout") {
    const action = need(
      "layoutAction",
      "Choose what should change.",
    ) as Extract<Change, { kind: "layout" }>["action"];
    const select = control<HTMLSelectElement>(form, "layoutRelative")!;
    const relative =
      action === "move" || action === "combine"
        ? {
            name: select.selectedOptions[0]?.textContent ?? "",
            selector: select.value,
          }
        : undefined;
    const detail =
      action === "reorder" || action === "other"
        ? need(
            "layoutDetail",
            action === "reorder"
              ? "Write the order it should be in."
              : "Describe the change.",
          )
        : valueOf(form, "layoutNotes");
    change = {
      kind,
      action,
      detail,
      ...(relative ? { relativeTo: relative } : {}),
      ...(action === "move"
        ? { position: valueOf(form, "layoutPosition") as "above" | "below" }
        : {}),
    };
  }
  const why = need(
    "why",
    "Say why, so the change can be judged against what it’s for.",
  );
  const priority = need("priority", "Choose how important it is.") as Priority;
  if (errors.length || !change) return { errors };
  return {
    errors,
    value: {
      ...(reviewer ? { reviewer } : {}),
      change,
      everywhere: control(form, "everywhere")!.checked,
      why,
      priority,
    },
  };
}

/** Marks each field in `errors` and clears the rest; returns the first one. */
export function showErrors(form: HTMLFormElement, errors: [string, string][]) {
  const failed = new Map(errors);
  form.querySelectorAll<HTMLElement>(".field-error").forEach((el) => {
    const name = el.id.slice(2);
    el.textContent = failed.get(name) ?? "";
    // A radio group's error is described on its fieldset, which cannot be invalid.
    const input = form.querySelector<HTMLElement>(`#f-${name}`);
    if (failed.has(name)) input?.setAttribute("aria-invalid", "true");
    else input?.removeAttribute("aria-invalid");
  });
  const first = errors[0]?.[0];
  return first
    ? (form.querySelector<HTMLElement>(`#f-${first}`) ??
        form.querySelector<HTMLElement>(
          `input[name="${first}"]:not(:disabled)`,
        ))
    : null;
}
