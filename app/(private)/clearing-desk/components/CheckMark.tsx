/**
 * The approve tick, inlined from the Figma export's own asset
 * (`154-795-imgContainer5.svg`) rather than loaded as an `<img>`.
 *
 * An `<img>` cannot be recoloured by CSS, and this mark has two colours: grey
 * while the button is merely hovered, green while the approval is confirming.
 * Inlined, `fill="currentColor"` lets both come from one `color` declaration
 * each — and it spares us re-adding the export's second, pre-coloured asset.
 */
export default function CheckMark() {
  return (
    <svg
      className="check"
      width="41"
      height="31"
      viewBox="0 0 41 31"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M13.0296 23.6689L3.30983 14.34L0 17.4944L13.0296 30L41 3.15436L37.7135 0L13.0296 23.6689Z"
        fill="currentColor"
      />
    </svg>
  );
}
