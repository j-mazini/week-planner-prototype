import type { Payee } from '../types';
import { displayVehicle, formatMoney } from '../utils/mappers';
import ApproveButton from './ApproveButton';

export default function ClearingPanel({ payee, onEdit, onApprove }: {
  payee: Payee; onEdit: () => void; onApprove: () => void;
}) {
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
      <ApproveButton payee={payee} onApprove={onApprove} />
    </article>
  );
}
