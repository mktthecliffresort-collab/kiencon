import confetti from 'canvas-confetti';
import type React from 'react';

/**
 * Fires a grand fireworks display using canvas-confetti
 */
export function fireGrandCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  // Left and Right Cannons
  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7'],
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  frame();

  // Center star explosion
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { y: 0.55 },
    shapes: ['star', 'circle'],
    colors: ['#fbbf24', '#f97316', '#34d399', '#60a5fa', '#f43f5e'],
    scalar: 1.2,
  });
}

/**
 * Quick joyful mini burst of confetti
 */
export function fireMiniBurst(x: number = 0.5, y: number = 0.5) {
  confetti({
    particleCount: 35,
    spread: 60,
    origin: { x, y },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    scalar: 1.1,
  });
}

export const fireSmallConfetti = fireMiniBurst;

/**
 * Cheerful particle burst (stars & confetti) emanating right from the clicked button or coordinates
 */
export function fireButtonParticleBurst(target?: React.MouseEvent | HTMLElement | { x: number; y: number } | null) {
  let originX = 0.5;
  let originY = 0.5;

  if (target) {
    if ('clientX' in target && 'clientY' in target && typeof target.clientX === 'number') {
      originX = Math.max(0.05, Math.min(0.95, target.clientX / window.innerWidth));
      originY = Math.max(0.05, Math.min(0.95, target.clientY / window.innerHeight));
    } else if ('getBoundingClientRect' in target && typeof target.getBoundingClientRect === 'function') {
      const rect = target.getBoundingClientRect();
      originX = Math.max(0.05, Math.min(0.95, (rect.left + rect.width / 2) / window.innerWidth));
      originY = Math.max(0.05, Math.min(0.95, (rect.top + rect.height / 2) / window.innerHeight));
    } else if ('x' in target && 'y' in target) {
      originX = target.x;
      originY = target.y;
    }
  }

  // 1. Shimmering star burst
  confetti({
    particleCount: 24,
    angle: 90,
    spread: 80,
    startVelocity: 22,
    ticks: 140,
    origin: { x: originX, y: originY },
    shapes: ['star'],
    colors: ['#fbbf24', '#f59e0b', '#f43f5e', '#a855f7', '#38bdf8'],
    scalar: 1.2,
    gravity: 0.9,
  });

  // 2. High-speed mini circular confetti scatter
  confetti({
    particleCount: 28,
    angle: 90,
    spread: 100,
    startVelocity: 28,
    ticks: 110,
    origin: { x: originX, y: originY },
    shapes: ['circle'],
    colors: ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#eab308'],
    scalar: 0.85,
    gravity: 1.1,
  });
}
