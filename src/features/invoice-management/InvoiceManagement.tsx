'use client';

import { useEffect, useState } from 'react';
import { ScreenRouter } from './components/ScreenRouter';
import manifest from './manifest.json';
import InvoiceBoard from './InvoiceBoard';
import PaymentSchedule from './PaymentSchedule';
import './design.css';
import './integration.css';

const initialScreen = '41-2474';

export default function InvoiceManagement() {
  const [screenId, setScreenId] = useState(initialScreen);

  useEffect(() => {
    const syncScreen = () => {
      const requested = window.location.hash.slice(1);
      setScreenId(manifest.some(screen => screen.slug === requested) ? requested : initialScreen);
    };
    syncScreen();
    window.addEventListener('hashchange', syncScreen);
    return () => window.removeEventListener('hashchange', syncScreen);
  }, []);

  const screen = manifest.find(item => item.slug === screenId) ?? manifest[0];
  // The desks are ours; the rest are still the imported Figma canvases, which
  // are a fixed 1277px and need the shell to scroll.
  const isDesk = screenId === initialScreen || screenId === '82-8787' || screenId === '82-7755';

  function screenBody() {
    if (screenId === '82-7755') return <PaymentSchedule />;
    if (isDesk) return <InvoiceBoard history={screenId === '82-8787'} />;
    return (
      <div className="invoice-management-canvas" style={{ minHeight: screen.height - 64 }}>
        <ScreenRouter screenId={screenId} />
      </div>
    );
  }

  return (
    <main className={`invoice-management${isDesk ? ' is-desk' : ''}`} aria-label="Invoice management">
      <nav className="invoice-management-tabs" aria-label="Invoice sections">
        {[
          ['41-2474', 'Invoice processing'],
          ['50-4736', 'Deductions & recharges'],
          ['82-7755', 'Schedule for payment'],
          ['82-8787', 'Invoices history'],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={screenId === id ? 'page' : undefined}>{label}</a>
        ))}
      </nav>
      {screenBody()}
    </main>
  );
}
