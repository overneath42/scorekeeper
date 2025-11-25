import { gsap } from "gsap";
import { ITransitionPage } from "@barba/core/dist/core/src/src/defs";

export const slideRightTransition: ITransitionPage = {
  name: "slide-right",
  from: {
    namespace: ["play"],
  },
  to: {
    namespace: ["index"],
  },
  sync: true,
  leave(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.current.container, {
        transform: "translateX(100%)",
        duration: 0.6,
        ease: "expo.inOut",
        onComplete: resolve,
      });
    });
  },
  beforeEnter(data) {
    return new Promise<void>((resolve) => {
      gsap.set(data.next.container, {
        transform: "translateX(-100%)",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 2,
        backgroundColor: "#fff",
      });
      resolve();
    });
  },
  enter(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.next.container, {
        transform: "translateX(0%)",
        duration: 0.6,
        ease: "expo.inOut",
        onComplete: resolve,
      });
    });
  },
};
