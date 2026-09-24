"use client";

import RipplesOriginal from "react-ripples";
import { ReactNode, ButtonHTMLAttributes } from "react";

// Wrapper component for Ripples to fix TypeScript issues
const Ripples = ({ children, className, ...props }: { children: ReactNode; className?: string; [key: string]: unknown }) => {
  // @ts-expect-error - RipplesOriginal types may be incomplete
  return <RipplesOriginal className={className} {...props}>{children}</RipplesOriginal>;
};

interface ButtonWithRippleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export const ButtonWithRipple = ({ children, className = "", ...props }: ButtonWithRippleProps) => {
  return (
    <Ripples className="d-inline-block">
      <button className={className} {...props}>
        {children}
      </button>
    </Ripples>
  );
};

