import { sitePath } from "../paths";

export const homepageTestimonials = [
  {
    name: "Robb Henshaw",
    role:
      "CMO, Edgescale AI; former Co-Founder and CMO, Cameyo (acquired by Google)",
    note: "",
    image: "robb-henshaw.jpeg",
    quote:
      "“C-Level AI is a completely unique approach that cuts through the AI hype. It starts with the C-Level AI training workshop, providing your execs with practical AI skills and immediate value. Following it up with the Scorecard gives you a clear understanding of your current state. You head into the discovery session with great ideas of what could be possible that is grounded in reality.”",
  },
  {
    name: "Paul Keely",
    role: "Co-founder and Managing Director, Palladium Security LLC",
    note: "Former Co-founder, Born In The Cloud (acquired by Open Systems)",
    image: "paul-keely.jpeg",
    quote:
      "“What stood out in the C-Level AI workshop was how practical it was. The exercises turned AI from concept to execution, with role-play coaching and tailored prompts that improved my client outreach instantly. Richard brings the balance of a trusted advisor and a hands-on coach.”",
  },
  {
    name: "Carmen Paredes Ramirez",
    role: "Founder and CEO of Ruruka and Maraja",
    note: "MIT Innovator Under 35 LATAM 2025",
    image: "carmen-paredes-ramirez.jpeg",
    quote:
      "“This course was amazing and incredibly useful! The sessions were engaging and interactive, which made learning enjoyable. I especially appreciated having access to the materials on demand after the live session. It was perfect for catching up on anything I missed during the live sessions. The pacing was just right, and everything was explained clearly and easy to understand.”",
  },
  {
    name: "Andrew Miller",
    role: "Former Co-Founder and CEO, Cameyo (acquired by Google)",
    note: "",
    image: "andrew-miller.jpeg",
    quote:
      "“Richard’s C-Level AI workshop went beyond theory. It helped me turn ChatGPT into a trusted advisor and a sounding board in less than 1 hour. The role-play coaching and personalized AI tools delivered quick, actionable tweaks I could implement immediately. It’s already changing how I approach client conversations.”",
  },
  {
    name: "Neville Louison",
    role: "Founder of Soulful Silverback",
    note: "",
    image: "neville-louison.jpeg",
    quote:
      "“Working with Richard in the Strategy Pivot Workshop unlocked a clear, actionable path forward for my business pivot. With his expert guidance through ChatGPT, Gemini, and Gamma, I not only refined my positioning and GTM playbook, but also had a fully functional landing page live in under three hours!”",
  },
];

export function testimonialsSection() {
  return `<section id="testimonials" class="testimonials band" aria-labelledby="testimonials-title"><div class="wrap">
   <div class="section-head"><div><p class="note section-label">What clients say</p><h2 id="testimonials-title" class="display" data-reveal-lines>What founders are saying</h2></div><div class="testimonial-nav" hidden><button type="button" data-testimonial-step="-1" aria-label="Previous testimonial">←</button><span data-testimonial-count aria-live="polite">1 / ${homepageTestimonials.length}</span><button type="button" data-testimonial-step="1" aria-label="Next testimonial">→</button></div></div>
   <div class="testimonial-track" tabindex="0" aria-label="Testimonials">${homepageTestimonials.map((quote) => `<figure class="testimonial-card"><blockquote><p>${quote.quote}</p></blockquote><figcaption><img src="${sitePath(`assets/${quote.image}`)}" alt="${quote.name}" width="64" height="64" loading="lazy"><span><strong>${quote.name}</strong><span>${quote.role}</span>${quote.note ? `<small>${quote.note}</small>` : ""}</span></figcaption></figure>`).join("")}</div>
  </div></section>`;
}

/** Enhance a complete list into a carousel while keeping every quote in the DOM. */
export function mountTestimonials(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>("#testimonials");
  if (!section) return () => {};
  const track = section.querySelector<HTMLElement>(".testimonial-track")!;
  const nav = section.querySelector<HTMLElement>(".testimonial-nav")!;
  const count = section.querySelector<HTMLElement>("[data-testimonial-count]")!;
  const cards = [...track.querySelectorAll<HTMLElement>(".testimonial-card")];
  let current = 0;
  const show = (index: number) => {
    current = (index + cards.length) % cards.length;
    track.replaceChildren(...cards.slice(current), ...cards.slice(0, current));
    track.scrollLeft = 0;
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
  section.addEventListener("click", onClick);
  track.addEventListener("keydown", onKey);
  return () => {
    section.removeEventListener("click", onClick);
    track.removeEventListener("keydown", onKey);
  };
}
