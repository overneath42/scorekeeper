import { gsap } from "gsap";
import { ITransitionPage } from "@barba/core/dist/core/src/src/defs";

export const slideDownFormTransition: ITransitionPage = {
  name: "slide-down-form",
  from: {
    namespace: ["new", "edit"],
  },
  to: {
    namespace: ["index", "play"],
  },
  sync: true,
  beforeLeave(data) {
    return new Promise<void>((resolve) => {
      gsap.set(data.current.container, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 2,
        backgroundColor: "#fff",
        boxShadow: "0 -2.5px 12px rgb(0 0 0 / 0.25)",
        onComplete: resolve,
      });
    });
  },
  leave(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.current.container, {
        transform: "translateY(100%)",
        duration: 0.6,
        ease: "expo.inOut",
        onComplete: resolve,
      });
    });
  },
  beforeEnter(data) {
    return new Promise<void>((resolve) => {
      gsap.set(data.next.container, {
        opacity: 0.25,
        onComplete: resolve,
      });
    });
  },
  enter(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.next.container, {
        opacity: 1,
        duration: 0.5,
        onComplete: resolve,
      });
    });
  },
};
