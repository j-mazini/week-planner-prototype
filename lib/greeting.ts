/**
 * The greeting at the top of a home screen.
 *
 * Both homes used to state the hour and the name in the markup, so every visitor was
 * told "Good morning, João" whoever they were and whenever they arrived.
 *
 * @param fullName - The signed-in person's name; only the first word is used.
 * @param now - Injected so the wording can be tested without waiting for the clock.
 */
export const greet = (fullName: string | undefined, now: Date = new Date()): string => {
  const firstName = (fullName ?? "").trim().split(/\s+/)[0];
  if (!firstName) return "Welcome back.";

  const hour = now.getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${partOfDay}, ${firstName}.`;
};
