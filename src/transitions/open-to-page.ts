import { ITransitionPage } from "@barba/core/dist/core/src/src/defs";
import { gsap } from "gsap";

export const openToPageTransition: ITransitionPage = {
  name: "open-to-page",
  from: {
    namespace: ["index"],
  },
  to: {
    namespace: ["play"],
  },
  sync: true,
  beforeLeave(data) {
    return new Promise<void>((resolve) => {
      gsap.set(data.current.container, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transformOrigin: "left center",
        backgroundColor: "#fff",
        zIndex: 2,
        boxShadow: "10px 0 20px rgba(0, 0, 0, 0.3), -2px 0 10px rgba(0, 0, 0, 0.1)",
        onComplete: resolve,
      });
    });
  },
  leave(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.current.container, {
        transform: "translateZ(50px) rotateY(-90deg) scale(1)",
        duration: 1.5,
        ease: "expo.inOut",
        onComplete: resolve,
      });
    });
  },
  beforeEnter(data) {
    return new Promise<void>((resolve) => {
      gsap.set(data.next.container, {
        opacity: 0.25,
        transform: "scale(0.95)",
        onComplete: resolve,
      });
    });
  },
  enter(data) {
    return new Promise<void>((resolve) => {
      gsap.to(data.next.container, {
        opacity: 1,
        duration: 1,
        transform: "scale(1)",
        ease: "expo.inOut",
        onComplete: resolve,
      });
    });
  },
};
