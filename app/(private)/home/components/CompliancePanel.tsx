import type { ComplianceCategoryModel } from "../types";

export default function CompliancePanel({ categories }: { categories: ComplianceCategoryModel[] }) {
  return (
    <section className="hp-panel" aria-label="Compliance">
      <div className="hp-panelhd">
        <div>
          <h2 className="hp-panelttl">Compliance</h2>
          <p className="hp-panelsub">Expiring and expired training</p>
        </div>
      </div>
      <div className="hp-panelbd">
        <div className="hp-cards">
          {categories.map((category) => (
            <div className="hp-card" key={category.id}>
              <div className="hp-cardhd">
                <span className="hp-cardname">{category.title}</span>
              </div>
              <div className="hp-minilist">
                <div className="hp-minilisthd" style={{ color: "var(--amber-ink)" }}>EXPIRING</div>
                {category.expiring.length === 0 ? (
                  <div className="hp-miniempty">—</div>
                ) : (
                  <div className="hp-minilistbody">
                    {category.expiring.map((entry) => (
                      <div className="hp-minirow" key={entry.vendorId}>
                        <span>{entry.vendorName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hp-minilist">
                <div className="hp-minilisthd" style={{ color: "var(--red)" }}>EXPIRED</div>
                {category.expired.length === 0 ? (
                  <div className="hp-miniempty">—</div>
                ) : (
                  <div className="hp-minilistbody">
                    {category.expired.map((entry) => (
                      <div className="hp-minirow" key={entry.vendorId}>
                        <span>{entry.vendorName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
