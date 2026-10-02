import { reviewTabCapture, screenshotFile } from "./screenshot";
import type { Screenshot } from "./model";
import css from "./review.css?inline";
import { submitDrafts, sendLabel, submissionUrl } from "./submission";
import { sitePath } from "../paths";
import { endReviewSession } from "./activation";
import { publicSite } from "./submission-contract";
import { createStore, storageKey, newId, type FeedbackItem } from "./store";
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

/** The warning every surface carries. Sending is impossible without reading it. */
const publicNotice =
  "Your feedback, name and any screenshots will be posted publicly on GitHub.";

/**
 * Beside the warning, the plain-English answer to "what does public mean?".
 * Native `<details>`: keyboard reachable, openable without JavaScript.
 */
const noticeDetail = (style: string) => `<details data-notice-detail style="${style}">
  <summary style="cursor:pointer;display:inline;font-weight:650;text-decoration:underline;text-underline-offset:2px">What does “publicly on GitHub” mean?</summary>
  <p style="margin:6px 0 0">Your comment and your first name appear on a public list where the team works through the feedback. A first name is enough — it shows next to your comment so the team knows who to ask.</p>
  <p style="margin:6px 0 0">Nothing else is shared: no email address, no account and no tracking.</p>
</details>`;
/**
 * The explainer sits on the warning's own line, so the resting bar keeps the
 * height it had before this copy existed and the page reserves the same space.
 */
const barNoticeStyle = "display:inline-block;font-weight:inherit;max-width:none;padding:0;color:#d4d3cc;font-size:12px";
/** The explainer inside a panel, where it sits with other muted hints. */
const panelNoticeStyle = "max-width:60ch;font-size:13px;color:#5e5e58";

/** The tool's own id for the band a page opens with. Reviewers read it plainly. */
const sectionGloss = (section: string) =>
  section === "Page opening" ? "Top of this page" : section;

/** Where an item points, as context a reviewer reads — never a raw sitemap id. */
const whereLine = (target: FeedbackItem["target"]) =>
  [target.pageName, sectionGloss(target.section), targetLabel(target)]
    .filter(Boolean)
    .join(" · ");

const targetReason = "tool-reason";

/**
 * Review mode: the team points at the exact thing on the page they mean and
 * says precisely what should change. It lives in its own shadow root so the
 * site's styles never reach it and it never shows up in what it reviews.
 * Returns a disposer that removes all of it; saved feedback stays saved.
 */
export function mountReview() {
  const store = createStore();
  const capture = reviewTabCapture();
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
      <button type="button" data-act="send" disabled>Send 0 feedback items</button>
      <button type="button" data-act="receipt" hidden>Last receipt</button>
      <button type="button" class="quiet" data-act="exit">Exit</button>
    </div>
    <div class="bar-picking" hidden>
      <p>Click the part of the page you want to change.</p>
      <button type="button" data-act="cancel-pick">Cancel</button>
    </div>
    <div class="bar-notice-row" style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><p class="bar-notice">${publicNotice}</p>${noticeDetail(barNoticeStyle)}</div>
    <p class="bar-warning" data-sending-warning hidden>Sending to the team isn’t switched on yet. You can still write and save feedback here, then copy or download it to send by email.</p>
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
    "html.found42-reviewing body{padding-bottom:var(--found42-review-space,112px)}html.found42-picking,html.found42-picking *{cursor:crosshair!important}";
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
  // Said in the bar before anything is written, so the fallback never surprises.
  $("[data-sending-warning]").hidden = !!submissionUrl;
  const page = currentPage();
  const bar = $(".bar");
  const reserveBar = () =>
    document.documentElement.style.setProperty(
      "--found42-review-space",
      `${Math.ceil(bar.getBoundingClientRect().height + 48)}px`,
    );
  const barLayout = new ResizeObserver(reserveBar);
  barLayout.observe(bar);
  reserveBar();

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

  let submitting = false;
  let sentCount = 0;
  let sendTotal = 0;

  const syncSendButtons = () => {
    shadow
      .querySelectorAll<HTMLButtonElement>('[data-act="send"]')
      .forEach((button) => {
        button.disabled = submitting || !store.items().length;
        button.textContent = submitting
          ? "Sending…"
          : sendLabel(store.items().length);
      });
    $('[data-act="receipt"]').hidden = !store.receipts().length;
    shadow
      .querySelectorAll<HTMLButtonElement>('[data-act="retry"]')
      .forEach((button) => {
        button.disabled = submitting || !store.items().length;
      });
    shadow
      .querySelectorAll<HTMLButtonElement>('[data-act="copy-text"]')
      .forEach((button) => {
        button.disabled = !store.items().length;
      });
    $("[data-warning]").hidden = store.persistent;
  };

  /* ── Pins: where saved feedback on this page points ── */
  const drawPins = () => {
    const items = store.items();
    $("[data-count]").textContent = String(items.length);
    syncSendButtons();
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
      choose(snap(document.activeElement));
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
  let screenshot: Screenshot | undefined;
  let imageBusy = false;
  let imageGeneration = 0;

  const pointTools = () => ({
    widen: !!selected && !!widen(selected),
    narrow: trail.length > 0,
    repick: editing ? editing.target.page === page : true,
  });

  /**
   * Names each target tool by its effect and never leaves a dead grey button:
   * an impossible tool is renamed for the reviewer, described by its reason and
   * explained on screen, while keeping the stable accessible name the shipped
   * journey looks for.
   */
  function showTools() {
    if (!form) return;
    const can = pointTools();
    let reason = form.querySelector<HTMLElement>(`[data-reason="${targetReason}"]`);
    if (!reason) {
      reason = document.createElement("p");
      reason.className = "tool-reason";
      reason.dataset.reason = targetReason;
      reason.id = targetReason;
      reason.style.cssText =
        "margin:6px 0 0;color:#5e5e58;font-size:13px;display:none";
      form.querySelector(".target-tools")?.after(reason);
    }
    const tools: { act: string; name: string; impossible: string }[] = [
      {
        act: "wider",
        name: "Larger area — select a bigger part of the page",
        impossible: "nothing larger to select here",
      },
      {
        act: "narrower",
        name: "Smaller area — go back to the smaller part",
        impossible: "already the smallest part of this selection",
      },
      {
        act: "repick",
        name: "Pick again — choose a different part of the page",
        impossible: "this page isn’t open for picking",
      },
    ];
    for (const tool of tools) {
      const button = form.querySelector<HTMLButtonElement>(
        `[data-act="${tool.act}"]`,
      );
      if (!button) continue;
      const enabled =
        tool.act === "wider"
          ? can.widen
          : tool.act === "narrower"
            ? can.narrow
            : can.repick;
      button.disabled = !enabled;
      button.setAttribute(
        "aria-label",
        enabled ? tool.name : `${tool.name} — ${tool.impossible}`,
      );
      // #125: an impossible tool is never a silent grey pill. It stays put and
      // self-explaining instead of vanishing, so the shipped journey can still
      // find it, name it and assert its disabled state.
      if (enabled) button.removeAttribute("aria-describedby");
      else button.setAttribute("aria-describedby", targetReason);
    }
    reason.textContent = !can.widen && !can.narrow
      ? "You’ve reached the smallest and largest part of this selection."
      : !can.widen
        ? "There’s nothing larger around this to select."
        : !can.narrow
          ? "Already the smallest part of this selection."
          : "";
    reason.style.display = !can.widen || !can.narrow ? "block" : "none";
  }

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
    screenshot = undefined;
    imageGeneration++;
    if (!form || !resume) newForm();
    resume = false;
    applyTarget(form!, target, pointTools());
    showTools();
    showScreenshot();
    showForm();
  }

  function newForm(item?: FeedbackItem) {
    editing = item;
    screenshot = item?.screenshot;
    imageGeneration++;
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
    form
      .querySelector<HTMLInputElement>("#f-screenshot")!
      .addEventListener("change", (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) void changeScreenshot(() => screenshotFile(file));
      });
    form.querySelector<HTMLButtonElement>('[data-act="capture"]')!.disabled =
      !capture.available || !selected;
    if (!capture.available)
      form.querySelector<HTMLElement>("[data-capture-hint]")!.textContent =
        "Native tab capture is unavailable here. Attach a screenshot file or continue with written feedback.";
    showScreenshot();
  }

  function showScreenshot() {
    if (!form || !target) return;
    const preview = form.querySelector<HTMLElement>(
      "[data-screenshot-preview]",
    )!;
    preview.replaceChildren();
    if (screenshot?.dataUrl) {
      const image = document.createElement("img");
      image.src = screenshot.dataUrl;
      image.alt = `Screenshot of ${target.element} in ${target.section} on ${target.pageName}`;
      preview.append(image);
      const caption = document.createElement("p");
      caption.className = "hint";
      caption.textContent = `${screenshot.source === "tab" ? "Native tab capture" : "Attached screenshot — check that target and reviewed state match"}. ${screenshot.width} × ${screenshot.height}.`;
      preview.append(caption);
    }
    form.querySelector<HTMLButtonElement>(
      '[data-act="remove-screenshot"]',
    )!.hidden = !screenshot;
  }

  async function changeScreenshot(load: () => Promise<Screenshot>) {
    if (!form || imageBusy) return;
    const current = form;
    const generation = ++imageGeneration;
    imageBusy = true;
    const status = current.querySelector<HTMLElement>(
      "[data-screenshot-status]",
    )!;
    status.textContent = "Preparing screenshot…";
    current
      .querySelectorAll<HTMLButtonElement | HTMLInputElement>(
        "button, #f-screenshot",
      )
      .forEach((control) => {
        control.dataset.wasDisabled = String(control.disabled);
        control.disabled = true;
      });
    try {
      const next = await load();
      if (generation !== imageGeneration || form !== current) return;
      screenshot = next;
      if (next.source === "tab" && selected) {
        target = describe(selected);
        applyTarget(current, target, pointTools());
      }
      showScreenshot();
      status.textContent =
        "Screenshot ready. Inspect it before saving and sending.";
    } catch (error) {
      if (form === current)
        status.textContent =
          error instanceof Error
            ? error.message
            : "Screenshot failed. Your written feedback is unchanged; continue without it.";
    } finally {
      imageBusy = false;
      current
        .querySelectorAll<HTMLButtonElement | HTMLInputElement>(
          "[data-was-disabled]",
        )
        .forEach((control) => {
          control.disabled = control.dataset.wasDisabled === "true";
          delete control.dataset.wasDisabled;
        });
      current.querySelector<HTMLInputElement>("#f-screenshot")!.value = "";
    }
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
    showTools();
    fillForm(form!, item);
    showForm();
  }

  function save(event: SubmitEvent) {
    event.preventDefault();
    if (!form || !target || imageBusy) return;
    const { errors, value } = readForm(form, target);
    const first = showErrors(form, errors);
    if (!value) return first?.focus();
    if (value.reviewer) store.setReviewer(value.reviewer);
    const now = new Date().toISOString();
    const { reviewer, ...answer } = value;
    const imageOmitted = store.save({
      id: editing?.id ?? newId(),
      created: editing?.created ?? now,
      ...(editing ? { updated: now } : {}),
      reviewer: reviewer ?? editing?.reviewer ?? store.reviewer(),
      target,
      ...(screenshot ? { screenshot } : {}),
      ...answer,
    });
    const count = store.items().length;
    const wasEditing = !!editing;
    formPanel.close();
    drawPins();
    say(
      imageOmitted
        ? "Written feedback saved. Browser storage is full, so this screenshot was not saved. Send existing drafts or remove an image before attaching it again."
        : wasEditing
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
    screenshot = undefined;
    imageGeneration++;
    formPanel.replaceChildren();
    // The native dialog restores focus. Its deferred close event must not
    // steal focus from Send or another control the reviewer has already chosen.
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
  <p class="item-where">${esc(whereLine(item.target))}</p>
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
  <button type="button" class="primary" data-act="send"${items.length && !submitting ? "" : " disabled"}>${submitting ? "Sending…" : sendLabel(items.length)}</button>
  <button type="button" data-act="backup"${items.length ? "" : " disabled"}>Download backup…</button>
  <p class="hint">${publicNotice}</p>
  ${noticeDetail(panelNoticeStyle)}
  <button type="button" data-act="close">Close</button>
</div>`;
  }

  /* ── Send ── */
  let sending: ReturnType<typeof feedbackFile> | undefined;
  function renderReceipt() {
    if (sendPanel.dataset.mode !== "receipt") {
      sendPanel.dataset.mode = "receipt";
      sendPanel.innerHTML = `<div class="panel-head">
        <p class="eyebrow">Review mode</p>
        <h2 id="send-title" tabindex="-1">Feedback receipt</h2>
        <button type="button" class="close" data-act="close" aria-label="Close">×</button>
      </div>
      <div class="panel-body">
        <p role="status" aria-live="polite" data-progress></p>
        <ol class="items" data-receipts></ol>
        <p class="hint">Confirmed submitted versions leave your draft list. Revisions stay saved as new feedback. Discussion and changes to published issues happen on GitHub.</p>
        <p class="hint">${publicNotice}</p>
        ${noticeDetail(panelNoticeStyle)}
      </div>
      <div class="panel-foot">
        <button type="button" class="primary" data-act="send"></button>
        <button type="button" data-act="retry"${store.items().length && !submitting ? "" : " disabled"}>Try again</button>
        <button type="button" data-act="copy-text" data-copy-text${store.items().length ? "" : " disabled"}>Copy my feedback as text</button>
        <button type="button" data-act="download"${store.items().length ? "" : " disabled"}>Download a copy</button>
        <button type="button" data-act="close">Close</button>
      </div>`;
    }
    const receipts = store.receipts();
    const confirmed = receipts.filter(
      (item) => item.status === "confirmed",
    ).length;
    sendPanel.querySelector<HTMLElement>("[data-progress]")!.textContent =
      submitting
        ? `Sending feedback: ${sentCount} of ${sendTotal} checked. Please keep this page open.`
        : `${confirmed} ${confirmed === 1 ? "item" : "items"} published. ${store.items().length} ${store.items().length === 1 ? "draft remains" : "drafts remain"} saved in this browser.`;
    sendPanel.querySelector<HTMLElement>("[data-receipts]")!.innerHTML =
      receipts
        .map(
          (receipt) => `<li>
      <p class="item-head">${esc(receipt.label)}</p>
      <p>${esc(receipt.message)}</p>
      ${receipt.status === "confirmed" && receipt.issue ? `<a class="chip" href="${esc(receipt.issue.url)}" target="_blank" rel="noopener noreferrer">Issue #${receipt.issue.number} on GitHub</a>` : ""}
      ${receipt.reason === "screenshot" && store.items().some((item) => item.id === receipt.id && item.screenshot) ? `<button type="button" class="chip" data-without-image="${esc(receipt.id)}"${submitting ? " disabled" : ""}>Send text without screenshot</button>` : ""}
      ${receipt.status === "invalid" && receipt.reason === "content-conflict" && store.items().some((item) => item.id === receipt.id) ? `<button type="button" class="chip" data-new="${esc(receipt.id)}">Save as new feedback</button>` : ""}
    </li>`,
        )
        .join("");
    syncSendButtons();
  }

  async function send() {
    if (submitting || !store.items().length) return;
    submitting = true;
    sentCount = 0;
    sendTotal = store.items().length;
    listPanel.close();
    renderReceipt();
    if (!sendPanel.open) sendPanel.showModal();
    sendPanel.querySelector<HTMLElement>("h2")?.focus();
    try {
      await submitDrafts(store, publicSite, (done, total) => {
        sentCount = done;
        sendTotal = total;
        if (sendPanel.open && sendPanel.dataset.mode === "receipt")
          renderReceipt();
        drawPins();
      });
    } catch {
      say(
        "Delivery could not be confirmed. Your drafts are saved; retry later.",
      );
    } finally {
      submitting = false;
      if (sendPanel.open && sendPanel.dataset.mode === "receipt")
        renderReceipt();
      drawPins();
    }
  }

  function renderBackup() {
    sendPanel.dataset.mode = "backup";
    sending = feedbackFile(store.items(), store.reviewer());
    sendPanel.innerHTML = `<div class="panel-head">
      <h2 id="send-title">Download a backup</h2>
      <p>This keeps a local copy for you or the team if hosted sending is unavailable.</p>
      <button type="button" class="close" data-act="close" aria-label="Close">×</button>
    </div><div class="panel-body">
      <button type="button" class="primary" data-act="download">Download file</button>
      <button type="button" data-act="copy-text" data-copy-text>Copy my feedback as text</button>
      <label class="label" for="send-preview">Backup contents</label>
      <textarea id="send-preview" class="preview" readonly rows="12">${esc(sending.text)}</textarea>
    </div><div class="panel-foot"><button type="button" data-act="close">Close</button></div>`;
  }

  function download() {
    const file =
      sending ?? (sending = feedbackFile(store.items(), store.reviewer()));
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

  /** The reviewer's own words as text, for a receipt or a backup panel. */
  function feedbackText() {
    return feedbackFile(store.items(), store.reviewer()).text;
  }

  async function copy() {
    const preview = sendPanel.querySelector<HTMLTextAreaElement>(".preview");
    const text = preview?.value ?? feedbackText();
    await copyAsText(text, preview ?? undefined);
  }

  /** Copies `text`, falling back to a selectable box when the clipboard is denied. */
  async function copyAsText(text: string, field?: HTMLTextAreaElement) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const target = field ?? receiptPreview(text);
      target.focus();
      target.select();
      return say("It’s selected below: press ⌘C or Ctrl+C to copy it.");
    }
    say("Feedback copied as text.");
  }

  /** A readable copy of every draft, shown when the clipboard is unavailable. */
  function receiptPreview(text: string) {
    const existing =
      sendPanel.querySelector<HTMLTextAreaElement>(".receipt-copy");
    if (existing) {
      existing.value = text;
      return existing;
    }
    const field = document.createElement("textarea");
    field.className = "preview receipt-copy";
    field.style.marginTop = "10px";
    field.readOnly = true;
    field.rows = 12;
    field.setAttribute("aria-label", "Your feedback as text");
    field.value = text;
    sendPanel
      .querySelector(".panel-body")
      ?.append(field);
    return field;
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
    if (act === "capture" && selected)
      void changeScreenshot(() =>
        capture.capture(selected!, (hidden) =>
          host.toggleAttribute("data-capturing", hidden),
        ),
      );
    else if (act === "remove-screenshot") {
      screenshot = undefined;
      imageGeneration++;
      showScreenshot();
      form?.querySelector<HTMLInputElement>("#f-screenshot")?.focus();
      const status = form?.querySelector<HTMLElement>(
        "[data-screenshot-status]",
      );
      if (status)
        status.textContent =
          "Screenshot removed. Written feedback is ready to save.";
    } else if (button.dataset.withoutImage) {
      const item = store
        .items()
        .find((item) => item.id === button.dataset.withoutImage);
      if (item && !submitting) {
        const text = { ...item };
        delete text.screenshot;
        store.save(text);
        void send();
      }
    } else if (act === "pick") startPicking();
    else if (act === "cancel-pick") cancelPicking();
    else if (act === "list") {
      renderList();
      listPanel.showModal();
    } else if (act === "send" || act === "retry") {
      void send();
    } else if (act === "receipt") {
      renderReceipt();
      sendPanel.showModal();
    } else if (act === "backup") {
      listPanel.close();
      renderBackup();
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
    else if (act === "copy-text") void copy();
    else if (act === "clear") {
      if (!confirmed(button as HTMLButtonElement, "Delete all of it?")) return;
      store.clear();
      drawPins();
      sendPanel.close();
      say("Cleared. This browser has no feedback saved.");
    } else if (button.dataset.new) {
      const renamed = store.saveAsNew(button.dataset.new);
      drawPins();
      renderReceipt();
      if (renamed) say("Revision saved as new feedback. Send it when ready.");
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
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== storageKey) return;
    drawPins();
    if (listPanel.open) renderList();
    if (sendPanel.open && sendPanel.dataset.mode === "receipt") renderReceipt();
  };
  addEventListener("storage", onStorage);

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
    barLayout.disconnect();
    document.documentElement.style.removeProperty("--found42-review-space");
    shadow.removeEventListener("click", onPress);
    removeEventListener("storage", onStorage);
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
