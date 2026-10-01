import { MotionGlobalConfig } from "framer-motion";

/**
 * Run framer-motion instantly under test.
 *
 * Without this, an element leaving an `AnimatePresence` stays mounted for the
 * length of its exit animation, and jsdom has no frame loop to finish it — so a
 * test that removes a card and immediately asserts it is gone finds it still
 * there. The fix belongs here rather than in the assertions: a test that waits
 * for an animation is testing the animation, not the behaviour.
 */
MotionGlobalConfig.skipAnimations = true;
