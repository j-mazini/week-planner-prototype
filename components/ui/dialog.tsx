"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarOptional } from "./sidebar";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  // Not within SidebarProvider, sidebar is considered closed
  const sidebarContext = useSidebarOptional();
  const isSidebarOpen = sidebarContext?.state === 'expanded';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .dialog-gradient-backdrop {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e8f0f5 50%, #f1f5f9 75%, #f8fafc 100%);
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
          background-attachment: fixed;
          background-position: 0 0;
          position: relative;
        }

        .dialog-gradient-backdrop::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          min-width: 100vw;
          height: 100%;
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08), transparent 50%),
                      radial-gradient(circle at 80% 10%, rgba(236, 72, 153, 0.08), transparent 45%),
                      radial-gradient(circle at 75% 80%, rgba(14, 165, 233, 0.08), transparent 50%),
                      linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(236, 72, 153, 0.02) 100%);
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: -1;
        }
      `}} />
      <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=closed]:duration-200",
        className
      )}
        style={{
          background: 'rgba(15, 23, 42, 0.25)',
          backdropFilter: 'blur(8px) saturate(120%)',
          WebkitBackdropFilter: 'blur(8px) saturate(120%)',
          ...(isSidebarOpen && typeof window !== 'undefined' && window.innerWidth >= 768
            ? { left: '16rem', width: 'calc(100vw - 16rem)' }
            : {}),
          transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        {...props}
      />
    </>
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Not within SidebarProvider, sidebar is considered closed
  const sidebarContext = useSidebarOptional();
  const isSidebarOpen = sidebarContext?.state === 'expanded';

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl ring-1 ring-black/5",
          className
        )}
        style={{
          ...(isSidebarOpen && typeof window !== 'undefined' && window.innerWidth >= 768
            ? { left: 'calc(50% + 8rem)' }
            : {}),
          transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-accent hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1.5">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
