/**
 * The Figma export's SVGs, keyed by the purpose `src/Icons.tsx` gave them.
 *
 * Only the names this port actually renders are listed. The export drew its own
 * sidebar and topbar; here `NavbarWrapper` does that, so the chrome assets
 * (logo, nav glyphs, user menu, expand) were deleted rather than shipped dead —
 * as were the assets for states this port does not render (`approve.active`,
 * `.empty-queue`, the goal's close button, which uses a `×` glyph).
 */
const ASSETS = {
  route: '154-795-imgContainer4.svg',
  vehicle: '154-795-imgGroup2.svg',
  approve: '154-795-imgContainer5.svg',
  cleared: '154-1134-imgContainer6.svg',
  clearedRoute: '154-1134-imgContainer7.svg',
  trophy: '154-2225-imgContainer4.svg',
  star: '154-2225-imgBackgroundBorder.svg',
  select: '154-2524-imgSvg.svg',
} as const;

export type IconName = keyof typeof ASSETS;

/**
 * Decorative only: every icon here sits beside text that already carries the
 * meaning, so the alt text is empty by design.
 */
export default function Icon({ name }: { name: IconName }) {
  return (
    // These are 11-19px decorative SVGs with intrinsic dimensions; next/image
    // neither optimises SVG nor adds anything here.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="icon" src={`/clearing-desk/assets/${ASSETS[name]}`} alt="" />
  );
}
