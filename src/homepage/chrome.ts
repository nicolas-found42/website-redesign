import { arrow, icon } from "../icons";
import { destinationRegister, directContact } from "../content";
import { sitePath } from "../paths";
const nav = [
  ["Free resources", "resources/"],
  ["Services", "services/"],
  ["About", "about/"],
  ["Blog", "blog/"],
] as const;
const industries = [
  ["Private Equity", "industries/private-equity/"],
  ["B2B SaaS", "industries/b2b-saas/"],
] as const;
const logo = () =>
  `<a class="brand" href="${sitePath()}" aria-label="Found42 home"><img src="${sitePath("assets/found42-logo.png")}" alt="Found42" width="1024" height="1024"></a>`;
export function siteHeader() {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap">${logo()}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span class="menu-toggle-label">Menu</span>${icon("menu")}${icon("close")}</button><nav id="navigation" aria-label="Main navigation">${nav
    .slice(0, 2)
    .map(([t, p]) => `<a href="${sitePath(p)}">${t}</a>`)
    .join(
      "",
    )}<details class="industry-menu"><summary>Industries</summary><div>${industries.map(([t, p]) => `<a href="${sitePath(p)}">${t}</a>`).join("")}</div></details>${nav
    .slice(2)
    .map(([t, p]) => `<a href="${sitePath(p)}">${t}</a>`)
    .join(
      "",
    )}<button class="nav-contact" data-dialog="contact">Talk to us ${arrow}</button></nav></header>`;
}
export function siteFooter() {
  const group = (
    title: string,
    links: readonly (readonly [string, string])[],
  ) =>
    `<div class="footer-group"><h2>${title}</h2><ul>${links.map(([t, p]) => `<li><a href="${p}">${t}</a></li>`).join("")}</ul></div>`;
  return `<footer class="site-footer on-ink" data-ground="ink"><div class="wrap"><div class="footer-grid"><div class="footer-mark">${logo()}<p>Practical AI. Built around the work.</p><p class="note--plain">Practical Claude skills, workflows and automations shaped around real business work.</p></div>${group(
    "Explore",
    nav.map(([t, p]) => [t, sitePath(p)] as const),
  )}${group(
    "Industries",
    industries.map(([t, p]) => [t, sitePath(p)] as const),
  )}${group("Contact & legal", [
    ["Contact Found42", destinationRegister.liveInquiry],
    [`Email ${directContact.email}`, `mailto:${directContact.email}`],
    [`Call ${directContact.phone}`, `tel:${directContact.tel}`],
    ["Privacy Policy", "https://www.found42.com/privacy-policy"],
    ["Terms of Use", "https://www.found42.com/terms-of-use"],
  ])}</div><div class="footer-base"><span>© ${new Date().getFullYear()} Found42 LLC</span></div></div></footer>`;
}
