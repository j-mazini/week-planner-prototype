/**
 * Motion for the cards that move between the pending queue and the cleared
 * column. Both lists share these so the two halves of a single approval — the
 * card leaving one side and arriving on the other — stay in step.
 *
 * The card does not fly across the screen: the two columns are separate scroll
 * containers, so a shared `layoutId` would be fragile. A coordinated exit and
 * entry reads as "it went over there" without the flight mechanics.
 */

/** Both columns receive a card from above. */
export const CARD_ENTER = { opacity: 0, y: -12 } as const;

export const CARD_SETTLED = { opacity: 1, x: 0, y: 0 } as const;

/** Approved: the queue is left of the cleared column, so the card leaves right. */
export const QUEUE_EXIT = { opacity: 0, x: 8 } as const;

/** Returned to the queue: back the way it came. */
export const CLEARED_EXIT = { opacity: 0, x: -8 } as const;

const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Exit is quicker than entry: the vacated slot closing slowly reads as lag,
 * while the arriving card is the part worth watching.
 */
export function cardTransition(reducedMotion: boolean) {
  return {
    exit: { duration: reducedMotion ? 0 : 0.16, ease: EASE },
    enter: { duration: reducedMotion ? 0 : 0.2, ease: EASE },
  };
}
