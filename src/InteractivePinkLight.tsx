import { useEffect, useRef } from 'react';
import './interactive-pink-light.css';

/** A procedural opening light; no generated image or mouse-blocking overlay. */
export function InteractivePinkLight() {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = light.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let current = { x: 0, y: 0, angle: 0, strength: 1 };
    let target = { ...current };
    const paint = () => {
      if (Number(node.parentElement?.style.opacity ?? 1) < .02) { frame = 0; return; }
      let distance = 0;
      for (const key of ['x', 'y', 'angle', 'strength'] as const) {
        const delta = target[key] - current[key];
        current[key] += delta * .085;
        distance += Math.abs(delta);
      }
      node.style.setProperty('--pink-x', `${current.x.toFixed(2)}px`);
      node.style.setProperty('--pink-y', `${current.y.toFixed(2)}px`);
      node.style.setProperty('--pink-angle', `${current.angle.toFixed(3)}deg`);
      node.style.setProperty('--pink-strength', current.strength.toFixed(3));
      frame = distance > .03 ? requestAnimationFrame(paint) : 0;
    };
    const animate = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const reset = () => { target = { x: 0, y: 0, angle: 0, strength: 1 }; animate(); };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reduced.matches || !finePointer.matches || new URLSearchParams(location.search).get('motion') === 'reduce') return;
      // The containing opening layer owns its scroll fade. Do no animation work
      // after that layer has disappeared into the existing portfolio sequence.
      if (Number(node.parentElement?.style.opacity ?? 1) < .02) return;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      target = {
        x: (x - .25) * Math.min(window.innerWidth * .16, 210),
        y: (y - .25) * Math.min(window.innerHeight * .12, 110),
        angle: (x - y) * 10,
        strength: 1.12 - Math.min(1, Math.hypot(x, y)) * .28,
      };
      animate();
    };
    const onPreference = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      current = { x: 0, y: 0, angle: 0, strength: 1 };
      target = { ...current };
      node.style.removeProperty('--pink-x');
      node.style.removeProperty('--pink-y');
      node.style.removeProperty('--pink-angle');
      node.style.removeProperty('--pink-strength');
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    reduced.addEventListener('change', onPreference);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      reduced.removeEventListener('change', onPreference);
    };
  }, []);

  return <div ref={light} className="interactive-pink-light" aria-hidden="true" />;
}
