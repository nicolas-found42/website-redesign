import { sitePath } from "../paths";

import {
  robbHenshawAttribution,
  testimonials as homepageTestimonials,
} from "@shared/content/facts";

export { robbHenshawAttribution, homepageTestimonials };

export function testimonialsSection() {
  return `<section id="testimonials" class="testimonials band" aria-labelledby="testimonials-title"><div class="wrap">
   <div class="section-head"><div><p class="note section-label">What clients say</p><h2 id="testimonials-title" class="display" data-reveal-lines>What founders are saying</h2></div><div class="testimonial-nav" hidden><button type="button" data-testimonial-step="-1" aria-label="Previous testimonial">←</button><span data-testimonial-count aria-live="polite">1 / ${homepageTestimonials.length}</span><button type="button" data-testimonial-step="1" aria-label="Next testimonial">→</button></div></div>
   <div class="testimonial-track" tabindex="0" aria-label="Testimonials">${homepageTestimonials.map((quote) => `<figure class="testimonial-card"><blockquote><p>${quote.quote}</p></blockquote><figcaption><img src="${sitePath(`assets/${quote.image}`)}" alt="${quote.name}" width="64" height="64" loading="lazy"><span><strong>${quote.name}</strong><span>${quote.role}</span>${quote.note ? `<small>${quote.note}</small>` : ""}</span></figcaption></figure>`).join("")}</div>
  </div></section>`;
}

/**
 * A scannable rail of testimonials while keeping every quote in the DOM.
 *
 * The five quotes stay in one track — the same markup the no-script layout
 * shows — laid out as a horizontal scroller that reveals several cards at once
 * wherever the viewport has room, so they can be read together instead of one
 * press at a time. The `←` / `→` controls and the arrow keys step the rail by
 * one card and report the position in the live count. Without script, or with
 * reduced motion, every card is already visible and no movement is needed.
 */
export function mountTestimonials(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>("#testimonials");
  if (!section) return () => {};
  const track = section.querySelector<HTMLElement>(".testimonial-track")!;
  const nav = section.querySelector<HTMLElement>(".testimonial-nav")!;
  const count = section.querySelector<HTMLElement>("[data-testimonial-count]")!;
  const cards = [...track.querySelectorAll<HTMLElement>(".testimonial-card")];
  let current = 0;
  /** Bring a card to the rail's leading edge and report the position. */
  const show = (index: number) => {
    current = (index + cards.length) % cards.length;
    const offset =
      cards[current].getBoundingClientRect().left -
      track.getBoundingClientRect().left;
    track.scrollLeft += offset;
    count.textContent = `${current + 1} / ${cards.length}`;
  };
  const onClick = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-testimonial-step]",
    );
    if (button) show(current + Number(button.dataset.testimonialStep));
  };
  const onKey = (event: KeyboardEvent) => {
    if (
      event.target !== track ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    event.preventDefault();
    show(current + (event.key === "ArrowRight" ? 1 : -1));
  };
  track.classList.add("is-carousel");
  nav.hidden = false;
  count.textContent = `1 / ${cards.length}`;
  section.addEventListener("click", onClick);
  track.addEventListener("keydown", onKey);
  return () => {
    section.removeEventListener("click", onClick);
    track.removeEventListener("keydown", onKey);
  };
}
