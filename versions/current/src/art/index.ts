import type { Art, Orientation } from "./kit";
import { masterArt } from "./master";
import { trainingArt } from "./training";
import { automationArt } from "./automation";
import { productArt } from "./product";
import { executivesArt } from "./executives";
import { contributorsArt } from "./contributors";
import { buildersArt } from "./builders";
import { reviewArt } from "./review";

/** Every drawing on the site, by the id of the composition or scene it draws. */
const drawings: Record<string, (orientation: Orientation) => Art> = {
  master: masterArt,
  training: trainingArt,
  automation: automationArt,
  product: productArt,
  executives: executivesArt,
  contributors: contributorsArt,
  builders: buildersArt,
  review: reviewArt,
};

export function artFor(id: string, orientation: Orientation): Art {
  const draw = drawings[id];
  if (!draw) throw new Error(`No drawing for "${id}"`);
  return draw(orientation);
}
