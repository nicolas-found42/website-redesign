/**
 * THROWAWAY PROTOTYPE — issue #74 follow-up.
 * Two braid weights on the existing industry page, switched by ?variant=broad
 * or ?variant=thin. The broad version is the current drawing; the thin version
 * tests whether clean pipelines read more clearly in the same page context.
 * This module is imported only in Vite's development mode.
 */

type Variant = "broad" | "thin";

const thinBraid = `<div class="braid-prototype-drawing" role="img" aria-label="Prototype: three thin paths for your people, workflows and business knowledge braid together through human direction into practical AI at work.">
  <svg viewBox="0 0 620 740" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g class="braid-prototype-sources" fill="#242424" font-family="Manrope, sans-serif" font-size="23" font-weight="400">
      <text x="30" y="53">Your people</text>
      <text x="30" y="160">Your workflows</text>
      <text x="30" y="267">What your business knows</text>
    </g>
    <g fill="none" stroke="#242424" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
      <path d="M34 79 H235 Q328 79 328 168 V310 C328 343 469 349 469 390 C469 423 399 432 399 465 C399 499 329 511 329 555"/>
      <path d="M34 186 H280 Q399 186 399 287 V310 C399 343 329 349 329 390 C329 423 469 432 469 465 C469 499 399 511 399 555"/>
      <path d="M34 293 H355 Q469 293 469 328 C469 343 399 349 399 390 C399 423 329 432 329 465 C329 499 469 511 469 555"/>
    </g>
    <g fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M34 79 H235 Q328 79 328 168 V310 C328 343 469 349 469 390 C469 423 399 432 399 465 C399 499 329 511 329 555" stroke="#ffffff"/>
      <path d="M34 186 H280 Q399 186 399 287 V310 C399 343 329 349 329 390 C329 423 469 432 469 465 C469 499 399 511 399 555" stroke="#242424"/>
      <path d="M34 293 H355 Q469 293 469 328 C469 343 399 349 399 390 C399 423 329 432 329 465 C329 499 469 511 469 555" stroke="#d8d5cc"/>
    </g>
    <path d="M329 605 V641 M399 605 V641 M469 605 V641" fill="none" stroke="#242424" stroke-width="6" stroke-linecap="round"/>
    <rect x="298" y="553" width="205" height="52" rx="4" fill="#fff" stroke="#b60716" stroke-width="5"/>
    <text x="401" y="587" text-anchor="middle" fill="#b60716" font-family="Space Grotesk, sans-serif" font-size="21" font-weight="700">Human direction</text>
    <path d="M329 641 Q399 668 469 641" fill="none" stroke="#242424" stroke-width="6" stroke-linecap="round"/>
    <rect x="285" y="667" width="234" height="50" rx="3" fill="#242424"/>
    <text x="402" y="698" text-anchor="middle" fill="#fff" font-family="Space Grotesk, sans-serif" font-size="21" font-weight="600">Practical AI at work</text>
  </svg>
</div>`;

const styles = `.braid-prototype-drawing{width:100%;max-width:620px;margin-inline:auto}.braid-prototype-drawing svg{display:block;width:100%;height:auto}@media(min-width:861px){.braid-prototype-sources{font-size:18px}}.braid-prototype-bar{position:fixed;z-index:10000;left:50%;bottom:12px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;width:min(410px,calc(100vw - 24px));padding:7px 10px;background:#242424;color:#fff;border:2px solid #fff;box-shadow:0 8px 30px #0005;font:600 14px/1.3 system-ui,sans-serif}.braid-prototype-bar span{flex:1;min-width:0}.braid-prototype-bar button{min-width:44px;min-height:44px;background:#fff;color:#242424;font:700 22px system-ui,sans-serif}.braid-prototype-bar strong{display:block;font-size:14px}.braid-prototype-bar small{display:block;color:#dedede;font-size:12px}.braid-prototype-badge{display:block;margin-bottom:12px;color:#b60716;font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}body:has(.braid-prototype-bar){padding-bottom:105px}`;

export function mountBraidPrototype(): () => void {
  const drawing = document.querySelector<HTMLElement>(".page-drawing");
  if (!drawing) return () => {};

  const original = drawing.innerHTML;
  const style = document.createElement("style");
  style.textContent = styles;
  document.head.append(style);

  const bar = document.createElement("div");
  bar.className = "braid-prototype-bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Braid prototype variants");
  bar.innerHTML = `<button type="button" aria-label="Previous braid variant">←</button><span aria-live="polite"></span><button type="button" aria-label="Next braid variant">→</button>`;
  document.body.append(bar);

  const variants: Variant[] = ["broad", "thin"];
  function current(): Variant {
    return new URLSearchParams(location.search).get("variant") === "thin"
      ? "thin"
      : "broad";
  }
  function render() {
    const variant = current();
    drawing!.innerHTML = `<span class="braid-prototype-badge">Prototype · ${variant === "broad" ? "Current broad plait" : "Thin pipeline braid"}</span>${variant === "broad" ? original : thinBraid}`;
    bar.querySelector("span")!.innerHTML = `<strong>${variant === "broad" ? "A · Broad plait" : "B · Thin pipelines"}</strong><small>Throwaway comparison · ${variant === "broad" ? "current drawing" : "proposed clean lines"}</small>`;
  }
  function switchVariant(direction: number) {
    const next = variants[(variants.indexOf(current()) + direction + 2) % 2];
    const url = new URL(location.href);
    url.searchParams.set("variant", next);
    history.replaceState(history.state, "", url);
    render();
  }
  const buttons = bar.querySelectorAll("button");
  buttons[0].addEventListener("click", () => switchVariant(-1));
  buttons[1].addEventListener("click", () => switchVariant(1));
  function onKey(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable]")) return;
    event.preventDefault();
    switchVariant(event.key === "ArrowRight" ? 1 : -1);
  }
  window.addEventListener("keydown", onKey);
  render();

  return () => {
    window.removeEventListener("keydown", onKey);
    drawing.innerHTML = original;
    bar.remove();
    style.remove();
  };
}
