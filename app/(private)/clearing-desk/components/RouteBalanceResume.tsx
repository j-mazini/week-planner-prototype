import type { RouteSummary } from '../types';

export default function RouteBalanceResume({ summary }: { summary: RouteSummary }) {
  return (
    <section className="route-summary">
      <h3>ROUTE BALANCE RESUME</h3>
      <dl>
        <div><dt>POSTCODES</dt><dd>{summary.postcodes.join(', ')}</dd></div>
        <div><dt>STOPS</dt><dd data-testid="summary-stops">{summary.stops}</dd></div>
        <div><dt>PRE 12</dt><dd data-testid="summary-pre12">{summary.pre12}</dd></div>
      </dl>
    </section>
  );
}
