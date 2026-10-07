/**
 * Tokens de movimento da aplicação.
 *
 * Um único sítio a definir durações e easings, para que uma page nova nasça
 * com o mesmo ritmo das outras em vez de inventar o seu próprio `0.3s ease`.
 * Os mesmos números existem como custom properties em `globals.css`
 * (`--motion-*`) para a via CSS — nunca devem divergir entre os dois sítios.
 *
 * Ver docs/superpowers/specs/2026-10-07-page-animations-design.md
 */

/** Durações em segundos (unidade do framer-motion). */
export const MOTION_DURATION = {
  /** Micro-feedback: hover, toggle de estado. */
  fast: 0.15,
  /** Entrada de página e de secção. O valor por omissão. */
  base: 0.22,
  /** Movimento com deslocação maior: modais, drawers. */
  slow: 0.32,
} as const;

/** Atraso entre secções consecutivas numa cascata. */
export const MOTION_STAGGER = 0.055;

/** Deslocação vertical de uma entrada, em px. Subtil por desenho. */
export const MOTION_OFFSET = 8;

/** `ease-out` padrão — o mesmo que o Tailwind usa em `ease-in-out`. */
export const MOTION_EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Entrada de página. Só opacidade: a página inteira a deslizar lê-se como
 * instabilidade, e um `transform` no contentor de topo quebraria qualquer
 * descendente `sticky`.
 */
export const pageEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE },
} as const;

/** Contentor que escalona a entrada dos filhos. Usar com `sectionEnter`. */
export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: MOTION_STAGGER } },
} as const;

/** Filho de `staggerContainer`. */
export const sectionEnter = {
  initial: { opacity: 0, y: MOTION_OFFSET },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE },
  },
} as const;
