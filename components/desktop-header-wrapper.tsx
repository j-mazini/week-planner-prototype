"use client";

import { useEffect } from "react";

export function DesktopHeaderScrollBehavior() {
  useEffect(() => {
    let isScrolledDown = false;
    let lastScrollY = 0;
    let isHovered = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        isScrolledDown = true;
      } else if (currentScrollY < lastScrollY) {
        isScrolledDown = false;
      }
      
      lastScrollY = currentScrollY;
      updateHeaderVisibility();
    };

    const updateHeaderVisibility = () => {
      const headers = document.querySelectorAll('.header-section');
      headers.forEach((header) => {
        const htmlHeader = header as HTMLElement;
        const shouldShow = isHovered || !isScrolledDown;
        
        if (shouldShow) {
          htmlHeader.style.opacity = '1';
          htmlHeader.style.pointerEvents = 'auto';
        } else {
          htmlHeader.style.opacity = '0';
          htmlHeader.style.pointerEvents = 'none';
        }
      });
    };

    const handleMouseEnter = () => {
      isHovered = true;
      updateHeaderVisibility();
    };

    const handleMouseLeave = () => {
      isHovered = false;
      updateHeaderVisibility();
    };

    // Adicionar estilos CSS
    const style = document.createElement('style');
    style.textContent = `
      .header-section {
        position: sticky;
        top: 0;
        z-index: 40;
        transition: opacity 0.3s ease-out;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.98) 0%,
          rgba(255, 255, 255, 0.95) 50%,
          rgba(248, 250, 252, 0.95) 100%
        );
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        padding: 1rem 0;
        margin-top: -1rem;
        margin-left: -1.5rem;
        margin-right: -1.5rem;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    `;
    document.head.appendChild(style);

    // Criar área de hover invisível
    const hoverArea = document.createElement('div');
    document.body.appendChild(hoverArea);

    // Adicionar eventos de hover nos headers
    const headers = document.querySelectorAll('.header-section');
    headers.forEach((header) => {
      header.addEventListener('mouseenter', handleMouseEnter);
      header.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateHeaderVisibility();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      hoverArea.remove();
      style.remove();
      headers.forEach((header) => {
        header.removeEventListener('mouseenter', handleMouseEnter);
        header.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return null;
}

