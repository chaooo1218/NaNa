export const motion = {
  duration: {
    fast: 0.14,
    normal: 0.18,
    slow: 0.22,
  },
  durationMs: {
    fast: 140,
    normal: 180,
    slow: 220,
  },
  easing: {
    standard: "power1.out",
    emphasized: "power2.out",
    css: "cubic-bezier(0.2, 0, 0, 1)",
  },
  stagger: {
    list: 0.035,
    compact: 0.025,
  },
  distance: {
    enterY: 6,
    cardEnterY: 8,
  },
  scale: {
    subtle: 1.01,
    press: 0.995,
  },
} as const

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export const motionStyle = (durationMs: number = motion.durationMs.normal) => ({
  transitionDuration: `${prefersReducedMotion() ? 0 : durationMs}ms`,
  transitionTimingFunction: motion.easing.css,
})

export const motionPreset = {
  fadeIn: {
    autoAlpha: 1,
    y: 0,
    duration: motion.duration.normal,
    ease: motion.easing.standard,
  },
  listRefresh: {
    autoAlpha: 1,
    y: 0,
    duration: motion.duration.fast,
    ease: motion.easing.standard,
  },
  cardEnterFrom: {
    autoAlpha: 0,
    y: motion.distance.cardEnterY,
  },
  chipActive: {
    scale: motion.scale.subtle,
    duration: motion.duration.fast,
    ease: motion.easing.standard,
  },
} as const
