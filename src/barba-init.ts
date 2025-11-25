import barba from "@barba/core";
import {
  slideUpFormTransition,
  slideDownFormTransition,
  slideLeftTransition,
  slideRightTransition,
} from "./transitions/index.js";

export function initBarba() {
  barba.init({
    transitions: [
      slideUpFormTransition,
      slideDownFormTransition,
      slideLeftTransition,
      slideRightTransition,
    ],
  });
}
