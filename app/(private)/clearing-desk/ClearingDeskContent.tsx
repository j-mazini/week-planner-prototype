"use client";

import { useClearingDesk } from '@/hooks/useClearingDesk';
import './styles.css';

export default function ClearingDeskContent() {
  const { board, isLoading, isError, refetch } = useClearingDesk({});

  if (isError) {
    return (
      <div className="clearing-desk">
        <p role="alert">Could not load the clearing desk.</p>
        <button type="button" onClick={() => void refetch()}>Try again</button>
      </div>
    );
  }

  return (
    <div className="clearing-desk">
      <header className="page-heading">
        <h1>CLEARING DESK</h1>
        <p>Payment authorization &amp; clearing</p>
      </header>
      {isLoading || !board
        ? <p role="status">Loading transactions…</p>
        : <div className="desk-columns" />}
    </div>
  );
}
