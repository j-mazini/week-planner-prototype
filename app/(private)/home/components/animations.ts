import { Variants } from 'framer-motion';

/**
 * Animation variants for the home page
 * Optimized for performance with reduced complexity
 */
export const homePageAnimations = {
  page: {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.35, 
        ease: [0.4, 0, 0.2, 1] as const 
      } 
    },
  } as Variants,

  section: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.35, 
        ease: [0.4, 0, 0.2, 1] as const 
      },
    },
  } as Variants,

  title: {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] as const 
      },
    },
  } as Variants,

  grid: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        delayChildren: 0.05 
      },
    },
  } as Variants,
};

