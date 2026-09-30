"use client";
import { useRef, useState } from "react";
import type { ImportPreviewModel } from "../../types";
import "./reference-modals.css";

export default function ImportModal({ onCancel, onFinish, runImport }: {
  onCancel: () => void;
  onFinish: () => void;
  runImport: () => Promise<ImportPreviewModel>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewModel | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function selectFile(next?: File) {
    setPreview(null);
    if (!next || !/\.(xlsx|xls|xlsm)$/i.test(next.name)) {
      setFile(null); setError("Select a .xlsx, .xls or .xlsm file."); return;
    }
    setFile(next); setError("");
  }
  async function process() {
    if (!file || processing) return;
    setProcessing(true); setError("");
    try {
      const result = await runImport();
      setPreview({ ...result, fileName: file.name });
    } catch {
      setError("Could not process the file. Please try again.");
    } finally { setProcessing(false); }
  }

  return (
    <section className="rbm-import" aria-label="Import DISCO Export">
      <p className="rbm-import-intro">Upload the DISCO export to build today&apos;s stops for Route Balance — extracts Pre-12, postcode totals and size-class breakdown, and seeds the routes below.</p>
      <div className="rbm-import-grid">
        <div className="rbm-upload-module">
          <input ref={fileInput} type="file" className="sr-only" aria-label="DISCO Excel file" accept=".xlsx,.xls,.xlsm" disabled={processing}
            onChange={(event) => selectFile(event.target.files?.[0])} />
          <button className="rbm-dropzone" type="button" disabled={processing} onClick={() => fileInput.current?.click()}
            onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!processing) selectFile(event.dataTransfer.files[0]); }}>
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 22V5m-6 6 6-6 6 6M5 21v7h22v-7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            <strong>{file ? file.name : <>Drag the DISCO Excel<br />file here</>}</strong>
            <span className="rbm-file-explorer">or open file explorer</span>
            <small>FORMATS: .XLSX, .XLS, .XLSM</small>
          </button>
          {file && <div className="rbm-file-metadata">{file.name}<span>{Math.max(1, Math.round(file.size / 1024))} KB</span></div>}
        </div>
        <div className={`rbm-import-preview${preview ? "" : " is-empty"}`} aria-busy={processing}>
          {!preview ? <p>{processing ? "Processing…" : <>Process a file to preview Pre-12, Postcode Analysis<br />and Size Class. The raw data terminal will populate<br />here.</>}</p> : <>
            <section><h2>Pre-12</h2><div className="rbm-table-scroll"><table className="rbm-table">
              <thead><tr><th>Postal Code</th><th>Name</th><th>Address</th></tr></thead>
              <tbody>{preview.pre12Rows.map((row, i) => <tr key={i}><td>{row.postcode}</td><td>{row.name}</td><td>{row.address}</td></tr>)}</tbody>
            </table></div></section>
            <section><h2>Postcode Analysis</h2><div className="rbm-table-scroll"><table className="rbm-table">
              <thead><tr><th>Subpostcode</th><th>Total deliveries</th></tr></thead>
              <tbody>{preview.postcodeAnalysis.map((row) => <tr key={row.subpostcode}><td>{row.subpostcode}</td><td>{row.totalDeliveries}</td></tr>)}</tbody>
            </table></div></section>
            <section><h2>Size Class</h2><div className="rbm-table-scroll"><table className="rbm-table">
              <thead><tr><th>Subpostcode</th><th>Soma Phys.</th><th>Total Pieces</th><th>Total Shipments</th></tr></thead>
              <tbody>{preview.sizeClass.map((row) => <tr key={row.subpostcode}><td>{row.subpostcode}</td><td>{row.somaPhys.toFixed(2)}</td><td>{row.totalPieces}</td><td>{row.totalShipments}</td></tr>)}</tbody>
            </table></div></section>
          </>}
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="rbm-import-actions">
        <button className="rbf-btn ghost" type="button" onClick={onCancel}>VOLTAR</button>
        <button className="rbf-btn primary" type="button" disabled={!file || processing} onClick={preview ? onFinish : process}>{preview ? "GO TO BALANCE" : processing ? "PROCESSING…" : "PROCESS"}</button>
      </div>
      <footer>© 2026 LOGIX / SPHERE OPERATIONAL SYSTEMS</footer>
    </section>
  );
}
