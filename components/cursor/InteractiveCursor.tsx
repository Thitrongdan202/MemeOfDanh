"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSettings } from "@/lib/settings/SettingsContext";

export function InteractiveCursor() {
  const { settings, resolvedTheme } = useSettings();
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on desktop pointer devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || !settings.customCursor || settings.reducedMotion) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    const spot = spotlightRef.current;
    if (!cursor || !ring) return;

    const xCursor = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power2.out" });
    const yCursor = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power2.out" });

    const xRing = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

    let xSpot: any = null;
    let ySpot: any = null;
    if (spot) {
      xSpot = gsap.quickTo(spot, "x", { duration: 0.5, ease: "power2.out" });
      ySpot = gsap.quickTo(spot, "y", { duration: 0.5, ease: "power2.out" });
    }

    const onMouseMove = (e: MouseEvent) => {
      xCursor(e.clientX);
      yCursor(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
      if (xSpot && ySpot) {
        xSpot(e.clientX);
        ySpot(e.clientY);
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      if (target) {
        const text = target.getAttribute("data-cursor") || "";
        setCursorText(text);
        setIsHovered(true);
      } else {
        const isClickable = (e.target as HTMLElement)?.closest(
          "a, button, input, select, [role='button'], [role='switch']"
        );
        if (isClickable) {
          setCursorText("");
          setIsHovered(true);
        } else {
          setCursorText("");
          setIsHovered(false);
        }
      }
    };

    const onMouseLeave = () => {
      gsap.to([cursor, ring], { opacity: 0, duration: 0.2 });
    };

    const onMouseEnter = () => {
      gsap.to([cursor, ring], { opacity: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [settings.customCursor, settings.reducedMotion, settings.backgroundEffects]);

  if (!isVisible) return null;

  return (
    <>
      {/* Background Interactive Ambient Spotlight (Optional via settings) */}
      {settings.backgroundEffects && (
        <div
          ref={spotlightRef}
          className="fixed top-0 left-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 z-0 transition-opacity duration-500"
          style={{
            background:
              resolvedTheme === "dark"
                ? "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)"
                : "radial-gradient(circle, var(--accent-light) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Center Precision Point */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent transition-transform duration-100"
      />

      {/* Outer Spring Ring with Badge State */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-200 ${
          cursorText
            ? "w-16 h-16 bg-accent text-white font-mono text-[10px] font-bold shadow-lg scale-100"
            : isHovered
            ? "w-10 h-10 border-2 border-accent bg-accent/10 scale-100"
            : "w-7 h-7 border border-museum-borderDark scale-75 opacity-70"
        }`}
      >
        {cursorText && (
          <span className="tracking-wider uppercase select-none text-center">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
