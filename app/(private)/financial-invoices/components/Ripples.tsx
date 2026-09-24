import React, { useEffect, useRef } from 'react';
import RipplesOriginal from "react-ripples";

type CompatibleRipplesProps = React.PropsWithChildren<{
  className?: string;
  during?: number;
  color?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}>;

// react-ripples publishes declarations generated against an older React type
// version, which incorrectly makes newer HTML attributes required.
const CompatibleRipples = RipplesOriginal as unknown as React.ComponentType<CompatibleRipplesProps>;

interface RipplesProps extends React.HTMLAttributes<HTMLDivElement> {
  during?: number;
  color?: string;
}

// Wrapper component for Ripples to fix TypeScript issues
export const Ripples: React.FC<RipplesProps> = ({
  children,
  className,
  style,
  during,
  color,
  onClick,
  ...wrapperProps
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Força o overflow: visible no elemento do react-ripples após o componente montar
    if (wrapperRef.current) {
      const ripplesElement = wrapperRef.current.querySelector('.react-ripples') as HTMLElement;
      if (ripplesElement) {
        ripplesElement.style.setProperty('overflow', 'visible', 'important');
      }
    }
  }, []);
  
  // Sobrescreve o overflow: hidden padrão do react-ripples
  const combinedStyle: React.CSSProperties = {
    overflow: 'visible',
    ...style
  };

  return (
    <div
      ref={wrapperRef}
      className="overflow-visible inline-block"
      style={combinedStyle}
      {...wrapperProps}
    >
      <CompatibleRipples
        className={className}
        during={during}
        color={color}
        onClick={onClick}
      >
        {children}
      </CompatibleRipples>
    </div>
  );
};

