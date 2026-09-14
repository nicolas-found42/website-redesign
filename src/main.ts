import "./style.css";
import { mountHomepage } from "./homepage";
import { createPageMotion } from "./motion-preference";

// The entry keeps the side-effectful imports and the mount; the page itself is
// composed in `homepage.ts`, which a test can import on its own.
const app = document.querySelector<HTMLDivElement>("#app")!;
const motionPreference = createPageMotion(
  matchMedia("(prefers-reduced-motion: reduce)"),
);
const disposeHomepage = mountHomepage(app, { motionPreference });

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposeHomepage();
    motionPreference.dispose();
  });
