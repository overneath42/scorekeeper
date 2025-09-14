import barba from "@barba/core";
import { slideUpFormTransition } from "./transitions/slide-up-form.js";
import { slideDownFormTransition } from "./transitions/slide-down-form.js";
import { openToPageTransition } from "./transitions/open-to-page.js";
import { closeCoverTransition } from "./transitions/close-cover.js";

export function initBarba() {
  barba.init({
    transitions: [
      slideUpFormTransition,
      slideDownFormTransition,
      openToPageTransition,
      closeCoverTransition,
    ],
  });
}
