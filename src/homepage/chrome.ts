import { arrow, icon } from "../icons";

/** Site chrome: the skip link, the header navigation and the footer. */
export function siteHeader() {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header wrap">
  <a class="brand" href="./" aria-label="Found42 home"><img src="./assets/found42-logo.png" alt="Found42" width="1024" height="1024"></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation">Menu ${icon("menu")}</button>
  <nav id="navigation" aria-label="Main navigation"><a href="#resources">Free resources</a><a href="#services">How we help</a><a href="https://www.found42.com/blog">Insights</a><a href="#about">About</a><a class="nav-contact" href="https://www.found42.com/contact">Request a consultation ${arrow}</a></nav>
</header>`;
}

/**
 * The footer is organised rather than flat: what is on this page, where the
 * rest of Found42 lives, and the legal pages. Gated resources are reached
 * through the page section that states their access terms, not from here.
 */
export function siteFooter() {
  const group = (
    title: string,
    links: readonly (readonly [string, string])[],
  ) =>
    `<div class="footer-group"><h2>${title}</h2><ul>${links
      .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
      .join("")}</ul></div>`;

  return `<footer class="site-footer on-ink" data-ground="ink">
 <div class="wrap">
  <div class="footer-grid">
   <div class="footer-mark">
    <a class="brand" href="./" aria-label="Found42 home"><img src="./assets/found42-logo.png" alt="Found42" width="1024" height="1024"></a>
    <p>Human ambition. Put to work.</p>
   </div>
   ${group("On this page", [
     ["Free resources", "#resources"],
     ["How we help", "#services"],
     ["About Richard", "#about"],
     ["Start a conversation", "#contact"],
   ])}
   ${group("Found42", [
     ["Insights", "https://www.found42.com/blog"],
     ["About", "https://www.found42.com/about"],
     ["Contact", "https://www.found42.com/contact"],
   ])}
   ${group("Legal", [
     ["Privacy Policy", "https://www.found42.com/privacy-policy"],
     ["Terms of Use", "https://www.found42.com/terms-of-use"],
   ])}
  </div>
  <div class="footer-base">
   <span>© ${new Date().getFullYear()} Found42 LLC</span>
   <span class="footer-flag">Design prototype</span>
  </div>
 </div>
</footer>`;
}
