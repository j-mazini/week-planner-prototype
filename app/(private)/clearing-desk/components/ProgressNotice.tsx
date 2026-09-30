export default function ProgressNotice({ remaining, percent, onDismiss }: {
  remaining: number; percent: number; onDismiss: () => void;
}) {
  return (
    <div className="goal">
      <div className="goal-title">
        GOAL IN SIGHT!
        <button type="button" aria-label="Dismiss goal" onClick={onDismiss}>×</button>
      </div>
      <div className="goal-message">
        <strong>ONLY {remaining} APPROVALS LEFT!</strong>
        <p>You are among today&rsquo;s fastest controllers.</p>
      </div>
      <div className="goal-track"><span style={{ width: `${percent}%` }} /></div>
      <small>{percent}% REACHED</small>
    </div>
  );
}
