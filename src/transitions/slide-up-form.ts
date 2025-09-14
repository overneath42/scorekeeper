import { gsap } from "gsap";
import { ITransitionPage } from "@barba/core/dist/core/src/src/defs";

export const slideUpFormTransition: ITransitionPage = {
  name: "slide-up-form",
  from: {
    namespace: ["index", "play"],
  },
  to: {
    namespace: ["new", "edit"],
  },
  sync: true,
  leave(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.current.container, {
        opacity: 0.25,
        duration: 0.375,
        onComplete: resolve,
      });
    });
  },
  beforeEnter(data) {
    return new Promise<void>((resolve) => {
      gsap.set(data.next.container, {
        transform: "translateY(100%)",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 2,
        backgroundColor: "#fff",
        boxShadow: "0 -2.5px 12px rgb(0 0 0 / 0.25)",
      });
      resolve();
    });
  },
  enter(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.next.container, {
        transform: "translateY(0%)",
        duration: 0.75,
        ease: "expo.inOut",
        onComplete: resolve,
      });
    });
  },
};
