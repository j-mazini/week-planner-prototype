import { motion, useReducedMotion } from 'framer-motion';
import type { Payee } from '../types';
import { displayVehicle } from '../utils/mappers';
import { CARD_ENTER, CARD_SETTLED, QUEUE_EXIT, cardTransition } from '../motion';

export default function PayeeCard({ payee, selected, onSelect }: {
  payee: Payee; selected: boolean; onSelect: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const { enter, exit } = cardTransition(reduced);

  // A motion.button rather than a wrapper: the stylesheet lays these out as
  // direct children of .pending-panel, so an extra element would change the DOM
  // the CSS and the tests both target.
  return (
    <motion.button
      layout
      initial={CARD_ENTER}
      animate={{ ...CARD_SETTLED, transition: enter }}
      exit={{ ...QUEUE_EXIT, transition: exit }}
      type="button"
      className={`pending-card${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="card-row">
        <span className="route-id">{payee.id}</span>
        <span className="pending-badge">PENDING</span>
      </span>
      <span className="card-row">
        <span>{payee.name}</span>
        <strong>{payee.mode}</strong>
      </span>
      <span className="vehicle-id">{displayVehicle(payee)}</span>
    </motion.button>
  );
}
