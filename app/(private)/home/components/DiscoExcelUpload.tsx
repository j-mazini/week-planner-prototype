"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { parseDiscoExcelFile } from "../disco-excel-parser";
import type { DashboardDisco } from "../disco-types";

interface DiscoExcelUploadProps {
  onParsed: (data: DashboardDisco) => void;
  accept?: string;
}

export function DiscoExcelUpload({ onParsed, accept = ".xlsx,.xls" }: DiscoExcelUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      const name = (file.name || "").toLowerCase();
      if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
        setError("Please select an Excel file (.xlsx or .xls).");
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const data = await parseDiscoExcelFile(file);
        if (!data.deliveries?.length && !Object.keys(data.loops || {}).length) {
          setError("The file does not contain recognised delivery data. Check the columns (Route, SortWave, Postcode, etc.).");
          return;
        }
        onParsed(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Error processing the file.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${dragOver ? "border-blue-400 bg-blue-50/50" : "border-slate-200 bg-slate-50/50"}
          ${loading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={loading}
          aria-label="Select Excel deliveries file"
        />
        {loading ? (
          <p className="text-sm text-slate-600">Processing file…</p>
        ) : (
          <>
            <div className="flex justify-center gap-2 text-slate-500 mb-2">
              <FileSpreadsheet className="w-8 h-8 text-blue-500" />
              <Upload className="w-6 h-6 mt-1" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">
              Drag an Excel file or click to select
            </p>
            <p className="text-xs text-slate-500">
              DISCO Route Data (.xlsx) with columns: Route, SortWave/Cycle, Postcode/Subpostcode, Address, etc.
            </p>
          </>
        )}
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
