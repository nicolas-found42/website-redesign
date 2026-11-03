import type { MotionPreference } from "../motion-preference";
import { mountAudiences } from "./audiences-behaviour";
import { mountServices } from "./services-behaviour";
import { mountTestimonials } from "./testimonials";

export interface BandMount {
  /** A still selector: the band is present in the prerendered markup. */
  selector: string;
  mount(
    root: HTMLElement,
    options: { motionPreference: MotionPreference },
  ): () => void;
}

/**
 * The bands that come alive after their still markup has loaded. A band that
 * needs behavior gets one entry here and one renderer; the page composes them
 * from this table instead of growing another `if` at each new band.
 */
export const bandMounts: readonly BandMount[] = [
  {
    selector: ".services-art",
    mount: (root, options) => mountServices(root, options),
  },
  {
    selector: "[data-scene-host]",
    mount: (root, options) => mountAudiences(root, options),
  },
  {
    selector: "#testimonials",
    mount: (root) => mountTestimonials(root),
  },
];
