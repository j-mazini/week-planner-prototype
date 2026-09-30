"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';

export type PdfEntry = { blob: Blob; filename: string };

type PdfPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  /** Supports a single PDF or a list for pagination */
  pdfs: PdfEntry[];
};

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ open, onClose, pdfs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  // Create/revoke object URLs whenever blobs change
  useEffect(() => {
    if (!open || pdfs.length === 0) {
      setObjectUrls([]);
      setCurrentIndex(0);
      return;
    }

    const urls = pdfs.map((p) => URL.createObjectURL(p.blob));
    setObjectUrls(urls);
    setCurrentIndex(0);

    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [open, pdfs]);

  const total = pdfs.length;
  const current = pdfs[currentIndex];
  const currentUrl = objectUrls[currentIndex];

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
  }, [total]);

  const handleDownloadCurrent = () => {
    if (!current || !currentUrl) return;
    const a = document.createElement('a');
    a.href = currentUrl;
    a.download = current.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    pdfs.forEach((p, i) => {
      const url = objectUrls[i];
      if (!url) return;
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url;
        a.download = p.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 400);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-base font-semibold truncate max-w-[60%]">
              {current?.filename ?? 'Preview'}
            </DialogTitle>

            {/* Pagination */}
            {total > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  title="Previous PDF"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Navigation pills */}
                <div className="flex items-center gap-1">
                  {pdfs.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      title={p.filename}
                      className={`h-7 rounded px-2 text-xs font-medium transition-colors ${
                        i === currentIndex
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goTo(currentIndex + 1)}
                  disabled={currentIndex === total - 1}
                  title="Next PDF"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <span className="text-xs text-slate-500 ml-1 whitespace-nowrap">
                  {currentIndex + 1} / {total}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* PDF iframe */}
        <div className="flex-1 min-h-0 bg-slate-100">
          {currentUrl ? (
            <iframe
              key={currentUrl}
              src={currentUrl}
              title="PDF Preview"
              className="w-full h-[68vh] border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-[68vh] text-slate-400 text-sm">
              Loading PDF…
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>

          {total > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadAll}
              disabled={objectUrls.length === 0}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download all ({total})
            </Button>
          )}

          <Button
            type="button"
            onClick={handleDownloadCurrent}
            disabled={!current || objectUrls.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {total > 1 ? `Download this (${currentIndex + 1}/${total})` : 'Download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewModal;
