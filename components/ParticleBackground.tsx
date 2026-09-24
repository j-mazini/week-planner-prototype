"use client";

import React, { memo, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { IParticlesProps } from "react-particles";
import type { Engine, ISourceOptions } from "tsparticles-engine";

// Instância única e dinâmica (evita re-init e loops no canvas em re-renders do pai).
const Particles = dynamic<IParticlesProps>(
  () => import("react-particles").then((module) => module.default),
  { ssr: false }
);

async function initParticlesEngine(engine: Engine) {
  const { loadSlim } = await import("tsparticles-slim");
  await loadSlim(engine);
}

const PARTICLES_OPTIONS: ISourceOptions = {
  background: { color: { value: "transparent" } },
  fpsLimit: 30,
  interactivity: {
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
      resize: true,
    },
  },
  particles: {
    color: { value: ["#00d4ff", "#0099cc", "#5dade2"] },
    links: {
      color: "#00d4ff",
      distance: 150,
      enable: true,
      opacity: 0.4,
      width: 1,
    },
    collisions: { enable: false },
    move: {
      enable: true,
      speed: 0.5,
      direction: "none" as const,
      outModes: "out" as const,
      random: false,
      straight: false,
      attract: { enable: false },
    },
    number: {
      density: { enable: true, area: 800 },
      value: 30,
    },
    opacity: {
      value: 0.6,
      random: false,
      anim: { enable: false },
    },
    shape: { type: "circle" as const },
    size: {
      value: { min: 2, max: 4 },
      random: false,
      animation: { enable: false },
    },
  },
  detectRetina: false,
};

/**
 * Fundo de partículas (login e telas que precisem do efeito).
 * Memoizado para não reagir a re-renders do pai; opções e init são estáveis no módulo.
 */
export const ParticleBackground = memo(function ParticleBackground() {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden
      />
    );
  }

  return (
    <Particles
      id="tsparticles"
      init={initParticlesEngine}
      options={PARTICLES_OPTIONS}
    />
  );
});
