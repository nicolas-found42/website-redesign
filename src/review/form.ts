import { sectionGloss } from "./target-meta";
import type { Change, FeedbackItem, Kind, Priority } from "./store";
import { clean, isMediaKind, isTextKind, type Target } from "./target";

export const esc = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/**
 * The target as plain context, for the form's own title. Unlike the shared
 * `targetLabel` (a list label, `Heading “…”`), this reads as a sentence —
 * "You picked the heading “…”" — so the element type is context, not a
 * quoted code-like identifier (#129).
 */
const contextLabel = (target: Pick<Target, "element" | "text">) => {
  const sentence = clean(target.text).slice(0, 90);
  const article = /^[aeiou]/i.test(target.element) ? "an" : "a";
  const type = target.element.toLowerCase();
  return sentence
    ? `You picked ${article} ${type} “${sentence}”`
    : `You picked ${article} ${type}`;
};

/**
 * The kind a change is, each with one plain example of what it means. The last
 * entry is a real answer: a reviewer is never forced to pick a taxonomy, and
 * what they wrote decides the kind they didn't pick (#121).
 */
const kinds: [Kind | "", string, string][] = [
  [
    "wording",
    "Wording",
    "Change the exact words — fix a typo or reword a heading",
  ],
  [
    "content",
    "Content",
    "Add, remove or replace information — add a missing link or a missing fact",
  ],
  ["visual", "Visual", "How it looks — the wrong colour or a cramped layout"],
  ["layout", "Layout", "Where things sit — move this section below that one"],
  [
    "",
    "Not sure yet",
    "Leave it to us — we work the kind out from what you write",
  ],
];
const priorities: [Priority, string][] = [
  ["must", "Must change"],
  ["should", "Should change"],
  ["nice", "Nice to have"],
];

// `label` is carried onto the wrapper so a validation summary can name the
// field the reviewer sees, not its internal `name` (#122).
const field = (
  name: string,
  label: string,
  { hint = "", rows = 3, input = false, when = "" } = {},
) => `<div class="field" data-field-label="${esc(label)}"${when ? ` data-when="${when}"` : ""}>
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
) => `<fieldset class="field ${className}" data-field-label="${esc(legend)}" aria-describedby="e-${name}">
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
    <p class="eyebrow">Your feedback on</p>
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
    <p class="hint" id="form-errors" role="alert" data-form-errors></p>
    ${askName ? field("reviewer", "Your name", { input: true, hint: "We save your name in this browser, so you only type it once. A first name is fine — it sits beside your comment so the team knows who to ask." }) : ""}
    ${choices("kind", "What kind of change? (optional)", kinds, "kinds")}
    <div class="kind-fields" data-for="comment">
      ${field("comment", "Your comment", { hint: "Just tell us what you would like changed. You can leave the kind to us." })}
    </div>
    <p class="hint" data-no-text hidden>This has no words to change. For its text, choose Larger area or pick a heading or paragraph instead.</p>

    <div class="kind-fields" data-for="wording">
      <p class="label">Current text</p>
      <blockquote class="current"><p class="current-text" data-current></p><p class="current-where" data-current-where></p></blockquote>
      ${field("proposed", "Change it to", {
        hint: "The saved wording will be exactly what’s in this field. Click in and the current text is selected, ready to replace — or edit it as it is.",
        rows: 4,
      })}
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

    <label class="check"><input type="checkbox" name="everywhere"><span class="check-text">Apply my fix to every place the same thing appears — for example, this heading on other pages.</span></label>

    ${field("why", "Why?", { hint: "What should a visitor understand, feel or do differently?" })}
    ${choices("priority", "How important is it?", priorities, "priority")}
    <fieldset class="field screenshot-field">
      <legend>Screenshot (optional)</legend>
      <p class="hint">Screenshots will be public with your GitHub issue. Check the preview for unintended information. Use a real screenshot showing this target and surrounding page in the state you reviewed.</p>
      <button type="button" data-act="capture">Capture this tab</button>
      <p class="hint" data-capture-hint>Choose this tab in the browser’s sharing prompt. Only the visible page is captured; review controls are hidden.</p>
      <label for="f-screenshot">Attach screenshot file</label>
      <input id="f-screenshot" type="file" accept="image/png" aria-describedby="screenshot-hint">
      <p class="hint" id="screenshot-hint">PNG, up to 8 MB. Images may be resized to fit free delivery limits. Replacing an image keeps the old one until the new preview is ready.</p>
      <div data-screenshot-preview></div>
      <button type="button" data-act="remove-screenshot" hidden>Remove screenshot</button>
      <p class="hint" role="status" aria-live="polite" data-screenshot-status></p>
    </fieldset>
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
  // "Not sure yet" (no kind chosen) still needs somewhere to write, so the
  // target's suggested kind's fields stay on screen (#121).
  const kind = valueOf(form, "kind") || (form.dataset.suggestedKind ?? "");
  form.querySelectorAll<HTMLElement>("[data-for]").forEach((el) => {
    el.hidden =
      el.dataset.for === "comment"
        ? !!valueOf(form, "kind")
        : el.dataset.for !== kind;
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
 * new text replaces the old only while the reviewer hasn't edited it, and it
 * arrives selected so a paste replaces it rather than appending (#118).
 */
export function applyTarget(
  form: HTMLFormElement,
  target: Target,
  can: { widen: boolean; narrow: boolean; repick: boolean },
) {
  const previous = form.dataset.shownText ?? "";
  form.dataset.shownText = target.text;
  form.querySelector("[data-target-name]")!.textContent = contextLabel(target);
  const where = `${target.pageName} › ${sectionGloss(target.section)}`;
  form.querySelector("[data-target-where]")!.textContent = where;
  form.querySelector("[data-current]")!.textContent = target.text;
  // The pinned quote carries where it sits too ("surrounding context"), so the
  // reviewer places the words without collapsing the sheet.
  form.querySelector("[data-current-where]")!.textContent = where;
  const proposed = control<HTMLTextAreaElement>(form, "proposed")!;
  if (!proposed.value || proposed.value === previous) {
    proposed.value = target.text;
    // The text the reviewer is about to replace starts selected: the field's
    // instruction says so, and a paste then lands as the exact replacement.
    proposed.dataset.fresh = "yes";
    if (document.activeElement === proposed) proposed.select();
  }

  const wording = form.querySelector<HTMLInputElement>(
    'input[name="kind"][value="wording"]',
  )!;
  wording.disabled = !target.text;
  if (wording.disabled && wording.checked) wording.checked = false;
  form.querySelector<HTMLElement>("[data-no-text]")!.hidden = !!target.text;
  const suggested = defaultKind(target);
  if (!form.dataset.kindChosen) {
    form
      .querySelectorAll<HTMLInputElement>('input[name="kind"]')
      .forEach((radio) => (radio.checked = radio.value === suggested));
  }
  // Which fields to keep in view when the reviewer hasn't committed to a kind.
  if (suggested) form.dataset.suggestedKind = suggested;
  else delete form.dataset.suggestedKind;

  const tools: [string, boolean][] = [
    ["wider", can.widen],
    ["narrower", can.narrow],
    ["repick", can.repick],
  ];
  for (const [act, enabled] of tools)
    form.querySelector<HTMLButtonElement>(`[data-act="${act}"]`)!.disabled =
      !enabled;
  targets.set(form, target);
  watchFields(form);
  syncForm(form);
}

/** Loads a saved item into the form for editing. */
export function fillForm(form: HTMLFormElement, item: FeedbackItem) {
  const { change } = item;
  form.dataset.kindChosen = "yes";
  form.dataset.suggestedKind = change.kind;
  if (item.kindUncertain || change.kind === "comment") {
    form
      .querySelectorAll<HTMLInputElement>('input[name="kind"]')
      .forEach((radio) => {
        radio.checked = radio.value === "";
      });
  } else setValue(form, "kind", change.kind);
  if (change.kind === "comment") setValue(form, "comment", change.detail);
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
  kindUncertain?: true;
  everywhere: boolean;
  why: string;
  priority: Priority;
}

/** A field the reviewer filled, and the kind it most likely means (#121). */
const inferredKinds = (form: HTMLFormElement, target: Target): Kind[] => {
  const filled = (name: string) => !!valueOf(form, name);
  return [
    ...(filled("proposed") &&
    clean(valueOf(form, "proposed")) !== clean(target.text)
      ? (["wording"] as Kind[])
      : []),
    ...(filled("contentAction") ? (["content"] as Kind[]) : []),
    ...(filled("visualProblem") || filled("visualDesired")
      ? (["visual"] as Kind[])
      : []),
    ...(filled("layoutAction") ? (["layout"] as Kind[]) : []),
  ];
};

/**
 * Reads the form, or says what is missing. Errors name the field and say what
 * a specific answer looks like, since a vague one is what this tool replaces.
 * The kind is optional (#121): when the reviewer hasn't chosen one, the fields
 * they filled decide it, and only a comment nobody has written yet asks for it.
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
  const chosen = valueOf(form, "kind") as Kind | "";
  const inferred = chosen ? [] : inferredKinds(form, target);
  const comment = valueOf(form, "comment");
  const kind =
    chosen ||
    (comment ? "comment" : inferred[0]) ||
    (valueOf(form, "why") ? "comment" : "");
  if (!kind && !inferred.length) {
    errors.push([
      "comment",
      "Write your comment or describe the change below.",
    ]);
  }
  let change: Change | undefined;
  if (kind === "comment")
    change = { kind, detail: comment || valueOf(form, "why") };
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
      ...(!chosen ? { kindUncertain: true as const } : {}),
      everywhere: control(form, "everywhere")!.checked,
      why,
      priority,
    },
  };
}

/** The label the reviewer sees for a field, for the summary line. */
const fieldLabel = (form: HTMLFormElement, name: string) =>
  (
    form
      .querySelector<HTMLElement>(`#f-${name}`)
      ?.closest<HTMLElement>("[data-field-label]") ??
    form
      .querySelector<HTMLElement>(`#e-${name}`)
      ?.closest<HTMLElement>("[data-field-label]")
  )?.dataset.fieldLabel ?? "One answer";

/**
 * Writes the summary announcement (#122): one alert naming how many answers
 * are still needed, the first fix, and the fields waiting behind it, so a
 * screen reader hears a next step and still learns of every outstanding error.
 */
function showSummary(form: HTMLFormElement, errors: [string, string][]) {
  const summary = form.querySelector<HTMLElement>("[data-form-errors]");
  if (!summary) return;
  if (!errors.length) {
    summary.textContent = "";
    return;
  }
  const [first, ...rest] = errors;
  const behind = rest.map(([name]) => fieldLabel(form, name)).join(", ");
  summary.textContent = [
    `${errors.length} ${errors.length === 1 ? "field still needs" : "fields still need"} attention.`,
    `${fieldLabel(form, first[0])}: ${first[1]}`,
    behind ? `Then: ${behind}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Marks the outstanding fields and clears the rest; returns the first one.
 * Progressive by default (#122): one Save reveals only the first fix so no
 * error wall lands at once. Each later Save focuses the next missing answer.
 */
export function showErrors(form: HTMLFormElement, errors: [string, string][]) {
  const shown = new Map(errors.slice(0, 1));
  form.querySelectorAll<HTMLElement>(".field-error").forEach((el) => {
    const name = el.id.slice(2);
    if (!name) return; // the summary block carries its own id
    el.textContent = shown.get(name) ?? "";
    // A radio group's error is described on its fieldset, which cannot be invalid.
    const input = form.querySelector<HTMLElement>(`#f-${name}`);
    if (shown.has(name)) input?.setAttribute("aria-invalid", "true");
    else input?.removeAttribute("aria-invalid");
  });
  showSummary(form, errors);
  const first = errors[0]?.[0];
  return first
    ? (form.querySelector<HTMLElement>(`#f-${first}`) ??
        form.querySelector<HTMLElement>(
          `input[name="${first}"]:not(:disabled)`,
        ))
    : null;
}

/** The active target of each form, so blur validation can re-check a field. */
const targets = new WeakMap<HTMLFormElement, Target>();

/**
 * Validates a field when the reviewer leaves it, so guidance arrives beside
 * the field they just filled instead of piling up on Save (#122). Only fields
 * the reviewer has engaged with are judged: a field that was edited, or one
 * already carrying an error. An untouched field is never scolded — in
 * particular, moving focus between controls must not raise anything, or the
 * DOM would grow under the pointer mid-click.
 */
function watchFields(form: HTMLFormElement) {
  if (form.dataset.fieldsWatched) return;
  form.dataset.fieldsWatched = "yes";
  const touched = new Set<string>();
  form.addEventListener(
    "input",
    (event) => {
      const name = (event.target as HTMLInputElement)?.name;
      if (name) touched.add(name);
    },
    true,
  );
  form.addEventListener(
    "change",
    (event) => {
      const name = (event.target as HTMLInputElement)?.name;
      if (name) touched.add(name);
    },
    true,
  );
  // #118: the prefilled replacement starts replaced, not appended to. The
  // first time the reviewer focuses or clicks into the field, its current text
  // is selected so a paste lands as the exact replacement — but only while the
  // field still holds what we prefilled. The moment they edit it, we stop.
  const proposed = control<HTMLTextAreaElement>(form, "proposed");
  if (proposed) {
    const fresh = () =>
      proposed.dataset.fresh === "yes" &&
      proposed.value === (form.dataset.shownText ?? "");
    proposed.addEventListener("focus", () => {
      if (fresh()) proposed.select();
    });
    proposed.addEventListener("pointerdown", (event) => {
      // A click that lands before focus selects the whole field too;
      // preventDefault keeps a caret-from-click from collapsing that selection.
      if (fresh() && document.activeElement !== proposed) {
        event.preventDefault();
        proposed.focus();
        proposed.select();
      } else if (fresh()) {
        proposed.select();
      }
    });
    proposed.addEventListener("input", () => {
      delete proposed.dataset.fresh;
    });
  }
  form.addEventListener(
    "focusout",
    (event) => {
      const el = event.target as HTMLInputElement;
      const name = el?.name;
      if (!name || !form.elements.namedItem(name)) return;
      const line = form.querySelector<HTMLElement>(`#e-${name}`);
      if (!line) return; // only fields with their own error line
      // Untouched and not already flagged: leave it alone.
      if (!touched.has(name) && !line.textContent) return;
      const target = targets.get(form);
      if (!target) return;
      const { errors } = readForm(form, target);
      const message = errors.find(([field]) => field === name)?.[1];
      line.textContent = message ?? "";
      if (message) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
      // A field that is now fine may still leave a stale summary behind.
      if (!message && form.querySelector("[data-form-errors]")?.textContent)
        showSummary(form, errors);
    },
    true,
  );
}
