"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

// Updated: Pull-tab style sidebar button

interface FloatingNavbarProps {
  onToggle: () => void;
  isSidebarOpen: boolean;
}

export function FloatingNavbar({ onToggle, isSidebarOpen }: FloatingNavbarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  // Inicializar com verificação imediata se estiver no cliente
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 720;
    }
    return false;
  });
  const { isMobile } = useSidebar();

  // Efeito para detectar telas menores que 720px
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 720);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Efeito para detectar scroll para baixo
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsScrolledDown(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrolledDown(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Não renderizar em telas menores que 720px (usar MobileSidebarButton ao invés)
  if (isSmallScreen) {
    return null;
  }

  // Handler para quando o usuário interage com o botão
  const handleClick = () => {
    onToggle();
  };

  // Mostrar quando hover, mesmo se estiver escondido pelo scroll
  // No mobile ou telas menores que 720px, sempre mostrar quando sidebar está fechada
  // No desktop, mostrar se hover ou não estiver scrolled down
  // Em telas menores que 720px, sempre mostrar quando sidebar está fechada (ignorar scroll e hover)
  const shouldShow = !isSidebarOpen && (isMobile || isSmallScreen ? true : (isHovered || !isScrolledDown));

  // Não renderizar em telas menores que 720px (usar MobileSidebarButton ao invés)
  if (isSmallScreen) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sphere-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 
                        0 0 0 0 rgba(0, 0, 0, 0.05);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15), 
                        0 0 0 8px rgba(0, 0, 0, 0);
          }
        }
        @keyframes smooth-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes icon-rotate {
          from {
            transform: rotate(-90deg);
            opacity: 0;
          }
          to {
            transform: rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .sphere-pulse {
          animation: sphere-pulse 3s ease-in-out infinite;
        }
        .smooth-float {
          animation: smooth-float 3s ease-in-out infinite;
        }
        .icon-rotate {
          animation: icon-rotate 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .gradient-button {
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 
                      0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .gradient-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.5s ease;
        }
        .gradient-button:hover::before {
          left: 100%;
        }
        .gradient-button:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15), 
                      0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-3px) scale(1.08);
          border-color: rgba(0, 0, 0, 0.1);
        }
        .gradient-button.active {
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2), 
                      0 2px 8px rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }
        .gradient-button.active:hover {
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.3), 
                      0 4px 12px rgba(34, 197, 94, 0.2);
        }
        .nav-hidden {
          opacity: 0;
          transition: opacity 0.3s ease-out;
          pointer-events: none;
          visibility: hidden;
        }
        .nav-visible {
          opacity: 1;
          transition: opacity 0.3s ease-out;
          pointer-events: auto;
          visibility: visible;
        }
        .floating-button-container.hidden {
          opacity: 0;
          pointer-events: none;
          visibility: hidden;
          transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
        }
        .floating-button-container {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 50;
          width: 1rem;
          height: 5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto !important;
          cursor: grab;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Em telas menores que 720px, garantir que o botão seja sempre visível quando sidebar está fechada */
        @media (max-width: 719px) {
          .floating-button-container:not(.hidden) {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }
          .floating-button-container:not(.hidden) .droplet-button {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }
          .floating-button-container {
            width: 1.5rem !important;
            height: 4rem !important;
          }
        }
        @media (min-width: 768px) {
          .floating-button-container {
            width: 1.25rem;
            height: 6rem;
          }
        }
        .floating-button-container.left-position {
          left: 0;
          right: auto;
        }
        .floating-button-container:hover {
          width: 1.5rem;
        }
        @media (min-width: 768px) {
          .floating-button-container:hover {
            width: 2rem;
          }
        }
        .floating-button-container:active {
          cursor: grabbing;
        }
        .floating-button-container:hover button {
          opacity: 1 !important;
          pointer-events: auto !important;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }
        .droplet-button {
          width: 100%;
          height: 100%;
          border-radius: 0 0.5rem 0.5rem 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%);
          backdrop-filter: blur(12px);
          border: none;
          border-right: 2px solid rgba(99, 102, 241, 0.3);
          border-top: 1px solid rgba(99, 102, 241, 0.2);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 2px 0 10px rgba(99, 102, 241, 0.1);
        }
        .droplet-button::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(99, 102, 241, 0.4) 20%,
            rgba(99, 102, 241, 0.6) 50%,
            rgba(99, 102, 241, 0.4) 80%,
            transparent 100%
          );
          border-radius: 0 2px 2px 0;
          transition: all 0.3s ease;
        }
        .droplet-button:hover {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.18) 100%);
          border-right-color: rgba(99, 102, 241, 0.5);
          box-shadow: 3px 0 20px rgba(99, 102, 241, 0.2);
        }
        .droplet-button:hover::before {
          width: 4px;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(99, 102, 241, 0.6) 20%,
            rgba(99, 102, 241, 0.8) 50%,
            rgba(99, 102, 241, 0.6) 80%,
            transparent 100%
          );
        }
        .droplet-button:active {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.24) 100%);
        }
        @media (max-width: 767px) {
          .droplet-button {
            animation: none;
          }
        }
        .droplet-button > * {
          display: flex;
        }
        .droplet-button::after {
          content: '';
          position: absolute;
          width: 0.5rem;
          height: 0.5rem;
          border-top: 2px solid rgba(99, 102, 241, 0.6);
          border-right: 2px solid rgba(99, 102, 241, 0.6);
          transform: rotate(45deg);
          transition: all 0.3s ease;
        }
        .droplet-button:hover::after {
          transform: rotate(45deg) translateX(2px);
          border-color: rgba(99, 102, 241, 0.9);
        }
        .droplet-button::before {
          display: none;
        }
        .droplet-button::after {
          display: none;
        }
        .sphere-button {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 767px) {
          .sphere-button {
            transition: none;
            animation: none;
          }
          .gradient-button {
            transition: none;
            animation: none;
          }
          .gradient-button:hover {
            transform: none;
          }
          .sphere-pulse,
          .smooth-float {
            animation: none !important;
          }
        }
        .sphere-button > * {
          transform: rotate(0deg);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slide-hint {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }
        .droplet-button::after {
          animation: slide-hint 2s ease-in-out infinite;
        }
        .droplet-button:hover::after {
          animation: none;
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 2px 0 10px rgba(99, 102, 241, 0.1);
          }
          50% {
            box-shadow: 2px 0 15px rgba(99, 102, 241, 0.2);
          }
        }
        .droplet-button {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .droplet-button:hover {
          animation: none;
        }
      `}} />
      <div 
        className={`floating-button-container ${
          isSidebarOpen ? 'hidden' : 'left-position'
        }`}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        {/* Elemento invisível que sempre captura o hover quando o botão está escondido */}
        {!shouldShow && (
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 1,
              pointerEvents: 'auto',
            }}
          />
        )}
        <button
          onClick={handleClick}
          className={`droplet-button ${
            isSidebarOpen ? 'active' : ''
          } ${shouldShow ? 'nav-visible' : 'nav-hidden'}`}
          style={{ position: 'relative', zIndex: 2 }}
          title="Pull to open sidebar"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
        </button>
      </div>
    </>
  );
}


