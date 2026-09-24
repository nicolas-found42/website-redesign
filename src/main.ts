import "./style.css";
import { renderPage, pageMeta } from "./pages";
import { routeFromPath } from "./paths";
import { mountPage, mountHomepage } from "./homepage";
import { createPageMotion } from "./motion-preference";
import { reviewRequested } from "./review/activation";

// The entry keeps the side-effectful imports and the mount; the page itself is
// composed in `homepage.ts`, which a test can import on its own.
const app = document.querySelector<HTMLDivElement>("#app")!;
const motionPreference = createPageMotion(
  matchMedia("(prefers-reduced-motion: reduce)"),
);
const route = routeFromPath(location.pathname);
const meta = pageMeta[route];
document.title = meta?.title ?? "Page not found | Found42";
document
  .querySelector('meta[name="description"]')
  ?.setAttribute(
    "content",
    meta?.description ?? "Page not found in the Found42 preview.",
  );
const disposeHomepage = route
  ? mountPage(app, renderPage(route), { motionPreference })
  : mountHomepage(app, { motionPreference });

// The team's review tools load only from a review link; visitors never fetch them.
let disposeReview: (() => void) | undefined;
if (reviewRequested())
  void import("./review/review").then(({ mountReview }) => {
    disposeReview = mountReview();
  });

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposeHomepage();
    disposeReview?.();
    motionPreference.dispose();
  });
