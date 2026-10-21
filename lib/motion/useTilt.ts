"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useSettings } from "../settings/SettingsContext";

export function useTilt<T extends HTMLElement = HTMLDivElement>(maxTilt: number = 5) {
  const ref = useRef<T>(null);
  const { settings } = useSettings();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || !settings.cardTilt || settings.reducedMotion) {
      return;
    }

    gsap.set(el, { transformPerspective: 800, transformStyle: "preserve-3d" });

    const rotXTo = gsap.quickTo(el, "rotationX", { duration: 0.35, ease: "power2.out" });
    const rotYTo = gsap.quickTo(el, "rotationY", { duration: 0.35, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0 to 1
      const y = (e.clientY - rect.top) / rect.height; // 0 to 1

      const rotY = (x - 0.5) * (maxTilt * 2);
      const rotX = (0.5 - y) * (maxTilt * 2);

      rotXTo(rotX);
      rotYTo(rotY);
    };

    const handleMouseLeave = () => {
      rotXTo(0);
      rotYTo(0);
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.set(el, { rotationX: 0, rotationY: 0, clearProps: "transformPerspective,transformStyle" });
    };
  }, [settings.cardTilt, settings.reducedMotion, maxTilt]);

  return ref;
}
