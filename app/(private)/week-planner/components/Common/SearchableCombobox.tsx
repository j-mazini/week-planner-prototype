"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComboboxItem {
  value: string;
  label: string;
  secondaryLabel?: string;
}

interface SearchableComboboxProps {
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  error?: string;
  title?: string;
}

export function SearchableCombobox({
  items,
  value,
  onValueChange,
  placeholder = "Select item...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  disabled = false,
  loading = false,
  className,
  error,
  title,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Clear query when closed
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    
    const terms = q.split(/\s+/);
    
    return items.filter((item) => {
      const label = (item.label || "").toLowerCase();
      const value = (item.value || "").toLowerCase();
      const secondaryLabel = (item.secondaryLabel || "").toLowerCase();
      
      return terms.every(term => 
        label.includes(term) || 
        value.includes(term) || 
        secondaryLabel.includes(term)
      );
    });
  }, [items, query]);

  const selectedItem = useMemo(
    () => items.find((item) => String(item.value) === String(value)),
    [items, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div className="relative w-full group">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md px-4 py-2 text-sm transition-all duration-200 hover:border-sky-400/50 hover:bg-sky-50/30 hover:shadow-sm focus:ring-2 focus:ring-sky-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-slate-400",
              error && "border-red-500/50 bg-red-50/30 hover:border-red-500/70",
              className
            )}
            disabled={disabled || loading}
          >
            <span className="truncate pr-4 font-medium">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                  Loading...
                </span>
              ) : selectedItem ? (
                selectedItem.label
              ) : (
                placeholder
              )}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {!loading && (
                <ChevronsUpDown className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-200",
                  open ? "text-sky-500" : "text-slate-400"
                )} />
              )}
            </div>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 flex flex-col max-h-[350px] z-[10001] bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-3 border-b border-slate-100 bg-slate-50/30 backdrop-blur-md sticky top-0 z-10 space-y-2">
          {title && (
            <div className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-sky-500 shadow-[0_0_5px_rgba(14,165,233,0.5)]" />
              {title}
            </div>
          )}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-focus-within:text-sky-500" />
            <input
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full pl-10 pr-4 text-sm bg-white/50 border border-slate-200 rounded-xl transition-all duration-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 font-medium outline-none"
              autoFocus
            />
          </div>
          {error && (
            <div className="text-[10px] text-red-500 bg-red-50/50 border border-red-100/50 rounded-lg px-2.5 py-1.5 font-medium flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {error}
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1 p-1.5 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="flex justify-center">
                <Search className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-xs text-slate-400 font-medium">{emptyText}</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredItems.map((item) => {
                const isSelected = String(item.value) === String(value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      "w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 text-left relative overflow-hidden group/item",
                      isSelected 
                        ? "bg-sky-50 text-sky-700 shadow-sm shadow-sky-100/50" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                    onClick={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-r-full shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                    )}
                    
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 mt-0.5",
                      isSelected 
                        ? "bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/30" 
                        : "bg-white border-slate-200 text-transparent group-hover/item:border-sky-300"
                    )}>
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "font-semibold truncate tracking-tight",
                        isSelected ? "text-sky-700" : "text-slate-700"
                      )}>
                        {item.label}
                      </div>
                      {item.secondaryLabel && (
                        <div className={cn(
                          "text-[10px] mt-0.5 truncate font-medium uppercase tracking-wider opacity-70",
                          isSelected ? "text-sky-600" : "text-slate-400"
                        )}>
                          {item.secondaryLabel}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
