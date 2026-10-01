import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Payee } from '../types';
import CheckMark from './CheckMark';
import { APPROVE_CONFIRM_MS } from '../motion';

/**
 * The right-hand column of the payee card. It belongs to the card rather than
 * to the detail view: the design keeps it beside the edit form too, disabled
 * while the form is open, so the card never loses its second pane.
 *
 * Mount it with `key={payee.id}` — the confirmation below is per-payee state,
 * and reusing the instance across a selection change leaves the incoming
 * payee's button green and swallows its click.
 */
export default function ApproveButton({ payee, onApprove, disabled = false }: {
  payee: Payee; onApprove: () => void; disabled?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The card unmounts as soon as the approval lands, so the timer has to be
  // cleared on the way out.
  useEffect(() => () => clearTimeout(timer.current), []);

  function approve() {
    if (confirming) return;
    setConfirming(true);
    timer.current = setTimeout(onApprove, reduced ? 0 : APPROVE_CONFIRM_MS);
  }

  return (
    <button
      className={`approve${confirming ? ' is-approving' : ''}`}
      type="button"
      disabled={disabled}
      onClick={approve}
      aria-label={`Approve ${payee.name}`}
    >
      <span className="approve-mark" aria-hidden="true"><CheckMark /></span>
      <span>APPROVE</span>
    </button>
  );
}
