import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./style.css";
import {
  resources,
  playbook,
  article,
  services,
  testimonials,
  proofSource,
} from "./content";
import { icon } from "./icons";
import { workflowMarkup, mountWorkflow, motif } from "./workflow";
const arrow = icon("arrow");
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header wrap">
  <a class="brand" href="./" aria-label="Found42 home"><img src="./assets/found42-logo.png" alt="Found42" width="1024" height="1024"></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation">Menu ${icon("menu")}</button>
  <nav id="navigation" aria-label="Main navigation"><a href="#resources">Free resources</a><a href="#services">Services</a><a href="https://www.found42.com/blog">Insights</a><a href="#about">About</a><a class="nav-contact" href="https://www.found42.com/contact">Request a consultation ${arrow}</a></nav>
</header>
<main id="main">
<section class="hero" aria-labelledby="hero-title">
 <div class="hero-grid wrap">
  <div class="hero-copy"><p class="eyebrow"><span class="red-rule"></span> Practical AI. Human ambition.</p><h1 id="hero-title">Put AI to work on what <em>moves your business.</em></h1><p class="hero-intro">Help your people apply AI. Improve the workflows that slow them down. Build new value from what your business knows.</p><div class="hero-actions"><a class="button primary" href="#resources">Explore free resources ${arrow}</a><a class="text-link" href="https://www.found42.com/contact">Request a consultation ${arrow}</a></div><p class="hero-note">Start exploring. Or bring us a challenge.</p></div>
  ${workflowMarkup()}
 </div>
 <div class="hero-bottom wrap"><span>People. Workflows. Products.</span><a href="#resources">Find your starting point ${icon("down")}</a></div>
</section>
<section id="resources" class="section wrap" aria-labelledby="resources-title">
 <div class="section-top"><div><p class="eyebrow">01 / Free resources</p><h2 id="resources-title">A useful place to start.</h2></div><p class="section-intro">Get a fresh perspective, try a more relevant prompt, or take stock of your AI readiness. Choose what’s useful to you.</p></div>
 <div class="resource-grid">
  <article class="resource-card reading-card reveal"><div class="reading-graphic" aria-hidden="true"><span class="feature-kicker">A different way to think.</span><span class="reading-type">Think<br>like a <em>CxO.</em></span><img class="reading-ribbon" src="./assets/reading-connections.svg" alt="" width="600" height="430"><span class="feature-footer">Human expertise × AI possibility</span></div><div class="reading-copy"><span class="badge">Public reading · No form</span><h3>${article.title}</h3><p>${article.description}</p><div class="resource-access"><p class="gate">${article.gate}</p><a class="card-link" href="${article.url}">Read the article ${arrow}</a></div></div></article>
  ${resources.map((resource, index) => `<article class="resource-card supporting-card reveal"><div class="resource-meta"><span>${resource.category}</span>${icon(index === 0 ? "prompts" : "scan")}</div><h3>${resource.title}</h3><p>${resource.description}</p><div class="resource-access"><span class="badge">${resource.kind}</span><p class="gate">${resource.gate}</p><a class="card-link" href="${resource.url}">${resource.action} ${arrow}</a></div></article>`).join("")}
 </div>
 <div class="playbook-row reveal"><span class="playbook-icon">${icon("book")}</span><div><span class="eyebrow">Also worth exploring</span><h3>${playbook.title}</h3><p>${playbook.description} ${playbook.gate}</p></div><a class="text-link" href="${playbook.url}">Request the playbook ${arrow}</a></div>
 <a class="text-link blog-link" href="https://www.found42.com/blog">More perspectives on the blog ${arrow}</a>
</section>
<section id="services" class="services-section" aria-labelledby="services-title"><div class="wrap section">
 <div class="section-top"><div><p class="eyebrow">02 / How we help</p><h2 id="services-title">From possibility<br>to practical work.</h2></div><p class="section-intro">For leadership teams and portfolio-company operators ready to apply AI to real challenges. Start with your people, your workflows, or your product.</p></div>
 <div class="service-list">${services.map((service, index) => `<article class="service-row reveal"><div class="service-art" aria-hidden="true">${motif(index)}<span>0${index + 1}</span></div><div><p class="service-label">${service.label}</p><h3>${service.title}</h3></div><p>${service.description}</p></article>`).join("")}</div>
 <a class="text-link" href="https://www.found42.com/contact">Discuss your challenge ${arrow}</a>
</div></section>
<section class="section wrap proof" aria-labelledby="proof-title">
 <div class="proof-heading"><p class="eyebrow">03 / People behind the possibilities</p><h2 id="proof-title">Business experience.<br><span>A teacher’s mindset.</span></h2></div>
 <div class="proof-grid">
  <div id="about" class="founder reveal"><div class="portrait"><img src="./assets/richard-achee.png" alt="Richard Achée, founder of Found42" width="750" height="750" loading="lazy"><div class="portrait-label"><span>Meet the founder</span><span>Found42</span></div></div><div class="founder-copy"><h3>Richard Achée</h3><p class="founder-name">Founder &amp; CEO, Found42</p><p>Richard brings a love of coaching and mentoring to helping people apply AI to their most pressing business challenges.</p><p>His published biography describes enterprise leadership, business development and M&amp;A work at Google, including Cameyo and Neverware. Today, his focus is helping teams turn business expertise into practical AI use.</p><a class="text-link" href="https://www.found42.com/about">More about Richard ${arrow}</a></div></div>
  <div class="workshop-proof"><p class="eyebrow">The workshop experience</p><h3>From the workshop,<br>in their words.</h3><div class="testimonials">${testimonials.map((testimonial) => `<figure class="testimonial reveal"><span class="quote-mark" aria-hidden="true">“</span><blockquote><p>“${testimonial.quote}”</p></blockquote><figcaption><strong>${testimonial.name}</strong><span>${testimonial.role}</span></figcaption></figure>`).join("")}</div><p class="proof-note">Selected excerpts about the C-Level AI workshop. <a href="${proofSource}">Published on Found42</a>.</p></div>
 </div>
</section>
<section id="contact" class="contact-section" aria-labelledby="contact-title"><img class="contact-ribbon" src="./assets/contact-connections.svg" alt="" width="600" height="430"><div class="wrap contact-grid"><div><p class="eyebrow">04 / Let’s put it to work</p><h2 id="contact-title">Bring a challenge.<br><span>Find a way forward.</span></h2></div><div class="contact-copy"><p>A team learning to use AI. A workflow ready for a rethink. A product with untapped potential. Tell us what you’re working on and where you’d like to go.</p><a class="button primary" href="https://www.found42.com/contact">Open the inquiry form ${arrow}</a><p class="inquiry-note">Continues to Found42’s contact form to request a consultation. Your inquiry starts a conversation; it does not book an appointment.</p></div></div></section>
</main>
<footer class="wrap"><div class="footer-top"><a class="brand" href="./" aria-label="Found42 home"><img src="./assets/found42-logo.png" alt="Found42" width="1024" height="1024"></a><span>Human ambition. Put to work.</span><div><a href="https://www.found42.com/blog">Insights</a><a href="https://www.found42.com/about">About</a><a href="https://www.found42.com/contact">Contact</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Found42 LLC</span><span>Design prototype</span><div><a href="https://www.found42.com/privacy-policy">Privacy Policy</a><a href="https://www.found42.com/terms-of-use">Terms of Use</a></div></div></footer>`;
const menu = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
const nav = document.querySelector<HTMLElement>("#navigation")!;
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
});
nav.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest("a");
  if (!link) return;
  const wasOpen = menu.getAttribute("aria-expanded") === "true";
  closeMenu();
  if (wasOpen && link.hash) {
    event.preventDefault();
    history.pushState(null, "", link.hash);
    document.querySelector(link.hash)?.scrollIntoView();
    const heading = document.querySelector<HTMLElement>(
      `${link.hash} h2, ${link.hash} h3`,
    );
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});
matchMedia("(min-width: 961px)").addEventListener("change", closeMenu);
// Entrances enhance visible content; nothing depends on an animation finishing.
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const disposeWorkflow = mountWorkflow(motionPreference);
const entranceObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!motionPreference.matches)
        entry.target.animate(
          [{ transform: "translateY(12px)" }, { transform: "translateY(0)" }],
          { duration: 450, easing: "ease-out" },
        );
      entranceObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => entranceObserver.observe(element));
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches)
    document.getAnimations().forEach((animation) => animation.cancel());
});

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposeWorkflow();
    entranceObserver.disconnect();
  });
