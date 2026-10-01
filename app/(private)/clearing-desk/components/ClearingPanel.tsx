import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Payee } from '../types';
import { displayVehicle, formatMoney } from '../utils/mappers';
import CheckMark from './CheckMark';
import { APPROVE_CONFIRM_MS } from '../motion';

export default function ClearingPanel({ payee, onEdit, onApprove }: {
  payee: Payee; onEdit: () => void; onApprove: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The card unmounts as soon as the approval lands, so the timer has to be
  // cleared on the way out — and on a selection change, which swaps the payee
  // under a confirmation already in flight.
  useEffect(() => () => clearTimeout(timer.current), []);

  function approve() {
    if (confirming) return;
    setConfirming(true);
    timer.current = setTimeout(onApprove, reduced ? 0 : APPROVE_CONFIRM_MS);
  }

  return (
    <article className="payee-card">
      <div className="route-seam">ROUTE: {payee.id}</div>
      <div className="payee-info">
        <div className="person-heading">
          <div>
            <h2>{payee.name}</h2>
            <p><b>VEHICLE:</b> {displayVehicle(payee)}</p>
          </div>
          <button className="small-button" type="button" onClick={onEdit}>EDITAR</button>
        </div>
        <div className="payment">
          <p>PAYMENT MODE</p>
          <div>
            <strong>{payee.mode}:</strong>{' '}
            <span data-testid="payment-amount">
              {formatMoney(payee.payment.amount, payee.payment.flat)}
            </span>
          </div>
        </div>
        <div className="details">
          <p><b>SORT:</b> {payee.sort ? 'YES' : 'NO'}</p>
          <p><b>SORT VALUE:</b> {payee.sortValue.toFixed(2)}</p>
          <p><b>ADHOC-SERVICE:</b> {payee.adhoc ?? '-'}</p>
        </div>
      </div>
      <button
        className={`approve${confirming ? ' is-approving' : ''}`}
        type="button"
        onClick={approve}
        aria-label={`Approve ${payee.name}`}
      >
        <span className="approve-mark" aria-hidden="true"><CheckMark /></span>
        <span>APPROVE</span>
      </button>
    </article>
  );
}
