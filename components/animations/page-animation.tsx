"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { ReactNode } from "react";

interface PageAnimationProps {
  children: ReactNode;
  className?: string;
}

// Animação de entrada de página
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1] as const
};

export function PageAnimation({ children, className }: PageAnimationProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// Animação de fade-in simples
export function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// Animação de slide-in da esquerda
export function SlideInLeft({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// Animação de slide-in da direita
export function SlideInRight({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// Animação de scale-in
export function ScaleIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// Animação de stagger para listas - Otimizado para melhor performance
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.05 }: StaggerContainerProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              // Otimização: reduzir duração e usar ease mais simples
              duration: 0.2,
            },
          },
        }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// Item para usar dentro do StaggerContainer - Otimizado
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            // Otimização: usar spring mais leve
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.5,
          },
        },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}