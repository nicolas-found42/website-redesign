import { arrow, icon } from "../icons";

/** Site chrome: the skip link, the header navigation and the footer. */
export function siteHeader() {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header wrap">
  <a class="brand" href="./" aria-label="Found42 home"><img src="./assets/found42-logo.png" alt="Found42" width="1024" height="1024"></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation">Menu ${icon("menu")}</button>
  <nav id="navigation" aria-label="Main navigation"><a href="#resources">Free resources</a><a href="#services">Services</a><a href="https://www.found42.com/blog">Insights</a><a href="#about">About</a><a class="nav-contact" href="https://www.found42.com/contact">Request a consultation ${arrow}</a></nav>
</header>`;
}

export function siteFooter() {
  return `<footer class="wrap"><div class="footer-top"><a class="brand" href="./" aria-label="Found42 home"><img src="./assets/found42-logo.png" alt="Found42" width="1024" height="1024"></a><span>Human ambition. Put to work.</span><div><a href="https://www.found42.com/blog">Insights</a><a href="https://www.found42.com/about">About</a><a href="https://www.found42.com/contact">Contact</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Found42 LLC</span><span>Design prototype</span><div><a href="https://www.found42.com/privacy-policy">Privacy Policy</a><a href="https://www.found42.com/terms-of-use">Terms of Use</a></div></div></footer>`;
}
