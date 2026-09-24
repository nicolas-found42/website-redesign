/** Homepage selectors only enhance content that is fully present in the HTML. */
export function mountApprovedHomepage(root: HTMLElement) {
  const homepage = root.querySelector<HTMLElement>(".approved-homepage")!;
  const choices = [
    ...homepage.querySelectorAll<HTMLButtonElement>("[data-approved-service]"),
  ];
  const panels = [
    ...homepage.querySelectorAll<HTMLElement>("[data-approved-panel]"),
  ];
  const select = (index: number) => {
    choices.forEach((choice, i) =>
      choice.setAttribute("aria-pressed", String(i === index)),
    );
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
  };
  select(0);
  const onService = (event: Event) => {
    const choice = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-approved-service]",
    );
    if (choice) select(Number(choice.dataset.approvedService));
  };
  const onServiceKey = (event: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const choice = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-approved-service]",
    );
    if (!choice) return;
    event.preventDefault();
    const current = Number(choice.dataset.approvedService);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? choices.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + choices.length) %
            choices.length;
    select(next);
    choices[next].focus();
  };
  homepage.addEventListener("click", onService);
  homepage.addEventListener("keydown", onServiceKey);

  const track = homepage.querySelector<HTMLElement>(".ah-quote-track")!;
  const cards = [...track.querySelectorAll<HTMLElement>(".ah-quote")];
  const count = homepage.querySelector<HTMLElement>(
    "[data-testimonial-count]",
  )!;
  let current = 0;
  const show = (index: number) => {
    current = (index + cards.length) % cards.length;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: cards[current].offsetLeft - cards[0].offsetLeft,
      behavior: reduce ? "instant" : "smooth",
    });
    count.textContent = `${current + 1} / ${cards.length}`;
  };
  const onCarousel = (event: Event) => {
    const step = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-testimonial-step]",
    );
    if (step) show(current + Number(step.dataset.testimonialStep));
  };
  const onCarouselKey = (event: KeyboardEvent) => {
    if (
      event.target !== track ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    event.preventDefault();
    show(current + (event.key === "ArrowRight" ? 1 : -1));
  };
  homepage.addEventListener("click", onCarousel);
  track.addEventListener("keydown", onCarouselKey);
  return () => {
    homepage.removeEventListener("click", onService);
    homepage.removeEventListener("keydown", onServiceKey);
    homepage.removeEventListener("click", onCarousel);
    track.removeEventListener("keydown", onCarouselKey);
  };
}
