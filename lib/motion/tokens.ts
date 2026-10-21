import { MotionIntensity } from "../settings/types";

export const EASINGS = {
  standard: "power2.out",
  emphasized: "power3.out",
  spring: "back.out(1.5)",
  smooth: "sine.inOut",
  cubic: [0.16, 1, 0.3, 1] as const,
  springCubic: [0.34, 1.4, 0.64, 1] as const,
};

export function getDuration(
  base: number,
  intensity: MotionIntensity = "expressive",
  reducedMotion: boolean = false
): number {
  if (reducedMotion) return 0.01;
  const multipliers: Record<MotionIntensity, number> = {
    subtle: 0.65,
    expressive: 1.0,
    cinematic: 1.4,
  };
  return parseFloat((base * (multipliers[intensity] || 1.0)).toFixed(2));
}
