export default function PayableEstimate({ perStop, stops }: { perStop: number; stops: number }) {
  return (
    <section className="estimate">
      <h3>ESTIMATE OF AMOUNTS PAYABLE</h3>
      <dl>
        <div>
          <dt>PER STOP</dt>
          <dd data-testid="estimate-per-stop">£ {perStop.toFixed(2)}</dd>
        </div>
        <div>
          <dt>TOTAL</dt>
          <dd data-testid="estimate-total">£ {(perStop * stops).toFixed(2)}</dd>
        </div>
      </dl>
    </section>
  );
}
