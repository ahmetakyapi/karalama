export const easeCurve = [0.22, 1, 0.36, 1] as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, ease: easeCurve },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeCurve },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: easeCurve },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};
