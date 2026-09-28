import css from "./review.css?inline";
import { sitePath } from "../paths";
import { endReviewSession } from "./activation";
import { createStore, newId, type FeedbackItem } from "./store";
import {
  currentPage,
  describe,
  elementKind,
  pageSections,
  resolve,
  snap,
  targetLabel,
  visibleText,
  widen,
  type Target,
} from "./target";
import { feedbackFile, kindNames, priorityNames, summarize } from "./export";
import {
  applyTarget,
  esc,
  fillForm,
  formMarkup,
  readForm,
  showErrors,
  syncForm,
} from "./form";

const phone = matchMedia("(max-width: 700px)");

/**
 * Review mode: the team points at the exact thing on the page they mean and
 * says precisely what should change. It lives in its own shadow root so the
 * site's styles never reach it and it never shows up in what it reviews.
 * Returns a disposer that removes all of it; saved feedback stays saved.
 */
export function mountReview() {
  const store = createStore();
  const host = document.createElement("div");
  host.id = "found42-review";
  // Lenis leaves wheel events inside the panels to scroll the panels.
  host.setAttribute("data-lenis-prevent", "");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${css}</style>
<div class="review">
  <div class="bar" role="region" aria-label="Review mode">
    <div class="bar-idle">
      <p class="bar-title"><span class="dot" aria-hidden="true"></span>Review mode</p>
      <button type="button" class="primary" data-act="pick">Add feedback</button>
      <button type="button" data-act="list">My feedback <span class="count" data-count>0</span></button>
      <button type="button" data-act="send">Send</button>
      <button type="button" class="quiet" data-act="exit">Exit</button>
    </div>
    <div class="bar-picking" hidden>
      <p>Click the part of the page you want to change.</p>
      <button type="button" data-act="cancel-pick">Cancel</button>
    </div>
    <p class="bar-warning" data-warning hidden>This browser isn’t keeping feedback between pages. Send it before you leave this page.</p>
  </div>
  <div class="highlight" data-highlight hidden><span class="highlight-label" data-highlight-label></span></div>
  <div class="pins" data-pins></div>
  <dialog class="panel" data-panel="form" aria-labelledby="form-title"></dialog>
  <dialog class="panel panel-list" data-panel="list" aria-labelledby="list-title"></dialog>
  <dialog class="panel panel-list" data-panel="send" aria-labelledby="send-title"></dialog>
  <div class="toast" data-toast role="status" aria-live="polite"></div>
</div>`;
  document.body.append(host);
  const pageStyle = document.createElement("style");
  pageStyle.textContent =
    "html.found42-reviewing body{padding-bottom:112px}html.found42-picking,html.found42-picking *{cursor:crosshair!important}";
  document.head.append(pageStyle);
  document.documentElement.classList.add("found42-reviewing");

  const $ = <T extends Element = HTMLElement>(selector: string) =>
    shadow.querySelector<T>(selector)!;
  const root = $(".review");
  const highlight = $("[data-highlight]");
  const pins = $("[data-pins]");
  const toast = $("[data-toast]");
  const formPanel = $<HTMLDialogElement>('[data-panel="form"]');
  const listPanel = $<HTMLDialogElement>('[data-panel="list"]');
  const sendPanel = $<HTMLDialogElement>('[data-panel="send"]');
  const pickButton = $<HTMLButtonElement>('[data-act="pick"]');
  $("[data-warning]").hidden = store.persistent;
  const page = currentPage();

  /* ── Highlight ── */
  let highlighted: Element | null = null;
  const placeHighlight = () => {
    const box = highlighted?.getBoundingClientRect();
    highlight.hidden = !box || (!box.width && !box.height);
    if (!box) return;
    Object.assign(highlight.style, {
      top: `${box.top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
    highlight.classList.toggle("label-below", box.top < 28);
  };
  const showHighlight = (el: Element | null, selected = false) => {
    highlight.classList.toggle("is-selected", selected);
    if (el && el !== highlighted)
      $("[data-highlight-label]").textContent = targetLabel({
        element: elementKind(el),
        text: visibleText(el),
      });
    highlighted = el;
    placeHighlight();
  };

  /* ── Pins: where saved feedback on this page points ── */
  const drawPins = () => {
    const items = store.items();
    $("[data-count]").textContent = String(items.length);
    pins.innerHTML = items
      .map((item, i) =>
        item.target.page === page
          ? `<button type="button" class="pin" data-pin="${item.id}" data-selector="${esc(item.target.selector)}" aria-label="Feedback ${i + 1}: ${esc(kindNames[item.change.kind])} on ${esc(targetLabel(item.target))}">${i + 1}</button>`
          : "",
      )
      .join("");
    placePins();
  };
  const placePins = () =>
    pins.querySelectorAll<HTMLElement>(".pin").forEach((pin) => {
      const box = resolve(pin.dataset.selector!)?.getBoundingClientRect();
      // A pin for something scrolled away hides rather than piling up at an edge.
      pin.hidden =
        !box ||
        (!box.width && !box.height) ||
        box.bottom < 0 ||
        box.top > innerHeight;
      if (!box) return;
      pin.style.top = `${Math.max(4, box.top - 10)}px`;
      pin.style.left = `${Math.min(innerWidth - 32, Math.max(4, box.left - 10))}px`;
    });

  let frame = 0;
  const place = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      placeHighlight();
      placePins();
    });
  };
  addEventListener("scroll", place, { passive: true });
  addEventListener("resize", place);
  const layout = new ResizeObserver(place);
  layout.observe(document.body);

  const say = (message: string) => {
    toast.textContent = message;
    toast.classList.add("is-shown");
    clearTimeout(Number(toast.dataset.timer));
    toast.dataset.timer = String(
      setTimeout(() => toast.classList.remove("is-shown"), 4000),
    );
  };

  /* ── Picking ── */
  let picking = false;
  /** When picking again from an open form, the form resumes afterwards. */
  let resume = false;
  const fromReview = (event: Event) => event.composedPath().includes(host);
  /** The page's own background is not a thing anyone means. */
  const pointable = (el: EventTarget | null): el is Element =>
    el instanceof Element &&
    el !== document.body &&
    el !== document.documentElement;
  const pointMove = (event: PointerEvent) =>
    showHighlight(
      !fromReview(event) && pointable(event.target) ? snap(event.target) : null,
    );
  const pointFocus = (event: FocusEvent) => {
    if (!fromReview(event) && pointable(event.target))
      showHighlight(snap(event.target));
  };
  /** Presses on the page choose; they never follow a link or open anything. */
  const swallow = (event: Event) => {
    if (fromReview(event)) return;
    event.stopImmediatePropagation();
    if (event.type === "mousedown") event.preventDefault();
  };
  const pointChoose = (event: MouseEvent) => {
    if (fromReview(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!pointable(event.target)) return;
    stopPicking();
    choose(snap(event.target));
  };
  const pointKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelPicking();
    } else if (
      (event.key === "Enter" || event.key === " ") &&
      !fromReview(event) &&
      pointable(document.activeElement)
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      stopPicking();
      choose(snap(document.activeElement!));
    }
  };
  const swallowed = [
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "auxclick",
    "dblclick",
  ];
  function startPicking() {
    picking = true;
    root.classList.add("is-picking");
    $(".bar-idle").hidden = true;
    $(".bar-picking").hidden = false;
    document.documentElement.classList.add("found42-picking");
    addEventListener("pointermove", pointMove, true);
    addEventListener("focusin", pointFocus, true);
    addEventListener("click", pointChoose, true);
    addEventListener("keydown", pointKey, true);
    swallowed.forEach((type) => addEventListener(type, swallow, true));
    $<HTMLButtonElement>('[data-act="cancel-pick"]').focus();
  }
  function stopPicking() {
    if (!picking) return;
    picking = false;
    root.classList.remove("is-picking");
    $(".bar-idle").hidden = false;
    $(".bar-picking").hidden = true;
    document.documentElement.classList.remove("found42-picking");
    removeEventListener("pointermove", pointMove, true);
    removeEventListener("focusin", pointFocus, true);
    removeEventListener("click", pointChoose, true);
    removeEventListener("keydown", pointKey, true);
    swallowed.forEach((type) => removeEventListener(type, swallow, true));
    showHighlight(null);
  }
  function cancelPicking() {
    stopPicking();
    const resuming = resume && form;
    resume = false;
    if (resuming) showForm();
    else pickButton.focus();
  }

  /* ── The form ── */
  let selected: Element | null = null;
  /** Elements "Smaller area" steps back through after "Larger area". */
  let trail: Element[] = [];
  let target: Target | undefined;
  let editing: FeedbackItem | undefined;
  let form: HTMLFormElement | null = null;

  const pointTools = () => ({
    widen: !!selected && !!widen(selected),
    narrow: trail.length > 0,
    repick: editing ? editing.target.page === page : true,
  });

  /** Brings the chosen element into view beside the panel, not under it. */
  const reveal = (el: Element) => {
    const box = el.getBoundingClientRect();
    const header =
      document.querySelector(".site-header")?.getBoundingClientRect().height ??
      0;
    const room = phone.matches ? innerHeight * 0.22 : innerHeight;
    if (box.top < header || box.top > header + room - 40)
      scrollTo({ top: scrollY + box.top - header - 16 });
    formPanel.classList.toggle(
      "dock-left",
      box.left + box.width / 2 > innerWidth / 2,
    );
  };

  function choose(el: Element, keepTrail = false) {
    if (!keepTrail) trail = [];
    selected = el;
    target = describe(el);
    if (!form || !resume) newForm();
    resume = false;
    applyTarget(form!, target, pointTools());
    showForm();
  }

  function newForm(item?: FeedbackItem) {
    editing = item;
    formPanel.innerHTML = formMarkup({
      askName: !store.reviewer(),
      sections: pageSections(),
    });
    form = formPanel.querySelector("form")!;
    form.addEventListener("change", (event) => {
      if ((event.target as HTMLInputElement).name === "kind")
        form!.dataset.kindChosen = "yes";
      syncForm(form!);
    });
    // An answered field stops saying what it was missing.
    const answered = (event: Event) => {
      const { name } = event.target as HTMLInputElement;
      const error = form!.querySelector(`#e-${name}`);
      if (error) error.textContent = "";
      (event.target as Element).removeAttribute("aria-invalid");
    };
    form.addEventListener("input", answered);
    form.addEventListener("change", answered);
    form.addEventListener("submit", save);
  }

  function showForm() {
    if (selected) {
      reveal(selected);
      showHighlight(selected, true);
    }
    if (!formPanel.open) formPanel.showModal();
    // The name first, once; then the new words when rewording; else the kind.
    const kind = form?.querySelector<HTMLInputElement>(
      'input[name="kind"]:checked',
    );
    (
      form?.querySelector<HTMLElement>('[name="reviewer"]') ??
      (kind?.value === "wording"
        ? form?.querySelector<HTMLElement>('[name="proposed"]')
        : null) ??
      kind ??
      form?.querySelector<HTMLElement>('input[name="kind"]:not(:disabled)')
    )?.focus();
  }

  function edit(id: string) {
    const item = store.items().find((saved) => saved.id === id);
    if (!item) return;
    listPanel.close();
    const onPage =
      item.target.page === page ? resolve(item.target.selector) : null;
    selected = onPage;
    trail = [];
    target = item.target;
    newForm(item);
    applyTarget(form!, target, pointTools());
    fillForm(form!, item);
    showForm();
  }

  function save(event: SubmitEvent) {
    event.preventDefault();
    if (!form || !target) return;
    const { errors, value } = readForm(form, target);
    const first = showErrors(form, errors);
    if (!value) return first?.focus();
    if (value.reviewer) store.setReviewer(value.reviewer);
    const now = new Date().toISOString();
    const { reviewer, ...answer } = value;
    store.save({
      id: editing?.id ?? newId(),
      created: editing?.created ?? now,
      ...(editing ? { updated: now } : {}),
      reviewer: reviewer ?? editing?.reviewer ?? store.reviewer(),
      target,
      ...answer,
    });
    const count = store.items().length;
    const wasEditing = !!editing;
    formPanel.close();
    drawPins();
    say(
      wasEditing
        ? "Feedback updated."
        : `Feedback saved. You have ${count} ${count === 1 ? "item" : "items"}; send them when you’re done.`,
    );
  }

  formPanel.addEventListener("close", () => {
    if (resume) return;
    showHighlight(null);
    selected = null;
    target = undefined;
    editing = undefined;
    form = null;
    formPanel.replaceChildren();
    pickButton.focus();
  });

  /* ── Your feedback ── */
  function renderList() {
    const items = store.items();
    const pages = [...new Set(items.map(({ target }) => target.page))];
    listPanel.innerHTML = `<div class="panel-head">
  <p class="eyebrow">Review mode</p>
  <h2 id="list-title">Your feedback</h2>
  <p>${items.length ? `${items.length} ${items.length === 1 ? "item is" : "items are"} saved in this browser until you send ${items.length === 1 ? "it" : "them"}.` : "Nothing yet. Choose Add feedback, then click the part of the page you want to change."}</p>
  <button type="button" class="close" data-act="close" aria-label="Close">×</button>
</div>
<div class="panel-body">${pages
      .map((path) => {
        const onPage = items
          .map((item, i) => ({ item, number: i + 1 }))
          .filter(({ item }) => item.target.page === path);
        return `<h3>${esc(onPage[0].item.target.pageName)}</h3><ol class="items">${onPage
          .map(
            ({ item, number }) => `<li>
  <p class="item-head"><span class="num" aria-hidden="true">${number}</span>${kindNames[item.change.kind]} · ${priorityNames[item.priority]}</p>
  <p class="item-where">${esc(item.target.section)} › ${esc(targetLabel(item.target))}</p>
  <p class="item-summary">${esc(summarize(item.change))}</p>
  <div class="item-actions">
    <button type="button" class="chip" data-edit="${item.id}">Edit</button>
    ${
      path === page
        ? `<button type="button" class="chip" data-show="${item.id}">Show on page</button>`
        : `<a class="chip" href="${sitePath(path)}?review&amp;item=${item.id}">Open page</a>`
    }
    <button type="button" class="chip danger" data-delete="${item.id}">Delete</button>
  </div>
</li>`,
          )
          .join("")}</ol>`;
      })
      .join("")}</div>
<div class="panel-foot">
  <button type="button" class="primary" data-act="send"${items.length ? "" : " disabled"}>Send…</button>
  <button type="button" data-act="close">Close</button>
</div>`;
  }

  /* ── Send ── */
  let sending: ReturnType<typeof feedbackFile> | undefined;
  function renderSend() {
    const items = store.items();
    const reviewer = store.reviewer();
    const file = items.length ? feedbackFile(items, reviewer) : undefined;
    sending = file;
    sendPanel.innerHTML = `<div class="panel-head">
  <p class="eyebrow">Review mode</p>
  <h2 id="send-title">Send your feedback</h2>
  <p>${file ? `${items.length} ${items.length === 1 ? "item" : "items"} from ${esc(reviewer)}. Download the file and attach it, or copy it and paste it into Slack or an email.` : "Nothing to send yet."}</p>
  <button type="button" class="close" data-act="close" aria-label="Close">×</button>
</div>
${
  file
    ? `<div class="panel-body">
  <div class="send-actions">
    <button type="button" class="primary" data-act="download" autofocus>Download file</button>
    <button type="button" data-act="copy">Copy to clipboard</button>
  </div>
  <p class="hint">The file names the page, section and element for each item, with its current text, so nobody has to guess what you meant.</p>
  <label class="label" for="send-preview">What gets sent</label>
  <textarea id="send-preview" class="preview" readonly rows="12">${esc(file.text)}</textarea>
  <div class="send-clear">
    <p class="hint">Once it’s sent, clear this browser’s copy so the next round starts empty.</p>
    <button type="button" class="chip danger" data-act="clear">Clear my feedback</button>
  </div>
</div>`
    : ""
}
<div class="panel-foot"><button type="button" data-act="close">Close</button></div>`;
  }

  function download() {
    const file = sending;
    if (!file) return;
    const url = URL.createObjectURL(
      new Blob([file.text], { type: "text/markdown" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    shadow.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say(`Downloaded ${file.name}.`);
  }

  async function copy() {
    const preview = sendPanel.querySelector<HTMLTextAreaElement>(".preview");
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.value);
    } catch {
      preview.focus();
      preview.select();
      return say("It’s selected below: press ⌘C or Ctrl+C to copy it.");
    }
    say("Copied. Paste it into Slack or an email.");
  }

  /** Asks once more before anything is deleted: the button says what the next press does. */
  const confirmed = (button: HTMLButtonElement, label: string) => {
    if (button.dataset.armed) return true;
    button.dataset.armed = "yes";
    button.textContent = label;
    return false;
  };

  /* ── Controls ── */
  function onPress(event: Event) {
    const button = (event.target as Element).closest<HTMLElement>("button, a");
    if (!button || (button as HTMLButtonElement).disabled) return;
    const act = button.dataset.act;
    const panel = button.closest("dialog");
    if (act === "pick") startPicking();
    else if (act === "cancel-pick") cancelPicking();
    else if (act === "list") {
      renderList();
      listPanel.showModal();
    } else if (act === "send") {
      listPanel.close();
      renderSend();
      sendPanel.showModal();
    } else if (act === "exit") exit();
    else if (act === "close") panel?.close();
    else if (act === "wider" && selected) {
      const wider = widen(selected);
      if (wider) {
        trail.push(selected);
        resume = true;
        choose(wider, true);
      }
    } else if (act === "narrower") {
      const narrower = trail.pop();
      if (narrower) {
        resume = true;
        choose(narrower, true);
      }
    } else if (act === "repick") {
      resume = true;
      formPanel.close();
      startPicking();
    } else if (act === "download") download();
    else if (act === "copy") void copy();
    else if (act === "clear") {
      if (!confirmed(button as HTMLButtonElement, "Delete all of it?")) return;
      store.clear();
      drawPins();
      sendPanel.close();
      say("Cleared. This browser has no feedback saved.");
    } else if (button.dataset.edit) edit(button.dataset.edit);
    else if (button.dataset.pin) edit(button.dataset.pin);
    else if (button.dataset.show) {
      const item = store.items().find(({ id }) => id === button.dataset.show);
      const el = item && resolve(item.target.selector);
      listPanel.close();
      if (el) flash(el);
      else
        say("That part of the page has changed since, so it can’t be found.");
    } else if (button.dataset.delete) {
      if (!confirmed(button as HTMLButtonElement, "Delete it?")) return;
      store.remove(button.dataset.delete);
      drawPins();
      renderList();
      listPanel.querySelector<HTMLElement>("h2")?.focus();
    }
  }
  shadow.addEventListener("click", onPress);

  /** Scrolls to an element and marks it for a moment. */
  function flash(el: Element) {
    el.scrollIntoView({ block: "center" });
    showHighlight(el, true);
    setTimeout(() => {
      if (highlighted === el && !formPanel.open) showHighlight(null);
    }, 2400);
  }

  function exit() {
    endReviewSession();
    const url = new URL(location.href);
    url.searchParams.delete("review");
    url.searchParams.delete("item");
    history.replaceState(history.state, "", url);
    dispose();
  }

  function dispose() {
    stopPicking();
    cancelAnimationFrame(frame);
    removeEventListener("scroll", place);
    removeEventListener("resize", place);
    layout.disconnect();
    shadow.removeEventListener("click", onPress);
    document.documentElement.classList.remove("found42-reviewing");
    pageStyle.remove();
    host.remove();
  }

  drawPins();
  /** A link from "Open page" arrives with the item to show. */
  const shown = new URL(location.href).searchParams.get("item");
  const item = shown && store.items().find(({ id }) => id === shown);
  if (item) {
    const el = resolve(item.target.selector);
    if (el) requestAnimationFrame(() => flash(el));
  }
  return dispose;
}
